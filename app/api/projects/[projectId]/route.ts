import { prisma } from "@/lib/prisma";
import { readJsonObject, requireUserId } from "@/lib/project-api";

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return project;
}

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const { projectId } = await params;
  const ownedProject = await getOwnedProject(projectId, userId);
  if (ownedProject instanceof Response) return ownedProject;

  const body = await readJsonObject(request);
  if (body instanceof Response) return body;

  if (typeof body.name !== "string") {
    return Response.json({ error: "Project name must be a string" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: ownedProject.id },
    data: { name: body.name },
  });

  return Response.json(project);
}

export async function DELETE(_request: Request, { params }: ProjectRouteContext) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const { projectId } = await params;
  const ownedProject = await getOwnedProject(projectId, userId);
  if (ownedProject instanceof Response) return ownedProject;

  await prisma.project.delete({ where: { id: ownedProject.id } });

  return new Response(null, { status: 204 });
}
