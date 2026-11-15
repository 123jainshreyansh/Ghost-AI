import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

export default function SignInPage() {
  return (
    <AuthPage>
      <Suspense>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "var(--auth-accent)",
              colorBackground: "var(--auth-card)",
              colorForeground: "var(--text-primary)",
              colorMutedForeground: "var(--text-muted)",
              colorInput: "var(--auth-input)",
              colorInputForeground: "var(--text-primary)",
              colorNeutral: "var(--text-primary)",
              colorDanger: "var(--state-error)",
              colorSuccess: "var(--state-success)",
              borderRadius: "0.65rem",
              fontFamily: "var(--font-sans)",
            },
          }}
          path={signInUrl}
          routing="path"
          signUpUrl={signUpUrl}
        />
      </Suspense>
    </AuthPage>
  );
}
