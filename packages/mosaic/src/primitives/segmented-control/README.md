# SegmentedControl

A single-select group of buttons where exactly one option is active. It follows the ARIA radio group pattern: `role="radiogroup"` with `role="radio"` items, a roving tabindex, and arrow keys that move the selection.

## When to Use

- Switching between a small set of mutually exclusive options, such as a billing period.
- Prefer Tabs when each option owns a panel of content.

## Usage

```tsx
import { SegmentedControl } from '@/primitives/segmented-control';

<SegmentedControl.Root
  aria-label='Billing period'
  defaultValue='monthly'
>
  <SegmentedControl.Item value='monthly'>Monthly</SegmentedControl.Item>
  <SegmentedControl.Item value='annual'>Annual</SegmentedControl.Item>
</SegmentedControl.Root>;
```

## Parts

| Part                         | Default Element | Description                                          |
| ---------------------------- | --------------- | ---------------------------------------------------- |
| `SegmentedControl.Root`      | `<div>`         | Group container (`role="radiogroup"`)                |
| `SegmentedControl.Item`      | `<button>`      | One option inside the group (`role="radio"`)         |
| `SegmentedControl.Indicator` | `<span>`        | Decorative element for the selection (`aria-hidden`) |

## Props

### `SegmentedControl.Root`

| Prop            | Type                      | Default | Description                       |
| --------------- | ------------------------- | ------- | --------------------------------- |
| `value`         | `string`                  | —       | Controlled selected value         |
| `defaultValue`  | `string`                  | `""`    | Initial selected value            |
| `onValueChange` | `(value: string) => void` | —       | Called when the selection changes |
| `disabled`      | `boolean`                 | `false` | Disables every item               |

### `SegmentedControl.Item`

| Prop       | Type      | Default      | Description                                                 |
| ---------- | --------- | ------------ | ----------------------------------------------------------- |
| `value`    | `string`  | **required** | Unique option identifier                                    |
| `disabled` | `boolean` | —            | Disables the item (uses `aria-disabled`, remains focusable) |

## Keyboard Navigation

| Key               | Action                                         |
| ----------------- | ---------------------------------------------- |
| `Tab`             | Focuses the selected item                      |
| `ArrowRight`      | Moves to and selects the next enabled item     |
| `ArrowLeft`       | Moves to and selects the previous enabled item |
| `Home`            | Moves to and selects the first enabled item    |
| `End`             | Moves to and selects the last enabled item     |
| `Space` / `Enter` | Selects the focused item                       |

When nothing is selected yet, focus lands on the first item without selecting it.

## Data Attributes

| Attribute       | Applies To | Description                     |
| --------------- | ---------- | ------------------------------- |
| `data-selected` | Item       | Selected item                   |
| `data-disabled` | Root, Item | Disabled group or disabled item |
