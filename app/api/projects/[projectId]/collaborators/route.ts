import { clerkClient } from "@clerk/nextjs/server";

import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { readJsonObject } from "@/lib/project-api";

type RouteContext = { params: Promise<{ projectId: string }> };
type CollaboratorView = { email: string; displayName: string; imageUrl: string | null };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

async function enrichCollaborators(entries: { email: string }[]): Promise<CollaboratorView[]> {
  if (entries.length === 0) return [];
  const profiles = new Map<string, { displayName: string; imageUrl: string | null }>();
  const clerk = await clerkClient();

  for (let start = 0; start < entries.length; start += 100) {
    const batch = entries.slice(start, start + 100);
    try {
      const result = await clerk.users.getUserList({
        emailAddress: batch.map(({ email }) => email),
        limit: batch.length,
      });
      for (const user of result.data) {
        const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username || "";
        for (const address of user.emailAddresses) {
          profiles.set(address.emailAddress.toLowerCase(), {
            displayName: displayName || address.emailAddress,
            imageUrl: user.imageUrl || null,
          });
        }
      }
    } catch {
      // A Clerk lookup failure should not prevent members from seeing email-based access.
    }
  }

  return entries.map(({ email }) => {
    const profile = profiles.get(email.toLowerCase());
    return { email, displayName: profile?.displayName ?? email, imageUrl: profile?.imageUrl ?? null };
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId, identity);
  if (!project) return Response.json({ error: "Project not found or access denied" }, { status: 404 });

  const entries = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  });
  return Response.json({ collaborators: await enrichCollaborators(entries) });
}

export async function POST(request: Request, { params }: RouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, ownerId: true } });
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  if (project.ownerId !== identity.userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await readJsonObject(request);
  if (body instanceof Response) return body;
  if (typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
    return Response.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const collaborator = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    create: { projectId, email },
    update: {},
    select: { email: true },
  });
  return Response.json({ collaborator: { email: collaborator.email } }, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, ownerId: true } });
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  if (project.ownerId !== identity.userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await readJsonObject(request);
  if (body instanceof Response) return body;
  if (typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
    return Response.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const result = await prisma.projectCollaborator.deleteMany({
    where: { projectId, email: body.email.trim().toLowerCase() },
  });
  if (result.count === 0) return Response.json({ error: "Collaborator not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
