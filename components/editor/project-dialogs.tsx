"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useProjectDialogs } from "@/components/editor/use-project-dialogs"

export function ProjectDialogs() {
  const {
    dialog,
    projects,
    formName,
    setFormName,
    roomId,
    error,
    isLoading,
    closeDialog,
    submitName,
    confirmDelete,
  } = useProjectDialogs()

  const project = dialog.type === "rename" || dialog.type === "delete"
    ? projects.find((item) => item.id === dialog.projectId)
    : undefined

  return (
    <Dialog
      open={dialog.type !== "closed"}
      onOpenChange={(open) => {
        if (!open) closeDialog()
      }}
    >
      <DialogContent aria-busy={isLoading}>
        {dialog.type === "create" && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void submitName()
            }}
          >
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>Name your new project. Its room ID updates as you type.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="create-project-name">Project name</label>
              <Input
                autoFocus
                id="create-project-name"
                onChange={(event) => setFormName(event.target.value)}
                placeholder="e.g. Product Architecture"
                required
                value={formName}
              />
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              Room ID preview <span className="ml-2 font-mono text-foreground">{roomId}</span>
            </div>
            <DialogFooter>
              <Button disabled={isLoading} onClick={closeDialog} type="button" variant="outline">Cancel</Button>
              <Button disabled={isLoading || !formName.trim()} type="submit">
                {isLoading ? "Creating…" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {dialog.type === "rename" && project && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void submitName()
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>Current project name: {project.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="rename-project-name">Project name</label>
              <Input
                autoFocus
                id="rename-project-name"
                onChange={(event) => setFormName(event.target.value)}
                required
                value={formName}
              />
            </div>
            <DialogFooter>
              <Button disabled={isLoading} onClick={closeDialog} type="button" variant="outline">Cancel</Button>
              <Button disabled={isLoading || !formName.trim()} type="submit">
                {isLoading ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {dialog.type === "delete" && project && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Delete project</DialogTitle>
              <DialogDescription>
                Delete “{project.name}”? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button disabled={isLoading} onClick={closeDialog} type="button" variant="outline">Cancel</Button>
              <Button disabled={isLoading} onClick={() => void confirmDelete()} type="button" variant="destructive">
                {isLoading ? "Deleting…" : "Delete project"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
