# Autocomplete

A combobox input with a filterable dropdown list. Supports virtual focus (focus stays on the input), keyboard navigation, and controlled/uncontrolled input and selection values.

## When to Use

- Search inputs with suggestions, tag pickers, or any input that filters a list of options.
- When the user needs to type to narrow down choices, unlike `Select` which is for picking from a static list.
- When you need `aria-autocomplete` behavior with `aria-activedescendant` virtual focus.

## Usage

```tsx
import { Autocomplete } from '@/primitives/autocomplete';

const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];

function MyAutocomplete() {
  const [inputValue, setInputValue] = useState('');
  const filtered = fruits.filter(f => f.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <Autocomplete
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <Autocomplete.Input placeholder='Search fruits...' />
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          {filtered.map(fruit => (
            <Autocomplete.Option
              key={fruit}
              value={fruit}
              label={fruit}
            />
          ))}
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete>
  );
}
```

### Inline List (inside another floating element)

Use `Autocomplete.List` instead of `Positioner + Popup` when nesting inside a Popover or Dialog. This skips the portal and floating positioning.

```tsx
<Autocomplete>
  <Autocomplete.Input />
  <Autocomplete.List>
    <Autocomplete.Option value='one' />
  </Autocomplete.List>
</Autocomplete>
```

## Parts

| Part                      | Default Element | Description                              |
| ------------------------- | --------------- | ---------------------------------------- |
| `Autocomplete`            | —               | Root context provider                    |
| `Autocomplete.Input`      | `<input>`       | Text input that drives filtering         |
| `Autocomplete.Positioner` | `<div>`         | Floating positioned container (portal)   |
| `Autocomplete.Popup`      | `<div>`         | Visual wrapper for the option list       |
| `Autocomplete.List`       | `<div>`         | Inline alternative to Positioner + Popup |
| `Autocomplete.Option`     | `<div>`         | A selectable option                      |
| `Autocomplete.Arrow`      | `<svg>`         | Optional floating arrow                  |

## Props

### `Autocomplete` (root)

| Prop                 | Type                      | Default          | Description                           |
| -------------------- | ------------------------- | ---------------- | ------------------------------------- |
| `inputValue`         | `string`                  | —                | Controlled input text                 |
| `defaultInputValue`  | `string`                  | `""`             | Initial input text (uncontrolled)     |
| `onInputValueChange` | `(value: string) => void` | —                | Called when input text changes        |
| `value`              | `string`                  | —                | Controlled selected value             |
| `defaultValue`       | `string`                  | —                | Initial selected value (uncontrolled) |
| `onValueChange`      | `(value: string) => void` | —                | Called when an option is selected     |
| `open`               | `boolean`                 | —                | Controlled open state                 |
| `defaultOpen`        | `boolean`                 | `false`          | Initial open state (uncontrolled)     |
| `onOpenChange`       | `(open: boolean) => void` | —                | Called when open state changes        |
| `placement`          | `Placement`               | `"bottom-start"` | Floating UI placement                 |
| `sideOffset`         | `number`                  | `4`              | Gap between input and popup (px)      |

### `Autocomplete.Option`

| Prop       | Type      | Default               | Description                                          |
| ---------- | --------- | --------------------- | ---------------------------------------------------- |
| `value`    | `string`  | **required**          | The option's value                                   |
| `label`    | `string`  | falls back to `value` | Display label, also used for input text on selection |
| `disabled` | `boolean` | —                     | Prevents selection                                   |

### `Autocomplete.Input`, `Autocomplete.Positioner`, `Autocomplete.Popup`, `Autocomplete.List`

No additional props beyond standard HTML attributes and the `render` prop.

### `Autocomplete.Arrow`

Accepts all `FloatingArrow` props. `ref` and `context` are injected automatically.

## Keyboard Navigation

| Key         | Action                                |
| ----------- | ------------------------------------- |
| `ArrowDown` | Move to next option                   |
| `ArrowUp`   | Move to previous option               |
| `Enter`     | Select the active option, close popup |
| `Escape`    | Close the popup                       |

Navigation loops and auto-scrolls the active option into view.

## Data Attributes

| Attribute                         | Applies To        | Description                                   |
| --------------------------------- | ----------------- | --------------------------------------------- |
| `data-cl-slot`                    | All parts         | Part identifier (e.g. `"autocomplete-input"`) |
| `data-cl-open` / `data-cl-closed` | Input             | Popup open state                              |
| `data-cl-selected`                | Option            | The currently selected option                 |
| `data-cl-active`                  | Option            | The keyboard-highlighted option               |
| `data-cl-disabled`                | Option            | Disabled option                               |
| `data-cl-side`                    | Positioner, Arrow | Resolved placement side                       |

## Open/Close Behavior

- Typing a non-empty string opens the popup automatically.
- Clearing the input closes the popup.
- Clicking an option closes the popup and returns focus to the input.
- Outside click and Escape close the popup.

## ARIA

- Input: `aria-autocomplete="list"`, `aria-activedescendant` (virtual focus)
- Options: `role="option"`, `aria-selected`, `aria-disabled`
- Focus manager: non-modal, `initialFocus={-1}` (focus stays on input)
