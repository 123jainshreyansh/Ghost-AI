"use client"

import { PanelLeftClose, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Project } from "@/components/editor/use-project-dialogs"

type ProjectSidebarProps = {
  isOpen: boolean
  onClose: () => void
  onCreateProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  ownedProjects: Project[]
  sharedProjects: Project[]
}

function ProjectList({
  projects,
  emptyMessage,
  onRenameProject,
  onDeleteProject,
}: { projects: Project[]; onRenameProject: (project: Project) => void; onDeleteProject: (project: Project) => void; emptyMessage: string }) {
  if (projects.length === 0) {
    return <p className="px-2 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-1">
      {projects.map((project) => (
        <li className="group flex min-w-0 items-center gap-1 rounded-lg px-2 py-2 hover:bg-sidebar-accent" key={project.id}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{project.name}</p>
            <p className="truncate text-xs text-muted-foreground">{project.slug}</p>
          </div>
          {project.access === "owned" && (
            <div className="flex shrink-0 items-center">
              <Button
                aria-label={`Rename ${project.name}`}
                onClick={() => onRenameProject(project)}
                size="icon-sm"
                title={`Rename ${project.name}`}
                variant="ghost"
              >
                <Pencil aria-hidden="true" />
              </Button>
              <Button
                aria-label={`Delete ${project.name}`}
                onClick={() => onDeleteProject(project)}
                size="icon-sm"
                title={`Delete ${project.name}`}
                variant="ghost"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  ownedProjects,
  sharedProjects,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-label="Project sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={`fixed bottom-0 left-0 top-16 z-20 flex w-80 max-w-[calc(100vw-2rem)] flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <h2 className="text-sm font-semibold">Projects</h2>
        <Button
          aria-label="Close project sidebar"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <PanelLeftClose aria-hidden="true" />
        </Button>
      </div>

      <Tabs className="min-h-0 flex-1 gap-0 px-4 pt-4" defaultValue="my-projects">
        <TabsList className="w-full">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent className="min-h-0 flex-1 overflow-y-auto py-3" value="my-projects">
          <ProjectList
            emptyMessage="Your projects will appear here."
            onDeleteProject={onDeleteProject}
            onRenameProject={onRenameProject}
            projects={ownedProjects}
          />
        </TabsContent>
        <TabsContent className="min-h-0 flex-1 overflow-y-auto py-3" value="shared">
          <ProjectList
            emptyMessage="Projects shared with you will appear here."
            onDeleteProject={onDeleteProject}
            onRenameProject={onRenameProject}
            projects={sharedProjects}
          />
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <Button className="w-full" onClick={onCreateProject} type="button">
          <Plus aria-hidden="true" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
