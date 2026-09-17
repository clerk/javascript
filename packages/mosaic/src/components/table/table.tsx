import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import type { CheckboxProps } from '../checkbox';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { aligns, styles } from './table.styles';

type TableSection = 'header' | 'body';

const TableSectionContext = React.createContext<TableSection>('body');

export type TableAlign = keyof typeof aligns;

export type TableSort = 'ascending' | 'descending' | 'none';

export type TableProps = MosaicElementProps<'table'>;

const Root = React.forwardRef<HTMLTableElement, TableProps>(function MosaicTable({ xstyle, ...rest }, ref) {
  return (
    <div {...mergeStyleProps(themeProps('table-shell'), stylex.props(reset.base, scrollAreaRoot, styles.shell))}>
      <div
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Safari does not focus an overflowing scroll container on its own, and a table without sortable or selectable cells holds nothing focusable.
        tabIndex={0}
        {...mergeStyleProps(
          themeProps('table-viewport'),
          stylex.props(reset.base, scrollAreaViewport('auto', 'inline'), styles.viewport),
        )}
      >
        <table
          ref={ref}
          {...mergeStyleProps(themeProps('table'), stylex.props(reset.base, styles.table, xstyle), rest)}
        />
      </div>
    </div>
  );
});

export type TableHeaderProps = MosaicComponentProps<'thead'>;

const Header = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(function MosaicTableHeader(
  { render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'thead',
    render,
    ref,
    props: mergeStyleProps(themeProps('table-header'), stylex.props(reset.base, styles.header, xstyle), rest),
  });
  return <TableSectionContext.Provider value='header'>{element}</TableSectionContext.Provider>;
});

export type TableBodyProps = MosaicComponentProps<'tbody'>;

const Body = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(function MosaicTableBody(
  { render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'tbody',
    render,
    ref,
    props: mergeStyleProps(themeProps('table-body'), stylex.props(reset.base, xstyle), rest),
  });
  return <TableSectionContext.Provider value='body'>{element}</TableSectionContext.Provider>;
});

export interface TableRowProps extends MosaicComponentProps<'tr'> {
  selected?: boolean;
}

const Row = React.forwardRef<HTMLTableRowElement, TableRowProps>(function MosaicTableRow(
  { selected, render, xstyle, ...rest },
  ref,
) {
  const section = React.useContext(TableSectionContext);
  return useRender({
    defaultTagName: 'tr',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('table-row', { selected }),
      stylex.props(reset.base, section === 'body' && styles.bodyRow, selected && styles.selectedRow, xstyle),
      { 'aria-selected': selected ? true : undefined },
      rest,
    ),
  });
});

export interface TableHeaderCellProps extends Omit<MosaicComponentProps<'th'>, 'align'> {
  align?: TableAlign;
  sort?: TableSort;
  onSort?: () => void;
}

const sortIcons = {
  ascending: 'chevron-up',
  descending: 'chevron-down',
  none: 'chevron-up-down',
} as const;

const HeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function MosaicTableHeaderCell(
  { align = 'start', sort = 'none', onSort, children, render, xstyle, ...rest },
  ref,
) {
  const sortable = onSort !== undefined;
  return useRender({
    defaultTagName: 'th',
    render,
    ref,
    props: {
      scope: 'col',
      ...mergeStyleProps(
        themeProps('table-header-cell', { align, sortable, sort: sortable && sort !== 'none' ? sort : undefined }),
        stylex.props(reset.base, styles.headerCell, aligns[align], sortable && styles.sortableHeaderCell, xstyle),
        { 'aria-sort': sortable && sort !== 'none' ? sort : undefined },
        rest,
      ),
      children: sortable ? (
        <Button
          variant='ghost'
          color='neutral'
          size='xs'
          onClick={onSort}
          xstyle={styles.sortButton}
        >
          {children}
          <Icon
            name={sortIcons[sort]}
            size='sm'
            placement='inline-end'
          />
        </Button>
      ) : (
        children
      ),
    },
  });
});

export interface TableCellProps extends Omit<MosaicComponentProps<'td'>, 'align'> {
  align?: TableAlign;
}

const Cell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function MosaicTableCell(
  { align = 'start', render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'td',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('table-cell', { align }),
      stylex.props(reset.base, styles.cell, aligns[align], xstyle),
      rest,
    ),
  });
});

export type TableSelectAllCellProps = CheckboxProps;

export interface TableSelectCellProps extends CheckboxProps {
  onToggleSelected?: (options: { range: boolean }) => void;
}

const selectCellProps = (slot: string) =>
  mergeStyleProps(themeProps(slot), stylex.props(reset.base, styles.cell, styles.selectCell));

const isShiftClick = (event: Event) => 'shiftKey' in event && event.shiftKey === true;

const SelectAllCell = React.forwardRef<HTMLInputElement, TableSelectAllCellProps>(
  function MosaicTableSelectAllCell(props, ref) {
    return (
      <th
        scope='col'
        {...selectCellProps('table-select-cell')}
      >
        <Checkbox
          ref={ref}
          {...props}
        />
      </th>
    );
  },
);

const SelectCell = React.forwardRef<HTMLInputElement, TableSelectCellProps>(function MosaicTableSelectCell(
  { onToggleSelected, onChange, ...rest },
  ref,
) {
  return (
    <td {...selectCellProps('table-select-cell')}>
      <Checkbox
        ref={ref}
        onChange={event => {
          onChange?.(event);
          onToggleSelected?.({ range: isShiftClick(event.nativeEvent) });
        }}
        {...rest}
      />
    </td>
  );
});

export type TableEmptyProps = MosaicElementProps<'td'>;

const Empty = React.forwardRef<HTMLTableCellElement, TableEmptyProps>(function MosaicTableEmpty(
  { colSpan = 1000, xstyle, ...rest },
  ref,
) {
  return (
    <Row>
      <td
        ref={ref}
        colSpan={colSpan}
        {...mergeStyleProps(themeProps('table-empty'), stylex.props(reset.base, styles.emptyCell, xstyle), rest)}
      />
    </Row>
  );
});

export const Table = { Root, Header, Body, Row, HeaderCell, Cell, SelectAllCell, SelectCell, Empty };
