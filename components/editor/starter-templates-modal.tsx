"use client"

import { ArrowDownToLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates"

type StarterTemplatesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

const PREVIEW_WIDTH = 320
const PREVIEW_HEIGHT = 176
const PREVIEW_PADDING = 24

function getNodeSize(node: CanvasNode) {
  return {
    width: typeof node.style?.width === "number" ? node.style.width : node.width ?? 144,
    height: typeof node.style?.height === "number" ? node.style.height : node.height ?? 68,
  }
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const positionedNodes = template.nodes.map((node) => ({ node, ...getNodeSize(node) }));
  const minX = Math.min(...positionedNodes.map(({ node }) => node.position.x));
  const minY = Math.min(...positionedNodes.map(({ node }) => node.position.y));
  const maxX = Math.max(...positionedNodes.map(({ node, width }) => node.position.x + width));
  const maxY = Math.max(...positionedNodes.map(({ node, height }) => node.position.y + height));
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / boundsWidth,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / boundsHeight,
  );
  const renderedWidth = boundsWidth * scale;
  const renderedHeight = boundsHeight * scale;
  const offsetX = (PREVIEW_WIDTH - renderedWidth) / 2;
  const offsetY = (PREVIEW_HEIGHT - renderedHeight) / 2;
  const renderedNodes = positionedNodes.map((entry) => ({
    ...entry,
    x: offsetX + (entry.node.position.x - minX) * scale,
    y: offsetY + (entry.node.position.y - minY) * scale,
    renderedWidth: entry.width * scale,
    renderedHeight: entry.height * scale,
  }));
  const nodesById = new Map(renderedNodes.map((entry) => [entry.node.id, entry]));

  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
    >
      {template.edges.map((edge: CanvasEdge) => {
        const source = nodesById.get(edge.source);
        const target = nodesById.get(edge.target);
        if (!source || !target) return null;
        return (
          <line
            key={edge.id}
            x1={source.x + source.renderedWidth / 2}
            x2={target.x + target.renderedWidth / 2}
            y1={source.y + source.renderedHeight / 2}
            y2={target.y + target.renderedHeight / 2}
            stroke="var(--muted-foreground)"
            strokeOpacity="0.58"
            strokeWidth="1.25"
          />
        );
      })}
      {renderedNodes.map(({ node, x, y, renderedWidth, renderedHeight }) => {
        const { shape, color } = node.data;
        const stroke = "color-mix(in oklch, var(--foreground) 45%, transparent)";
        const common = { fill: color, stroke, strokeWidth: 1 };

        return (
          <g key={node.id}>
            {shape === "diamond" ? (
              <polygon
                {...common}
                points={`${x + renderedWidth / 2},${y} ${x + renderedWidth},${y + renderedHeight / 2} ${x + renderedWidth / 2},${y + renderedHeight} ${x},${y + renderedHeight / 2}`}
              />
            ) : shape === "hexagon" ? (
              <polygon
                {...common}
                points={`${x + renderedWidth * 0.2},${y} ${x + renderedWidth * 0.8},${y} ${x + renderedWidth},${y + renderedHeight / 2} ${x + renderedWidth * 0.8},${y + renderedHeight} ${x + renderedWidth * 0.2},${y + renderedHeight} ${x},${y + renderedHeight / 2}`}
              />
            ) : shape === "circle" ? (
              <ellipse
                {...common}
                cx={x + renderedWidth / 2}
                cy={y + renderedHeight / 2}
                rx={renderedWidth / 2}
                ry={renderedHeight / 2}
              />
            ) : shape === "cylinder" ? (
              <g>
                <path
                  {...common}
                  d={`M ${x} ${y + renderedHeight * 0.18} C ${x} ${y - renderedHeight * 0.06}, ${x + renderedWidth} ${y - renderedHeight * 0.06}, ${x + renderedWidth} ${y + renderedHeight * 0.18} L ${x + renderedWidth} ${y + renderedHeight * 0.82} C ${x + renderedWidth} ${y + renderedHeight * 1.06}, ${x} ${y + renderedHeight * 1.06}, ${x} ${y + renderedHeight * 0.82} Z`}
                />
                <path
                  d={`M ${x} ${y + renderedHeight * 0.18} C ${x} ${y + renderedHeight * 0.42}, ${x + renderedWidth} ${y + renderedHeight * 0.42}, ${x + renderedWidth} ${y + renderedHeight * 0.18}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1"
                />
              </g>
            ) : (
              <rect
                {...common}
                height={renderedHeight}
                rx={shape === "pill" ? renderedHeight / 2 : 4}
                width={renderedWidth}
                x={x}
                y={y}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[min(88vh,860px)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-border/80 bg-popover p-0 shadow-2xl sm:max-w-[640px]">
        <DialogHeader className="border-b border-border px-4 py-4 pr-12">
          <DialogTitle className="text-base">Import Template</DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <Card className="gap-0 rounded-xl border border-border/80 bg-card/50 py-0" key={template.id}>
                <div className="m-2.5 mb-0 h-[120px] overflow-hidden rounded-md border border-border/60 bg-[var(--auth-right)]">
                  <TemplatePreview template={template} />
                </div>
                <CardContent className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
                  <h3 className="text-xs font-semibold text-foreground">{template.name}</h3>
                  <p className="mt-1 min-h-[66px] flex-1 text-[11px] leading-[1.45] text-muted-foreground">
                    {template.description}
                  </p>
                  <Button className="mt-3 w-full justify-center gap-2 border-border bg-transparent text-xs text-foreground hover:bg-muted" onClick={() => handleImport(template)} size="sm" variant="outline">
                    <ArrowDownToLine aria-hidden="true" className="size-4" />
                    Import
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
