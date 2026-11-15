"use client"

import { useCallback, useRef, useState } from "react"
import { Bot, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"

type ProjectWorkspaceProps = { project: { id: string; name: string }; isOwner: boolean }

export function ProjectWorkspace({ project, isOwner }: ProjectWorkspaceProps) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("saved")
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveHandlerRef = useRef<(() => Promise<void>) | null>(null)
  const setSaveHandler = useCallback((handler: (() => Promise<void>) | null) => {
    saveHandlerRef.current = handler
  }, [])
  const handleSaveStatusChange = useCallback((status: CanvasSaveStatus, errorMessage: string | null) => {
    setSaveStatus(status)
    setSaveError(errorMessage)
  }, [])

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{project.name}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            aria-label={`Save canvas, status: ${saveStatus}${saveError ? `, ${saveError}` : ""}`}
            className="gap-2"
            disabled={!saveHandlerRef.current || saveStatus === "saving"}
            onClick={() => void saveHandlerRef.current?.()}
            size="sm"
            type="button"
            variant="outline"
          >
            <Save aria-hidden="true" className="size-4" />
            <span>Save</span>
            <span aria-live="polite" className={`text-xs ${saveStatus === "error" ? "text-destructive" : "text-muted-foreground"}`} title={saveError ?? undefined}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Failed" : saveStatus === "unsaved" ? "Unsaved" : "Saved"}
            </span>
          </Button>
          {saveError && <span aria-live="assertive" className="max-w-40 truncate text-xs text-destructive" role="alert" title={saveError}>{saveError}</span>}
          <ShareDialog isOwner={isOwner} projectId={project.id} />
          <Button
            aria-label={isAiSidebarOpen ? "Hide AI sidebar" : "Show AI sidebar"}
            aria-pressed={isAiSidebarOpen}
            onClick={() => setIsAiSidebarOpen((open) => !open)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Bot aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 bg-background">
        <CollaborativeCanvas
          onSaveHandlerReady={setSaveHandler}
          onSaveStatusChange={handleSaveStatusChange}
          roomId={project.id}
        />
        <AiSidebar onClose={() => setIsAiSidebarOpen(false)} open={isAiSidebarOpen} />
      </div>
    </section>
  )
}
