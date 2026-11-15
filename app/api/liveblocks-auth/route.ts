import { getAccessibleProject, getCurrentIdentity } from "@/lib/project-access";
import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks";
import { readJsonObject } from "@/lib/project-api";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonObject(request);
  if (body instanceof Response) return body;
  if (typeof body.room !== "string" || !body.room.trim()) {
    return Response.json({ error: "A project room ID is required" }, { status: 400 });
  }

  const roomId = body.room.trim();
  const project = await getAccessibleProject(roomId, identity);
  if (!project) return Response.json({ error: "Forbidden" }, { status: 403 });

  try {
    const liveblocks = getLiveblocksClient();
    await liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] });

    const session = liveblocks.prepareSession(identity.userId, {
      userInfo: {
        name: identity.displayName,
        color: getCursorColor(identity.userId),
        ...(identity.avatarUrl ? { avatar: identity.avatarUrl } : {}),
      },
    });
    session.allow(roomId, ["*:write"]);

    const { body: tokenBody, status } = await session.authorize();
    return new Response(tokenBody, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json({ error: "Unable to authorize the Liveblocks session" }, { status: 500 });
  }
}
