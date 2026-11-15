import { prisma } from "@/lib/prisma";
import { readJsonObject, requireUserId } from "@/lib/project-api";

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await readJsonObject(request);
  if (body instanceof Response) return body;

  const name = body.name === undefined ? "Untitled Project" : body.name;
  if (typeof name !== "string") {
    return Response.json({ error: "Project name must be a string" }, { status: 400 });
  }
  if (body.id !== undefined && (typeof body.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.id))) {
    return Response.json({ error: "Project ID must be a lowercase slug" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      ...(typeof body.id === "string" ? { id: body.id } : {}),
      ownerId: userId,
      name,
    },
  });

  return Response.json(project, { status: 201 });
}
