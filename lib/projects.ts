import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export type EditorProject = {
  id: string;
  name: string;
  slug: string;
  access: "owned" | "shared";
};

function toEditorProject(project: { id: string; name: string }, access: EditorProject["access"]): EditorProject {
  return { ...project, slug: project.id, access };
}

export async function getEditorProjects() {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  if (!userId || !user) return { ownedProjects: [], sharedProjects: [] };
  const ownedProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
  const emails = user.emailAddresses.map(({ emailAddress }) => emailAddress.toLowerCase());
  const sharedProjects = emails.length
    ? await prisma.project.findMany({
        where: {
          ownerId: { not: userId },
          collaborators: { some: { email: { in: emails } } },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true },
      })
    : [];
  return {
    ownedProjects: ownedProjects.map((project) => toEditorProject(project, "owned")),
    sharedProjects: sharedProjects.map((project) => toEditorProject(project, "shared")),
  };
}
