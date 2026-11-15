"use client"

import { useEffect, useRef, type DragEvent } from "react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createShapeDragPreview } from "@/components/editor/shape-drag-preview";
import type { CanvasShape } from "@/types/canvas";

export const SHAPE_DRAG_TYPE = "application/x-ghost-canvas-shape";

export type ShapeDragPayload = {
  shape: CanvasShape;
  width: number;
  height: number;
};

type ShapeOption = ShapeDragPayload & { Icon: LucideIcon; label: string };

export const SHAPE_OPTIONS = [
  { shape: "rectangle", width: 160, height: 90, label: "Rectangle", Icon: RectangleHorizontal },
  { shape: "diamond", width: 140, height: 140, label: "Diamond", Icon: Diamond },
  { shape: "circle", width: 100, height: 100, label: "Circle", Icon: Circle },
  { shape: "pill", width: 150, height: 64, label: "Pill", Icon: Pill },
  { shape: "cylinder", width: 130, height: 110, label: "Cylinder", Icon: Cylinder },
  { shape: "hexagon", width: 140, height: 110, label: "Hexagon", Icon: Hexagon },
] satisfies ShapeOption[];

export function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ShapeDragPayload>;
  return SHAPE_OPTIONS.some((option) =>
    candidate.shape === option.shape && candidate.width === option.width && candidate.height === option.height,
  );
}

function startShapeDrag(event: DragEvent<HTMLButtonElement>, option: ShapeOption) {
  const payload: ShapeDragPayload = {
    shape: option.shape,
    width: option.width,
    height: option.height,
  };
  const preview = createShapeDragPreview(option.shape, option.width, option.height);
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, option.width / 2, option.height / 2);
  event.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
  return preview;
}

export function CanvasShapePanel({ onClickShape }: { onClickShape: (shape: CanvasShape) => void }) {
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => previewRef.current?.remove(), []);

  function handleDragStart(event: DragEvent<HTMLButtonElement>, option: ShapeOption) {
    previewRef.current?.remove();
    previewRef.current = startShapeDrag(event, option);
  }

  function handleDragEnd() {
    previewRef.current?.remove();
    previewRef.current = null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="rounded-full border border-border bg-card/90 px-3 py-1 text-[11px] text-muted-foreground shadow-md">
        Click to place · drag to position · connect from the dots
      </p>
      <div aria-label="Add shapes" className="flex items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-md" role="toolbar">
        {SHAPE_OPTIONS.map(({ shape, label, Icon, ...size }) => (
          <Button
            aria-label={`Add ${label.toLowerCase()} or drag onto canvas`}
            className="size-9 cursor-grab rounded-full active:cursor-grabbing"
            draggable
            key={shape}
            onClick={() => onClickShape(shape)}
            onDragEnd={handleDragEnd}
            onDragStart={(event) => handleDragStart(event, { shape, label, Icon, ...size })}
            size="icon"
            title={label}
            type="button"
            variant="ghost"
          >
            <Icon aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  );
}
