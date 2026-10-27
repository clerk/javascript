import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ChevronDown } from '../../icons/glyphs/chevron-down';
import { ChevronRight } from '../../icons/glyphs/chevron-right';
import { ChevronUp } from '../../icons/glyphs/chevron-up';
import { ChevronUpDown } from '../../icons/glyphs/chevron-up-down';
import { MagnifyingGlass } from '../../icons/glyphs/magnifying-glass';
import { X } from '../../icons/glyphs/x';
import type {
  TableBodyProps as HeadlessTableBodyProps,
  TableCellProps as HeadlessTableCellProps,
  TableColumnProps as HeadlessTableColumnProps,
  TableExpandButtonProps as HeadlessTableExpandButtonProps,
  TableHeaderProps as HeadlessTableHeaderProps,
  TableRootProps as HeadlessTableRootProps,
  TableRowProps as HeadlessTableRowProps,
  TableSelectionCheckboxProps as HeadlessTableSelectionCheckboxProps,
} from '../../primitives/table';
import { Table as Primitive } from '../../primitives/table';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import type { InputProps } from '../input';
import { InputGroup } from '../input-group';
import { scrollAreaRoot, scrollAreaViewport } from '../scroll-area';
import { tableStateMarker } from './table.markers.stylex';
import { aligns, columnWidth, layouts, sortIcons, stickySides, styles, tableMinWidth } from './table.styles';

export type { TableSelectionMode, TableSort } from '../../primitives/table';

type StyledProps<Props> = Omit<Props, 'className' | 'style'> & MosaicStyleProps;

export type TableAlign = keyof typeof aligns;

export type TableSticky = keyof typeof stickySides;

export type TableLayout = keyof typeof layouts;

export interface TableRootProps extends StyledProps<HeadlessTableRootProps> {
  layout?: TableLayout;
  minWidth?: string;
}

export type TableHeaderProps = StyledProps<HeadlessTableHeaderProps>;

export interface TableColumnProps extends StyledProps<Omit<HeadlessTableColumnProps, 'align'>> {
  align?: TableAlign;
  sticky?: TableSticky;
  width?: string;
}

export type TableBodyProps<Item> = StyledProps<HeadlessTableBodyProps<Item>>;

export type TableRowProps = StyledProps<HeadlessTableRowProps>;

export interface TableCellProps extends StyledProps<Omit<HeadlessTableCellProps, 'align'>> {
  align?: TableAlign;
  sticky?: TableSticky;
  noWrap?: boolean;
}

export interface TableSelectionColumnProps extends Omit<
  HeadlessTableSelectionCheckboxProps,
  'className' | 'style' | 'render' | 'aria-label'
> {
  'aria-label': string;
}

export type TableSelectionCellProps = TableSelectionColumnProps;

export interface TableExpandButtonProps extends StyledProps<Omit<HeadlessTableExpandButtonProps, 'aria-label'>> {
  'aria-label': string;
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

const Root = React.forwardRef<HTMLTableElement, TableRootProps>(function MosaicTable(
  { layout = 'auto', minWidth, xstyle, ...rest },
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
        <Primitive.Root
          ref={ref}
          {...mergeStyleProps(
            themeProps('table', { layout }),
            stylex.props(
              reset.base,
              styles.table,
              layouts[layout],
              minWidth !== undefined && tableMinWidth.fixed(minWidth),
              xstyle,
            ),
            rest,
          )}
        />
      </div>
    </div>
  );
});

const Header = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(function MosaicTableHeader(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Header
      ref={ref}
      {...mergeStyleProps(themeProps('table-header'), stylex.props(reset.base, styles.header, xstyle), rest)}
    />
  );
});

const Column = React.forwardRef<HTMLTableCellElement, TableColumnProps>(function MosaicTableColumn(
  { align = 'start', sticky, width, sortable = false, children, xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Column
      ref={ref}
      sortable={sortable}
      {...mergeStyleProps(
        themeProps('table-column', { align, sticky }),
        stylex.props(
          reset.base,
          styles.column,
          aligns[align],
          width !== undefined && columnWidth.fixed(width),
          sortable && [styles.sortableColumn, focusOutline.visible, styles.focusRing, tableStateMarker],
          sticky && [styles.sticky, stickySides[sticky]],
          xstyle,
        ),
        rest,
      )}
    >
      {sortable ? (
        <span {...stylex.props(styles.sortLabel)}>
          {children}
          <Icon
            glyph={ChevronUpDown}
            size='sm'
            xstyle={sortIcons.none}
          />
          <Icon
            glyph={ChevronUp}
            size='sm'
            xstyle={sortIcons.ascending}
          />
          <Icon
            glyph={ChevronDown}
            size='sm'
            xstyle={sortIcons.descending}
          />
        </span>
      ) : (
        children
      )}
    </Primitive.Column>
  );
});

type TableBodyComponent = <Item>(
  props: TableBodyProps<Item> & React.RefAttributes<HTMLTableSectionElement>,
) => React.ReactElement;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- forwardRef drops the Item type parameter; React 18 support rules out a generic ref prop.
const Body = React.forwardRef(BodyImpl) as TableBodyComponent;

function BodyImpl<Item>(
  { xstyle, renderEmptyState, ...rest }: TableBodyProps<Item>,
  ref: React.ForwardedRef<HTMLTableSectionElement>,
) {
  return (
    <Primitive.Body
      ref={ref}
      renderEmptyState={
        renderEmptyState
          ? () => (
              <div {...mergeStyleProps(themeProps('table-empty'), stylex.props(reset.base, styles.empty))}>
                {renderEmptyState()}
              </div>
            )
          : undefined
      }
      {...mergeStyleProps(themeProps('table-body'), stylex.props(reset.base, xstyle), rest)}
    />
  );
}

const Row = React.forwardRef<HTMLTableRowElement, TableRowProps>(function MosaicTableRow({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Row
      ref={ref}
      {...mergeStyleProps(
        themeProps('table-row'),
        stylex.props(reset.base, styles.row, focusOutline.visible, styles.focusRing, xstyle),
        rest,
      )}
    />
  );
});

const Cell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function MosaicTableCell(
  { align = 'start', sticky, noWrap = false, xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Cell
      ref={ref}
      {...mergeStyleProps(
        themeProps('table-cell', { align, sticky, noWrap }),
        stylex.props(
          reset.base,
          styles.cell,
          aligns[align],
          noWrap && styles.noWrap,
          focusOutline.visible,
          styles.focusRing,
          sticky && [styles.sticky, stickySides[sticky]],
          xstyle,
        ),
        rest,
      )}
    />
  );
});

const selectCellProps = () =>
  mergeStyleProps(themeProps('table-select-cell'), stylex.props(reset.base, styles.cell, styles.selectCell));

const SelectionColumn = React.forwardRef<HTMLInputElement, TableSelectionColumnProps>(
  function MosaicTableSelectionColumn(props, ref) {
    return (
      <Primitive.Column {...selectCellProps()}>
        <Primitive.SelectionCheckbox
          ref={ref}
          render={<Checkbox />}
          {...props}
        />
      </Primitive.Column>
    );
  },
);

const SelectionCell = React.forwardRef<HTMLInputElement, TableSelectionCellProps>(
  function MosaicTableSelectionCell(props, ref) {
    return (
      <Primitive.Cell {...selectCellProps()}>
        <Primitive.SelectionCheckbox
          ref={ref}
          render={<Checkbox />}
          {...props}
        />
      </Primitive.Cell>
    );
  },
);

const ExpandButton = React.forwardRef<HTMLButtonElement, TableExpandButtonProps>(function MosaicTableExpandButton(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.ExpandButton
      ref={ref}
      {...mergeStyleProps(
        themeProps('table-expand-button'),
        stylex.props(reset.base, styles.expandButton, focusOutline.visible, tableStateMarker, xstyle),
        rest,
      )}
    >
      <Icon
        glyph={ChevronRight}
        size='sm'
        xstyle={styles.expandIcon}
      />
    </Primitive.ExpandButton>
  );
});

export const Table = {
  Root,
  Toolbar,
  Search,
  Header,
  Column,
  Body,
  Row,
  Cell,
  SelectionColumn,
  SelectionCell,
  ExpandButton,
};
