import { notFound } from "next/navigation";
import { getEditorProjects } from "@/lib/projects";

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ projectId: string }> }) {
  const [{ projectId }, { ownedProjects, sharedProjects }] = await Promise.all([params, getEditorProjects()]);
  const project = [...ownedProjects, ...sharedProjects].find((item) => item.id === projectId);
  if (!project) notFound();

  return (
    <section className="flex min-h-full flex-1 items-center justify-center p-8">
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">PROJECT WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold">{project.name}</h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{project.id}</p>
      </div>
    </section>
  );
}
