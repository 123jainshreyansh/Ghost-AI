"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

type EditorNavbarProps = {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function EditorNavbar({ isSidebarOpen, onSidebarToggle }: EditorNavbarProps) {
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
        <UserButton />
      </div>
    </header>
  )
}
