# Select

A dropdown select component with keyboard navigation, typeahead, and optional item-to-trigger alignment. Replaces native `<select>` with a fully styled, accessible alternative.

## When to Use

- Picking one or several values from a predefined list of options.
- When you need typeahead, keyboard navigation, and full styling control.
- Prefer Select over Autocomplete when the user should choose from a fixed list without typing to filter.

## Usage

```tsx
import { Select } from '@/primitives/select';

<Select.Root>
  <Select.Trigger>
    <Select.Value placeholder='Choose a fruit...' />
  </Select.Trigger>
  <Select.Positioner>
    <Select.Popup>
      <Select.Item
        value='apple'
        label='Apple'
      />
      <Select.Item
        value='banana'
        label='Banana'
      />
      <Select.Item
        value='cherry'
        label='Cherry'
      />
    </Select.Popup>
  </Select.Positioner>
</Select.Root>;
```

### Controlled

```tsx
const [value, setValue] = useState('apple');

<Select.Root
  value={value}
  onValueChange={setValue}
>
  {/* ... */}
</Select.Root>;
```

### Multiple

`multiple` makes the value an array. Picking an option adds or removes it and keeps the popup open.

```tsx
<Select.Root
  multiple
  defaultValue={['apple', 'cherry']}
>
  <Select.Trigger>
    <Select.Value placeholder='Choose fruits...'>{value => `${value.length} selected`}</Select.Value>
  </Select.Trigger>
  {/* ... */}
</Select.Root>
```

`Select.Value` shows the selected labels joined with commas unless given children.

### Select all

`Select.SelectAll` is an option that selects every enabled item, or clears them once all are selected. Disabled items keep their state. It renders nothing unless the root is `multiple`. Style its check and dash off `data-checked` and `data-indeterminate`.

```tsx
<Select.Root multiple>
  {/* ... */}
  <Select.Popup>
    <Select.SelectAll label='Select all'>Select all</Select.SelectAll>
    <Select.Separator />
    <Select.Item
      value='apple'
      label='Apple'
    />
  </Select.Popup>
</Select.Root>
```

<kbd>Ctrl</kbd>+<kbd>A</kbd> (<kbd>⌘</kbd>+<kbd>A</kbd> on macOS) does the same while the popup is open, with or without a `Select.SelectAll`.

### With `items` for SSR label resolution

The `items` prop allows label resolution before options mount (useful for server rendering or deferred lists):

```tsx
const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

<Select.Root
  items={items}
  defaultValue='apple'
>
  {/* Select.Value will display "Apple" even before Items mount */}
</Select.Root>;
```

### Disable item-to-trigger alignment

By default, the selected option visually aligns with the trigger. Disable this for standard dropdown positioning:

```tsx
<Select.Root alignItemWithTrigger={false}>{/* Uses standard Floating UI positioning */}</Select.Root>
```

## Parts

| Part                   | Default Element | Description                                          |
| ---------------------- | --------------- | ---------------------------------------------------- |
| `Select.Root`          | —               | Root context provider                                |
| `Select.Trigger`       | `<button>`      | Toggles the dropdown on click                        |
| `Select.Value`         | `<span>`        | Displays the selected label or placeholder           |
| `Select.Portal`        | —               | Portals children (accepts `root` prop)               |
| `Select.Positioner`    | `<div>`         | Floating positioned container                        |
| `Select.Popup`         | `<div>`         | Visual wrapper for the option list                   |
| `Select.Item`          | `<button>`      | A selectable option                                  |
| `Select.ItemIndicator` | `<span>`        | Renders inside the selected item only, `aria-hidden` |
| `Select.SelectAll`     | `<button>`      | Selects every enabled item, or clears them           |
| `Select.Separator`     | `<div>`         | Divider between items, `role="presentation"`         |
| `Select.Group`         | `<div>`         | Groups options, named by its label                   |
| `Select.GroupLabel`    | `<div>`         | Names the enclosing `Select.Group`                   |
| `Select.Arrow`         | `<svg>`         | Optional floating arrow                              |

## Props

### `Select.Root`

| Prop                   | Type                       | Default          | Description                                                          |
| ---------------------- | -------------------------- | ---------------- | -------------------------------------------------------------------- |
| `multiple`             | `boolean`                  | `false`          | Allow selecting several options                                      |
| `value`                | `Value \| null \| Value[]` | —                | Controlled selected value; `null` for none, an array when `multiple` |
| `defaultValue`         | `Value \| null \| Value[]` | —                | Initial selected value (uncontrolled); an array when `multiple`      |
| `onValueChange`        | `(value) => void`          | —                | Called with the new value when the selection changes                 |
| `open`                 | `boolean`                  | —                | Controlled open state                                                |
| `defaultOpen`          | `boolean`                  | `false`          | Initial open state (uncontrolled)                                    |
| `onOpenChange`         | `(open: boolean) => void`  | —                | Called when open state changes                                       |
| `items`                | `SelectItem<Value>[]`      | —                | `{ label, value }` pairs for label resolution before options mount   |
| `alignItemWithTrigger` | `boolean`                  | `true`           | Visually align selected option over the trigger                      |
| `placement`            | `Placement`                | `"bottom-start"` | Floating UI placement                                                |
| `sideOffset`           | `number`                   | `4`              | Gap between trigger and popup (px)                                   |

### `Select.Value`

| Prop          | Type                                             | Default | Description                                                                                                                        |
| ------------- | ------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `placeholder` | `ReactNode`                                      | —       | Shown when no value is selected                                                                                                    |
| `children`    | `ReactNode \| ((value: unknown[]) => ReactNode)` | —       | Replaces the selected labels; a function receives the selected values, and the placeholder shows instead while nothing is selected |

### `Select.Item`

| Prop       | Type      | Default         | Description                                 |
| ---------- | --------- | --------------- | ------------------------------------------- |
| `value`    | `unknown` | **required**    | The item's value, compared with `Object.is` |
| `label`    | `string`  | `String(value)` | Display label, also used for typeahead      |
| `disabled` | `boolean` | —               | Prevents selection                          |

### `Select.ItemIndicator`

| Prop          | Type      | Default | Description                                                                   |
| ------------- | --------- | ------- | ----------------------------------------------------------------------------- |
| `keepMounted` | `boolean` | `false` | Render in unselected items too, with `data-selected` only on the selected one |

### `Select.SelectAll`

| Prop    | Type     | Default | Description          |
| ------- | -------- | ------- | -------------------- |
| `label` | `string` | —       | Matched by typeahead |

### `Select.Trigger`, `Select.Positioner`, `Select.Popup`, `Select.Separator`

No additional props beyond standard HTML attributes and the `render` prop.

### `Select.Arrow`

Accepts all `FloatingArrow` props and forwards `ref`. `context` is injected automatically.

## Keyboard Navigation

| Key               | Action                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `ArrowDown`       | Move to next option                                                                              |
| `ArrowUp`         | Move to previous option                                                                          |
| `Enter` / `Space` | Select the active option and close the popup; with `multiple`, toggle it and keep the popup open |
| `Escape`          | Close the popup                                                                                  |
| Type a character  | Jump to matching option (typeahead)                                                              |
| `Ctrl/⌘ + A`      | With `multiple`, select every enabled option, or clear them once all are selected                |

Typeahead is active only while the popup is open. It highlights the matching option; pressing Enter or Space then selects it.

## Data Attributes

| Attribute                   | Applies To | Description                                                                       |
| --------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `data-open` / `data-closed` | Trigger    | Popup open state                                                                  |
| `data-selected`             | Item       | Each selected option                                                              |
| `data-active`               | Item       | The keyboard-highlighted option                                                   |
| `data-disabled`             | Item       | Disabled option                                                                   |
| `data-checked`              | SelectAll  | Every enabled option is selected                                                  |
| `data-indeterminate`        | SelectAll  | Some, but not all, enabled options are selected                                   |
| `data-side`                 | Positioner | Resolved placement side, or `none` while the selected option overlays the trigger |

## Important Notes

- **`label` on `Select.Item`** drives both display in `Select.Value` and typeahead matching. If omitted, `String(value)` is used for both.
- **Values can be any type.** They are compared with `Object.is`, and `Value` is inferred from `items`, `value`, `defaultValue` or `onValueChange`.
- **`items` prop** is only for label resolution — it does not control which options render. You still render `Select.Item` children yourself.
- **Disabled options** can still receive keyboard focus but cannot be selected.
- **Popup contents freeze while closing.** The popup outlives `open` by its exit animation, so its children are wrapped in `Freeze` (`../utils`) and hold their last frame: picking an option does not move `data-selected` to the new row under the animation. The popup element itself keeps updating, so `data-closed` / `data-ending-style` still land.

## ARIA

- Popup: `role="listbox"`, `aria-multiselectable` when `multiple`
- Item: `role="option"`, `aria-selected`, `aria-disabled`
- SelectAll: `role="option"`, `aria-selected`, `aria-checked` (`mixed` while some are selected)
- Separator: `role="presentation"`
- Trigger: `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`
