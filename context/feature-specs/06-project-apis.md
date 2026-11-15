The databse schema is ready. Build the backend project API routes only.

## Routes

Create REST endpoints for:

-`GET /api/projects` . list current user's projects
-`POST /api/projects`, create project
-`PATCH /api/projects/[projectId]` , rename project
-`DELETE /api/projects/[projectsId]`, delete project

## Rules

Use the authenticated Clerk user ID as `ownerId`.

When creating:

-default missing project name to `Untitled Project`
-use the schema's existing ID strategy, do not add sequential IDs

Security:

-unauthorized requests return `401`
-only the project owner can rename or delete
-non-owner mutation return `403`

keep this backend-only. Do not wire the UI yet

## Check When Done

-routes exists for list/create/rename/delete
-owner checks are enforced for rename/delete
-`401` and `403` responses are handled correctly
-`npm run build` passes