# Popover

A floating panel anchored to a trigger element. Supports focus management, ARIA labeling, and enter/exit animations.

## When to Use

- Rich content panels, filter dropdowns, or any non-modal floating content anchored to a trigger.
- When content includes interactive elements (inputs, buttons) — unlike Tooltip which is display-only.
- Prefer Popover over Dialog when the content should be anchored to a specific element and the page should remain interactive by default.

## Usage

```tsx
import { Popover } from '@/primitives/popover';

<Popover>
  <Popover.Trigger>Settings</Popover.Trigger>
  <Popover.Positioner>
    <Popover.Popup>
      <Popover.Title>Preferences</Popover.Title>
      <Popover.Description>Adjust your settings below.</Popover.Description>
      {/* Interactive content here */}
      <Popover.Close>Done</Popover.Close>
    </Popover.Popup>
  </Popover.Positioner>
</Popover>;
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Popover>;
```

### Modal Mode

```tsx
<Popover modal>{/* Focus is trapped within the popover */}</Popover>
```

## Parts

| Part                  | Default Element | Description                              |
| --------------------- | --------------- | ---------------------------------------- |
| `Popover`             | —               | Root context provider                    |
| `Popover.Trigger`     | `<button>`      | Toggles the popover on click             |
| `Popover.Portal`      | —               | Portals children (accepts `root` prop)   |
| `Popover.Positioner`  | `<div>`         | Floating positioned container            |
| `Popover.Popup`       | `<div>`         | Visual content wrapper                   |
| `Popover.Arrow`       | `<svg>`         | Optional floating arrow                  |
| `Popover.Title`       | `<h2>`          | Heading, wired to `aria-labelledby`      |
| `Popover.Description` | `<p>`           | Description, wired to `aria-describedby` |
| `Popover.Close`       | `<button>`      | Closes the popover on click              |

## Props

### `Popover` (root)

| Prop           | Type                      | Default    | Description                        |
| -------------- | ------------------------- | ---------- | ---------------------------------- |
| `open`         | `boolean`                 | —          | Controlled open state              |
| `defaultOpen`  | `boolean`                 | `false`    | Initial open state (uncontrolled)  |
| `onOpenChange` | `(open: boolean) => void` | —          | Called when open state changes     |
| `placement`    | `Placement`               | `"bottom"` | Floating UI placement              |
| `sideOffset`   | `number`                  | `4`        | Gap between trigger and popup (px) |
| `modal`        | `boolean`                 | `false`    | Traps focus within the popover     |

### `Popover.Trigger`, `Popover.Positioner`, `Popover.Popup`, `Popover.Title`, `Popover.Description`, `Popover.Close`

No additional props beyond standard HTML attributes and the `render` prop.

### `Popover.Arrow`

Accepts all `FloatingArrow` props. `ref` and `context` are injected automatically.

## Keyboard

| Key      | Action                                                               |
| -------- | -------------------------------------------------------------------- |
| `Escape` | Closes the popover                                                   |
| `Tab`    | Cycles focus within popover (modal mode) or moves freely (non-modal) |

## Data Attributes

| Attribute                         | Applies To        | Description                              |
| --------------------------------- | ----------------- | ---------------------------------------- |
| `data-cl-slot`                    | All parts         | Part identifier (e.g. `"popover-popup"`) |
| `data-cl-open` / `data-cl-closed` | Trigger           | Open state                               |
| `data-cl-side`                    | Positioner, Arrow | Resolved placement side                  |

## Positioning

Middleware stack: `offset` -> `flip` -> `shift` -> `arrow` -> CSS vars. The popup auto-repositions on scroll and resize via `autoUpdate`. Cross-axis flipping is enabled only when using an aligned placement (e.g. `"bottom-start"`).

## Important Notes

- **Title and Description are optional but recommended.** They wire `aria-labelledby` and `aria-describedby` to the positioner. If omitted, those attributes are simply absent.
- **Non-modal by default.** Unlike Dialog, the page remains interactive behind the popover. Set `modal={true}` for a stricter focus trap.
- **Nested popovers are supported.** The `FloatingTree` pattern handles nesting automatically.

## ARIA

- Positioner: `role="dialog"`, `aria-labelledby` (from Title), `aria-describedby` (from Description)
- Trigger: `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`
