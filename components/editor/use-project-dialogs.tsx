"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

export type ProjectAccess = "owned" | "shared"
export type Project = { id: string; name: string; slug: string; access: ProjectAccess }
type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "rename" | "delete"; projectId: string }

function createSlug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function useProjectDialogState(initialOwnedProjects: Project[], initialSharedProjects: Project[]) {
  const router = useRouter()
  const pathname = usePathname()
  const [projects, setProjects] = useState([...initialOwnedProjects, ...initialSharedProjects])
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" })
  const [formName, setFormName] = useState("")
  const [roomSuffix, setRoomSuffix] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const slug = useMemo(() => createSlug(formName), [formName])
  const roomId = useMemo(() => `${slug || "project"}-${roomSuffix || "xxxxxxxx"}`, [slug, roomSuffix])

  function openCreate() { setFormName(""); setRoomSuffix(crypto.randomUUID().replaceAll("-", "").slice(0, 8)); setError(null); setDialog({ type: "create" }) }
  function openRename(project: Project) { setFormName(project.name); setError(null); setDialog({ type: "rename", projectId: project.id }) }
  function openDelete(project: Project) { setError(null); setDialog({ type: "delete", projectId: project.id }) }
  function closeDialog() {
    if (isLoading) return
    setDialog({ type: "closed" }); setFormName(""); setError(null)
  }

  async function submitName() {
    const name = formName.trim()
    if (isLoading || !name || dialog.type === "closed" || dialog.type === "delete") return
    const action = dialog
    setIsLoading(true); setError(null)
    try {
      const id = action.type === "create" ? `${createSlug(name) || "project"}-${roomSuffix}` : action.projectId
      const response = await fetch(action.type === "create" ? "/api/projects" : `/api/projects/${encodeURIComponent(id)}`, {
        method: action.type === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.type === "create" ? { id, name } : { name }),
      })
      if (!response.ok) throw new Error("Could not save the project. Please try again.")
      if (action.type === "create") {
        setDialog({ type: "closed" })
        setFormName("")
        router.push(`/workspace/${encodeURIComponent(id)}`)
        return
      }
      setProjects((current) => current.map((project) => project.id === id ? { ...project, name } : project))
      setDialog({ type: "closed" }); setFormName(""); router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.")
    } finally { setIsLoading(false) }
  }

  async function confirmDelete() {
    if (isLoading || dialog.type !== "delete") return
    const { projectId } = dialog
    setIsLoading(true); setError(null)
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Could not delete the project. Please try again.")
      setProjects((current) => current.filter((project) => project.id !== projectId))
      setDialog({ type: "closed" })
      if (pathname === `/workspace/${projectId}` || pathname.startsWith(`/workspace/${projectId}/`)) router.replace("/editor")
      else router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.")
    } finally { setIsLoading(false) }
  }

  return { projects, dialog, formName, setFormName, slug, roomId, error, isLoading, openCreate, openRename, openDelete, closeDialog, submitName, confirmDelete }
}

type ProjectDialogsContextValue = ReturnType<typeof useProjectDialogState>
const ProjectDialogsContext = createContext<ProjectDialogsContextValue | null>(null)

export function ProjectDialogProvider({ children, ownedProjects, sharedProjects }: {
  children: ReactNode; ownedProjects: Project[]; sharedProjects: Project[]
}) {
  const value = useProjectDialogState(ownedProjects, sharedProjects)
  return <ProjectDialogsContext.Provider value={value}>{children}</ProjectDialogsContext.Provider>
}

export function useProjectDialogs() {
  const context = useContext(ProjectDialogsContext)
  if (!context) throw new Error("useProjectDialogs must be used inside ProjectDialogProvider")
  return context
}
