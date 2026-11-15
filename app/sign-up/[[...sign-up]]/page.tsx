import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

export default function SignUpPage() {
  return (
    <AuthPage>
      <Suspense>
        <SignUp path={signUpUrl} routing="path" signInUrl={signInUrl} />
      </Suspense>
    </AuthPage>
  );
}
