import { redirect } from "next/navigation";

export default async function LegacyProjectWorkspacePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/editor/${encodeURIComponent(projectId)}`);
}
