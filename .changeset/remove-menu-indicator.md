---
'@clerk/mosaic': minor
---

**Breaking:** Remove `Menu.Indicator` and the `size` prop on `Menu.Media`. Menu now has checkbox and radio items, so a checkmark that marks the current choice goes in their indicator and is announced with `aria-checked`. Anything else at the end of a row, such as a spinner, goes in a trailing `Menu.Media`, which keeps its width while empty. `Menu.Media` is now always 20px wide; `size='xs'` made it 16px without changing the row height, so the label no longer lined up with the other rows.

| Before                                                  | After                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `<Menu.Item>` with a check in `<Menu.Indicator>`        | `<Menu.RadioItem value>` in a `<Menu.RadioGroup>`, with the check in `<Menu.RadioItemIndicator>`   |
| A toggled `<Menu.Item>` with a check in `<Menu.Indicator>` | `<Menu.CheckboxItem>`, with the check in `<Menu.CheckboxItemIndicator>`                          |
| Any other `<Menu.Indicator>…</Menu.Indicator>`          | `<Menu.Media>…</Menu.Media>`                                                                       |
| `MenuIndicatorProps`                                    | `MenuMediaProps`, `MenuRadioItemIndicatorProps` or `MenuCheckboxItemIndicatorProps`                |
| `.cl-menu-item-indicator`                               | `.cl-menu-item-media`, `.cl-menu-radio-item-indicator` or `.cl-menu-checkbox-item-indicator`       |
| `<Menu.Media size='xs'>` or `size='sm'`                 | `<Menu.Media>` |
| `MenuMediaSize`                                         | Remove it |
| `.cl-menu-item-media[data-size]`                        | `.cl-menu-item-media` |

Find usages with `git grep -nE 'Menu\.Indicator|MenuIndicatorProps|cl-menu-item-indicator|MenuMediaSize|Menu\.Media[^>]*size='`.

Checkbox and radio items keep the menu open on click. Pass `closeOnClick` to close it.

In the Switcher's accounts flyout, each account is now a `menuitemradio` inside a group named "Switch account", and the active one has `aria-checked="true"` in place of `aria-current="true"`.
