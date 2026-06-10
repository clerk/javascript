# Collapsible

A single show/hide panel toggled by a button. Supports controlled/uncontrolled state, disabled state, and CSS-driven expand/collapse animations.

## When to Use

- Inline content toggles: show more text, advanced options, filter panels.
- When you need a single toggle rather than a stacked accordion.
- Prefer Collapsible over manual `display: none` — it handles ARIA attributes and animation lifecycle automatically.

## Usage

```tsx
import { Collapsible } from '@/primitives/collapsible';

<Collapsible.Root>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Panel>Hidden content</Collapsible.Panel>
</Collapsible.Root>;
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Collapsible.Root
  open={open}
  onOpenChange={setOpen}
>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Panel>Hidden content</Collapsible.Panel>
</Collapsible.Root>;
```

### Disabled

```tsx
<Collapsible.Root disabled>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Panel>Hidden content</Collapsible.Panel>
</Collapsible.Root>
```

## Parts

| Part                  | Default Element | Description                        |
| --------------------- | --------------- | ---------------------------------- |
| `Collapsible.Root`    | `<div>`         | Root wrapper, provides context     |
| `Collapsible.Trigger` | `<button>`      | Clickable toggle that opens/closes |
| `Collapsible.Panel`   | `<div>`         | Collapsible content area           |

## Props

### `Collapsible.Root`

| Prop           | Type                      | Default | Description                        |
| -------------- | ------------------------- | ------- | ---------------------------------- |
| `open`         | `boolean`                 | —       | Controlled open state              |
| `defaultOpen`  | `boolean`                 | `false` | Initial open state (uncontrolled)  |
| `onOpenChange` | `(open: boolean) => void` | —       | Called when open state changes     |
| `disabled`     | `boolean`                 | `false` | Prevents the trigger from toggling |

### `Collapsible.Trigger`

No additional props. Renders as `<button>` by default.

### `Collapsible.Panel`

No additional props. Renders as `<div>` by default.

All parts accept a `render` prop for polymorphic rendering and standard HTML attributes for their default element.

## Data Attributes

| Attribute          | Applies To           | Description                                  |
| ------------------ | -------------------- | -------------------------------------------- |
| `data-cl-slot`     | All parts            | Part identifier (e.g. `"collapsible-panel"`) |
| `data-cl-open`     | Root, Trigger, Panel | Present when the panel is open               |
| `data-cl-closed`   | Root, Trigger, Panel | Present when the panel is closed             |
| `data-cl-disabled` | Root, Trigger        | Present when disabled                        |

## CSS Animation

`Collapsible.Panel` exposes CSS custom properties set to the panel's measured dimensions:

| Property                     | Value                       |
| ---------------------------- | --------------------------- |
| `--collapsible-panel-height` | `scrollHeight` of the panel |
| `--collapsible-panel-width`  | `scrollWidth` of the panel  |

Use these for height/width-based animations:

```css
[data-cl-slot='collapsible-panel'] {
  overflow: hidden;
  height: var(--collapsible-panel-height);
  transition: height 200ms ease;
}
[data-cl-slot='collapsible-panel'][data-cl-closed] {
  height: 0;
}
```

The panel suppresses the enter animation on initial mount — only subsequent opens animate.

## ARIA

- Trigger: `aria-expanded`, `aria-controls` (pointing to its panel), `aria-disabled`
- Panel: `role="region"`, `aria-labelledby` (pointing to its trigger)
