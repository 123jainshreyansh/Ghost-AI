"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import {
  BaseEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  MarkerType,
  NodeResizer,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type ReactFlowInstance,
  useReactFlow,
  type NodeProps,
  type EdgeProps,
  type Connection,
} from "@xyflow/react";
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow";
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { useCanRedo, useCanUndo, useErrorListener, useRedo, useUndo } from "@liveblocks/react";
import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";

import { CANVAS_NODE_COLOR_PALETTE, type CanvasEdge, type CanvasNode, type CanvasNodeData, type CanvasShape } from "@/types/canvas";
import { CanvasShapePanel, isShapeDragPayload, SHAPE_DRAG_TYPE, SHAPE_OPTIONS } from "@/components/editor/canvas-shape-panel";
import { OPEN_STARTER_TEMPLATES_EVENT, type CanvasTemplate } from "@/components/editor/starter-templates";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { CollaboratorPresence } from "@/components/editor/collaborator-presence";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasAutosave, type CanvasSaveStatus } from "@/hooks/use-canvas-autosave";

type CollaborativeCanvasProps = {
  roomId: string;
  onSaveHandlerReady?: (handler: (() => Promise<void>) | null) => void;
  onSaveStatusChange?: (status: CanvasSaveStatus, errorMessage: string | null) => void;
};

const UpdateNodeDataContext = createContext<((nodeId: string, data: Partial<CanvasNodeData>) => void) | null>(null);
const UpdateEdgeLabelContext = createContext<((edgeId: string, label: string) => void) | null>(null);

type CanvasControlsProps = {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

function CanvasControls({ reactFlow, canUndo, canRedo, onUndo, onRedo }: CanvasControlsProps) {
  return (
    <div aria-label="Canvas controls" className="flex items-center gap-1 rounded-full border border-border bg-popover/95 p-1 shadow-lg backdrop-blur" role="toolbar">
      <div className="flex items-center gap-0.5">
        <Button aria-label="Zoom out" onClick={() => void reactFlow.zoomOut({ duration: 160 })} size="icon-sm" title="Zoom out" type="button" variant="ghost">
          <ZoomOut aria-hidden="true" />
        </Button>
        <Button aria-label="Fit canvas to view" onClick={() => void reactFlow.fitView({ padding: 0.2, duration: 200 })} size="icon-sm" title="Fit view" type="button" variant="ghost">
          <Maximize aria-hidden="true" />
        </Button>
        <Button aria-label="Zoom in" onClick={() => void reactFlow.zoomIn({ duration: 160 })} size="icon-sm" title="Zoom in" type="button" variant="ghost">
          <ZoomIn aria-hidden="true" />
        </Button>
      </div>
      <div aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
      <div className="flex items-center gap-0.5">
        <Button aria-label="Undo" disabled={!canUndo} onClick={onUndo} size="icon-sm" title="Undo (Ctrl/⌘ Z)" type="button" variant="ghost">
          <Undo2 aria-hidden="true" />
        </Button>
        <Button aria-label="Redo" disabled={!canRedo} onClick={onRedo} size="icon-sm" title="Redo (Ctrl/⌘ Shift Z)" type="button" variant="ghost">
          <Redo2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function CanvasLoading() {
  return (
    <div aria-live="polite" className="grid h-full min-h-64 place-items-center text-sm text-muted-foreground">
      Connecting to the canvas…
    </div>
  );
}

function CanvasError({ message }: { message: string }) {
  return (
    <div aria-live="assertive" className="grid h-full min-h-64 place-items-center px-6 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-medium">Canvas connection lost</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function FlowErrorListener({ onConnectionError }: { onConnectionError: (message: string) => void }) {
  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      onConnectionError("We couldn’t connect to this project’s shared canvas. Check your connection and reload the page to try again.");
    }
  });
  return null;
}

function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const updateNodeData = useContext(UpdateNodeDataContext);
  const [isEditing, setIsEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(data.label);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const activeColor = CANVAS_NODE_COLOR_PALETTE.find((color) => color.background === data.color) ?? CANVAS_NODE_COLOR_PALETTE[0];
  const stroke = selected ? activeColor.background : `color-mix(in oklch, ${activeColor.background} 72%, var(--border))`;
  const borderStyle = {
    borderColor: stroke,
    borderWidth: selected ? 2 : 1,
    boxShadow: selected ? `0 0 0 1px ${data.color}` : undefined,
  };

  const startEditing = () => {
    setLabelDraft(data.label);
    setIsEditing(true);
  };

  const handleLabelChange = (value: string) => {
    setLabelDraft(value);
    updateNodeData?.(id, { label: value });
  };

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      setIsEditing(false);
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center px-3 py-2 text-sm">
      {selected && (
        <div
          aria-label="Node colors"
          className="nodrag nopan absolute -top-12 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-border bg-popover px-2 py-1.5 shadow-xl"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          role="toolbar"
        >
          {CANVAS_NODE_COLOR_PALETTE.map((color) => {
            const isActive = activeColor.id === color.id;
            return (
              <button
                aria-label={`${color.label} node color`}
                aria-pressed={isActive}
                className={`nodrag nopan size-5 rounded-full border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover ${isActive ? "border-foreground ring-2 ring-foreground/70 ring-offset-1 ring-offset-popover" : "border-white/35"}`}
                key={color.id}
                onClick={() => updateNodeData?.(id, { color: color.background, textColor: color.text })}
                onPointerEnter={() => setHoveredColor(color.id)}
                onPointerLeave={() => setHoveredColor(null)}
                style={{
                  backgroundColor: color.background,
                  boxShadow: hoveredColor === color.id ? `0 0 0 3px color-mix(in oklch, ${color.text} 28%, transparent)` : undefined,
                }}
                title={color.label}
                type="button"
              />
            );
          })}
        </div>
      )}
      <NodeResizer
        color="var(--brand-accent)"
        handleStyle={{ width: 8, height: 8, borderRadius: 2, border: "1px solid var(--background)" }}
        isVisible={selected}
        lineStyle={{ borderColor: "color-mix(in oklch, var(--brand-accent) 55%, transparent)" }}
        minHeight={56}
        minWidth={80}
      />
      {data.shape === "rectangle" && <div aria-hidden="true" className="absolute inset-0 rounded-md border" style={{ ...borderStyle, backgroundColor: activeColor.background }} />}
      {data.shape === "pill" && <div aria-hidden="true" className="absolute inset-0 rounded-full border" style={{ ...borderStyle, backgroundColor: activeColor.background }} />}
      {data.shape === "circle" && <div aria-hidden="true" className="absolute inset-0 rounded-full border" style={{ ...borderStyle, backgroundColor: activeColor.background }} />}
      {(data.shape === "diamond" || data.shape === "hexagon" || data.shape === "cylinder") && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          {data.shape === "diamond" && <polygon fill={activeColor.background} points="50,2 98,50 50,98 2,50" stroke={stroke} strokeWidth={selected ? 2.5 : 1.5} />}
          {data.shape === "cylinder" && (
            <>
              <path d="M3 16 C3 8 24 2 50 2 C76 2 97 8 97 16 V84 C97 92 76 98 50 98 C24 98 3 92 3 84 Z" fill={activeColor.background} stroke={stroke} strokeWidth={selected ? 2.5 : 1.5} />
              <path d="M3 16 C3 24 24 30 50 30 C76 30 97 24 97 16" fill="none" stroke={stroke} strokeWidth={selected ? 2.5 : 1.5} />
            </>
          )}
          {data.shape === "hexagon" && <polygon fill={activeColor.background} points="20,2 80,2 98,50 80,98 20,98 2,50" stroke={stroke} strokeWidth={selected ? 2.5 : 1.5} />}
        </svg>
      )}
      <Handle className="canvas-node-handle !size-2.5 !border-2 !border-background !bg-white shadow-sm" id="target-left" position={Position.Left} title="Connect to another shape" type="target" />
      <Handle className="canvas-node-handle !size-2.5 !border-2 !border-background !bg-white shadow-sm" id="source-right" position={Position.Right} title="Drag to connect another shape" type="source" />
      <Handle className="canvas-node-handle !size-2.5 !border-2 !border-background !bg-white shadow-sm" id="target-top" position={Position.Top} title="Connect to another shape" type="target" />
      <Handle className="canvas-node-handle !size-2.5 !border-2 !border-background !bg-white shadow-sm" id="source-bottom" position={Position.Bottom} title="Drag to connect another shape" type="source" />
      <span
        className={`relative z-10 max-w-[70%] break-words text-center ${data.label ? "" : "opacity-70"}`}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          startEditing();
        }}
        style={{ color: data.textColor ?? activeColor.text }}
      >
        {data.label || "Double-click to add a label"}
      </span>
      {isEditing && (
        <textarea
          aria-label="Node label"
          autoFocus
          className="nodrag nopan nowheel absolute left-1/2 top-1/2 z-20 min-h-10 w-[70%] -translate-x-1/2 -translate-y-1/2 resize-none rounded-sm border border-border bg-card px-2 py-1 text-center text-sm shadow-sm outline-none focus:border-primary"
          onBlur={() => setIsEditing(false)}
          onChange={(event) => handleLabelChange(event.target.value)}
          onDoubleClick={(event) => event.stopPropagation()}
          onKeyDown={handleLabelKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          placeholder="Add a label"
          style={{ color: data.textColor ?? activeColor.text }}
          value={labelDraft}
        />
      )}
    </div>
  );
}

const nodeTypes = { canvasNode: CanvasNodeRenderer };

function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const updateEdgeLabel = useContext(UpdateEdgeLabelContext);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(data?.label ?? "");
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = selected || hovered;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
    offset: 20,
  });

  const commitLabel = () => {
    updateEdgeLabel?.(id, labelDraft.trim());
    setIsEditing(false);
  };

  const startEditing = (event: ReactMouseEvent<SVGGElement | HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setLabelDraft(data?.label ?? "");
    setIsEditing(true);
  };

  const handlePointerEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovered(true);
  };

  const handlePointerLeave = () => {
    hoverTimeout.current = setTimeout(() => setHovered(false), 120);
  };

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      commitLabel();
    }
  };

  return (
    <>
      <g onDoubleClick={startEditing} onMouseEnter={handlePointerEnter} onMouseLeave={handlePointerLeave}>
        <BaseEdge
          interactionWidth={20}
          markerEnd={markerEnd}
          path={edgePath}
          style={{
            opacity: isActive ? 1 : 0.62,
            stroke: "var(--foreground)",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 1.75,
            transition: "opacity 120ms ease",
          }}
        />
      </g>
      {(data?.label || isActive || isEditing) && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute pointer-events-auto"
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={startEditing}
            onMouseDown={(event) => event.stopPropagation()}
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onPointerDown={(event) => event.stopPropagation()}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {isEditing ? (
              <input
                aria-label="Edge label"
                autoFocus
                className="nodrag nopan nowheel rounded-full border border-border bg-popover px-2 py-1 text-center text-xs text-popover-foreground shadow-md outline-none focus:border-primary"
                onBlur={commitLabel}
                onChange={(event) => setLabelDraft(event.target.value)}
                onKeyDown={handleLabelKeyDown}
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                size={Math.min(Math.max(labelDraft.length, 1), 32)}
                style={{ width: `${Math.min(Math.max(labelDraft.length + 2, 6), 34)}ch` }}
                value={labelDraft}
              />
            ) : data?.label ? (
              <span className="rounded-full border border-border/80 bg-popover/95 px-2 py-1 text-xs text-foreground shadow-sm">
                {data.label}
              </span>
            ) : (
              <span className="rounded-full border border-border/50 bg-popover/70 px-2 py-1 text-[11px] text-muted-foreground/70">
                Double-click to label
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = { canvasEdge: CanvasEdgeRenderer, default: CanvasEdgeRenderer };

type SyncedFlowContentProps = {
  roomId: string;
  pendingTemplate: CanvasTemplate | null;
  onTemplateApplied: () => void;
  onSaveHandlerReady?: (handler: (() => Promise<void>) | null) => void;
  onSaveStatusChange?: (status: CanvasSaveStatus, errorMessage: string | null) => void;
};

function SyncedFlowContent({ roomId, pendingTemplate, onTemplateApplied, onSaveHandlerReady, onSaveStatusChange }: SyncedFlowContentProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  });
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { addNodes, fitView, getEdge, getNode, screenToFlowPosition } = reactFlow;
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeCounter = useRef(0);
  const copyBufferRef = useRef<{ nodes: CanvasNode[]; edges: CanvasEdge[] } | null>(null);
  const pasteCounterRef = useRef(0);
  const appliedTemplateRef = useRef<string | null>(null);
  const loadStartedRef = useRef(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const { saveNow } = useCanvasAutosave(roomId, nodes, edges, canvasLoaded, (status, errorMessage) => onSaveStatusChange?.(status, errorMessage));

  useEffect(() => {
    onSaveHandlerReady?.(saveNow);
    return () => onSaveHandlerReady?.(null);
  }, [onSaveHandlerReady, saveNow]);

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    const roomHasCanvas = nodes.length > 0 || edges.length > 0;
    if (roomHasCanvas) {
      setCanvasLoaded(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(roomId)}/canvas`, { cache: "no-store" });
        if (!response.ok) throw new Error("Canvas load failed");
        const payload: { canvas?: { nodes?: CanvasNode[]; edges?: CanvasEdge[] } | null } = await response.json();
        const savedCanvas = payload.canvas;
        const roomStillEmpty = reactFlow.getNodes().length === 0 && reactFlow.getEdges().length === 0;
        if (!cancelled && savedCanvas && roomStillEmpty) {
          const savedNodes = Array.isArray(savedCanvas.nodes) ? savedCanvas.nodes : [];
          const savedEdges = Array.isArray(savedCanvas.edges) ? savedCanvas.edges : [];
          onNodesChange(savedNodes.map((item) => ({ type: "add" as const, item })));
          onEdgesChange(savedEdges.map((item) => ({ type: "add" as const, item })));
        }
      } catch {
        // An unavailable saved snapshot should not prevent the live room from opening.
      } finally {
        if (!cancelled) setCanvasLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, [roomId]);

  const updateNodeData = useCallback((nodeId: string, data: Partial<CanvasNodeData>) => {
    const node = getNode(nodeId);
    if (!node) return;
    onNodesChange([{ type: "replace", id: nodeId, item: { ...node, data: { ...node.data, ...data } } }]);
  }, [getNode, onNodesChange]);

  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    const edge = getEdge(edgeId);
    if (!edge) return;
    onEdgesChange([{ type: "replace", id: edgeId, item: { ...edge, data: { ...edge.data, label } } }]);
  }, [getEdge, onEdgesChange]);

  const handleCopy = useCallback(() => {
    const copiedNodes = reactFlow.getNodes().filter((node) => node.selected);
    if (copiedNodes.length === 0) return false;
    const copiedNodeIds = new Set(copiedNodes.map((node) => node.id));
    const copiedEdges = reactFlow.getEdges().filter((edge) => copiedNodeIds.has(edge.source) && copiedNodeIds.has(edge.target));
    copyBufferRef.current = {
      nodes: copiedNodes.map((node) => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data },
        style: node.style ? { ...node.style } : undefined,
        selected: false,
        dragging: false,
      })),
      edges: copiedEdges.map((edge) => ({ ...edge, data: { label: edge.data?.label ?? "" } })),
    };
    return true;
  }, [reactFlow]);

  const handlePaste = useCallback(() => {
    const copied = copyBufferRef.current;
    if (!copied || copied.nodes.length === 0) return false;

    pasteCounterRef.current += 1;
    const pasteId = `${Date.now()}-${pasteCounterRef.current}`;
    const offset = 28 * pasteCounterRef.current;
    const idMap = new Map(copied.nodes.map((node, index) => [node.id, `copy-${pasteId}-${index}`]));
    const pastedNodes = copied.nodes.map((node) => ({
      ...node,
      id: idMap.get(node.id)!,
      position: { x: node.position.x + offset, y: node.position.y + offset },
      selected: false,
      dragging: false,
    }));
    const pastedEdges = copied.edges.map((edge, index) => ({
      ...edge,
      id: `copy-edge-${pasteId}-${index}`,
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
      data: { label: edge.data?.label ?? "" },
    }));

    onNodesChange(pastedNodes.map((item) => ({ type: "add" as const, item })));
    onEdgesChange(pastedEdges.map((item) => ({ type: "add" as const, item })));
    onNodesChange(pastedNodes.map((node) => ({ type: "select" as const, id: node.id, selected: true })));
    return true;
  }, [onEdgesChange, onNodesChange]);

  useKeyboardShortcuts({
    reactFlow,
    onUndo: undo,
    onRedo: redo,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  const handleConnect = useCallback((connection: Connection) => {
    onConnect({
      ...connection,
      type: "canvasEdge",
      data: { label: "" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--foreground)" },
      style: { stroke: "var(--foreground)", strokeWidth: 1.75, strokeLinecap: "round" },
    } as Connection);
  }, [onConnect]);

  useEffect(() => {
    if (!pendingTemplate) {
      appliedTemplateRef.current = null;
      return;
    }
    if (appliedTemplateRef.current === pendingTemplate.id) return;
    appliedTemplateRef.current = pendingTemplate.id;

    onDelete({ nodes, edges });
    onNodesChange(pendingTemplate.nodes.map((item) => ({ type: "add" as const, item })));
    onEdgesChange(pendingTemplate.edges.map((item) => ({ type: "add" as const, item })));
    onTemplateApplied();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void fitView({ padding: 0.24, duration: 260 });
      });
    });
  }, [edges, fitView, nodes, onDelete, onEdgesChange, onNodesChange, onTemplateApplied, pendingTemplate]);

  const createNode = useCallback((shape: CanvasShape, width: number, height: number, position: { x: number; y: number }) => {
    const id = `${shape}-${Date.now()}-${nodeCounter.current}`;
    nodeCounter.current += 1;
    addNodes({
      id,
      type: "canvasNode",
      position,
      style: { width, height },
      data: { label: "", color: CANVAS_NODE_COLOR_PALETTE[0].background, textColor: CANVAS_NODE_COLOR_PALETTE[0].text, shape },
    });
  }, [addNodes]);

  const handleClickShape = useCallback((shape: CanvasShape) => {
    const option = SHAPE_OPTIONS.find((candidate) => candidate.shape === shape);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!option || !rect) return;
    const center = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    createNode(shape, option.width, option.height, { x: center.x - option.width / 2, y: center.y - option.height / 2 });
  }, [createNode, screenToFlowPosition]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const transfer = event.dataTransfer.getData(SHAPE_DRAG_TYPE);
    if (!transfer) return;

    let payload: unknown;
    try {
      payload = JSON.parse(transfer);
    } catch {
      return;
    }
    if (!isShapeDragPayload(payload)) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    createNode(payload.shape, payload.width, payload.height, position);
  }, [createNode, screenToFlowPosition]);

  return (
    <div className="relative h-full min-h-64 w-full" onDragOver={handleDragOver} onDrop={handleDrop} ref={canvasRef}>
      <UpdateNodeDataContext.Provider value={updateNodeData}>
       <UpdateEdgeLabelContext.Provider value={updateEdgeLabel}>
        <ReactFlow<CanvasNode, CanvasEdge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDelete={onDelete}
          connectionMode={ConnectionMode.Loose}
          fitView
          minZoom={0.2}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: "canvasEdge",
            markerEnd: { type: MarkerType.ArrowClosed, color: "var(--foreground)" },
            style: { stroke: "var(--foreground)", strokeWidth: 1.75, strokeLinecap: "round" },
            data: { label: "" },
          }}
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-background"
        >
          <Cursors />
          <Background color="var(--border)" gap={18} size={1} variant={BackgroundVariant.Dots} />
          <Panel className="m-4" position="top-right">
            <CollaboratorPresence />
          </Panel>
          <Panel className="mb-2" position="bottom-left">
            <CanvasControls canRedo={canRedo} canUndo={canUndo} onRedo={redo} onUndo={undo} reactFlow={reactFlow} />
          </Panel>
          <Panel position="bottom-center">
            <CanvasShapePanel onClickShape={handleClickShape} />
          </Panel>
        </ReactFlow>
       </UpdateEdgeLabelContext.Provider>
      </UpdateNodeDataContext.Provider>
    </div>
  );
}

function SyncedFlow(props: SyncedFlowContentProps) {
  return (
    <ReactFlowProvider>
      <SyncedFlowContent {...props} />
    </ReactFlowProvider>
  );
}

type RoomCanvasProps = SyncedFlowContentProps;

function RoomCanvas(props: RoomCanvasProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const onConnectionError = useCallback((message: string) => setConnectionError(message), []);

  if (connectionError) return <CanvasError message={connectionError} />;

  return (
    <>
      <FlowErrorListener onConnectionError={onConnectionError} />
      <ClientSideSuspense fallback={<CanvasLoading />}>
        <SyncedFlow {...props} />
      </ClientSideSuspense>
    </>
  );
}

export function CollaborativeCanvas({ roomId, onSaveHandlerReady, onSaveStatusChange }: CollaborativeCanvasProps) {
  const [isStarterTemplatesOpen, setIsStarterTemplatesOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null);

  useEffect(() => {
    const openTemplates = () => setIsStarterTemplatesOpen(true);
    window.addEventListener(OPEN_STARTER_TEMPLATES_EVENT, openTemplates);
    return () => window.removeEventListener(OPEN_STARTER_TEMPLATES_EVENT, openTemplates);
  }, []);

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
        <div className="h-full min-h-0 w-full">
          <RoomCanvas
            onSaveHandlerReady={onSaveHandlerReady}
            onSaveStatusChange={onSaveStatusChange}
            pendingTemplate={pendingTemplate}
            onTemplateApplied={() => setPendingTemplate(null)}
            roomId={roomId}
          />
        </div>
        <StarterTemplatesModal
          onImport={setPendingTemplate}
          onOpenChange={setIsStarterTemplatesOpen}
          open={isStarterTemplatesOpen}
        />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
