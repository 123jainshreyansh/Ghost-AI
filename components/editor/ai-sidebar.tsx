"use client"

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, Bot, Download, FileText, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type AiSidebarProps = {
  open: boolean
  onClose: () => void
}

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ open, onClose }: AiSidebarProps) {
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submitMessage = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const content = draft.trim()
    if (!content) return

    setMessages((current) => [...current, { id: Date.now(), role: "user", content }])
    setDraft("")
    if (textareaRef.current) textareaRef.current.style.height = "72px"
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submitMessage()
    }
  }

  const handleDraftChange = (value: string) => {
    setDraft(value)
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "72px"
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 72), 160)}px`
  }

  return (
    <aside
      aria-hidden={!open}
      aria-label="AI workspace sidebar"
      className={`absolute inset-y-3 right-3 z-30 flex w-[min(22rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-background/95 text-foreground shadow-2xl backdrop-blur transition-[transform,opacity] duration-300 ease-out ${open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[calc(100%+1rem)] opacity-0"}`}
      inert={!open}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklch,var(--brand-accent)_16%,transparent)] text-[var(--brand-accent)]">
          <Bot aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">AI Workspace</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Collaborate with Ghost AI</p>
        </div>
        <Button aria-label="Close AI sidebar" onClick={onClose} size="icon-sm" type="button" variant="ghost">
          <X aria-hidden="true" />
        </Button>
      </header>

      <Tabs className="flex min-h-0 flex-1 flex-col gap-0" defaultValue="architect">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2 bg-muted/70" variant="default">
          <TabsTrigger className="data-active:bg-[var(--brand-panel)] data-active:text-[var(--brand-accent)]" value="architect">
            AI Architect
          </TabsTrigger>
          <TabsTrigger className="data-active:bg-[var(--brand-panel)] data-active:text-[var(--brand-accent)]" value="specs">
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-3 flex min-h-0 flex-1 flex-col" value="architect">
          <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col items-center justify-center py-6 text-center">
                <div className="grid size-11 place-items-center rounded-2xl border border-border bg-card text-[var(--brand-accent)]">
                  <Sparkles aria-hidden="true" className="size-5" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground">Shape your next idea</h3>
                <p className="mt-1.5 max-w-64 text-xs leading-5 text-muted-foreground">
                  Describe a system or start with one of these prompts.
                </p>
                <div className="mt-5 flex w-full flex-col items-center gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      className="max-w-full rounded-full bg-muted px-3 py-2 text-xs text-[var(--brand-accent)] transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      key={prompt}
                      onClick={() => {
                        setDraft(prompt)
                        textareaRef.current?.focus()
                      }}
                      type="button"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                {messages.map((message) => (
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-5 ${message.role === "user" ? "ml-auto rounded-br-md border-2 border-[color-mix(in_oklch,var(--brand-accent)_50%,transparent)] bg-[color-mix(in_oklch,var(--brand-panel)_62%,var(--background))] text-foreground" : "mr-auto rounded-bl-md border border-border bg-card text-foreground"}`}
                    key={message.id}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="shrink-0 border-t border-border p-3" onSubmit={submitMessage}>
            <div className="rounded-xl border border-border bg-card p-2 focus-within:border-ring">
              <Textarea
                aria-label="Message Ghost AI"
                className="field-sizing-fixed min-h-[72px] max-h-40 resize-none border-0 bg-transparent px-1.5 py-1.5 text-sm shadow-none focus-visible:ring-0"
                onChange={(event) => handleDraftChange(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Describe what you want to build..."
                ref={textareaRef}
                rows={3}
                value={draft}
              />
              <div className="mt-1 flex items-center justify-between px-1">
                <span className="text-[10px] text-muted-foreground">Enter to send · Shift+Enter for a new line</span>
                <Button
                  aria-label="Send message"
                  className="size-7 rounded-lg bg-[var(--brand-accent)] p-0 text-white hover:bg-[color-mix(in_oklch,var(--brand-accent)_86%,white)]"
                  disabled={!draft.trim()}
                  size="icon-sm"
                  type="submit"
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-4" value="specs">
          <Button className="w-full bg-[var(--brand-accent)] text-white hover:bg-[color-mix(in_oklch,var(--brand-accent)_86%,white)]" type="button">
            <Sparkles aria-hidden="true" className="size-4" />
            Generate Spec
          </Button>
          <Card className="mt-4 gap-0 border-border bg-card p-4 shadow-none">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-[var(--brand-accent)]">
                <FileText aria-hidden="true" className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-foreground">System Architecture</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A structured technical spec for your application architecture, services, and data flow.
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full" disabled type="button" variant="outline">
              <Download aria-hidden="true" className="size-4" />
              Download
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
