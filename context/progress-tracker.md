# Progress Tracker

## Current Phase

- In Progress

## Current Goal

- Continue with the next planned editor feature spec.

## Completed

- Implemented feature spec 19: added canvas-only participant avatars with self-filtering and overflow, moved the Clerk UserButton into the canvas room view, and added Liveblocks React Flow cursors for other collaborators.
- Implemented feature spec 20: added the floating AI sidebar with AI Architect and Specs tabs, prompt chips, local chat presentation, and a static spec preview.
- Implemented feature spec 21: added authenticated private Vercel Blob canvas save/load APIs, empty-room-only snapshot restoration, save status feedback, and a workspace Save button.
- Implemented feature spec 17 canvas ergonomics: added bottom-left zoom, fit-view, undo, and redo controls; wired zoom/history keyboard shortcuts and ignored them in editable fields. Selected nodes and their connecting edges can be copied and pasted with Cmd/Ctrl+C/V; Delete and Backspace remove selected nodes and edges through Liveblocks.
- Restyled the starter-template import dialog to match `del/image4.png`: compact dark modal, three side-by-side preview cards, concise descriptions, and outlined import actions.
- Implemented feature spec 18: added microservices, CI/CD, and event-driven templates with lightweight previews, a navbar picker, and Liveblocks import that replaces the current canvas and fits the view.
- Removed the React Flow minimap from the canvas.
- Implemented feature spec 13: rectangle, pill, and circle nodes use CSS shapes; diamond, hexagon, and cylinder nodes use scalable SVGs. Selected nodes have stronger borders, and shape drags show a size-matched cursor preview that clears on drag end.
- Implemented feature spec 14: selected nodes show subtle resize handles with minimum dimensions, and labels can be edited inline on double-click with each keystroke synchronized through the Liveblocks React Flow change handler.
- Implemented feature spec 15: selected nodes show a floating toolbar with six predefined background/text color pairs; swatch changes update the node’s collaborative data immediately.
- Implemented feature spec 16: all four node handles fade in on hover, new connections use rounded orthogonal arrowed edges, and edges support hover/selection feedback plus synchronized midpoint labels.
- Implemented feature spec 12 with a bottom-centered draggable shape toolbar, shape-and-size payload validation, screen-to-canvas drop conversion, unique shape/timestamp/counter IDs, distinct shape outlines, click-to-place behavior, and visible connection ports.
- Implemented feature spec 11 with a client Liveblocks room wrapper, ClientSideSuspense loading state, connection error fallback, typed shared canvas nodes/edges, and a Liveblocks-synced React Flow canvas with loose connections, fitView, MiniMap, and dot background.
- Implemented feature spec 10 with typed Liveblocks Presence/UserMeta, a cached `@liveblocks/node` client, deterministic user cursor colors, and authenticated `POST /api/liveblocks-auth` room authorization.
- Installed the missing `@liveblocks/node` dependency; Liveblocks room access uses the project ID as the private room ID after server-side project access verification.
- Implemented feature spec 09 with workspace Share dialog, collaborator listing, owner-only invite/remove controls, read-only collaborator access, temporary copied-link feedback, and Clerk profile name/avatar enrichment with email fallback.
- Added authenticated `GET`, `POST`, and `DELETE /api/projects/[projectId]/collaborators` handlers with access checks, email validation, and owner-only mutation enforcement.
- Implemented `context/feature-specs/08-editor-workspace-shell.md`: added Clerk identity and project access helpers, the access-denied view, the `/editor/[roomId]` project workspace shell, active project highlighting, and the AI sidebar toggle.
- New project creation now navigates to `/editor/[roomId]`; the former `/workspace/[projectId]` path redirects to the access-checked workspace route.
- Active-workspace deletion now recognizes the `/editor/[roomId]` route and returns to `/editor`.
- Added server-side owned/shared project loading for the editor shell and replaced mock dialog state with API-backed create, rename, and delete actions.
- Added slug-plus-random-suffix room ID preview and creation, aligned the project primary ID with that room ID, and added the authenticated project workspace destination.
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

- No feature implementation is currently in progress; features 19–21 are complete.

## Next Up

- Add AI behavior in a later feature spec.

## Open Questions

- Generated room IDs remain the Project primary IDs and are reused as Liveblocks room IDs.
- `LIVEBLOCKS_SECRET_KEY` is not currently configured in `.env` or `.env.local`; Liveblocks server auth requires the project secret key at runtime.
- `BLOB_READ_WRITE_TOKEN` must be configured in the deployment environment for Vercel Blob canvas saves and loads.

## Architecture Decisions

- Editor chrome state is managed by `EditorShell` in the shared app layout; the sidebar is fixed over the canvas and does not change its layout.
- The existing generated Dialog primitives are the reusable dialog pattern and remain untouched.
- Authentication pages must render outside `EditorShell`; the protected editor experience owns the shell, while the root route resolves signed-in and signed-out navigation.
- Project records and collaborator email records are modeled in PostgreSQL; editor lists are server-loaded and project mutations use authenticated APIs.
- Canvas JSON is stored in private Vercel Blob storage, and Prisma stores only its URL in `Project.canvasJsonPath`; explicit saves use an authenticated project-scoped API.
- Prisma CLI configuration uses `prisma7.config.ts` and the split schema directory; the initial migration SQL is generated under `prisma/migrations`.

## Session Notes

- `npm.cmd run build` passes with synchronized canvas delete/copy/paste, zoom controls, and Liveblocks undo/redo.
- `npm.cmd run build` passes after implementing feature specs 19 and 20.
- Feature spec 21 is implemented, including the workspace Save button; `npm.cmd run build` passes with the canvas API route.
- Fixed canvas saves against the configured private Vercel Blob store: uploads and SDK reads now use private access. The previous public-access request was rejected by the store; the save UI now shows the returned error detail. `npm.cmd run build` and a temporary private Blob upload/read/delete check pass.
- Changed canvas saving to manual mode per user request: edits show Unsaved, and the workspace Save button sends the write.
- `npm.cmd run build` passes after switching canvas persistence to manual saves.
- `npm.cmd run build` passes after removing the canvas minimap.
- `npm.cmd run build` passes after matching the starter-template import dialog to `del/image4.png`.
- Feature spec 18 is implemented; `npm.cmd run build` passes with starter template previews and collaborative canvas replacement.
- `npm.cmd run build` passes after the root session redirect was placed inside Suspense for Next.js 16 prerendering. The first sandbox build could not fetch Google Fonts; the network-enabled retry completed successfully.
- `npm.cmd run build` and `npm.cmd run lint` pass after implementing the project dialogs and sidebar actions.
- `prisma format`, `prisma validate`, and `prisma generate` pass for the split Prisma schema. `npm.cmd run build` passes after adding the client singleton.
- Applied migration `20261114230000_init` to both the local CLI database and the app database in `.env.local`; remote `prisma migrate status` confirms the app database schema is up to date. The missing-table error came from the CLI and Next.js loading different `DATABASE_URL` values.
- `npm.cmd run build` passes with both project API routes included.
- Feature spec 07 is implemented; `npm.cmd run build` passes with server-loaded project data streamed under Suspense.
- Feature spec 08 is implemented; `npm.cmd run build` passes with `/editor/[roomId]` and the access-checked workspace shell.
- Feature spec 11 is implemented; `npm.cmd run build` and `npm.cmd run lint` pass with the collaborative React Flow canvas.
- Feature spec 12 is implemented; `npm.cmd run build` passes with collaborative shape creation.
- Toolbar click placement, per-shape rendering, and visible connection ports are fixed; `npm.cmd run build` passes.
- Feature spec 13 is implemented; `npm.cmd run build` passes with CSS/SVG node rendering and drag previews.
- Feature spec 14 is implemented; `npm.cmd run build` passes with synced resizing and inline label editing.
- Feature spec 15 is implemented; `npm.cmd run build` passes with predefined collaborative node color pairs and the selected-node toolbar.
- Feature spec 16 is implemented; `npm.cmd run build` passes with custom arrowed edges, hover handles, and collaborative inline edge labels.
- Feature spec 09 is implemented; `npm.cmd run build` passes with the collaborator API and share dialog.
- Feature spec 10 is implemented; `npm.cmd run build` passes with `/api/liveblocks-auth` included.
- Feature spec 11 is implemented; `npm.cmd run build` and `npm.cmd run lint` pass with the collaborative React Flow canvas.
- Feature spec 11 is implemented; `npm.cmd run build` passes with the Liveblocks-backed React Flow canvas.
- Preserve pre-existing worktree edits while implementing this feature.
