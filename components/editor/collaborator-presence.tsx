"use client"

import { useMemo } from "react"
import { useAuth, UserButton } from "@clerk/nextjs"
import { shallow, useOthersMapped } from "@liveblocks/react"

type Collaborator = {
  id: string
  name: string
  avatar?: string
  color: string
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?"
}

export function CollaboratorPresence() {
  const { userId } = useAuth()
  const others = useOthersMapped(
    (other) => [other.id, other.info.name, other.info.avatar, other.info.color] as const,
    shallow,
  )

  const collaborators = useMemo(() => {
    const uniqueUsers = new Map<string, Collaborator>()

    for (const [, [id, name, avatar, color]] of others) {
      if (!id || id === userId || uniqueUsers.has(id)) continue
      uniqueUsers.set(id, {
        id,
        name: name || "Collaborator",
        avatar,
        color,
      })
    }

    return [...uniqueUsers.values()]
  }, [others, userId])

  const visibleCollaborators = collaborators.slice(0, 5)
  const overflowCount = Math.max(collaborators.length - visibleCollaborators.length, 0)

  return (
    <div
      aria-label="Room participants"
      className={`flex items-center ${collaborators.length > 0 ? "gap-2 rounded-full border border-border bg-background/90 px-2 py-1.5 shadow-lg backdrop-blur" : ""}`}
    >
      {collaborators.length > 0 && (
        <>
          <div aria-label="Other collaborators" className="flex items-center -space-x-2" role="group">
            {visibleCollaborators.map((collaborator) => (
              <div
                aria-label={`${collaborator.name} is in this room`}
                className="pointer-events-none grid size-8 shrink-0 place-items-center overflow-hidden rounded-full text-[11px] font-semibold text-white ring-2 ring-background"
                key={collaborator.id}
                role="img"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.avatar ? (
                  <img alt="" className="size-full object-cover" referrerPolicy="no-referrer" src={collaborator.avatar} />
                ) : (
                  initials(collaborator.name)
                )}
              </div>
            ))}
            {overflowCount > 0 && (
              <div
                aria-label={`${overflowCount} more collaborators`}
                className="pointer-events-none grid size-8 shrink-0 place-items-center rounded-full border border-border bg-muted text-[10px] font-medium text-foreground ring-2 ring-background"
                role="img"
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <span aria-hidden="true" className="h-5 w-px bg-border" />
        </>
      )}
      <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
    </div>
  )
}
