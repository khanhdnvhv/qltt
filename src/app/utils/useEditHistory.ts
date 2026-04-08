import { useState, useCallback, useRef, useEffect } from "react";

interface EditRecord {
  rowKey: string;
  colKey: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
}

interface EditHistoryReturn {
  /** Push a new edit to history */
  pushEdit: (rowKey: string, colKey: string, oldValue: string, newValue: string) => void;
  /** Undo the last edit. Returns the edit record or null. */
  undo: () => EditRecord | null;
  /** Redo the last undone edit. Returns the edit record or null. */
  redo: () => EditRecord | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Number of edits in history */
  historyLength: number;
  /** Number of undone edits available for redo */
  redoLength: number;
  /** Clear all history */
  clearHistory: () => void;
}

/**
 * useEditHistory — tracks inline cell edits with undo/redo support.
 * Integrates with VirtualTable's onCellEdit to provide Ctrl+Z / Ctrl+Shift+Z.
 *
 * @param maxHistory Maximum edits to keep (default: 50)
 * @param onApply Callback to apply an edit (for undo/redo). Receives rowKey, colKey, value.
 */
export function useEditHistory(
  maxHistory = 50,
  onApply?: (rowKey: string, colKey: string, value: string) => void
): EditHistoryReturn {
  const [past, setPast] = useState<EditRecord[]>([]);
  const [future, setFuture] = useState<EditRecord[]>([]);
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;

  const pushEdit = useCallback((rowKey: string, colKey: string, oldValue: string, newValue: string) => {
    if (oldValue === newValue) return;
    setPast((prev) => {
      const next = [...prev, { rowKey, colKey, oldValue, newValue, timestamp: Date.now() }];
      if (next.length > maxHistory) next.shift();
      return next;
    });
    // Clear redo stack on new edit
    setFuture([]);
  }, [maxHistory]);

  const undo = useCallback((): EditRecord | null => {
    let edit: EditRecord | null = null;
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      edit = next.pop()!;
      return next;
    });
    if (edit) {
      const e = edit as EditRecord;
      setFuture((prev) => [...prev, e]);
      onApplyRef.current?.(e.rowKey, e.colKey, e.oldValue);
    }
    return edit;
  }, []);

  const redo = useCallback((): EditRecord | null => {
    let edit: EditRecord | null = null;
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      edit = next.pop()!;
      return next;
    });
    if (edit) {
      const e = edit as EditRecord;
      setPast((prev) => [...prev, e]);
      onApplyRef.current?.(e.rowKey, e.colKey, e.newValue);
    }
    return edit;
  }, []);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  // Global Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      // Don't intercept when inside input/textarea (let browser handle native undo)
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          // Redo
          e.preventDefault();
          redo();
        } else {
          // Undo
          e.preventDefault();
          undo();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return {
    pushEdit,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyLength: past.length,
    redoLength: future.length,
    clearHistory,
  };
}
