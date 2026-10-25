'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { type TableItem, TableItemContext, useTableContext } from './table-context';

export interface TableBodyProps<Item> extends Omit<ComponentProps<'tbody'>, 'children'> {
  /** The records to render, one row each. */
  items: readonly Item[];
  /** Returns the value that identifies an item's row in the selection and expanded state. */
  itemToStringValue: (item: Item) => string;
  /** Returns an item's child items. Passing it makes the table a tree grid. */
  itemToChildren?: (item: Item) => readonly Item[] | undefined;
  /** Renders the row for an item. */
  children: (item: Item) => React.ReactNode;
  /** Rendered in a single cell that spans every column when there are no items. */
  empty?: React.ReactNode;
}

interface VisibleRow<Item> extends TableItem {
  item: Item;
}

type TableBodyComponent = <Item>(
  props: TableBodyProps<Item> & React.RefAttributes<HTMLTableSectionElement>,
) => React.ReactElement;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- forwardRef drops the Item type parameter; React 18 support rules out a generic ref prop.
export const TableBody = React.forwardRef(TableBodyImpl) as TableBodyComponent;

function TableBodyImpl<Item>(props: TableBodyProps<Item>, ref: React.ForwardedRef<HTMLTableSectionElement>) {
  const { render, items, itemToStringValue, itemToChildren, children, empty, ...otherProps } = props;
  const { expanded, syncBodyRows, columnCount, excludeFromNavigation } = useTableContext();
  const tree = itemToChildren !== undefined;

  const rows = React.useMemo(
    () => visibleRows(items, { itemToStringValue, itemToChildren, expanded }),
    [items, itemToStringValue, itemToChildren, expanded],
  );

  React.useLayoutEffect(() => {
    syncBodyRows({ values: rows.map(row => row.value), tree });
  }, [rows, tree, syncBodyRows]);

  const excludeEmptyRow = React.useCallback(
    (node: HTMLTableRowElement | null) => {
      if (node) {
        excludeFromNavigation(node);
      }
    },
    [excludeFromNavigation],
  );

  const content =
    rows.length === 0 && empty !== undefined ? (
      <tr ref={excludeEmptyRow}>
        <td colSpan={columnCount || undefined}>{empty}</td>
      </tr>
    ) : (
      rows.map(({ item, ...tableItem }) => (
        <TableItemContext.Provider
          key={tableItem.value}
          value={tableItem}
        >
          {children(item)}
        </TableItemContext.Provider>
      ))
    );

  return useRender({
    defaultTagName: 'tbody',
    render,
    ref,
    props: mergeProps<'tbody'>({ children: content }, otherProps),
  });
}

function visibleRows<Item>(
  items: readonly Item[],
  options: Pick<TableBodyProps<Item>, 'itemToStringValue' | 'itemToChildren'> & { expanded: string[] },
  depth = 0,
): VisibleRow<Item>[] {
  return items.flatMap((item, index) => {
    const value = options.itemToStringValue(item);
    const childItems = options.itemToChildren?.(item) ?? [];
    const row: VisibleRow<Item> = {
      item,
      value,
      depth,
      index,
      setSize: items.length,
      hasChildren: childItems.length > 0,
    };
    return options.expanded.includes(value) ? [row, ...visibleRows(childItems, options, depth + 1)] : [row];
  });
}
