---
'@clerk/mosaic': minor
---

**Breaking:** Screen readers now announce `Combobox.Empty` when a search matches no options. It renders a polite `role="status"` `<div>` (it was a `<p>`) that stays mounted and shows its children only when nothing matches, so keep it in the popup or beside the list rather than rendering it conditionally. To make this work, `Combobox.Root` now owns the items, and `Combobox.Collection` only renders them:

| Before                                                                       | After                                                       |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `<Combobox.Collection items={items} itemToStringLabel={toLabel}>`            | `<Combobox.Root items={items} itemToStringLabel={toLabel}>` |
| `<Combobox.Collection empty={<Combobox.Empty>No results</Combobox.Empty>}>`  | `<Combobox.Empty>No results</Combobox.Empty>` beside it     |
| `{item => …}`                                                                | `{(item: Item) => …}`                                       |

Without `items` on the root, `Combobox.Empty` always shows its children. The `ComboboxEmpty` ref is now an `HTMLDivElement`.

Find usages with `git grep -nE "Combobox\.(Collection|Empty)|ComboboxEmpty"`.
