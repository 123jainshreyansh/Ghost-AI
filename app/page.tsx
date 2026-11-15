import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function RootRedirect(): Promise<never> {
  const { userId } = await auth();
  redirect(userId ? "/editor" : process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in");
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <RootRedirect />
    </Suspense>
  );
}
