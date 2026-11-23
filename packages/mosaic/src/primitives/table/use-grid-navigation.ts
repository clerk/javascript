import React from 'react';

import {
  type CompositeKeyEvent,
  type SetTabIndex,
  useComposite,
  type UseCompositeReturn,
} from '../hooks/use-composite';
import { isRtl, isTextEntry } from './table-dom';

const WIDGET_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

interface Position {
  row: number;
  column: number;
}

const ROW_COLUMN = -1;

export function useGridNavigation(table: HTMLTableElement | null, enabled: boolean, excluded: WeakSet<Element>) {
  const positionRef = React.useRef<Position | null>(null);
  const editingRef = React.useRef<HTMLTableCellElement | null>(null);

  const composite: UseCompositeReturn = useComposite(table, {
    enabled,
    recoverFocus: true,
    stopPropagation: 'all',
    getItems: () => (table ? gridItems(table, excluded) : []),
    preferred: {
      getItem: () =>
        table ? itemAt(table, positionRef.current ?? initialPosition(table, excluded), excluded) : undefined,
    },
    resolveFocus: target => {
      if (!table) {
        return null;
      }
      if (target instanceof HTMLTableRowElement && isRowItem(target, excluded) && target.closest('table') === table) {
        editingRef.current = null;
        return target;
      }
      const cell = owningCell(table, target);
      if (!cell) {
        return null;
      }
      if (target === cell || target === focusTarget(cell, excluded)) {
        editingRef.current = null;
        return target;
      }
      editingRef.current = cell;
      return cell;
    },
    getNextItem: (event, target) => {
      if (!table) {
        return null;
      }
      const row = target instanceof HTMLTableRowElement && target.closest('table') === table ? target : null;
      const cell = row ? null : owningCell(table, target);
      if (cell && editingRef.current === cell) {
        return null;
      }
      if (cell && target === cell && (event.key === 'Enter' || event.key === 'F2')) {
        const [firstWidget] = cellWidgets(cell, excluded);
        if (firstWidget) {
          event.preventDefault();
          editingRef.current = cell;
          composite.setActive(cell);
          firstWidget.focus();
        }
        return null;
      }
      const position = row
        ? rowMove(table, row, event, excluded)
        : cell
          ? cellMove(table, cell, event, excluded)
          : null;
      const next = position ? itemAt(table, position, excluded) : null;
      if (next) {
        editingRef.current = null;
      }
      return next ?? null;
    },
    syncTabIndexes: (active, setTabIndex) => {
      if (!table) {
        return;
      }
      if (active) {
        positionRef.current = positionOf(active);
      }
      for (const row of Array.from(table.rows)) {
        syncRow(row, active, editingRef.current, excluded, setTabIndex);
      }
    },
  });

  React.useLayoutEffect(() => {
    if (!enabled || !table) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && !event.altKey) {
        composite.handleKeyDown(event);
      }
    };
    table.addEventListener('keydown', onKeyDown, true);
    return () => table.removeEventListener('keydown', onKeyDown, true);
  }, [enabled, table, composite]);

  return (target: Element) => {
    const cell = table ? owningCell(table, target) : null;
    if (!cell || editingRef.current !== cell) {
      return false;
    }
    editingRef.current = null;
    composite.setActive(cell);
    cell.focus();
    return true;
  };
}

function gridItems(table: HTMLTableElement, excluded: WeakSet<Element>) {
  return Array.from(table.rows)
    .filter(row => !isDisabledRow(row))
    .flatMap<HTMLElement>(row => [
      ...(isRowItem(row, excluded) ? [row] : []),
      ...Array.from(row.cells).flatMap(cell => [cell, focusTarget(cell, excluded)]),
    ]);
}

function syncRow(
  row: HTMLTableRowElement,
  active: HTMLElement | null,
  editing: HTMLTableCellElement | null,
  excluded: WeakSet<Element>,
  setTabIndex: SetTabIndex,
) {
  const disabled = isDisabledRow(row);
  if (isRowItem(row, excluded)) {
    setTabIndex(row, disabled ? null : rovingTabIndex(row === active));
  }
  for (const cell of Array.from(row.cells)) {
    setTabIndex(cell, disabled ? null : rovingTabIndex(cell === active));
    for (const widget of cellWidgets(cell, excluded)) {
      setTabIndex(widget, rovingTabIndex(widget === active || cell === editing));
    }
  }
}

function rowMove(
  table: HTMLTableElement,
  row: HTMLTableRowElement,
  event: CompositeKeyEvent,
  excluded: WeakSet<Element>,
): Position | null {
  const { forward, backward } = arrowKeys(table);
  const expanded = row.getAttribute('aria-expanded');
  switch (event.key) {
    case forward:
      return expanded === 'false' ? null : { row: row.rowIndex, column: 0 };
    case backward: {
      if (expanded === 'true') {
        return null;
      }
      const parent = parentRow(row);
      return parent ? { row: parent.rowIndex, column: ROW_COLUMN } : { row: row.rowIndex, column: Infinity };
    }
    case 'ArrowDown':
      return { row: nextRowIndex(table, row.rowIndex, 1), column: ROW_COLUMN };
    case 'ArrowUp':
      return { row: nextRowIndex(table, row.rowIndex, -1), column: ROW_COLUMN };
    case 'Home':
      return { row: edgeRowIndex(table, 1, excluded) ?? row.rowIndex, column: ROW_COLUMN };
    case 'End':
      return { row: edgeRowIndex(table, -1, excluded) ?? row.rowIndex, column: ROW_COLUMN };
    default:
      return null;
  }
}

function cellMove(
  table: HTMLTableElement,
  cell: HTMLTableCellElement,
  event: CompositeKeyEvent,
  excluded: WeakSet<Element>,
): Position | null {
  const { forward, backward } = arrowKeys(table);
  const row = rowOf(cell);
  const column = cell.cellIndex;
  const last = row.cells.length - 1;
  const corner = event.ctrlKey || event.metaKey;
  switch (event.key) {
    case forward:
      return { row: row.rowIndex, column: column === last && isRowItem(row, excluded) ? ROW_COLUMN : column + 1 };
    case backward:
      return { row: row.rowIndex, column: column === 0 && isRowItem(row, excluded) ? ROW_COLUMN : column - 1 };
    case 'ArrowDown':
      return { row: nextRowIndex(table, row.rowIndex, 1), column };
    case 'ArrowUp':
      return { row: nextRowIndex(table, row.rowIndex, -1), column };
    case 'Home':
      return corner ? { row: 0, column: 0 } : { row: row.rowIndex, column: 0 };
    case 'End':
      return corner
        ? { row: nextRowIndex(table, table.rows.length, -1), column: Infinity }
        : { row: row.rowIndex, column: Infinity };
    default:
      return null;
  }
}

function itemAt(table: HTMLTableElement, position: Position, excluded: WeakSet<Element>): HTMLElement | undefined {
  const rows = table.rows;
  const row = rows[clamp(position.row, 0, rows.length - 1)];
  if (!row) {
    return undefined;
  }
  if (isDisabledRow(row)) {
    const fallback = initialPosition(table, excluded);
    return fallback.row === row.rowIndex ? undefined : itemAt(table, fallback, excluded);
  }
  if (position.column === ROW_COLUMN && isRowItem(row, excluded)) {
    return row;
  }
  const cell = row.cells[clamp(position.column, 0, row.cells.length - 1)];
  return cell ? focusTarget(cell, excluded) : undefined;
}

function initialPosition(table: HTMLTableElement, excluded: WeakSet<Element>): Position {
  const row = edgeRowIndex(table, 1, excluded);
  return row === undefined ? { row: 0, column: 0 } : { row, column: ROW_COLUMN };
}

function positionOf(element: HTMLElement): Position {
  if (element instanceof HTMLTableRowElement) {
    return { row: element.rowIndex, column: ROW_COLUMN };
  }
  const cell = element.closest('td, th');
  return cell instanceof HTMLTableCellElement
    ? { row: rowOf(cell).rowIndex, column: cell.cellIndex }
    : { row: 0, column: 0 };
}

function nextRowIndex(table: HTMLTableElement, from: number, step: 1 | -1) {
  for (let index = from + step; index >= 0 && index < table.rows.length; index += step) {
    const row = table.rows[index];
    if (row && !isDisabledRow(row)) {
      return index;
    }
  }
  return from;
}

function edgeRowIndex(table: HTMLTableElement, step: 1 | -1, excluded: WeakSet<Element>) {
  const rows = Array.from(table.rows).filter(row => isRowItem(row, excluded) && !isDisabledRow(row));
  return (step === 1 ? rows[0] : rows[rows.length - 1])?.rowIndex;
}

function parentRow(row: HTMLTableRowElement) {
  const level = Number(row.getAttribute('aria-level'));
  if (!(level > 1)) {
    return null;
  }
  for (let sibling = row.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
    if (sibling instanceof HTMLTableRowElement && Number(sibling.getAttribute('aria-level')) === level - 1) {
      return sibling;
    }
  }
  return null;
}

function cellWidgets(cell: HTMLTableCellElement, excluded: WeakSet<Element>): HTMLElement[] {
  return Array.from(cell.querySelectorAll<HTMLElement>(WIDGET_SELECTOR)).filter(
    widget => !excluded.has(widget) && !widget.matches(':disabled, [data-floating-ui-focus-guard]'),
  );
}

function focusTarget(cell: HTMLTableCellElement, excluded: WeakSet<Element>): HTMLElement {
  const widgets = cellWidgets(cell, excluded);
  const [only] = widgets;
  return widgets.length === 1 && only && !isTextEntry(only) ? only : cell;
}

function owningCell(table: HTMLTableElement, node: Element): HTMLTableCellElement | null {
  const cell = node.closest('td, th');
  return cell instanceof HTMLTableCellElement && cell.closest('table') === table ? cell : null;
}

function rowOf(cell: HTMLTableCellElement) {
  const row = cell.parentElement;
  if (!(row instanceof HTMLTableRowElement)) {
    throw new Error('Table cells must be rendered inside a table row');
  }
  return row;
}

function isRowItem(row: HTMLTableRowElement, excluded: WeakSet<Element>) {
  return (
    row.parentElement instanceof HTMLTableSectionElement && row.parentElement.tagName === 'TBODY' && !excluded.has(row)
  );
}

function isDisabledRow(row: HTMLTableRowElement) {
  return row.getAttribute('aria-disabled') === 'true';
}

function arrowKeys(table: HTMLTableElement) {
  return isRtl(table)
    ? { forward: 'ArrowLeft', backward: 'ArrowRight' }
    : { forward: 'ArrowRight', backward: 'ArrowLeft' };
}

function rovingTabIndex(active: boolean) {
  return active ? 0 : -1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
