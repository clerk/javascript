import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ChevronDown } from '../../icons/glyphs/chevron-down';
import { ChevronUp } from '../../icons/glyphs/chevron-up';
import { ChevronUpDown } from '../../icons/glyphs/chevron-up-down';
import { MagnifyingGlass } from '../../icons/glyphs/magnifying-glass';
import { X } from '../../icons/glyphs/x';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { Button } from '../button';
import type { CheckboxProps } from '../checkbox';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import type { InputProps } from '../input';
import { InputGroup } from '../input-group';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { aligns, columnWidth, layouts, stickySides, styles } from './table.styles';

type TableSection = 'header' | 'body';

const TableSectionContext = React.createContext<TableSection>('body');

export type TableAlign = keyof typeof aligns;

export type TableSort = 'ascending' | 'descending' | 'none';

export type TableSticky = keyof typeof stickySides;

export type TableLayout = keyof typeof layouts;

export interface TableProps extends MosaicElementProps<'table'> {
  layout?: TableLayout;
}

export type TableToolbarProps = MosaicComponentProps<'div'>;

const Toolbar = React.forwardRef<HTMLDivElement, TableToolbarProps>(function MosaicTableToolbar(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('table-toolbar'), stylex.props(reset.base, styles.toolbar, xstyle), rest),
  });
});

export interface TableSearchProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'children' | 'size' | 'variant'
> {
  label: string;
  clearLabel: string;
  value: string;
  onValueChange: (value: string) => void;
}

const Search = React.forwardRef<HTMLInputElement, TableSearchProps>(function MosaicTableSearch(
  { label, clearLabel, value, onValueChange, disabled, readOnly, ...rest },
  ref,
) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs([ref, inputRef]);
  return (
    <InputGroup.Root
      disabled={disabled}
      xstyle={styles.search}
      {...themeProps('table-search')}
    >
      <InputGroup.Start>
        <Icon glyph={MagnifyingGlass} />
      </InputGroup.Start>
      <InputGroup.Input
        ref={mergedRef}
        autoComplete='off'
        aria-label={label}
        placeholder={label}
        {...rest}
        type='search'
        value={value}
        readOnly={readOnly}
        onChange={event => onValueChange(event.currentTarget.value)}
      />
      {value ? (
        <InputGroup.End>
          <Button
            type='button'
            aria-label={clearLabel}
            disabled={disabled || readOnly}
            onClick={() => {
              onValueChange('');
              inputRef.current?.focus();
            }}
          >
            <Icon glyph={X} />
          </Button>
        </InputGroup.End>
      ) : null}
    </InputGroup.Root>
  );
});

const Root = React.forwardRef<HTMLTableElement, TableProps>(function MosaicTable(
  { layout = 'auto', xstyle, ...rest },
  ref,
) {
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
          {...mergeStyleProps(
            themeProps('table', { layout }),
            stylex.props(reset.base, styles.table, layouts[layout], xstyle),
            rest,
          )}
        />
      </div>
    </div>
  );
});

export type TableColumnGroupProps = MosaicComponentProps<'colgroup'>;

const ColumnGroup = React.forwardRef<HTMLTableColElement, TableColumnGroupProps>(function MosaicTableColumnGroup(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'colgroup',
    render,
    ref,
    props: mergeStyleProps(themeProps('table-column-group'), stylex.props(reset.base, xstyle), rest),
  });
});

export interface TableColumnProps extends MosaicComponentProps<'col'> {
  width?: string;
}

const Column = React.forwardRef<HTMLTableColElement, TableColumnProps>(function MosaicTableColumn(
  { width, render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'col',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('table-column'),
      stylex.props(reset.base, width !== undefined && columnWidth.fixed(width), xstyle),
      rest,
    ),
  });
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
  sticky?: TableSticky;
  sort?: TableSort;
  onSort?: () => void;
}

const sortIcons = {
  ascending: ChevronUp,
  descending: ChevronDown,
  none: ChevronUpDown,
} as const;

const HeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function MosaicTableHeaderCell(
  { align = 'start', sticky, sort = 'none', onSort, children, render, xstyle, ...rest },
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
        themeProps('table-header-cell', {
          align,
          sticky,
          sortable,
          sort: sortable && sort !== 'none' ? sort : undefined,
        }),
        stylex.props(
          reset.base,
          styles.headerCell,
          aligns[align],
          sortable && styles.sortableHeaderCell,
          sticky && [styles.sticky, stickySides[sticky]],
          xstyle,
        ),
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
            glyph={sortIcons[sort]}
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
  sticky?: TableSticky;
  noWrap?: boolean;
}

const Cell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function MosaicTableCell(
  { align = 'start', sticky, noWrap = false, render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'td',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('table-cell', { align, sticky, noWrap }),
      stylex.props(
        reset.base,
        styles.cell,
        aligns[align],
        noWrap && styles.noWrap,
        sticky && [styles.sticky, stickySides[sticky]],
        xstyle,
      ),
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

export const Table = {
  Root,
  Toolbar,
  Search,
  ColumnGroup,
  Column,
  Header,
  Body,
  Row,
  HeaderCell,
  Cell,
  SelectAllCell,
  SelectCell,
  Empty,
};
