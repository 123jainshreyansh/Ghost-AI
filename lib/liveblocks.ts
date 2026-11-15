import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#EC4899",
  "#22C55E",
  "#EAB308",
  "#3B82F6",
  "#EF4444",
] as const;

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocksClient?: Liveblocks;
};

export function getLiveblocksClient() {
  if (globalForLiveblocks.liveblocksClient) return globalForLiveblocks.liveblocksClient;
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY must be configured to authorize Liveblocks sessions.");
  globalForLiveblocks.liveblocksClient = new Liveblocks({ secret });
  return globalForLiveblocks.liveblocksClient;
}

export function getCursorColor(userId: string) {
  let hash = 2166136261;
  for (let index = 0; index < userId.length; index += 1) {
    hash = Math.imul(hash ^ userId.charCodeAt(index), 16777619);
  }
  return CURSOR_COLORS[(hash >>> 0) % CURSOR_COLORS.length];
}
