import Link from "next/link"
import { NewProjectButton } from "@/components/editor/new-project-button"

export default function EditorPage() {
  return (
    <div className="grid min-h-full flex-1 grid-cols-2">
      <section className="brand-panel relative flex min-w-0 flex-col justify-between overflow-hidden p-4 sm:p-7 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-40 size-[28rem] rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-24 size-[18rem] rounded-full border border-white/10" />
        <Link aria-label="Ghost AI home" className="relative flex w-fit items-center gap-2 text-xs font-semibold tracking-wide text-foreground sm:gap-3 sm:text-sm" href="/editor">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg border border-white/20 bg-white/10 font-bold">G</span>
          GHOST AI
        </Link>

        <div className="relative max-w-lg space-y-4 sm:space-y-6">
          <p className="text-[10px] font-medium text-white/65 sm:text-xs">Your creative workspace</p>
          <h1 className="text-2xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
            Make space for your next idea.
          </h1>
          <p className="max-w-sm text-xs leading-5 text-white/70 sm:text-sm sm:leading-6">
            A focused place to think, create, and move your projects forward with AI.
          </p>
        </div>

        <p className="relative text-[10px] text-white/55 sm:text-xs">A quieter way to get from thought to done.</p>
      </section>

      <section className="flex min-w-0 items-center justify-center border-l border-white/5 bg-background p-4 sm:p-8">
        <div className="w-full max-w-md space-y-4 text-center sm:space-y-5">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              Create a project or open an existing one
            </h2>
            <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              Start a new architecture workspace, or choose a project from the sidebar
            </p>
          </div>
          <NewProjectButton />
        </div>
      </section>
    </div>
  );
}
