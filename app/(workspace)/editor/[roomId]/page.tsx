import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/editor/access-denied";
import { ProjectWorkspace } from "@/components/editor/project-workspace";
import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access";

export default async function EditorWorkspacePage({ params }: { params: Promise<{ roomId: string }> }) {
  const [{ roomId }, identity] = await Promise.all([params, getCurrentIdentity()]);
  if (!identity) redirect("/sign-in");

  const project = await getAccessibleProject(roomId, identity);
  if (!project) return <AccessDenied />;

  return <ProjectWorkspace project={project} isOwner={project.ownerId === identity.userId} />;
}
