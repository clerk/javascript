# Tooltip

A floating label that appears on hover or focus. Non-interactive, used for supplementary descriptions. No focus trapping — tooltips never receive focus.

## When to Use

- Describing icon buttons, truncated text, or any element that benefits from a short label.
- When the content is display-only (no interactive elements inside).
- Prefer Tooltip over Popover when the content is a simple text label that should appear on hover/focus and disappear immediately.

## Usage

```tsx
import { Tooltip } from '@/primitives/tooltip';

<Tooltip.Root>
  <Tooltip.Trigger>
    <IconButton aria-label='Settings' />
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Popup>
      Settings
      <Tooltip.Arrow />
    </Tooltip.Popup>
  </Tooltip.Positioner>
</Tooltip.Root>;
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Tooltip.Root
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Tooltip.Root>;
```

### Custom Delay

```tsx
<Tooltip.Root
  delay={500}
  closeDelay={100}
>
  {/* Opens after 500ms hover, closes 100ms after leaving */}
</Tooltip.Root>
```

## Parts

| Part                 | Default Element | Description                                                              |
| -------------------- | --------------- | ------------------------------------------------------------------------ |
| `Tooltip.Root`       | —               | Root context provider                                                    |
| `Tooltip.Group`      | —               | Shares an open/close delay across grouped tooltips for instant switching |
| `Tooltip.Trigger`    | `<button>`      | Element that triggers the tooltip on hover/focus                         |
| `Tooltip.Portal`     | —               | Portals children (accepts `root` prop)                                   |
| `Tooltip.Positioner` | `<div>`         | Floating positioned container                                            |
| `Tooltip.Popup`      | `<div>`         | The visible tooltip content                                              |
| `Tooltip.Arrow`      | `<svg>`         | Optional arrow pointing at the trigger                                   |

## Props

### `Tooltip.Root`

| Prop           | Type                      | Default | Description                          |
| -------------- | ------------------------- | ------- | ------------------------------------ |
| `open`         | `boolean`                 | —       | Controlled open state                |
| `defaultOpen`  | `boolean`                 | `false` | Initial open state (uncontrolled)    |
| `onOpenChange` | `(open: boolean) => void` | —       | Called when open state changes       |
| `placement`    | `Placement`               | `"top"` | Floating UI placement                |
| `sideOffset`   | `number`                  | `4`     | Gap between trigger and tooltip (px) |
| `delay`        | `number`                  | `200`   | Hover open delay (ms)                |
| `closeDelay`   | `number`                  | `0`     | Hover close delay (ms)               |

### `Tooltip.Trigger`, `Tooltip.Positioner`, `Tooltip.Popup`

No additional props beyond standard HTML attributes and the `render` prop.

### `Tooltip.Arrow`

Accepts all `FloatingArrow` props. `ref` and `context` are injected automatically.

## Open/Close Behavior

- **Hover**: Opens after `delay` ms, closes after `closeDelay` ms.
- **Focus**: Opens on keyboard focus (`:focus-visible`), closes on blur.
- **Dismiss**: Closes on Escape key.
- **No click handling** — tooltips are triggered by hover and focus only.

## Data Attributes

| Attribute                         | Applies To        | Description                              |
| --------------------------------- | ----------------- | ---------------------------------------- |
| `data-cl-slot`                    | All parts         | Part identifier (e.g. `"tooltip-popup"`) |
| `data-cl-open` / `data-cl-closed` | Trigger           | Open state                               |
| `data-cl-side`                    | Positioner, Arrow | Resolved placement side                  |

## Positioning

Middleware stack: `offset` -> `flip` -> `shift` -> `arrow` -> CSS vars. Repositions automatically on scroll/resize via `autoUpdate`.

## Important Notes

- **No `FloatingFocusManager`** — tooltips do not receive or trap focus. This is correct per ARIA guidelines.
- **Nested tooltips are supported** via `FloatingTree`.
- **`Tooltip.Trigger` wraps its child** — if your trigger is already a button, the `render` prop can forward props to it instead of wrapping.
- **For tooltip clusters** (e.g. toolbar buttons), wrap them in `Tooltip.Group` to share an open/close delay so moving between triggers switches tooltips instantly. Accepts `delay` (`number | { open?, close? }`) and `timeoutMs` props.

## ARIA

- Popup: `role="tooltip"`
- Trigger: `aria-describedby` (pointing to the tooltip)
