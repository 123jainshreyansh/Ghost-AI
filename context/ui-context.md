# UI Context

## Theme

Dark only. The design language is a focused creative workspace with near-black surfaces, restrained color, and vivid accents for interactive elements. Authentication uses an equal two-panel layout from tablet widths upward, with a vivid purple editorial brand panel beside the dark form panel; small screens prioritize the form.

## Colors

Define color tokens as CSS custom properties in `app/globals.css`. Use tokens rather than hardcoded hex values.

| Role | CSS Variable | Value |
| --- | --- | --- |
| Page background | `--bg-base` | Near black (`--background`) |
| Surface | `--bg-surface` | Raised dark surface (`--card`) |
| Primary text | `--text-primary` | Near white (`--foreground`) |
| Muted text | `--text-muted` | Soft gray (`--muted-foreground`) |
| Primary accent | `--accent-primary` | Primary theme color (`--primary`) |
| Border | `--border-default` | Translucent white (`--border`) |
| Error | `--state-error` | Destructive theme color |
| Success | `--state-success` | Green status color |
| Workspace brand panel | `--brand-panel`, `--brand-panel-deep`, `--brand-accent` | Purple tint and gradient accent for the signed-in editor |
| Auth panels and accent | `--auth-left`, `--auth-right`, `--auth-card`, `--auth-input`, `--auth-accent` | Charcoal left panel, near-black form panel/card, and turquoise controls |

## Typography

| Role | Font | Variable |
| --- | --- | --- |
| UI text | Geist Sans | `--font-sans` |
| Code/mono | Geist Mono | `--font-mono` |

## Border Radius

| Context | Class |
| --- | --- |
| Inline / small UI | Follow the existing Tailwind radius scale |
| Cards / panels | Follow the existing Tailwind radius scale |
| Modals / overlays | Follow the existing Tailwind radius scale |

## Component Library

shadcn/ui on top of Tailwind. Components live in `components/ui/`; use the CLI to add components rather than writing generated primitives from scratch.

## Layout Patterns

- Authentication: full-viewport equal split from tablet widths upward, charcoal product story with turquoise feature icons on the left and a compact centered sign-in card on near black; form-first layout on small screens.
- Editor: full-viewport 50/50 split with a purple brand panel and dark canvas; the shared navigation sits above it and the project sidebar slides over the canvas.
- Sidebars: fixed width with a border separator.
- Modals: centered overlay with backdrop blur.
- Navbar: top bar with bottom border.

## Icons

Lucide React. Use stroke-based icons, sized `h-4 w-4` inline and `h-5 w-5` in buttons.
