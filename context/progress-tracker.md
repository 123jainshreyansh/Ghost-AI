# Progress Tracker

## Current Phase

- In Progress

## Current Goal

- Continue wiring the editor home and project sidebar to persisted project data and API mutations.

## Completed

- Added server-side owned/shared project loading for the editor shell and replaced mock dialog state with API-backed create, rename, and delete actions.
- Added slug-plus-random-suffix room ID preview and creation, aligned the project primary ID with that room ID, and added the authenticated `/workspace/[projectId]` destination.
- Added API create ID validation and documented server-seeded project state and room ID routing in `architecture.md`.
- Fixed create success to close and clear the persistent project dialog before navigating to the new workspace.
- Initialized shadcn/ui for Next.js and Tailwind CSS v4.
- Generated Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea under `components/ui/`.
- Installed the `lucide-react` icon library and class merging dependencies.
- Added `lib/utils.ts` with a Tailwind-aware `cn()` helper.
- Set the app's global shadcn tokens and base theme to dark colors.
- Added a responsive editor navbar with a stateful sidebar toggle and centered Ghost AI title.
- Added a floating, sliding project sidebar with My Projects and Shared empty states and a New Project action.
- Wired the editor navbar and project sidebar into the shared app layout through the reusable editor shell. Existing Dialog primitives provide token-based title, description, and footer actions; no dialog instances were added.
- Read the authentication feature spec and confirmed Clerk keys are present in `.env.local`; sign-in and sign-up URL variables are not currently defined.
- Added `@clerk/ui` and wrapped the root app in `ClerkProvider` with Clerk's dark theme and the app's CSS color variables.
- Added responsive Clerk sign-in and sign-up pages with minimal two-panel desktop layouts and form-only small-screen layouts.
- Added default route protection in root `proxy.ts`, routed `/` to `/editor` or the configured sign-in path, and scoped the editor shell to `/editor`.
- Implemented the `/editor` home copy and New Project action, live slug preview, create/rename/delete dialogs, mock owned/shared projects, owned-only sidebar actions, and mobile sidebar scrim dismissal.
- Added Clerk's built-in `UserButton` to the editor navbar and documented the auth route boundary in `architecture.md`.
- Restyled authentication as a clear 50/50 split from tablet widths upward, with an editorial violet brand panel beside the dark form; documented Geist Sans and Geist Mono as the UI font tokens.
- Added the same always-visible 50/50 brand-and-canvas split to the signed-in editor and installed the Anthropic `frontend-design` skill in `.agents/skills/frontend-design`.
- Matched the sign-in page to `del/image2.png` with a charcoal feature panel, turquoise icons and action button, and a compact Clerk card on a near-black panel.
- Added the `Project` and `ProjectCollaborator` Prisma models with the requested status, relation, uniqueness, cascade deletion, and indexes.
- Added `lib/prisma.ts` with a development hot-reload cache, Accelerate for `prisma+postgres://` URLs, and the PostgreSQL driver adapter for direct URLs; installed `@prisma/extension-accelerate`.
- Documented the Prisma schema and client boundaries in `architecture.md`.
- Added `GET` and `POST /api/projects` and `PATCH` and `DELETE /api/projects/[projectId]` using Clerk auth and Prisma, with owner-scoped listing, the `Untitled Project` create default, and owner-only mutations.
- Added 401 responses for unauthenticated requests, 403 responses for non-owner mutations, 404 for missing projects, and 400 responses for malformed or invalid request bodies.
- Kept the existing project UI disconnected from the new API as specified and documented the API boundary in `architecture.md`.

## In Progress


## Next Up

- Connect the project UI to the API in a later feature after the backend routes are complete.

## Open Questions

- Liveblocks is not configured in the project; this feature uses the generated room ID as the Project primary ID, leaving Liveblocks integration for its own feature.

## Architecture Decisions

- Editor chrome state is managed by `EditorShell` in the shared app layout; the sidebar is fixed over the canvas and does not change its layout.
- The existing generated Dialog primitives are the reusable dialog pattern and remain untouched.
- Authentication pages must render outside `EditorShell`; the protected editor experience owns the shell, while the root route resolves signed-in and signed-out navigation.
- Project records are modeled in PostgreSQL, but the existing project dialog UI continues to use in-memory mock data until a later feature connects it to persistence.
- Prisma CLI configuration uses `prisma7.config.ts` and the split schema directory; the initial migration SQL is generated under `prisma/migrations`.

## Session Notes

- `npm.cmd run build` passes after the root session redirect was placed inside Suspense for Next.js 16 prerendering. The first sandbox build could not fetch Google Fonts; the network-enabled retry completed successfully.
- `npm.cmd run build` and `npm.cmd run lint` pass after implementing the project dialogs and sidebar actions.
- `prisma format`, `prisma validate`, and `prisma generate` pass for the split Prisma schema. `npm.cmd run build` passes after adding the client singleton.
- Applied migration `20261114230000_init` to both the local CLI database and the app database in `.env.local`; remote `prisma migrate status` confirms the app database schema is up to date. The missing-table error came from the CLI and Next.js loading different `DATABASE_URL` values.
- `npm.cmd run build` passes with both project API routes included.
- Feature spec 07 is implemented; `npm.cmd run build` passes with `/editor` and `/workspace/[projectId]` server data streamed under Suspense.
- Preserve pre-existing worktree edits while implementing this feature.
