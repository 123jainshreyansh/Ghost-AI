import type { ReactNode } from "react";
import { Suspense } from "react";
import { EditorShell } from "@/components/editor/editor-shell";
import { getEditorProjects } from "@/lib/projects";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}><WorkspaceRuntime>{children}</WorkspaceRuntime></Suspense>;
}

async function WorkspaceRuntime({ children }: { children: ReactNode }) {
  const { ownedProjects, sharedProjects } = await getEditorProjects();
  return <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects}>{children}</EditorShell>;
}
