import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

function pathnameFor(value: string, request: NextRequest) {
  return new URL(value, request.url).pathname.replace(/\/$/, "") || "/";
}

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute = [signInUrl, signUpUrl].some((route) => {
    const routePath = pathnameFor(route, request);
    return pathname === routePath || pathname.startsWith(`${routePath}/`);
  });
  const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");

  // API handlers return JSON 401 responses themselves instead of Clerk's page redirect.
  if (!isPublicAuthRoute && !isApiRoute) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
