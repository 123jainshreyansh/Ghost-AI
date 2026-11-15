# Architecture Context

## Stack

| Layer     | Technology                  | Role   |
| --------- | --------------------------- | ------ |
| Framework | [e.g. Next.js + TypeScript] | [Role] |
| UI        | [e.g. Tailwind + shadcn/ui] | [Role] |
| Auth      | [e.g. Clerk]                | [Role] |
| Database  | Prisma ORM 7 + PostgreSQL  | Persistent project metadata and collaboration records; Prisma Postgres uses Accelerate |
| [Layer]   | [Technology]                | [Role] |

## System Boundaries

- `app/(workspace)/` — authenticated editor routes and the shared editor shell.
- `app/sign-in/` and `app/sign-up/` — public Clerk authentication routes.
- `proxy.ts` — Clerk session middleware and default route protection, with the configured auth routes public.
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]

## Storage Model

- **PostgreSQL via Prisma**: `Project` and `ProjectCollaborator` models define durable ownership, project metadata, and collaborator email records. `canvasJsonPath` points to future canvas blob storage; canvas content does not live in PostgreSQL. The editor home loads owned and shared project metadata server-side; dialog mutations use the project API.

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
- Generated project room IDs are also the Project primary IDs. New projects navigate to `/workspace/[projectId]`; this route is the authenticated destination for a project workspace.

## Prisma Access

- `lib/prisma.ts` exports a cached Prisma Client singleton. Prisma Postgres URLs use Accelerate; standard PostgreSQL URLs use the `@prisma/adapter-pg` driver adapter.
- Prisma models are split across `prisma/` schema files, with the project models in `prisma/models/project.prisma`.
- `app/api/projects/` exposes Clerk-authenticated list and create handlers and owner-only rename and delete handlers. The authenticated Clerk user ID is the project `ownerId`; API handlers perform their own auth checks so unauthenticated requests receive JSON 401 responses rather than page redirects.
