import { get, put } from "@vercel/blob";

import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

type CanvasRouteContext = { params: Promise<{ projectId: string }> };
type CanvasState = { nodes: unknown[]; edges: unknown[] };

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected storage error";
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? message.replaceAll(token, "[redacted]") : message;
}

function isCanvasState(value: unknown): value is CanvasState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  return Array.isArray(state.nodes) && Array.isArray(state.edges);
}

async function getAuthorizedProject(projectId: string) {
  const identity = await getCurrentIdentity();
  if (!identity) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const project = await getAccessibleProject(projectId, identity);
  if (!project) return { response: Response.json({ error: "Project not found" }, { status: 404 }) };
  return { project };
}

export async function GET(_request: Request, { params }: CanvasRouteContext) {
  const { projectId } = await params;
  const result = await getAuthorizedProject(projectId);
  if ("response" in result) return result.response;

  const project = await prisma.project.findUnique({
    where: { id: result.project.id },
    select: { canvasJsonPath: true },
  });
  if (!project?.canvasJsonPath) return Response.json({ canvas: null });

  try {
    const blob = await get(project.canvasJsonPath, { access: "private", useCache: false });
    if (!blob || blob.statusCode !== 200) return Response.json({ error: "Saved canvas was not found" }, { status: 404 });
    const canvas: unknown = await new Response(blob.stream).json();
    if (!isCanvasState(canvas)) return Response.json({ error: "Saved canvas data is invalid" }, { status: 502 });
    return Response.json({ canvas });
  } catch (error) {
    console.error("Canvas blob load failed", error);
    return Response.json({ error: `Could not load the saved canvas: ${safeErrorMessage(error)}` }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: CanvasRouteContext) {
  const { projectId } = await params;
  const result = await getAuthorizedProject(projectId);
  if ("response" in result) return result.response;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Canvas storage is not configured on the server (BLOB_READ_WRITE_TOKEN is missing)." }, { status: 503 });
  }

  let canvas: unknown;
  try {
    canvas = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  if (!isCanvasState(canvas)) return Response.json({ error: "Canvas must include nodes and edges arrays" }, { status: 400 });

  try {
    const blob = await put(`projects/${result.project.id}/canvas.json`, JSON.stringify(canvas), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    await prisma.project.update({
      where: { id: result.project.id },
      data: { canvasJsonPath: blob.url },
    });
    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Canvas blob save failed", error);
    return Response.json({ error: `Could not save the canvas: ${safeErrorMessage(error)}` }, { status: 502 });
  }
}
