import type { CanvasShape } from "@/types/canvas";

function createSvg(shape: CanvasShape) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const createShapeElement = (tag: "rect" | "polygon" | "circle" | "path", attributes: Record<string, string>) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    element.setAttribute("fill", "var(--card)");
    element.setAttribute("stroke", "var(--brand-accent)");
    element.setAttribute("stroke-width", "2");
    return element;
  };

  if (shape === "diamond") {
    svg.append(createShapeElement("polygon", { points: "50,2 98,50 50,98 2,50" }));
  } else if (shape === "hexagon") {
    svg.append(createShapeElement("polygon", { points: "20,2 80,2 98,50 80,98 20,98 2,50" }));
  } else if (shape === "cylinder") {
    svg.append(createShapeElement("path", { d: "M3 16 C3 8 24 2 50 2 C76 2 97 8 97 16 V84 C97 92 76 98 50 98 C24 98 3 92 3 84 Z" }));
    const topArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    topArc.setAttribute("d", "M3 16 C3 24 24 30 50 30 C76 30 97 24 97 16");
    topArc.setAttribute("fill", "none");
    topArc.setAttribute("stroke", "var(--brand-accent)");
    topArc.setAttribute("stroke-width", "2");
    svg.append(topArc);
  }

  return svg;
}

export function createShapeDragPreview(shape: CanvasShape, width: number, height: number) {
  const preview = document.createElement("div");
  Object.assign(preview.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${width}px`,
    height: `${height}px`,
    boxSizing: "border-box",
    opacity: "0.82",
    filter: "drop-shadow(0 8px 16px rgb(0 0 0 / 35%))",
    pointerEvents: "none",
  });

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    Object.assign(preview.style, {
      border: "2px solid var(--brand-accent)",
      backgroundColor: "var(--card)",
      borderRadius: shape === "rectangle" ? "6px" : "9999px",
    });
  } else {
    preview.append(createSvg(shape));
  }

  return preview;
}
