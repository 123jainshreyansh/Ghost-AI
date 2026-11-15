import type { ReactNode } from "react";
import { BrainCircuit, FileText, UsersRound } from "lucide-react";
import Link from "next/link";

type AuthPageProps = {
  children: ReactNode;
};

const features = [
  {
    icon: BrainCircuit,
    title: "AI architecture generation",
    description: "Describe your system and map it to a live canvas.",
  },
  {
    icon: UsersRound,
    title: "Real-time collaboration",
    description: "Work together with live cursors and shared editing.",
  },
  {
    icon: FileText,
    title: "Instant spec generation",
    description: "Export a complete Markdown spec from your canvas.",
  },
];

export function AuthPage({ children }: AuthPageProps) {
  return (
    <main className="grid min-h-screen flex-1 grid-cols-1 bg-[var(--auth-right)] md:grid-cols-2">
      <section className="auth-brand-panel relative hidden flex-col gap-10 border-r border-white/5 p-6 md:flex lg:p-10">
        <Link aria-label="Ghost AI home" className="flex w-fit items-center gap-2.5 text-sm font-semibold text-foreground" href="/">
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[var(--auth-accent)] text-xs font-bold text-[var(--auth-left)]">G</span>
          Ghost AI
        </Link>
        <div className="my-auto max-w-lg space-y-7">
          <div className="space-y-4">
            <h1 className="max-w-md text-2xl font-semibold leading-[1.12] tracking-tight text-foreground lg:text-3xl">
              Design systems at the speed of thought.
            </h1>
            <p className="max-w-md text-xs leading-5 text-white/65 lg:text-sm lg:leading-6">
              Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
            </p>
          </div>
          <ul className="space-y-4 lg:space-y-5">
            {features.map(({ icon: Icon, title, description }) => <li className="flex items-start gap-3" key={title}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--auth-icon-bg)] text-[var(--auth-accent)]">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-xs font-medium text-foreground lg:text-sm">{title}</span>
                <span className="mt-1 block text-[11px] leading-4 text-white/55 lg:text-xs">{description}</span>
              </span>
            </li>)}
          </ul>
        </div>
      </section>
      <section className="auth-form-panel flex min-h-screen min-w-0 items-center justify-center px-5 py-10 sm:px-8">
        <div className="auth-clerk-card-scope w-full max-w-[18rem]">
          <Link aria-label="Ghost AI home" className="mb-8 block w-fit text-lg font-semibold tracking-tight text-foreground md:hidden" href="/">
            Ghost AI
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
