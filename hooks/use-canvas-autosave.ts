"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "unsaved" | "saving" | "saved" | "error";

export function useCanvasAutosave(
  projectId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  enabled: boolean,
  onStatusChange?: (status: CanvasSaveStatus, errorMessage: string | null) => void,
) {
  const [status, setStatusState] = useState<CanvasSaveStatus>("saved");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestRef = useRef(0);
  const onStatusChangeRef = useRef(onStatusChange);
  const initializedRef = useRef(false);
  const lastSnapshotRef = useRef<string | null>(null);
  const savedSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const setStatus = useCallback((next: CanvasSaveStatus, message: string | null = null) => {
    setStatusState(next);
    onStatusChangeRef.current?.(next, message);
  }, []);

  const snapshot = JSON.stringify({ nodes, edges });

  useEffect(() => {
    if (!enabled) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      lastSnapshotRef.current = snapshot;
      savedSnapshotRef.current = snapshot;
      return;
    }
    if (lastSnapshotRef.current === snapshot) return;
    lastSnapshotRef.current = snapshot;
    if (snapshot !== savedSnapshotRef.current) {
      setErrorMessage(null);
      setStatus("unsaved");
    }
  }, [enabled, setStatus, snapshot]);

  const saveNow = useCallback(async () => {
    const snapshotToSave = JSON.stringify({ nodes, edges });
    const requestId = ++requestRef.current;
    setErrorMessage(null);
    setStatus("saving");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: snapshotToSave,
      });
      if (!response.ok) {
        const payload: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Canvas save failed (HTTP ${response.status})`);
      }
      if (requestId === requestRef.current) {
        savedSnapshotRef.current = snapshotToSave;
        const latestSnapshot = lastSnapshotRef.current;
        setStatus(latestSnapshot === snapshotToSave ? "saved" : "unsaved");
      }
    } catch (error) {
      if (requestId === requestRef.current) {
        const message = error instanceof Error ? error.message : "Canvas save failed for an unknown reason.";
        setErrorMessage(message);
        setStatus("error", message);
      }
    }
  }, [edges, nodes, projectId, setStatus]);

  return { status, errorMessage, saveNow };
}
