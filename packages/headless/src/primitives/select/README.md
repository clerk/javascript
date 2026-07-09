# Select

A dropdown select component with keyboard navigation, typeahead, and optional item-to-trigger alignment. Replaces native `<select>` with a fully styled, accessible alternative.

## When to Use

- Picking a single value from a predefined list of options.
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
      <Select.Option
        value='apple'
        label='Apple'
      />
      <Select.Option
        value='banana'
        label='Banana'
      />
      <Select.Option
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
  {/* Select.Value will display "Apple" even before Options mount */}
</Select.Root>;
```

### Disable item-to-trigger alignment

By default, the selected option visually aligns with the trigger. Disable this for standard dropdown positioning:

```tsx
<Select.Root alignItemWithTrigger={false}>{/* Uses standard Floating UI positioning */}</Select.Root>
```

## Parts

| Part                | Default Element | Description                                |
| ------------------- | --------------- | ------------------------------------------ |
| `Select.Root`       | —               | Root context provider                      |
| `Select.Trigger`    | `<button>`      | Toggles the dropdown on click              |
| `Select.Value`      | `<span>`        | Displays the selected label or placeholder |
| `Select.Portal`     | —               | Portals children (accepts `root` prop)     |
| `Select.Positioner` | `<div>`         | Floating positioned container              |
| `Select.Popup`      | `<div>`         | Visual wrapper for the option list         |
| `Select.Option`     | `<button>`      | A selectable option                        |
| `Select.Arrow`      | `<svg>`         | Optional floating arrow                    |

## Props

### `Select.Root`

| Prop                   | Type                      | Default          | Description                                                        |
| ---------------------- | ------------------------- | ---------------- | ------------------------------------------------------------------ |
| `value`                | `string`                  | —                | Controlled selected value                                          |
| `defaultValue`         | `string`                  | —                | Initial selected value (uncontrolled)                              |
| `onValueChange`        | `(value: string) => void` | —                | Called when selection changes                                      |
| `open`                 | `boolean`                 | —                | Controlled open state                                              |
| `defaultOpen`          | `boolean`                 | `false`          | Initial open state (uncontrolled)                                  |
| `onOpenChange`         | `(open: boolean) => void` | —                | Called when open state changes                                     |
| `items`                | `SelectItem[]`            | —                | `{ label, value }` pairs for label resolution before options mount |
| `alignItemWithTrigger` | `boolean`                 | `true`           | Visually align selected option over the trigger                    |
| `placement`            | `Placement`               | `"bottom-start"` | Floating UI placement                                              |
| `sideOffset`           | `number`                  | `4`              | Gap between trigger and popup (px)                                 |

### `Select.Value`

| Prop          | Type        | Default | Description                     |
| ------------- | ----------- | ------- | ------------------------------- |
| `placeholder` | `ReactNode` | —       | Shown when no value is selected |

### `Select.Option`

| Prop       | Type      | Default               | Description                            |
| ---------- | --------- | --------------------- | -------------------------------------- |
| `value`    | `string`  | **required**          | The option's value                     |
| `label`    | `string`  | falls back to `value` | Display label, also used for typeahead |
| `disabled` | `boolean` | —                     | Prevents selection                     |

### `Select.Trigger`, `Select.Positioner`, `Select.Popup`

No additional props beyond standard HTML attributes and the `render` prop.

### `Select.Arrow`

Accepts all `FloatingArrow` props. `ref` and `context` are injected automatically.

## Keyboard Navigation

| Key               | Action                                |
| ----------------- | ------------------------------------- |
| `ArrowDown`       | Move to next option                   |
| `ArrowUp`         | Move to previous option               |
| `Enter` / `Space` | Select the active option, close popup |
| `Escape`          | Close the popup                       |
| Type a character  | Jump to matching option (typeahead)   |

Typeahead is active only while the popup is open. It highlights the matching option; pressing Enter or Space then selects it.

## Data Attributes

| Attribute                         | Applies To | Description                              |
| --------------------------------- | ---------- | ---------------------------------------- |
| `data-cl-slot`                    | All parts  | Part identifier (e.g. `"select-option"`) |
| `data-cl-open` / `data-cl-closed` | Trigger    | Popup open state                         |
| `data-cl-selected`                | Option     | The currently selected option            |
| `data-cl-active`                  | Option     | The keyboard-highlighted option          |
| `data-cl-disabled`                | Option     | Disabled option                          |
| `data-cl-side`                    | Positioner | Resolved placement side                  |

## Important Notes

- **`label` on `Select.Option`** drives both display in `Select.Value` and typeahead matching. If omitted, `value` is used for both.
- **`items` prop** is only for label resolution — it does not control which options render. You still render `Select.Option` children yourself.
- **Disabled options** can still receive keyboard focus but cannot be selected.

## ARIA

- Popup: `role="listbox"`
- Option: `role="option"`, `aria-selected`, `aria-disabled`
- Trigger: `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`
