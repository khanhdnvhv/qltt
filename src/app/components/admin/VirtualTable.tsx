import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Columns3, Eye, EyeOff, Check, X, GripVertical } from "lucide-react";

/**
 * VirtualTable - Lightweight virtualized table for large admin datasets.
 * Only renders visible rows + a small buffer, dramatically reducing DOM nodes.
 *
 * Features:
 * - Virtual scrolling (activates when data >= threshold, default 30)
 * - Column sorting (asc/desc/none) with custom comparators
 * - Column resizing via drag handles (resizableColumns prop)
 * - Keyboard navigation (Arrow keys, Home/End, Enter, Space, Ctrl+A)
 * - Checkbox selection with select-all
 * - Batch actions support via selectedRows
 * - Responsive column hiding (hiddenBelow breakpoints)
 * - Column visibility toggle (showColumnToggle prop)
 * - Inline cell editing (double-click, editable columns)
 * - Empty state message
 */

export type SortDirection = "asc" | "desc" | null;

export interface VirtualTableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
  width?: string;
  /** Minimum width when resizing (default: 60px) */
  minWidth?: number;
  hiddenBelow?: "sm" | "md" | "lg" | "xl";
  render: (item: T, index: number) => React.ReactNode;
  /** Enable sorting for this column. Provide a comparator or `true` for default string compare. */
  sortable?: boolean | ((a: T, b: T) => number);
  /** Enable column resizing via drag handle */
  resizable?: boolean;
  /** Enable inline cell editing */
  editable?: boolean;
  /** Extract string value for editing. Defaults to String(item[key]). */
  editValue?: (item: T) => string;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  maxHeight?: number;
  virtualizeThreshold?: number;
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectedRows?: string[];
  onSelectRow?: (key: string) => void;
  onSelectAll?: () => void;
  showCheckbox?: boolean;
  emptyMessage?: string;
  /** Default sort column key */
  defaultSortKey?: string;
  /** Default sort direction */
  defaultSortDir?: SortDirection;
  /** Enable column resizing globally */
  resizableColumns?: boolean;
  /** Show column visibility toggle button in footer */
  showColumnToggle?: boolean;
  /** Callback when a cell is edited inline. Receives row key, column key, and new value. */
  onCellEdit?: (rowKey: string, colKey: string, value: string) => void;
  /** Enable drag-and-drop row reordering (non-virtualized mode only, disabled when sort is active) */
  draggableRows?: boolean;
  /** Callback when rows are reordered via drag-and-drop. Receives fromIndex and toIndex. */
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
}

const hiddenClass: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ArrowUp className="w-3 h-3 text-primary" />;
  if (direction === "desc") return <ArrowDown className="w-3 h-3 text-primary" />;
  return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />;
}

export function VirtualTable<T>({
  data,
  columns,
  rowHeight = 56,
  maxHeight = 560,
  virtualizeThreshold = 30,
  getRowKey,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  showCheckbox = false,
  emptyMessage = "Khong co du lieu",
  defaultSortKey,
  defaultSortDir = null,
  resizableColumns = false,
  showColumnToggle = false,
  onCellEdit,
  draggableRows = false,
  onRowReorder,
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSortDir);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // Column resize state
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ colKey: string; startX: number; startW: number } | null>(null);

  // Column visibility state
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [colToggleOpen, setColToggleOpen] = useState(false);
  const colToggleRef = useRef<HTMLDivElement>(null);

  // Toggleable columns (exclude 'actions' and empty header columns)
  const toggleableColumns = useMemo(
    () => columns.filter((c) => c.key !== "actions" && c.header !== ""),
    [columns]
  );

  // Visible columns (after user toggle)
  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols]
  );

  const toggleColVisibility = useCallback((key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Close column toggle dropdown on outside click
  useEffect(() => {
    if (!colToggleOpen) return;
    const handler = (e: MouseEvent) => {
      if (colToggleRef.current && !colToggleRef.current.contains(e.target as Node)) {
        setColToggleOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [colToggleOpen]);

  const handleResizeStart = useCallback((colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.target as HTMLElement).closest("th");
    if (!th) return;
    const startW = th.getBoundingClientRect().width;
    resizeRef.current = { colKey, startX: e.clientX, startW };

    const onMove = (moveE: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = moveE.clientX - resizeRef.current.startX;
      const col = columns.find((c) => c.key === colKey);
      const minW = col?.minWidth ?? 60;
      const newW = Math.max(minW, resizeRef.current.startW + delta);
      setColWidths((prev) => ({ ...prev, [colKey]: newW }));
    };

    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [columns]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;

    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortable) return data;

    const sorted = [...data];
    if (typeof col.sortable === "function") {
      sorted.sort((a, b) => {
        const result = (col.sortable as (a: T, b: T) => number)(a, b);
        return sortDir === "desc" ? -result : result;
      });
    }
    return sorted;
  }, [data, sortKey, sortDir, columns]);

  const shouldVirtualize = sortedData.length >= virtualizeThreshold;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !shouldVirtualize) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll, shouldVirtualize]);

  // Calculate visible range
  const { visibleData, startIndex, totalHeight, offsetY } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        visibleData: sortedData,
        startIndex: 0,
        totalHeight: sortedData.length * rowHeight,
        offsetY: 0,
      };
    }

    const buffer = 5;
    const visibleCount = Math.ceil(maxHeight / rowHeight);
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const end = Math.min(sortedData.length, start + visibleCount + buffer * 2);

    return {
      visibleData: sortedData.slice(start, end),
      startIndex: start,
      totalHeight: sortedData.length * rowHeight,
      offsetY: start * rowHeight,
    };
  }, [sortedData, scrollTop, rowHeight, maxHeight, shouldVirtualize]);

  const allSelected = sortedData.length > 0 && selectedRows.length === sortedData.length;

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (sortedData.length === 0) return;

    // Ctrl+A / Cmd+A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === "a" && showCheckbox && onSelectAll) {
      e.preventDefault();
      onSelectAll();
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, sortedData.length - 1));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      }
      case "Home": {
        e.preventDefault();
        setFocusedIndex(0);
        break;
      }
      case "End": {
        e.preventDefault();
        setFocusedIndex(sortedData.length - 1);
        break;
      }
      case "Enter": {
        if (focusedIndex >= 0 && focusedIndex < sortedData.length) {
          onRowClick?.(sortedData[focusedIndex]);
        }
        break;
      }
      case " ": {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < sortedData.length && showCheckbox) {
          const key = getRowKey(sortedData[focusedIndex]);
          onSelectRow?.(key);
        }
        break;
      }
    }
  }, [sortedData, focusedIndex, onRowClick, onSelectRow, showCheckbox, getRowKey]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedIndex < 0 || !containerRef.current || !shouldVirtualize) return;
    const scrollEl = containerRef.current;
    const rowTop = focusedIndex * rowHeight;
    const rowBottom = rowTop + rowHeight;
    const viewTop = scrollEl.scrollTop;
    const viewBottom = viewTop + maxHeight;

    if (rowTop < viewTop) {
      scrollEl.scrollTop = rowTop;
    } else if (rowBottom > viewBottom) {
      scrollEl.scrollTop = rowBottom - maxHeight;
    }
  }, [focusedIndex, rowHeight, maxHeight, shouldVirtualize]);

  // Reset focus when data changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [sortedData.length]);

  const handleSort = useCallback((colKey: string) => {
    if (sortKey === colKey) {
      // Cycle: asc   desc   null
      setSortDir((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(colKey);
      setSortDir("asc");
    }
    // Reset scroll on sort change
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setScrollTop(0);
  }, [sortKey, sortDir]);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ rowKey: string; colKey: string; value: string } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const isTabNavigatingRef = useRef(false);

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const startEdit = useCallback((rowKey: string, colKey: string, currentValue: string) => {
    if (!onCellEdit) return;
    setEditingCell({ rowKey, colKey, value: currentValue });
  }, [onCellEdit]);

  const confirmEdit = useCallback(() => {
    if (editingCell && onCellEdit) {
      onCellEdit(editingCell.rowKey, editingCell.colKey, editingCell.value);
    }
    setEditingCell(null);
  }, [editingCell, onCellEdit]);

  // Tab navigation: confirm current edit, move to next/prev editable cell
  const navigateEditableCell = useCallback((direction: "next" | "prev") => {
    if (!editingCell || !onCellEdit) return;
    // Confirm current
    onCellEdit(editingCell.rowKey, editingCell.colKey, editingCell.value);

    const editableCols = visibleColumns.filter((c) => c.editable);
    if (editableCols.length === 0) { setEditingCell(null); return; }

    const currentColIdx = editableCols.findIndex((c) => c.key === editingCell.colKey);
    const currentRowIdx = sortedData.findIndex((item) => getRowKey(item) === editingCell.rowKey);
    if (currentRowIdx === -1) { setEditingCell(null); return; }

    let nextColIdx = currentColIdx;
    let nextRowIdx = currentRowIdx;

    if (direction === "next") {
      nextColIdx++;
      if (nextColIdx >= editableCols.length) {
        nextColIdx = 0;
        nextRowIdx++;
      }
    } else {
      nextColIdx--;
      if (nextColIdx < 0) {
        nextColIdx = editableCols.length - 1;
        nextRowIdx--;
      }
    }

    // Bounds check
    if (nextRowIdx < 0 || nextRowIdx >= sortedData.length) {
      setEditingCell(null);
      return;
    }

    const nextItem = sortedData[nextRowIdx];
    const nextCol = editableCols[nextColIdx];
    const nextRowKey = getRowKey(nextItem);
    const nextVal = nextCol.editValue
      ? nextCol.editValue(nextItem)
      : String((nextItem as Record<string, unknown>)[nextCol.key] ?? "");

    setEditingCell({ rowKey: nextRowKey, colKey: nextCol.key, value: nextVal });
    setFocusedIndex(nextRowIdx);
  }, [editingCell, onCellEdit, visibleColumns, sortedData, getRowKey]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  // Drag-and-drop row reordering (non-virtualized, no active sort)
  const isDndEnabled = draggableRows && !!onRowReorder && !shouldVirtualize && (!sortKey || !sortDir);
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = useCallback((idx: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    setDragFromIdx(idx);
    // Make the drag image semi-transparent
    const row = e.currentTarget as HTMLElement;
    row.style.opacity = "0.4";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "";
    setDragFromIdx(null);
    setDragOverIdx(null);
  }, []);

  const handleDragOver = useCallback((idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  }, []);

  const handleDrop = useCallback((toIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    setDragFromIdx(null);
    setDragOverIdx(null);
    if (!isNaN(fromIdx) && fromIdx !== toIdx && onRowReorder) {
      onRowReorder(fromIdx, toIdx);
    }
  }, [onRowReorder]);

  // Column count for colSpan calculations
  const totalColCount = visibleColumns.length + (showCheckbox ? 1 : 0) + (isDndEnabled ? 1 : 0);

  const renderHeaderCell = (col: VirtualTableColumn<T>) => {
    const isSortable = !!col.sortable;
    const isActive = sortKey === col.key;
    const currentDir = isActive ? sortDir : null;
    const isResizable = resizableColumns && (col.resizable !== false) && col.key !== "actions" && col.header !== "";
    const widthStyle = colWidths[col.key] ? { width: colWidths[col.key] + "px" } : col.width ? { width: col.width } : {};

    return (
      <th
        key={col.key}
        className={`text-left px-3 py-3.5 text-[16px] text-muted-foreground relative ${col.hiddenBelow ? hiddenClass[col.hiddenBelow] : ""} ${col.headerClassName || ""} ${isSortable ? "cursor-pointer select-none hover:text-foreground transition-colors group/th" : ""}`}
        style={{ fontWeight: 600, ...widthStyle }}
        onClick={isSortable ? () => handleSort(col.key) : undefined}
      >
        <span className="inline-flex items-center gap-1">
          {col.header}
          {isSortable && <SortIcon direction={currentDir} />}
        </span>
        {isResizable && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gray-200 dark:bg-white/10 cursor-col-resize opacity-0 hover:opacity-100 hover:bg-primary/40 dark:hover:bg-primary/40 transition-opacity"
            onMouseDown={(e) => handleResizeStart(col.key, e)}
            onClick={(e) => e.stopPropagation()}
            role="separator"
            aria-label={`Resize ${col.header}`}
          />
        )}
      </th>
    );
  };

  const renderRow = (item: T, index: number, globalIndex: number) => {
    const key = getRowKey(item);
    const isFocused = focusedIndex === globalIndex;
    const isDragTarget = isDndEnabled && dragOverIdx === globalIndex && dragFromIdx !== globalIndex;
    const isDragging = isDndEnabled && dragFromIdx === globalIndex;
    return (
      <tr
        key={key}
        data-row-index={globalIndex}
        aria-selected={selectedRows.includes(key)}
        className={`border-b border-gray-50 dark:border-border/50 transition-colors ${onRowClick ? "cursor-pointer" : ""} ${isFocused ? "bg-primary/[0.04] dark:bg-primary/[0.06] outline-none ring-1 ring-inset ring-primary/20" : "hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"} ${isDragTarget ? "border-t-2 border-t-primary" : ""} ${isDragging ? "opacity-40" : ""}`}
        style={shouldVirtualize ? { height: rowHeight } : undefined}
        onClick={() => { setFocusedIndex(globalIndex); onRowClick?.(item); }}
        draggable={isDndEnabled}
        onDragStart={isDndEnabled ? (e) => handleDragStart(globalIndex, e) : undefined}
        onDragEnd={isDndEnabled ? handleDragEnd : undefined}
        onDragOver={isDndEnabled ? (e) => handleDragOver(globalIndex, e) : undefined}
        onDrop={isDndEnabled ? (e) => handleDrop(globalIndex, e) : undefined}
      >
        {isDndEnabled && (
          <td className="px-2 py-3.5 w-8 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
            <GripVertical className="w-4 h-4 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors" />
          </td>
        )}
        {showCheckbox && (
          <td className="px-5 py-3.5 w-12">
            <input
              type="checkbox"
              checked={selectedRows.includes(key)}
              onChange={(e) => {
                e.stopPropagation();
                onSelectRow?.(key);
              }}
              className="w-4 h-4 rounded border-gray-300 text-primary"
            />
          </td>
        )}
        {visibleColumns.map((col) => {
          const isEditing = editingCell?.rowKey === key && editingCell?.colKey === col.key;
          const canEdit = col.editable && onCellEdit;
          return (
            <td
              key={col.key}
              className={`px-3 py-3.5 ${col.hiddenBelow ? hiddenClass[col.hiddenBelow] : ""} ${canEdit && !isEditing ? "cursor-text" : ""}`}
              style={{ width: colWidths[col.key] ? colWidths[col.key] + "px" : col.width }}
              onDoubleClick={canEdit ? (e) => {
                e.stopPropagation();
                const val = col.editValue
                  ? col.editValue(item)
                  : String((item as Record<string, unknown>)[col.key] ?? "");
                startEdit(key, col.key, val);
              } : undefined}
            >
              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={editInputRef}
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit();
                      if (e.key === "Escape") cancelEdit();
                      if (e.key === "Tab") {
                        e.preventDefault();
                        isTabNavigatingRef.current = true;
                        navigateEditableCell(e.shiftKey ? "prev" : "next");
                        // Reset flag after React re-render cycle
                        requestAnimationFrame(() => { isTabNavigatingRef.current = false; });
                      }
                      e.stopPropagation();
                    }}
                    onBlur={() => {
                      // Skip if Tab navigation just set a new editing cell
                      if (isTabNavigatingRef.current) return;
                      confirmEdit();
                    }}
                    className="w-full bg-white dark:bg-muted border border-primary/40 rounded-lg px-2 py-1 text-[15px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <button onClick={confirmEdit} className="p-0.5 text-emerald-600 hover:text-emerald-700 shrink-0" aria-label="Xac nhan">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onMouseDown={cancelEdit} className="p-0.5 text-muted-foreground hover:text-foreground shrink-0" aria-label="Huy">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                col.render(item, globalIndex)
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-xl"
        style={shouldVirtualize ? { maxHeight, overflowY: "auto" } : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="grid"
        aria-label="Bang du lieu"
        aria-rowcount={sortedData.length}
      >
        {shouldVirtualize && (
          <div style={{ height: totalHeight, position: "relative" }}>
            {/* Sticky header */}
            <table className="w-full" style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <thead>
                <tr className="border-b border-gray-100 dark:border-border bg-white dark:bg-card">
                  {isDndEnabled && (
                    <th className="w-8 px-2 py-3.5" />
                  )}
                  {showCheckbox && (
                    <th className="text-left px-5 py-3.5 w-12">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary"
                      />
                    </th>
                  )}
                  {visibleColumns.map(renderHeaderCell)}
                </tr>
              </thead>
            </table>

            {/* Virtual rows */}
            <div style={{ position: "absolute", top: offsetY + rowHeight + 14, left: 0, right: 0 }}>
              <table className="w-full">
                <tbody>
                  {visibleData.map((item, i) => renderRow(item, i, startIndex + i))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Non-virtualized (small datasets) */}
        {!shouldVirtualize && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border">
                {isDndEnabled && (
                  <th className="w-8 px-2 py-3.5" />
                )}
                {showCheckbox && (
                  <th className="text-left px-5 py-3.5 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary"
                    />
                  </th>
                )}
                {visibleColumns.map(renderHeaderCell)}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 && (
                <tr>
                  <td
                    colSpan={totalColCount}
                    className="text-center py-12 text-muted-foreground text-[15px]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {sortedData.map((item, i) => renderRow(item, i, i))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer: Row count, sort info, column toggle */}
      {(shouldVirtualize || sortKey || showColumnToggle) && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-border">
          <span className="text-[15px] text-muted-foreground">
            {sortedData.length} hang
            {shouldVirtualize && " ⬢ Virtual scrolling"}
            {hiddenCols.size > 0 && ` ⬢ ${hiddenCols.size} cot an`}
          </span>
          <div className="flex items-center gap-3">
            {sortKey && sortDir && (
              <button
                onClick={() => { setSortKey(null); setSortDir(null); }}
                className="text-[15px] text-primary hover:text-primary/80 transition-colors"
                style={{ fontWeight: 500 }}
              >
                Xoa sap xep
              </button>
            )}
            {showColumnToggle && (
              <div className="relative" ref={colToggleRef}>
                <button
                  onClick={() => setColToggleOpen((p) => !p)}
                  className={`flex items-center gap-1 text-[15px] px-2 py-1 rounded-lg transition-colors ${colToggleOpen ? "text-primary bg-primary/[0.06]" : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5"}`}
                  style={{ fontWeight: 500 }}
                  aria-label="Hien/an cot"
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  Cot
                </button>
                {colToggleOpen && (
                  <div className="absolute bottom-full right-0 mb-1.5 w-48 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-1.5 z-50">
                    <p className="px-3.5 py-1.5 text-[10.5px] text-muted-foreground" style={{ fontWeight: 600 }}>
                      Hien thi cot
                    </p>
                    {toggleableColumns.map((col) => {
                      const isHidden = hiddenCols.has(col.key);
                      return (
                        <button
                          key={col.key}
                          onClick={() => toggleColVisibility(col.key)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[16px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          {isHidden ? (
                            <EyeOff className="w-3.5 h-3.5 text-muted-foreground/40" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-primary" />
                          )}
                          <span className={isHidden ? "text-muted-foreground/50 line-through" : "text-foreground"}>
                            {col.header}
                          </span>
                        </button>
                      );
                    })}
                    {hiddenCols.size > 0 && (
                      <button
                        onClick={() => setHiddenCols(new Set())}
                        className="w-full text-left px-3.5 py-2 text-[15px] text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-border mt-1"
                        style={{ fontWeight: 500 }}
                      >
                        Hien tat ca
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
