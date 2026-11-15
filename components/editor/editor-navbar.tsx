"use client"

import { Blocks, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { OPEN_STARTER_TEMPLATES_EVENT } from "@/components/editor/starter-templates"

type EditorNavbarProps = {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  showStarterTemplates?: boolean
  showUserButton?: boolean
}

export function EditorNavbar({ isSidebarOpen, onSidebarToggle, showStarterTemplates = false, showUserButton = true }: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
      <div className="flex flex-1 items-center">
        <Button
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          aria-pressed={isSidebarOpen}
          onClick={onSidebarToggle}
          size="icon"
          variant="ghost"
        >
          <SidebarIcon aria-hidden="true" />
        </Button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground">
        Ghost AI
      </div>

      <div className="flex flex-1 justify-end">
        {showStarterTemplates && (
          <Button
            aria-label="Open starter templates"
            className="mr-2 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => window.dispatchEvent(new Event(OPEN_STARTER_TEMPLATES_EVENT))}
            size="sm"
            variant="ghost"
          >
            <Blocks aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
        )}
        {showUserButton && <UserButton />}
      </div>
    </header>
  )
}
