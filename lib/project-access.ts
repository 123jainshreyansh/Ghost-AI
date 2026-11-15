import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type ClerkIdentity = {
  userId: string;
  primaryEmail: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export async function getCurrentIdentity(): Promise<ClerkIdentity | null> {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  if (!userId) return null;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
    || user?.username
    || user?.primaryEmailAddress?.emailAddress
    || userId;
  return {
    userId,
    primaryEmail: user?.primaryEmailAddress?.emailAddress.toLowerCase() ?? null,
    displayName,
    avatarUrl: user?.imageUrl ?? null,
  };
}

export async function getAccessibleProject(projectId: string, identity: ClerkIdentity) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: identity.userId },
        ...(identity.primaryEmail
          ? [{ collaborators: { some: { email: identity.primaryEmail } } }]
          : []),
      ],
    },
    select: { id: true, name: true, ownerId: true },
  });
}
