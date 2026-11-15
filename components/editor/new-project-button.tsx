"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/components/editor/use-project-dialogs"

export function NewProjectButton() {
  const { openCreate } = useProjectDialogs()
  return <Button onClick={openCreate} type="button"><Plus aria-hidden="true" />New Project</Button>
}
