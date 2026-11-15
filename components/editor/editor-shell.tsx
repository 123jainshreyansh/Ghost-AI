"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogProvider, useProjectDialogs, type Project } from "@/components/editor/use-project-dialogs"

type EditorShellProps = {
  children: React.ReactNode
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorShell({ children, ownedProjects, sharedProjects }: EditorShellProps) {
  return (
    <ProjectDialogProvider ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      <EditorShellContent>{children}</EditorShellContent>
    </ProjectDialogProvider>
  )
}

function EditorShellContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { projects, openCreate, openRename, openDelete } = useProjectDialogs()
  const ownedProjects = projects.filter((project) => project.access === "owned")
  const sharedProjects = projects.filter((project) => project.access === "shared")

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        showStarterTemplates={pathname.startsWith("/editor/")}
        showUserButton={!pathname.startsWith("/editor/")}
      />
      <main className="relative flex min-h-0 flex-1">{children}</main>
      {isSidebarOpen && (
        <button
          aria-label="Close projects sidebar"
          className="fixed inset-x-0 bottom-0 top-16 z-10 bg-black/60 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      )}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={openCreate}
        onDeleteProject={openDelete}
        onRenameProject={openRename}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={pathname.startsWith("/editor/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : undefined}
      />
      <ProjectDialogs />
    </div>
  )
}
