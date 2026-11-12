---
'@clerk/mosaic': minor
---

**Breaking:** Rename the `.cl-` classes on `Menu` item parts to match the `<row>-<part>` scheme used by `Select` and `Combobox`. Components and props are unchanged; only the classes change.

| Before              | After                    |
| ------------------- | ------------------------ |
| `cl-menu-media`     | `cl-menu-item-media`     |
| `cl-menu-label`     | `cl-menu-item-label`     |
| `cl-menu-indicator` | `cl-menu-item-indicator` |

Find usages with `git grep -n "cl-menu-media\|cl-menu-label\|cl-menu-indicator"`.
