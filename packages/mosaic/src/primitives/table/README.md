# Table

A native `<table>` with optional row actions, selection, sorting and expandable tree rows. `Table.Root` owns the selection, expanded and sort state; `Table.Body` renders a row per item. Behavior follows [React Aria's Table](https://react-aria.adobe.com/Table) and the [Tree grid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) pattern.

## When to Use

- Tabular data where rows open a page, run an action, can be selected or sorted, or have child rows (for example, logs).
- A plain data table with none of these stays a plain `<table>` with no grid role or keyboard navigation.

## Usage

```tsx
import { Table } from '@/primitives/table';

<Table.Root
  aria-label='Logs'
  selectionMode='multiple'
  sort={sort}
  onSortChange={setSort}
>
  <Table.Header>
    <Table.Column>
      <Table.SelectionCheckbox />
    </Table.Column>
    <Table.Column
      value='message'
      sortable
    >
      Message
    </Table.Column>
  </Table.Header>
  <Table.Body
    items={logs}
    itemToStringValue={log => log.id}
    itemToChildren={log => log.children}
    empty='No logs'
  >
    {log => (
      <Table.Row href={`/logs/${log.id}`}>
        <Table.Cell>
          <Table.SelectionCheckbox />
        </Table.Cell>
        <Table.Cell rowHeader>
          <Table.ExpandButton>▸</Table.ExpandButton>
          {log.message}
        </Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
</Table.Root>;
```

Mark the cell that names the row with `rowHeader`. The row, its selection checkbox ("Select …") and its expand button ("Expand …" / "Collapse …") take their accessible names from it.

### Tree rows

Pass `itemToChildren` to `Table.Body` to make the table a tree grid. The children of an expanded row render right after it. Use `--table-row-depth` to indent them, and `expandable` on `Table.Row` for a row whose children are not loaded yet.

### Row actions

Pass `onClick` or `href` (with `target`, `rel` and `download`) to `Table.Row`. The row runs the action on click and on Enter, without a link or button in a cell. Clicks on buttons, links, inputs and portaled content inside the row do not run it. `href` keeps the modifier keys, so Cmd/Ctrl-click opens a new tab.

### Selection

Set `selectionMode` to `'single'`, `'multiple'` or `'none'`. With nothing selected, clicking an actionable row runs its action. Once any row is selected, clicking a row toggles its selection instead. Shift-click selects a range. Select all covers the visible rows that are not disabled.

### Sorting

Give a column a `value` and `sortable`. Activating its header sorts by it ascending, and activating it again flips the direction. The table does not sort the items; sort them in `onSortChange` or on the server.

## Parts

| Part                      | Default Element         | Description                                                |
| ------------------------- | ----------------------- | ---------------------------------------------------------- |
| `Table.Root`              | `<table>`               | Owns selection, expanded and sort state, and keyboard nav  |
| `Table.Header`            | `<thead>`               | Header, wraps its columns in a `<tr>`                      |
| `Table.Column`            | `<th scope="col">`      | Column header, optionally sortable                         |
| `Table.Body`              | `<tbody>`               | Renders a row per visible item, or the empty state         |
| `Table.Row`               | `<tr>`                  | Body row, with optional action, selection and tree state   |
| `Table.Cell`              | `<td>`                  | Cell. `<th scope="row">` with `rowHeader`.                 |
| `Table.SelectionCheckbox` | `<input type=checkbox>` | Selects its row, or all rows when inside `Table.Header`    |
| `Table.ExpandButton`      | `<button>`              | Toggles its row's children. Renders only if it can expand. |

## Props

### `Table.Root`

| Prop                | Type                               | Default  | Description                                 |
| ------------------- | ---------------------------------- | -------- | ------------------------------------------- |
| `selectionMode`     | `'none' \| 'single' \| 'multiple'` | `'none'` | How many rows can be selected               |
| `selection`         | `string[]`                         | —        | Selected row values (controlled)            |
| `defaultSelection`  | `string[]`                         | `[]`     | Selected row values on mount (uncontrolled) |
| `onSelectionChange` | `(selection: string[]) => void`    | —        | Called when the selection changes           |
| `expanded`          | `string[]`                         | —        | Expanded row values (controlled)            |
| `defaultExpanded`   | `string[]`                         | `[]`     | Expanded row values on mount (uncontrolled) |
| `onExpandedChange`  | `(expanded: string[]) => void`     | —        | Called when a row expands or collapses      |
| `sort`              | `TableSort \| null`                | —        | Sorted column and direction (controlled)    |
| `defaultSort`       | `TableSort \| null`                | `null`   | Sorted column and direction on mount        |
| `onSortChange`      | `(sort: TableSort) => void`        | —        | Called when a sortable column is activated  |

`TableSort` is `{ column: string; direction: 'ascending' | 'descending' }`.

### `Table.Column`

| Prop       | Type      | Default | Description                                        |
| ---------- | --------- | ------- | -------------------------------------------------- |
| `value`    | `string`  | —       | Identifies the column in the sort state            |
| `sortable` | `boolean` | `false` | Sorts by this column on activation. Needs `value`. |

### `Table.Body`

| Prop                | Type                                  | Default      | Description                                           |
| ------------------- | ------------------------------------- | ------------ | ----------------------------------------------------- |
| `items`             | `Item[]`                              | — (required) | The records to render                                 |
| `itemToStringValue` | `(item: Item) => string`              | — (required) | The row's value in the selection and expanded state   |
| `itemToChildren`    | `(item: Item) => Item[] \| undefined` | —            | An item's child items. Makes the table a tree grid.   |
| `children`          | `(item: Item) => ReactNode`           | — (required) | Renders the row for an item                           |
| `empty`             | `ReactNode`                           | —            | Rendered in one cell spanning every column when empty |

### `Table.Row`

| Prop         | Type                | Default | Description                                                |
| ------------ | ------------------- | ------- | ---------------------------------------------------------- |
| `disabled`   | `boolean`           | `false` | Removes the row from navigation, selection and its action  |
| `expandable` | `boolean`           | `false` | Lets the row expand before its children are loaded         |
| `onClick`    | `(event) => void`   | —       | Row action                                                 |
| `href`       | `string`            | —       | Row link. `onClick` runs first and can `preventDefault()`. |
| `target`     | `string`            | —       | Link target                                                |
| `rel`        | `string`            | —       | Link rel                                                   |
| `download`   | `boolean \| string` | —       | Link download                                              |

### `Table.Cell`

| Prop        | Type      | Default | Description                                                          |
| ----------- | --------- | ------- | -------------------------------------------------------------------- |
| `rowHeader` | `boolean` | `false` | Renders a row header that names the row, its checkbox and its button |

All parts accept a `render` prop for polymorphic rendering and standard HTML attributes for their default element.

## Keyboard Navigation

Navigation turns on when the table has row actions, selection, sortable columns or tree rows. Rows and cells are both focusable, and the table is one tab stop.

| Key                      | Action                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `ArrowDown` / `ArrowUp`  | Next / previous row (or cell in the same column). Skips disabled rows.                                     |
| `ArrowRight`             | On a collapsed row, expand it. Otherwise move into the first cell, then along the cells.                   |
| `ArrowLeft`              | On an expanded row, collapse it. On a child row, move to its parent. From the first cell, back to the row. |
| `Home` / `End`           | First / last row, or first / last cell in the row                                                          |
| `Ctrl+Home` / `Ctrl+End` | First / last cell in the table                                                                             |
| `Enter`                  | Run the row action, or toggle selection if the row has none. On a cell with controls, focus them.          |
| `Enter` / `Space`        | On a sortable column header, sort by it                                                                    |
| `F2`                     | Focus the controls in the focused cell                                                                     |
| `Escape`                 | Leave a cell's controls, or clear the selection                                                            |
| `Space`                  | Toggle the row's selection. `Shift+Space` selects a range.                                                 |
| `Ctrl+A` / `Cmd+A`       | Select all rows (multiple mode)                                                                            |

Left and right swap in right-to-left layouts. A cell with a single button or link focuses that control directly.

## Data Attributes

| Attribute             | Applies To             | Description                                                        |
| --------------------- | ---------------------- | ------------------------------------------------------------------ |
| `data-selected`       | Row                    | Present when the row is selected                                   |
| `data-disabled`       | Row, SelectionCheckbox | Present when disabled                                              |
| `data-expanded`       | Row, ExpandButton      | Present when the row is expanded                                   |
| `data-collapsed`      | ExpandButton           | Present when the row is collapsed                                  |
| `data-actionable`     | Row                    | Present when the row has an action                                 |
| `data-checked`        | SelectionCheckbox      | Present when checked                                               |
| `data-indeterminate`  | SelectionCheckbox      | Present when some rows are selected                                |
| `data-sortable`       | Column                 | Present when the column is sortable                                |
| `data-sort-direction` | Column                 | `ascending` or `descending` when the table is sorted by the column |

## CSS Variables

| Property            | Applies To | Value                                   |
| ------------------- | ---------- | --------------------------------------- |
| `--table-row-depth` | Row        | The row's depth, `0` for top-level rows |

## ARIA

- Root: `role="treegrid"` with `itemToChildren`, `role="grid"` with actions, selection or sortable columns, none otherwise. `aria-multiselectable` in multiple mode.
- Row: `aria-labelledby` its row header cells, `aria-selected` when selectable, `aria-disabled`. In a tree grid also `aria-level`, `aria-posinset`, `aria-setsize` and `aria-expanded`.
- Column: `aria-sort` when sortable: the direction on the sorted column, `none` on the others.
- SelectionCheckbox: labelled "Select" plus the row header, or "Select all" in the header.
- ExpandButton: labelled "Expand" or "Collapse" plus the row header, `aria-expanded`, and `tabIndex={-1}` because the row's arrow keys expand and collapse it.
