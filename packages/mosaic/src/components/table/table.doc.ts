import type { ComponentDoc } from '../../docs-schema';
import type {
  TableBodyProps,
  TableCellProps,
  TableColumnProps,
  TableExpandButtonProps,
  TableHeaderProps,
  TableRootProps,
  TableRowProps,
  TableSearchProps,
  TableSelectionCellProps,
  TableSelectionColumnProps,
  TableToolbarProps,
} from './table';

export default {
  name: 'Table',
  description:
    'A styled native `table` with optional row actions, selection, sorting and expandable tree rows, over the headless `Table` primitive. `Table.Root` owns the selection, expanded and sort state, and scrolls sideways when wider than its container. With actions, selection, sorting or tree rows it becomes a `grid` or `treegrid` with one tab stop and arrow-key navigation.',
  useFor: [
    'a data table, such as members or invitations',
    'rows that open a page or run an action on click',
    'selectable rows with a select-all checkbox',
    'sortable columns',
    'expandable rows with child rows, such as logs',
    'a search box above a table',
  ],
  keywords: ['table', 'data table', 'grid', 'rows', 'columns', 'sort', 'selection', 'tree grid', 'search'],
  practices: [
    { do: true, text: 'Name the table with `aria-label` or `aria-labelledby` on `Table.Root`.' },
    {
      do: true,
      text: 'Mark the column that names each row with `rowHeader`, so rows and their checkboxes take that name.',
    },
    { do: true, text: 'Sort the items yourself or on the server. The table only tracks the sort state.' },
    {
      do: true,
      text: 'Pass `onClick` or `href` to `Table.Row` for a row action, instead of a link or button in a cell.',
    },
    { do: false, text: 'Render `Table.Row` outside the children function of `Table.Body`. It throws.' },
    {
      do: false,
      text: 'Unmount rows while the next page loads. Turn them into bones with `Skeleton` (`mosaic guides inspect skeletons`).',
    },
  ],
  parts: {
    'Table.Root': {
      description:
        'Renders the `table` inside a shell (`cl-table-shell`) and a focusable horizontal scroll viewport (`cl-table-viewport`). Carries `data-layout`.',
      slot: 'cl-table',
      props: {
        layout: {
          type: 'TableLayout',
          doc: '`auto` sizes columns to content; `fixed` uses the column widths.',
          default: "'auto'",
        },
        minWidth: { type: 'string', doc: 'A CSS length below which the table scrolls instead of shrinking.' },
        selectionMode: {
          type: "'none' | 'single' | 'multiple'",
          doc: '`none`, `single` or `multiple`.',
          default: "'none'",
        },
        selection: { type: 'string[]', doc: 'Selected row values, when controlled.' },
        defaultSelection: { type: 'string[]', doc: 'Selected row values on mount.', default: '[]' },
        onSelectionChange: { type: '(selection: string[]) => void', doc: 'Called with the new selection.' },
        expanded: { type: 'string[]', doc: 'Expanded row values, when controlled.' },
        defaultExpanded: { type: 'string[]', doc: 'Expanded row values on mount.', default: '[]' },
        onExpandedChange: { type: '(expanded: string[]) => void', doc: 'Called when a row expands or collapses.' },
        sort: {
          type: "{ column: string; direction: 'ascending' | 'descending' } | null",
          doc: '`{ column, direction }`, when controlled.',
        },
        defaultSort: {
          type: "{ column: string; direction: 'ascending' | 'descending' } | null",
          doc: 'Sort on mount.',
          default: 'null',
        },
        onSortChange: {
          type: "(sort: { column: string; direction: 'ascending' | 'descending' }) => void",
          doc: 'Called when a sortable column is activated.',
        },
      },
    },
    'Table.Toolbar': { description: 'A `div` above the table for search and actions.', slot: 'cl-table-toolbar' },
    'Table.Search': {
      description:
        'A search input with a magnifying glass and a clear button while it has a value. Takes `Input` props.',
      slot: 'cl-table-search',
      props: {
        label: { type: 'string', doc: 'Accessible name and placeholder.' },
        clearLabel: { type: 'string', doc: 'Accessible name of the clear button.' },
        value: { type: 'string', doc: 'The query. Always controlled.' },
        onValueChange: {
          type: '(value: string) => void',
          doc: 'Called with the new query. Clearing calls it with an empty string and refocuses the input.',
        },
      },
    },
    'Table.Header': { description: 'The `thead`, wrapping its columns in a `tr`.', slot: 'cl-table-header' },
    'Table.Column': {
      description:
        'A `th scope="col"`. A sortable one shows a sort icon and carries `data-sortable` and `data-sort-direction`. Carries `data-align` and `data-sticky`.',
      slot: 'cl-table-column',
      props: {
        value: { type: 'string', doc: 'Identifies the column in the sort state.' },
        sortable: { type: 'boolean', doc: 'Sorts by this column on activation. Needs `value`.', default: 'false' },
        rowHeader: {
          type: 'boolean',
          doc: "Renders this column's cells as row headers that name their rows.",
          default: 'false',
        },
        align: { type: 'TableAlign', doc: '`start`, `center` or `end`.', default: "'start'" },
        sticky: { type: 'TableSticky', doc: '`start` or `end` pins the column while the table scrolls sideways.' },
        width: { type: 'string', doc: 'A fixed CSS width.' },
      },
    },
    'Table.Body': {
      description: 'The `tbody`. Renders a row per visible item, or the empty state in one cell (`cl-table-empty`).',
      slot: 'cl-table-body',
      props: {
        items: { type: 'readonly Item[]', doc: 'The records to render.' },
        itemToStringValue: {
          type: '(item: Item) => string',
          doc: "The row's value in the selection and expanded state.",
        },
        itemToChildren: {
          type: '(item: Item) => readonly Item[] | undefined',
          doc: "An item's child items. Makes the table a tree grid.",
        },
        children: { type: '(item: Item) => React.ReactNode', doc: 'Renders the `Table.Row` for an item.' },
        renderEmptyState: {
          type: '() => React.ReactNode',
          doc: 'Rendered in one cell spanning every column when there are no items.',
        },
      },
    },
    'Table.Row': {
      description:
        'A `tr`. Carries `data-selected`, `data-disabled`, `data-expanded` and `data-actionable`, and `--table-row-depth` in a tree.',
      slot: 'cl-table-row',
      props: {
        onClick: {
          type: 'React.MouseEventHandler<HTMLTableRowElement>',
          doc: 'Row action, run on click and Enter. Clicks on controls inside the row do not run it.',
        },
        href: { type: 'string', doc: 'Row link. Keeps modifier keys, so Cmd or Ctrl-click opens a new tab.' },
        disabled: {
          type: 'boolean',
          doc: 'Removes the row from navigation, selection and its action.',
          default: 'false',
        },
        expandable: { type: 'boolean', doc: 'Lets the row expand before its children are loaded.', default: 'false' },
      },
    },
    'Table.Cell': {
      description:
        'A `td`, or a `th scope="row"` in a `rowHeader` column. Carries `data-align`, `data-sticky` and `data-no-wrap`.',
      slot: 'cl-table-cell',
      props: {
        align: { type: 'TableAlign', doc: '`start`, `center` or `end`.', default: "'start'" },
        sticky: { type: 'TableSticky', doc: '`start` or `end` pins the cell while the table scrolls sideways.' },
        noWrap: { type: 'boolean', doc: 'Keeps the content on one line.', default: 'false' },
      },
    },
    'Table.SelectionColumn': {
      description:
        'A header cell with a `Checkbox` that selects all visible, enabled rows. Indeterminate when some are selected.',
      slot: 'cl-table-select-cell',
      props: { 'aria-label': { type: 'string', doc: 'Required. There is no row header to name it.' } },
    },
    'Table.SelectionCell': {
      description: 'A body cell with a `Checkbox` that selects its row.',
      slot: 'cl-table-select-cell',
      props: {
        'aria-label': {
          type: 'string',
          doc: 'Required. Read before the row header, so `\'Select\'` reads as "Select <row>".',
        },
      },
    },
    'Table.ExpandButton': {
      description:
        "A chevron button that toggles its row's children. Renders only when the row can expand. Out of the tab order; the arrow keys expand and collapse. Carries `data-expanded` or `data-collapsed`.",
      slot: 'cl-table-expand-button',
      props: { 'aria-label': { type: 'string', doc: 'Required. Read before the row header.' } },
    },
  },
  examples: [
    {
      title: 'Selectable rows',
      code: `
<Table.Root aria-label='Members' selectionMode='multiple'>
  <Table.Header>
    <Table.SelectionColumn aria-label='Select all' />
    <Table.Column value='name' rowHeader>Name</Table.Column>
  </Table.Header>
  <Table.Body items={members} itemToStringValue={member => member.id} renderEmptyState={() => m.empty}>
    {member => (
      <Table.Row>
        <Table.SelectionCell aria-label='Select' />
        <Table.Cell>{member.name}</Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
</Table.Root>
`,
    },
    {
      title: 'A search toolbar',
      code: `
<Table.Toolbar>
  <Table.Search label={m.search} clearLabel={m.clear} value={query} onValueChange={setQuery} />
</Table.Toolbar>
`,
    },
  ],
  related: ['Checkbox', 'Skeleton', 'EmptyState', 'ScrollArea'],
} satisfies ComponentDoc<{
  'Table.Root': TableRootProps;
  'Table.Toolbar': TableToolbarProps;
  'Table.Search': TableSearchProps;
  'Table.Header': TableHeaderProps;
  'Table.Column': TableColumnProps;
  'Table.Body': TableBodyProps<unknown>;
  'Table.Row': TableRowProps;
  'Table.Cell': TableCellProps;
  'Table.SelectionColumn': TableSelectionColumnProps;
  'Table.SelectionCell': TableSelectionCellProps;
  'Table.ExpandButton': TableExpandButtonProps;
}>;
