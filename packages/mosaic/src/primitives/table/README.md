# Table

A native `<table>` with optional row actions, row selection and expandable tree rows. Rows come from `useDataTable`, which owns selection and expanded state. Behavior follows [React Aria's Table](https://react-aria.adobe.com/Table) and [Tree grid](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/) patterns.

## When to Use

- Tabular data where rows open a page, run an action, can be selected, or have child rows (for example, logs).
- A plain data table with none of these stays a plain `<table>` with no grid role or keyboard navigation.

## Usage

```tsx
import { useDataTable } from '@/primitives/hooks';
import { Table } from '@/primitives/table';

const table = useDataTable({
  data: logs,
  getRowId: log => log.id,
  getSubRows: log => log.children,
  selectionMode: 'multiple',
});

<Table.Root
  table={table}
  aria-label='Logs'
>
  <Table.Header>
    <Table.Column>
      <Table.SelectionCheckbox />
    </Table.Column>
    <Table.Column>Message</Table.Column>
  </Table.Header>
  <Table.Body>
    {table.rows.map(row => (
      <Table.Row
        key={row.id}
        row={row}
        href={`/logs/${row.id}`}
      >
        <Table.Cell>
          <Table.SelectionCheckbox />
        </Table.Cell>
        <Table.Cell rowHeader>
          <Table.ExpandButton>▸</Table.ExpandButton>
          {row.original.message}
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>;
```

Mark the cell that names the row with `rowHeader`. The row, its selection checkbox ("Select …") and its expand button ("Expand …" / "Collapse …") take their accessible names from it.

`table.rows` holds only the visible rows: a child row is in the list while its parent is expanded. Use `--table-row-depth` to indent child rows.

### Row actions

Pass `onClick` or `href` (with `target`, `rel` and `download`) to `Table.Row`. The row runs the action on click and on Enter, without a link or button in a cell. Clicks on buttons, links, inputs and portaled content inside the row do not run it. `href` keeps the modifier keys, so Cmd/Ctrl-click opens a new tab.

### Selection

Set `selectionMode` on `useDataTable` to `'single'`, `'multiple'` or `'none'`. With nothing selected, clicking an actionable row runs its action. Once any row is selected, clicking a row toggles its selection instead. Shift-click selects a range.

## Parts

| Part                      | Default Element         | Description                                                |
| ------------------------- | ----------------------- | ---------------------------------------------------------- |
| `Table.Root`              | `<table>`               | Root, provides context and keyboard navigation             |
| `Table.Header`            | `<thead>`               | Header, wraps its columns in a `<tr>`                      |
| `Table.Column`            | `<th scope="col">`      | Column header                                              |
| `Table.Body`              | `<tbody>`               | Body                                                       |
| `Table.Row`               | `<tr>`                  | Body row, with optional action, selection and tree state   |
| `Table.Cell`              | `<td>`                  | Cell. `<th scope="row">` with `rowHeader`.                 |
| `Table.SelectionCheckbox` | `<input type=checkbox>` | Selects its row, or all rows when inside `Table.Header`    |
| `Table.ExpandButton`      | `<button>`              | Toggles its row's children. Renders only if it can expand. |

## Props

### `Table.Root`

| Prop    | Type              | Default | Description                                                                  |
| ------- | ----------------- | ------- | ---------------------------------------------------------------------------- |
| `table` | `TableCollection` | —       | The return value of `useDataTable`. Owns rows, selection and expanded state. |

### `Table.Row`

| Prop       | Type                | Default | Description                                                |
| ---------- | ------------------- | ------- | ---------------------------------------------------------- |
| `row`      | `DataTableRow`      | —       | The row from `useDataTable`                                |
| `disabled` | `boolean`           | `false` | Removes the row from navigation, selection and its action  |
| `onClick`  | `(event) => void`   | —       | Row action                                                 |
| `href`     | `string`            | —       | Row link. `onClick` runs first and can `preventDefault()`. |
| `target`   | `string`            | —       | Link target                                                |
| `rel`      | `string`            | —       | Link rel                                                   |
| `download` | `boolean \| string` | —       | Link download                                              |

### `Table.Cell`

| Prop        | Type      | Default | Description                                                          |
| ----------- | --------- | ------- | -------------------------------------------------------------------- |
| `rowHeader` | `boolean` | `false` | Renders a row header that names the row, its checkbox and its button |

All parts accept a `render` prop for polymorphic rendering and standard HTML attributes for their default element.

## Keyboard Navigation

Navigation turns on when the table has row actions, selection or tree rows. Rows and cells are both focusable, and the table is one tab stop.

| Key                      | Action                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `ArrowDown` / `ArrowUp`  | Next / previous row (or cell in the same column). Skips disabled rows.                                     |
| `ArrowRight`             | On a collapsed row, expand it. Otherwise move into the first cell, then along the cells.                   |
| `ArrowLeft`              | On an expanded row, collapse it. On a child row, move to its parent. From the first cell, back to the row. |
| `Home` / `End`           | First / last row, or first / last cell in the row                                                          |
| `Ctrl+Home` / `Ctrl+End` | First / last cell in the table                                                                             |
| `Enter`                  | Run the row action, or toggle selection if the row has none. On a cell with controls, focus them.          |
| `F2`                     | Focus the controls in the focused cell                                                                     |
| `Escape`                 | Leave a cell's controls, or clear the selection                                                            |
| `Space`                  | Toggle the row's selection. `Shift+Space` selects a range.                                                 |
| `Ctrl+A` / `Cmd+A`       | Select all rows (multiple mode)                                                                            |

Left and right swap in right-to-left layouts. A cell with a single button or link focuses that control directly.

## Data Attributes

| Attribute            | Applies To             | Description                         |
| -------------------- | ---------------------- | ----------------------------------- |
| `data-selected`      | Row                    | Present when the row is selected    |
| `data-disabled`      | Row, SelectionCheckbox | Present when disabled               |
| `data-expanded`      | Row, ExpandButton      | Present when the row is expanded    |
| `data-collapsed`     | ExpandButton           | Present when the row is collapsed   |
| `data-actionable`    | Row                    | Present when the row has an action  |
| `data-checked`       | SelectionCheckbox      | Present when checked                |
| `data-indeterminate` | SelectionCheckbox      | Present when some rows are selected |

## CSS Variables

| Property            | Applies To | Value                                   |
| ------------------- | ---------- | --------------------------------------- |
| `--table-row-depth` | Row        | The row's depth, `0` for top-level rows |

## ARIA

- Root: `role="treegrid"` with tree rows, `role="grid"` with actions or selection, none otherwise. `aria-multiselectable` in multiple mode.
- Row: `aria-labelledby` its row header cells, `aria-selected` when selectable, `aria-disabled`. In a tree grid also `aria-level`, `aria-posinset`, `aria-setsize` and `aria-expanded`.
- SelectionCheckbox: labelled "Select" plus the row header, or "Select all" in the header.
- ExpandButton: labelled "Expand" or "Collapse" plus the row header, `aria-expanded`, and `tabIndex={-1}` because the row's arrow keys expand and collapse it.
