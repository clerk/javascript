---
'@clerk/mosaic': minor
---

**Breaking:** Rename the `Option` parts of `Select` and `Combobox` to `Item`. This applies to both the styled components and the headless primitives. Behavior is unchanged, and TypeScript flags the old names.

| Before                                 | After                                |
| -------------------------------------- | ------------------------------------ |
| `Select.Option`                        | `Select.Item`                        |
| `Combobox.Option`                      | `Combobox.Item`                      |
| `Combobox.OptionIndicator`             | `Combobox.ItemIndicator`             |
| `SelectOptionProps`                    | `SelectItemProps`                    |
| `ComboboxOptionProps`                  | `ComboboxItemProps`                  |
| `ComboboxOptionIndicatorProps`         | `ComboboxItemIndicatorProps`         |
| `.cl-select-option`                    | `.cl-select-item`                    |
| `.cl-select-option-media`              | `.cl-select-item-media`              |
| `.cl-select-option-content`            | `.cl-select-item-content`            |
| `.cl-select-option-label`              | `.cl-select-item-label`              |
| `.cl-select-option-description`        | `.cl-select-item-description`        |
| `.cl-select-option-indicator`          | `.cl-select-item-indicator`          |
| `.cl-combobox-option`                  | `.cl-combobox-item`                  |
| `.cl-combobox-option-media`            | `.cl-combobox-item-media`            |
| `.cl-combobox-option-label`            | `.cl-combobox-item-label`            |
| `.cl-combobox-option-detail`           | `.cl-combobox-item-detail`           |
| `.cl-combobox-option-indicator`        | `.cl-combobox-item-indicator`        |
| `.cl-phone-input-country-option` | `.cl-phone-input-country-item` |

Add `Select.ItemIndicator`, which renders only inside the selected item. It is `aria-hidden` and works like `Combobox.ItemIndicator`. Both indicators now take `keepMounted`, which renders them in every item and puts `data-selected` only on the selected one. The styled `Select.Item` renders a `Select.ItemIndicator` with `keepMounted`, so the check's `.cl-select-item-indicator` element is now a `span` wrapping the icon.

A styled `Select.Item` with children no longer adds a check, matching `Combobox.Item`. Add `<Select.ItemIndicator keepMounted />` to composed rows that should show one.

Find usages with `git grep -nE "(Select|Combobox)\.Option|OptionIndicator|(Select|Combobox)Option(Indicator)?Props|cl-(select|combobox|phone-input-country)-option"`.
