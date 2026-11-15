# Architecture Context

## Stack

| Layer     | Technology                  | Role   |
| --------- | --------------------------- | ------ |
| Framework | [e.g. Next.js + TypeScript] | [Role] |
| UI        | [e.g. Tailwind + shadcn/ui] | [Role] |
| Auth      | [e.g. Clerk]                | [Role] |
| Database  | Prisma ORM 7 + PostgreSQL  | Persistent project metadata and collaboration records; Prisma Postgres uses Accelerate |
| Blob storage | Vercel Blob | Persisted collaborative canvas JSON |
| [Layer]   | [Technology]                | [Role] |

## System Boundaries

- `app/(workspace)/` — authenticated editor routes and the shared editor shell; project workspaces are served at `/editor/[roomId]`.
- `app/sign-in/` and `app/sign-up/` — public Clerk authentication routes.
- `proxy.ts` — Clerk session middleware and default route protection, with the configured auth routes public.
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]

## Storage Model

- **PostgreSQL via Prisma**: `Project` and `ProjectCollaborator` models define durable ownership, project metadata, and collaborator email records. `canvasJsonPath` stores the Vercel Blob URL for the latest saved canvas; canvas content does not live in PostgreSQL. The editor home loads owned and shared project metadata server-side; dialog mutations use the project API. React Flow nodes and edges synchronize through Liveblocks Storage.
- **Vercel Blob**: Private storage holds each project's serialized canvas JSON. Authenticated project canvas API routes verify project access and use the Blob SDK for private uploads and reads; Prisma stores only the returned blob URL in `Project.canvasJsonPath`.

- **[Storage type e.g. Database]**: [What lives here —
  e.g. metadata, ownership, relationships]
- **[Storage type e.g. Blob/File Storage]**: [What lives
  here — e.g. generated files, media, large artifacts]

## Auth and Access Model

- Clerk authenticates users. The root route sends signed-in users to `/editor`; signed-out requests are sent to the configured sign-in route.
- Sign-in and sign-up paths come from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, defaulting to `/sign-in` and `/sign-up`.
- All routes are protected by default in `proxy.ts` except the configured sign-in and sign-up paths.
- [How ownership works — e.g. Every project has a single
  owner]
- [How access control works — e.g. Only the owner or a
  collaborator can mutate project resources]

## Invariants

1. [Rule the codebase must never violate — e.g. Request
   handlers do not run long-lived background work]
2. [Invariant two]
3. [Invariant three]
4. [Invariant four]

## Project Dialog State

- `useProjectDialogs` owns server-seeded project lists, dialog state, form state, and API mutation loading state. Its provider is scoped to `EditorShell` so the editor home and project sidebar share updates.
- Generated project room IDs are also the Project primary IDs. New projects navigate to `/editor/[roomId]`; server-side access checks guard workspace rendering.
- `lib/project-access.ts` resolves the current Clerk user and primary email and checks ownership or collaborator access before workspace rendering.
- `lib/liveblocks.ts` owns the cached Liveblocks Node client and deterministic cursor color assignment. Liveblocks session metadata uses Clerk identity and remains separate from Prisma project metadata.
- `components/editor/collaborative-canvas.tsx` owns the client Liveblocks providers and React Flow canvas; the `/editor/[roomId]` page remains a server component.
- `components/editor/canvas-shape-panel.tsx` defines draggable shape payloads and default dimensions. The collaborative canvas validates drops and creates typed nodes in Liveblocks-synced React Flow state.
- `components/editor/shape-drag-preview.ts` builds cursor-following native drag images for each supported node shape; the shape panel removes the preview when dragging ends.

## Prisma Access

- `lib/prisma.ts` exports a cached Prisma Client singleton. Prisma Postgres URLs use Accelerate; standard PostgreSQL URLs use the `@prisma/adapter-pg` driver adapter.
- Prisma models are split across `prisma/` schema files, with the project models in `prisma/models/project.prisma`.
- `app/api/projects/` exposes Clerk-authenticated list and create handlers and owner-only rename and delete handlers. The authenticated Clerk user ID is the project `ownerId`; API handlers perform their own auth checks so unauthenticated requests receive JSON 401 responses rather than page redirects.
- `app/api/projects/[projectId]/collaborators/` lists collaborators for project members and restricts invite/remove mutations to the owner. Collaborator records store email addresses; Clerk Backend API lookups enrich them with profile names and avatars without a local user table.
- `app/api/projects/[projectId]/canvas/` verifies project access and saves/loads serialized canvas JSON through Vercel Blob, with Prisma storing only the blob URL.
- Canvas snapshots use private Vercel Blob access. Workspace changes are saved explicitly with the Save button; loading still restores a saved snapshot only when the Liveblocks room is empty.
- `app/api/liveblocks-auth/` verifies Clerk identity and project access before ensuring a private Liveblocks room exists and issuing a room-scoped access token.
