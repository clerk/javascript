---
'@clerk/mosaic': minor
---

**Breaking:** Remove the `placement` prop from `Icon`, along with the `data-icon` attribute it rendered. `Button` now tightens its padding on the side of an `Icon` placed directly before or after the label, read from its position. An icon inside a wrapper element no longer counts as leading or trailing, so the button keeps its text padding. Delete `placement` from your `Icon`s; TypeScript flags the ones left.

| Before                                      | After                                       |
| ------------------------------------------- | ------------------------------------------- |
| `<Icon glyph={Plus} placement='inline-start' />` | `<Icon glyph={Plus} />`                     |

Find usages with `git grep -nE "placement=\{?['\"]inline-|data-icon"`.

The text label inside `Button` and `SubmitButton` now carries a `cl-button-label` class you can target in your styles.
