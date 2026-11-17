import type { ComponentDoc } from '../../docs-schema';
import type { TableBodyProps } from './table-body';
import type { TableCellProps } from './table-cell';
import type { TableColumnProps } from './table-column';
import type { TableExpandButtonProps } from './table-expand-button';
import type { TableHeaderProps } from './table-header';
import type { TableRootProps } from './table-root';
import type { TableRowProps } from './table-row';
import type { TableSelectionCheckboxProps } from './table-selection-checkbox';

export default {
  name: 'Table',
  description:
    'Headless, unstyled native `<table>` with optional row actions, selection, sorting and expandable tree rows. Becomes a `grid` or `treegrid` with one tab stop and arrow-key navigation only when one of those is in use.',
  useFor: [
    'a data table whose rows open a page or run an action',
    'a table with selectable rows and a select-all checkbox',
    'a table with sortable columns',
    'a tree of expandable rows, such as logs with child entries',
  ],
  keywords: ['table', 'data table', 'grid', 'treegrid', 'rows', 'columns', 'sort', 'selection', 'expandable rows'],
  practices: [
    {
      do: true,
      text: 'Mark the column that names each row with `rowHeader`. Rows, checkboxes and expand buttons take their names from it.',
    },
    { do: true, text: 'Give the header `Table.SelectionCheckbox` an `aria-label`. It has no row header to name it.' },
    { do: true, text: 'Sort `items` yourself, or on the server, from `sort`. The table does not reorder rows.' },
    { do: true, text: 'Indent tree rows with `--table-row-depth`.' },
    {
      do: false,
      text: 'Put a link or button in a cell to make the row clickable. Pass `href` or `onClick` to `Table.Row` instead.',
    },
    { do: false, text: 'Render `Table.Row` outside the `Table.Body` children function. It throws.' },
  ],
  parts: {
    'Table.Root': {
      description:
        'A `table` that holds the selection, expanded rows and sort, and the keyboard navigation. `Escape` clears the selection and `Ctrl+A` selects all.',
      props: {
        selectionMode: { type: 'TableSelectionMode', doc: 'How many rows can be selected.', default: "'none'" },
        selection: { type: 'string[]', doc: 'The selected row values, when controlled.' },
        defaultSelection: {
          type: 'string[]',
          doc: 'The selected row values on mount, when uncontrolled.',
          default: '[]',
        },
        onSelectionChange: { type: '(selection: string[]) => void', doc: 'Called with the new selected row values.' },
        expanded: { type: 'string[]', doc: 'The expanded row values, when controlled.' },
        defaultExpanded: {
          type: 'string[]',
          doc: 'The expanded row values on mount, when uncontrolled.',
          default: '[]',
        },
        onExpandedChange: { type: '(expanded: string[]) => void', doc: 'Called with the new expanded row values.' },
        sort: { type: 'TableSort | null', doc: 'The sorted column and direction, when controlled.' },
        defaultSort: {
          type: 'TableSort | null',
          doc: 'The sorted column and direction on mount, when uncontrolled.',
          default: 'null',
        },
        onSortChange: { type: '(sort: TableSort) => void', doc: 'Called when a sortable column header is activated.' },
      },
    },
    'Table.Header': { description: 'A `thead` that wraps its columns in one `tr`.' },
    'Table.Column': {
      description:
        'A `th scope="col"`. A sortable column carries `aria-sort`, `data-sortable` and `data-sort-direction`, and sorts on click, `Enter` or `Space`.',
      props: {
        value: { type: 'string', doc: 'Identifies the column in `sort`.' },
        sortable: {
          type: 'boolean',
          doc: 'Sorts ascending on activation, then flips. Needs `value`.',
          default: 'false',
        },
        rowHeader: {
          type: 'boolean',
          doc: 'Renders this column’s cells as `th scope="row"` that name their rows.',
          default: 'false',
        },
      },
    },
    'Table.Body': {
      description: 'A `tbody` that renders a row per visible item, children after their expanded parent.',
      props: {
        items: { type: 'readonly Item[]', doc: 'The records, one row each.' },
        itemToStringValue: {
          type: '(item: Item) => string',
          doc: 'The row value used in `selection` and `expanded`.',
        },
        itemToChildren: {
          type: '(item: Item) => readonly Item[] | undefined',
          doc: 'An item’s child items. Makes the table a tree grid.',
        },
        children: { type: '(item: Item) => React.ReactNode', doc: 'Renders the `Table.Row` for an item.' },
        renderEmptyState: {
          type: '() => React.ReactNode',
          doc: 'Content for one cell spanning every column while there are no items.',
        },
      },
    },
    'Table.Row': {
      description:
        'A `tr` with `aria-selected`, and tree ARIA in a tree grid. Carries `data-selected`, `data-disabled`, `data-expanded` and `data-actionable`, and the `--table-row-depth` variable. Once any row is selected, a click toggles selection instead of the action.',
      props: {
        onClick: {
          type: 'React.MouseEventHandler<HTMLTableRowElement>',
          doc: 'The row action, run on click and `Enter`. Clicks on controls inside the row do not run it.',
        },
        href: {
          type: 'string',
          doc: 'Opens this link as the row action, keeping modifier keys. `onClick` runs first and can cancel it.',
        },
        disabled: {
          type: 'boolean',
          doc: 'Removes the row from navigation, selection and its action.',
          default: 'false',
        },
        expandable: { type: 'boolean', doc: 'Lets the row expand before its children are loaded.', default: 'false' },
      },
    },
    'Table.Cell': { description: 'A `td`, or a `th scope="row"` in a `rowHeader` column.' },
    'Table.SelectionCheckbox': {
      description:
        'A checkbox that selects its row, or every selectable row inside `Table.Header`. Renders nothing when selection is off, and in the header unless `multiple`. Carries `data-checked`, `data-indeterminate` and `data-disabled`.',
    },
    'Table.ExpandButton': {
      description:
        'A `button` that toggles its row’s children, out of the tab order. Renders only when the row can expand. Carries `data-expanded` or `data-collapsed`.',
    },
  },
  examples: [
    {
      title: 'Selectable rows that link',
      code: `
<Table.Root aria-label='Logs' selectionMode='multiple'>
  <Table.Header>
    <Table.Column>
      <Table.SelectionCheckbox aria-label='Select all' />
    </Table.Column>
    <Table.Column value='message' rowHeader>Message</Table.Column>
  </Table.Header>
  <Table.Body items={logs} itemToStringValue={log => log.id}>
    {log => (
      <Table.Row href={\`/logs/\${log.id}\`}>
        <Table.Cell>
          <Table.SelectionCheckbox aria-label='Select' />
        </Table.Cell>
        <Table.Cell>{log.message}</Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
</Table.Root>
`,
    },
  ],
} satisfies ComponentDoc<{
  'Table.Root': TableRootProps;
  'Table.Header': TableHeaderProps;
  'Table.Column': TableColumnProps;
  'Table.Body': TableBodyProps<unknown>;
  'Table.Row': TableRowProps;
  'Table.Cell': TableCellProps;
  'Table.SelectionCheckbox': TableSelectionCheckboxProps;
  'Table.ExpandButton': TableExpandButtonProps;
}>;
