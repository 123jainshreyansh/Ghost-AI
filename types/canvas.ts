import type { Edge, Node } from "@xyflow/react";

export type CanvasShape = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon";

export const CANVAS_NODE_COLOR_PALETTE = [
  { id: "graphite", label: "Graphite", background: "oklch(0.30 0.025 265)", text: "oklch(0.96 0.01 260)" },
  { id: "violet", label: "Violet", background: "oklch(0.38 0.12 292)", text: "oklch(0.97 0.025 295)" },
  { id: "blue", label: "Blue", background: "oklch(0.36 0.10 248)", text: "oklch(0.97 0.02 235)" },
  { id: "teal", label: "Teal", background: "oklch(0.37 0.09 181)", text: "oklch(0.97 0.02 175)" },
  { id: "amber", label: "Amber", background: "oklch(0.40 0.10 75)", text: "oklch(0.98 0.025 90)" },
  { id: "rose", label: "Rose", background: "oklch(0.38 0.11 15)", text: "oklch(0.97 0.02 20)" },
] as const;

export type CanvasNodeData = {
  label: string;
  color: string;
  textColor: string;
  shape: CanvasShape;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<{ label: string }, "canvasEdge">;
