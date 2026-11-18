---
'@clerk/mosaic': minor
---

**Breaking:** Two helpers move onto their component's namespace. Behavior is unchanged; TypeScript flags the old imports.

| Before                                                           | After                   |
| ---------------------------------------------------------------- | ----------------------- |
| `usePanelTitle` from `@clerk/mosaic/components/panel`            | `Panel.usePanelTitle`   |
| `sectionCompactStyles` from `@clerk/mosaic/components/section`   | `Section.compactStyles` |

Find usages with `git grep -nE "usePanelTitle|sectionCompactStyles"`.

Every component and primitive on the Mosaic docs site now imports from its docs path:

- Components from `@clerk/mosaic/components/<name>`: `ActionBar`, `Checkbox`, `Combobox`, `CopyButton`, `Dialog`, `Drawer`, `Flow`, `InputGroup`, `Link`, `Menu`, `Otp`, `Pagination`, `PasswordInput`, `PhoneInput`, `Reveal`, `Select`, `Separator`, `Spinner`, `Stepper`, `Switch`, `Tabs`, `TagInput`, `Tooltip` and `VisuallyHidden`
- Headless primitives from `@clerk/mosaic/primitives/<name>`

Components and compound primitives export one namespace plus their types, and helpers live on the namespace.
