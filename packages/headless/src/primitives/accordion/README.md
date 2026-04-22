# Accordion

A vertically stacked set of collapsible sections. Supports single or multiple open panels, keyboard navigation, and CSS-driven expand/collapse animations.

## When to Use

- FAQ sections, settings panels, or any UI where content should be shown/hidden in discrete sections.
- When you need accessible expand/collapse with proper ARIA attributes and keyboard support.
- Prefer Accordion over manual show/hide toggles — it handles focus management, ARIA, and animation lifecycle automatically.

## Usage

```tsx
import { Accordion } from '@/primitives/accordion';

<Accordion
  type='single'
  defaultValue={['item-1']}
>
  <Accordion.Item value='item-1'>
    <Accordion.Header>
      <Accordion.Trigger>Section 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Content for section 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value='item-2'>
    <Accordion.Header>
      <Accordion.Trigger>Section 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Content for section 2</Accordion.Panel>
  </Accordion.Item>
</Accordion>;
```

### Controlled

```tsx
const [value, setValue] = useState<string[]>(['item-1']);

<Accordion
  value={value}
  onValueChange={setValue}
>
  {/* ... */}
</Accordion>;
```

## Parts

| Part                | Default Element | Description                        |
| ------------------- | --------------- | ---------------------------------- |
| `Accordion`         | `<div>`         | Root wrapper, provides context     |
| `Accordion.Item`    | `<div>`         | Wraps a single collapsible section |
| `Accordion.Header`  | `<h3>`          | Heading wrapper for the trigger    |
| `Accordion.Trigger` | `<button>`      | Clickable toggle for its panel     |
| `Accordion.Panel`   | `<div>`         | Collapsible content area           |

## Props

### `Accordion` (root)

| Prop            | Type                        | Default      | Description                               |
| --------------- | --------------------------- | ------------ | ----------------------------------------- |
| `value`         | `string[]`                  | —            | Controlled open items                     |
| `defaultValue`  | `string[]`                  | `[]`         | Initial open items (uncontrolled)         |
| `onValueChange` | `(value: string[]) => void` | —            | Called when open items change             |
| `type`          | `"single" \| "multiple"`    | `"multiple"` | `"single"` enforces at most one open item |
| `disabled`      | `boolean`                   | `false`      | Disables all items                        |

### `Accordion.Item`

| Prop       | Type      | Default       | Description                     |
| ---------- | --------- | ------------- | ------------------------------- |
| `value`    | `string`  | **required**  | Unique identifier for this item |
| `disabled` | `boolean` | inherits root | Disables this specific item     |

### `Accordion.Header`

No additional props. Renders as `<h3>` by default.

### `Accordion.Trigger`

No additional props. Renders as `<button>` by default.

### `Accordion.Panel`

No additional props. Renders as `<div>` by default.

All parts accept a `render` prop for polymorphic rendering and standard HTML attributes for their default element.

## Keyboard Navigation

| Key               | Action                         |
| ----------------- | ------------------------------ |
| `ArrowDown`       | Move focus to next trigger     |
| `ArrowUp`         | Move focus to previous trigger |
| `Enter` / `Space` | Toggle the focused item        |

## Data Attributes

| Attribute          | Applies To           | Description                                       |
| ------------------ | -------------------- | ------------------------------------------------- |
| `data-cl-slot`     | All parts            | Identifies each part (e.g. `"accordion-trigger"`) |
| `data-cl-open`     | Item, Trigger, Panel | Present when the item is expanded                 |
| `data-cl-closed`   | Item, Trigger, Panel | Present when the item is collapsed                |
| `data-cl-disabled` | Item, Trigger        | Present when the item is disabled                 |

## CSS Animation

`Accordion.Panel` exposes a `--accordion-panel-height` CSS custom property set to the panel's `scrollHeight` in pixels. Use this for height-based expand/collapse animations:

```css
[data-cl-slot='accordion-panel'] {
  overflow: hidden;
  height: var(--accordion-panel-height);
  transition: height 200ms ease;
}
[data-cl-slot='accordion-panel'][data-cl-closed] {
  height: 0;
}
```

The panel suppresses the enter animation on initial mount — only subsequent opens animate.

## ARIA

- Trigger: `aria-expanded`, `aria-controls` (pointing to its panel), `aria-disabled`
- Panel: `role="region"`, `aria-labelledby` (pointing to its trigger)
