"use client"

import { useEffect } from "react";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

type UseKeyboardShortcutsOptions<N extends Node, E extends Edge> = {
  reactFlow: ReactFlowInstance<N, E>;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => boolean;
  onPaste: () => boolean;
};

function isEditingText(target: EventTarget | null) {
  return target instanceof Element && Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
  );
}

export function useKeyboardShortcuts<N extends Node, E extends Edge>({
  reactFlow,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
}: UseKeyboardShortcutsOptions<N, E>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || isEditingText(event.target)) return;

      const command = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (command && key === "z") {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
        return;
      }

      if (command && key === "y") {
        event.preventDefault();
        onRedo();
        return;
      }

      if (command && key === "c") {
        if (onCopy()) event.preventDefault();
        return;
      }

      if (command && key === "v") {
        if (onPaste()) event.preventDefault();
        return;
      }

      if (!command && !event.altKey && (event.key === "+" || event.key === "=")) {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: 160 });
        return;
      }

      if (!command && !event.altKey && event.key === "-") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: 160 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCopy, onPaste, onRedo, onUndo, reactFlow]);
}
