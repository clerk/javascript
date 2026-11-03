'use client';

import React from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, createStore, type DefaultProps, mergeProps, useRender } from '../utils';
import {
  selectAllState,
  type TableBodyRows,
  TableContext,
  type TableContextValue,
  type TableSelectionMode,
  type TableSort,
  type TableState,
} from './table-context';
import { isTextEntry } from './table-dom';
import { useGridNavigation } from './use-grid-navigation';

export interface TableRootProps extends ComponentProps<'table'> {
  /** How many rows can be selected. @default 'none' */
  selectionMode?: TableSelectionMode;
  /** The values of the selected rows (controlled). */
  selection?: string[];
  /** The values of the rows selected on mount (uncontrolled). @default [] */
  defaultSelection?: string[];
  /** Called when the selection changes. */
  onSelectionChange?: (selection: string[]) => void;
  /** The values of the expanded rows (controlled). */
  expanded?: string[];
  /** The values of the rows expanded on mount (uncontrolled). @default [] */
  defaultExpanded?: string[];
  /** Called when a row expands or collapses. */
  onExpandedChange?: (expanded: string[]) => void;
  /** The sorted column and direction (controlled). */
  sort?: TableSort | null;
  /** The sorted column and direction on mount (uncontrolled). @default null */
  defaultSort?: TableSort | null;
  /** Called when a sortable column header is activated. */
  onSortChange?: (sort: TableSort) => void;
}

const NO_ROWS: TableBodyRows = { values: [], tree: false };

export const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(props, ref) {
  const {
    render,
    selectionMode = 'none',
    selection: selectionProp,
    defaultSelection = [],
    onSelectionChange,
    expanded: expandedProp,
    defaultExpanded = [],
    onExpandedChange,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    ...otherProps
  } = props;
  const [selection, setSelection] = useControllableState(selectionProp, defaultSelection, onSelectionChange);
  const [expanded, setExpanded] = useControllableState(expandedProp, defaultExpanded, onExpandedChange);
  const [sort, setSort] = useControllableState(sortProp, defaultSort);
  const [element, setElement] = React.useState<HTMLTableElement | null>(null);
  const [bodyRows, setBodyRows] = React.useState(NO_ROWS);
  const [disabledValues, registerDisabled] = useRegistry<string>();
  const [interactiveCount, registerInteractive] = useCounter();
  const [columnCount, registerColumn] = useCounter();
  const [rowHeaderColumns, registerRowHeaderColumn] = useRegistry<number>();
  const anchorRef = React.useRef<string | null>(null);
  const [excluded] = React.useState(() => new WeakSet<Element>());

  const { tree } = bodyRows;
  const selectable = React.useMemo(
    () => (selectionMode === 'none' ? [] : bodyRows.values.filter(value => !disabledValues.includes(value))),
    [selectionMode, bodyRows, disabledValues],
  );
  const [store] = React.useState(() => createStore<TableState>({ selection, expanded, selectable }));
  const interactive = tree || selectionMode !== 'none' || interactiveCount > 0;

  React.useLayoutEffect(() => {
    store.set({ selection, expanded, selectable });
  }, [store, selection, expanded, selectable]);

  const leaveCell = useGridNavigation(element, interactive, excluded);

  const toggleSelected = React.useCallback(
    (value: string, options?: { range?: boolean }) => {
      const { selection: current, selectable: rows } = store.get();
      if (!rows.includes(value)) {
        return;
      }
      const selected = !current.includes(value);
      if (selectionMode === 'single') {
        setSelection(selected ? [value] : []);
        return;
      }
      const anchor = options?.range && anchorRef.current !== null ? rows.indexOf(anchorRef.current) : -1;
      anchorRef.current = value;
      const index = rows.indexOf(value);
      const changed = anchor === -1 ? [value] : rows.slice(Math.min(anchor, index), Math.max(anchor, index) + 1);
      setSelection(selected ? union(current, changed) : current.filter(other => !changed.includes(other)));
    },
    [store, selectionMode, setSelection],
  );

  const toggleAllSelected = React.useCallback(() => {
    const state = store.get();
    setSelection(
      selectAllState(state) === 'all'
        ? state.selection.filter(value => !state.selectable.includes(value))
        : union(state.selection, state.selectable),
    );
  }, [store, setSelection]);

  const toggleExpanded = React.useCallback(
    (value: string) => {
      const current = store.get().expanded;
      setExpanded(current.includes(value) ? current.filter(other => other !== value) : [...current, value]);
    },
    [store, setExpanded],
  );

  const sortBy = React.useCallback(
    (column: string) => {
      const direction = sort?.column === column && sort.direction === 'ascending' ? 'descending' : 'ascending';
      const next: TableSort = { column, direction };
      setSort(next);
      onSortChange?.(next);
    },
    [sort, setSort, onSortChange],
  );

  const syncBodyRows = React.useCallback((next: TableBodyRows) => {
    setBodyRows(previous =>
      previous.tree === next.tree && sameValues(previous.values, next.values) ? previous : next,
    );
  }, []);

  const excludeFromNavigation = React.useCallback((node: Element) => excluded.add(node), [excluded]);

  const contextValue = React.useMemo<TableContextValue>(
    () => ({
      selectionMode,
      store,
      sort,
      tree,
      toggleSelected,
      toggleAllSelected,
      toggleExpanded,
      sortBy,
      syncBodyRows,
      registerDisabled,
      registerInteractive,
      registerColumn,
      rowHeaderColumns,
      registerRowHeaderColumn,
      columnCount,
      excludeFromNavigation,
    }),
    [
      selectionMode,
      store,
      sort,
      tree,
      toggleSelected,
      toggleAllSelected,
      toggleExpanded,
      sortBy,
      syncBodyRows,
      registerDisabled,
      registerInteractive,
      registerColumn,
      rowHeaderColumns,
      registerRowHeaderColumn,
      columnCount,
      excludeFromNavigation,
    ],
  );

  const defaultProps = {
    role: tree ? 'treegrid' : interactive ? 'grid' : undefined,
    'aria-multiselectable': selectionMode === 'multiple' || undefined,
    onKeyDown: (event: React.KeyboardEvent<HTMLTableElement>) => {
      const { target, currentTarget } = event;
      if (event.isDefaultPrevented() || !(target instanceof Element) || !currentTarget.contains(target)) {
        return;
      }
      if (event.key === 'Escape' && leaveCell(target)) {
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Escape' && selection.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        setSelection([]);
      } else if (
        event.key === 'a' &&
        (event.ctrlKey || event.metaKey) &&
        selectionMode === 'multiple' &&
        !isTextEntry(target)
      ) {
        event.preventDefault();
        if (selectAllState({ selection, expanded, selectable }) !== 'all') {
          toggleAllSelected();
        }
      }
    },
  } satisfies DefaultProps<'table'>;

  return (
    <TableContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: 'table',
        render,
        ref: [setElement, ref],
        props: mergeProps<'table'>(defaultProps, otherProps),
      })}
    </TableContext.Provider>
  );
});

function useCounter() {
  const [count, setCount] = React.useState(0);
  const register = React.useCallback(() => {
    setCount(current => current + 1);
    return () => setCount(current => current - 1);
  }, []);
  return [count, register] as const;
}

function useRegistry<Value>() {
  const [values, setValues] = React.useState<Value[]>([]);
  const register = React.useCallback((value: Value) => {
    setValues(current => [...current, value]);
    return () => setValues(current => current.filter(other => other !== value));
  }, []);
  return [values, register] as const;
}

function union(values: string[], added: string[]) {
  return [...values, ...added.filter(value => !values.includes(value))];
}

function sameValues(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
