---
'@clerk/mosaic': minor
---

**Breaking:** Simplify `Item` to one size and one look. Every row is now bordered, sizes to its content with even padding instead of a fixed height, and `Item.Group` always stacks rows 8px apart. TypeScript flags the removed props.

| Before                                       | After                       |
| -------------------------------------------- | --------------------------- |
| `<Item.Root size='xs' \| 'md' \| 'lg'>`      | `<Item.Root>`               |
| `<Item.Root variant='outline' \| 'default'>` | `<Item.Root>` (bordered)    |
| `<Item.Group variant='outline' \| 'default'>`| `<Item.Group>`              |
| `<Item.Separator />`                         | Removed                     |
| `.cl-item[data-size]`, `.cl-item-media[data-size]` | Removed               |
| `.cl-item[data-variant]`, `.cl-item-group[data-variant]` | Removed         |

`Item.Label`'s `variant` is unchanged.

Find usages with `git grep -nE "Item\.(Root|Group)[^>]*(size|variant)=|Item\.Separator|cl-item(-media|-group)?\[data-(size|variant)"`.
