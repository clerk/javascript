import { contains, getTarget } from '@floating-ui/react/utils';
import React from 'react';

import { getComputedStyle } from '../../primitives/utils/dom';

const WIDGET_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';
const TEXT_ENTRY_SELECTOR =
  'textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"], [type="image"])';

interface Position {
  row: number;
  column: number;
}

function cellWidgets(cell: HTMLTableCellElement): HTMLElement[] {
  return Array.from(cell.querySelectorAll<HTMLElement>(WIDGET_SELECTOR)).filter(
    widget => !widget.matches(':disabled, [data-floating-ui-focus-guard]'),
  );
}

function focusTarget(cell: HTMLTableCellElement): HTMLElement {
  const widgets = cellWidgets(cell);
  return widgets.length === 1 && !widgets[0].matches(TEXT_ENTRY_SELECTOR) ? widgets[0] : cell;
}

function cellAt(table: HTMLTableElement, { row, column }: Position): HTMLTableCellElement | undefined {
  const rows = table.rows;
  if (rows.length === 0) {
    return undefined;
  }
  const cells = rows[Math.min(Math.max(row, 0), rows.length - 1)].cells;
  return cells[Math.min(Math.max(column, 0), cells.length - 1)];
}

function positionOf(cell: HTMLTableCellElement): Position {
  return { row: (cell.parentElement as HTMLTableRowElement).rowIndex, column: cell.cellIndex };
}

function owningCell(table: HTMLTableElement, node: Element): HTMLTableCellElement | null {
  const cell = node.closest('td, th');
  return cell instanceof HTMLTableCellElement && cell.closest('table') === table ? cell : null;
}

export function useGridNavigation(table: HTMLTableElement | null, enabled: boolean) {
  const activeRef = React.useRef<HTMLElement | null>(null);
  const positionRef = React.useRef<Position>({ row: 0, column: 0 });
  const editingRef = React.useRef<HTMLTableCellElement | null>(null);

  const sync = React.useCallback(() => {
    if (!table) {
      return;
    }
    if (!activeRef.current?.isConnected || !contains(table, activeRef.current)) {
      const cell = cellAt(table, positionRef.current);
      activeRef.current = cell ? focusTarget(cell) : null;
    }
    const active = activeRef.current;
    const editing = editingRef.current;
    for (const row of Array.from(table.rows)) {
      for (const cell of Array.from(row.cells)) {
        cell.tabIndex = cell === active ? 0 : -1;
        for (const widget of cellWidgets(cell)) {
          widget.tabIndex = widget === active || cell === editing ? 0 : -1;
        }
      }
    }
  }, [table]);

  React.useLayoutEffect(() => {
    if (enabled) {
      sync();
    }
  });

  React.useLayoutEffect(() => {
    if (!enabled || !table) {
      return;
    }
    const observer = new MutationObserver(sync);
    observer.observe(table, { childList: true, subtree: true });

    const activate = (element: HTMLElement, cell: HTMLTableCellElement, editing: HTMLTableCellElement | null) => {
      activeRef.current = element;
      positionRef.current = positionOf(cell);
      editingRef.current = editing;
      sync();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = getTarget(event) as HTMLElement;
      const cell = owningCell(table, target);
      if (!cell) {
        return;
      }
      if (target === cell) {
        activate(cell, cell, null);
      } else if (target === focusTarget(cell)) {
        activate(target, cell, null);
      } else {
        activate(cell, cell, cell);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = getTarget(event) as HTMLElement;
      const cell = event.defaultPrevented || event.altKey ? null : owningCell(table, target);
      if (!cell) {
        return;
      }

      if (editingRef.current === cell) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          activate(cell, cell, null);
          cell.focus();
        }
        return;
      }

      if ((event.key === 'Enter' || event.key === 'F2') && target === cell && cellWidgets(cell).length > 0) {
        event.preventDefault();
        activate(cell, cell, cell);
        cellWidgets(cell)[0].focus();
        return;
      }

      const { row, column } = positionOf(cell);
      const rtl = getComputedStyle(table).direction === 'rtl';
      const corner = event.ctrlKey || event.metaKey;
      const moves: Record<string, Position> = {
        [rtl ? 'ArrowLeft' : 'ArrowRight']: { row, column: column + 1 },
        [rtl ? 'ArrowRight' : 'ArrowLeft']: { row, column: column - 1 },
        ArrowDown: { row: row + 1, column },
        ArrowUp: { row: row - 1, column },
        Home: corner ? { row: 0, column: 0 } : { row, column: 0 },
        End: corner ? { row: table.rows.length - 1, column: Infinity } : { row, column: Infinity },
      };
      const next = Object.hasOwn(moves, event.key) ? moves[event.key] : undefined;
      if (!next) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const nextCell = cellAt(table, next);
      if (nextCell) {
        const element = focusTarget(nextCell);
        activate(element, nextCell, null);
        element.focus();
      }
    };

    table.addEventListener('focusin', onFocusIn);
    table.addEventListener('keydown', onKeyDown, true);
    return () => {
      observer.disconnect();
      table.removeEventListener('focusin', onFocusIn);
      table.removeEventListener('keydown', onKeyDown, true);
    };
  }, [enabled, table, sync]);
}
