import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function AccessDenied() {
  return (
    <section className="grid min-h-full flex-1 place-items-center px-6 py-16">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-card text-muted-foreground">
          <LockKeyhole aria-hidden="true" className="size-5" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">You can’t open this project</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This project may have moved, or you may not have access to it.
        </p>
        <Link className="mt-6 inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/editor">
          Back to projects
        </Link>
      </div>
    </section>
  );
}
