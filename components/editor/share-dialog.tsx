"use client"

import { useCallback, useState, type FormEvent } from "react"
import Image from "next/image"
import { Check, Copy, LoaderCircle, UserRound, UserRoundPlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Collaborator = { email: string; displayName: string; imageUrl: string | null }
type ShareDialogProps = {
  projectId: string
  isOwner: boolean
}

async function responseError(response: Response) {
  try {
    const body: unknown = await response.json()
    if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") return body.error
  } catch { /* Use the default message for non-JSON errors. */ }
  return "Something went wrong. Please try again."
}

export function ShareDialog({ projectId, isOwner }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(null)
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [busyEmail, setBusyEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const loadCollaborators = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`, { signal })
    if (!response.ok) throw new Error(await responseError(response))
    const data: { collaborators: Collaborator[] } = await response.json()
    setCollaborators(data.collaborators)
  }, [projectId])
  const isLoading = isOpen && collaborators === null

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) {
      setCollaborators(null)
      setError(null)
      return
    }
    setCollaborators(null)
    setError(null)
    void loadCollaborators().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Could not load collaborators.")
      setCollaborators([])
    })
  }

  async function inviteCollaborator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || isInviting) return
    setIsInviting(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      setEmail("")
      await loadCollaborators()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not invite this collaborator.")
    } finally { setIsInviting(false) }
  }

  async function removeCollaborator(collaboratorEmail: string) {
    if (busyEmail) return
    setBusyEmail(collaboratorEmail)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: collaboratorEmail }),
      })
      if (!response.ok) throw new Error(await responseError(response))
      setCollaborators((current) => (current ?? []).filter(({ email: currentEmail }) => currentEmail !== collaboratorEmail))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove this collaborator.")
    } finally { setBusyEmail(null) }
  }

  async function copyProjectLink() {
    setError(null)
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/editor/${encodeURIComponent(projectId)}`)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1600)
    } catch {
      setError("Could not copy the project link. Check your browser permissions and try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button aria-label="Share project" size="sm" type="button" variant="outline" />}>
        <UserRoundPlus aria-hidden="true" />
        Share
      </DialogTrigger>
      <DialogContent aria-busy={isLoading || isInviting || Boolean(busyEmail)} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner ? "Invite people to view and work in this project." : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <form className="flex items-end gap-2" onSubmit={(event) => void inviteCollaborator(event)}>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="text-sm font-medium" htmlFor="collaborator-email">Email address</label>
              <Input
                autoComplete="email"
                id="collaborator-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <Button disabled={isInviting || !email.trim()} type="submit">
              {isInviting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <UserRoundPlus aria-hidden="true" />}
              Invite
            </Button>
          </form>
        )}

        <section aria-label="Project collaborators" className="space-y-2">
          <h3 className="text-sm font-medium">People with access</h3>
          {isLoading ? (
            <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Loading people…</div>
          ) : collaborators?.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-sm text-muted-foreground">No collaborators yet.</p>
          ) : (
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {collaborators?.map((collaborator) => (
                <li className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-2" key={collaborator.email}>
                  {collaborator.imageUrl ? (
                    // Clerk's image URL is optional; email initials remain the fallback.
                    <Image alt="" className="size-9 shrink-0 rounded-full bg-muted object-cover" height={36} src={collaborator.imageUrl} unoptimized width={36} />
                  ) : (
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                      <UserRound className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{collaborator.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{collaborator.email}</p>
                  </div>
                  {isOwner && (
                    <Button
                      aria-label={`Remove ${collaborator.email}`}
                      disabled={Boolean(busyEmail)}
                      onClick={() => void removeCollaborator(collaborator.email)}
                      size="icon-sm"
                      title={`Remove ${collaborator.email}`}
                      type="button"
                      variant="ghost"
                    >
                      {busyEmail === collaborator.email ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <X aria-hidden="true" />}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <DialogFooter>
          {isOwner && (
            <Button disabled={isCopied} onClick={() => void copyProjectLink()} type="button" variant="outline">
              {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {isCopied ? "Copied!" : "Copy project link"}
            </Button>
          )}
          <Button onClick={() => handleOpenChange(false)} type="button">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
