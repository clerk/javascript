---
'@clerk/mosaic': minor
---

Rebuild `Table` on the headless Table primitive. `Table.Root` now owns row selection, tree expansion and sort state, and adds keyboard navigation between rows and cells. `Table.Body` renders rows from `items` with a render function and shows `renderEmptyState` when there are none. `Table.Column` replaces `Table.HeaderCell`, `Table.ColumnGroup` and the old `<col>` `Table.Column`, and takes `width`, `sortable` and `rowHeader`. `Table.SelectionColumn`, `Table.SelectionCell` and `Table.ExpandButton` replace `Table.SelectAllCell` and `Table.SelectCell`, and need an `aria-label`. `Table.Empty` is removed. Sorting goes ascending, then flips, and no longer clears on a third activation. Row selection no longer clears when the page, search or sort changes. Rows with an action now carry `data-actionable` instead of `data-interactive`.

Remove `useDataTable` and `useServerDataTable`. In the members table, rows for members you can't manage, including your own, are now marked `aria-disabled`. The API keys table no longer accepts `sort` or `onSortChange`.
