# Dialog

A modal or non-modal dialog overlay. Handles focus trapping, scroll locking, ARIA labeling, and enter/exit animations.

## When to Use

- Confirmations, alerts, forms, or any content that requires user attention before continuing.
- When you need focus trapping and scroll lock (modal behavior).
- Prefer Dialog over Popover when the content is not anchored to a trigger element and should appear centered/overlaid.

## Usage

```tsx
import { Dialog } from '@/primitives/dialog';

<Dialog.Root>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Backdrop />
  <Dialog.Viewport>
    <Dialog.Popup>
      <Dialog.Title>Confirm Action</Dialog.Title>
      <Dialog.Description>Are you sure you want to proceed?</Dialog.Description>
      <Dialog.Close>Cancel</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Viewport>
</Dialog.Root>;
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Dialog.Root
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Dialog.Root>;
```

### Non-modal

```tsx
<Dialog.Root modal={false}>{/* Focus is not trapped, page remains interactive */}</Dialog.Root>
```

## Parts

| Part                 | Default Element | Description                                     |
| -------------------- | --------------- | ----------------------------------------------- |
| `Dialog.Root`        | —               | Root context provider                           |
| `Dialog.Trigger`     | `<button>`      | Opens/closes the dialog on click                |
| `Dialog.Portal`      | —               | Portals children (defaults to `document.body`)  |
| `Dialog.Backdrop`    | `<div>`         | Semi-transparent overlay surface                |
| `Dialog.Viewport`    | `<div>`         | Fixed centering container; owns scroll lock     |
| `Dialog.Popup`       | `<div>`         | The dialog content container                    |
| `Dialog.Title`       | `<h2>`          | Dialog heading, wired to `aria-labelledby`      |
| `Dialog.Description` | `<p>`           | Dialog description, wired to `aria-describedby` |
| `Dialog.Close`       | `<button>`      | Closes the dialog on click                      |

## Props

### `Dialog.Root`

| Prop           | Type                      | Default | Description                             |
| -------------- | ------------------------- | ------- | --------------------------------------- |
| `open`         | `boolean`                 | —       | Controlled open state                   |
| `defaultOpen`  | `boolean`                 | `false` | Initial open state (uncontrolled)       |
| `onOpenChange` | `(open: boolean) => void` | —       | Called when open state changes          |
| `modal`        | `boolean`                 | `true`  | Traps focus and blocks page interaction |

### `Dialog.Portal`

| Prop   | Type                                                          | Default         | Description                      |
| ------ | ------------------------------------------------------------- | --------------- | -------------------------------- |
| `root` | `HTMLElement \| null \| React.RefObject<HTMLElement \| null>` | `document.body` | Container element to portal into |

When `root` is provided, the dialog is portaled into that container instead of `document.body`. Consumers handle layout via CSS on the container (or by omitting `Dialog.Viewport` and styling their own).

### `Dialog.Viewport`

| Prop         | Type      | Default | Description                     |
| ------------ | --------- | ------- | ------------------------------- |
| `lockScroll` | `boolean` | `true`  | Prevents body scroll while open |

### `Dialog.Backdrop`, `Dialog.Trigger`, `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`

No additional props beyond standard HTML attributes and the `render` prop.

## Keyboard

| Key      | Action                                      |
| -------- | ------------------------------------------- |
| `Escape` | Closes the dialog                           |
| `Tab`    | Cycles focus within the dialog (modal mode) |

## Data Attributes

| Attribute                         | Applies To                         | Description |
| --------------------------------- | ---------------------------------- | ----------- |
| `data-cl-open` / `data-cl-closed` | Trigger, Backdrop, Viewport, Popup | Open state  |

Slot identity (`data-cl-slot`) is applied by the styled (mosaic) layer, not by the headless parts.

## Important Notes

- **`Dialog.Popup` should be a child of `Dialog.Viewport`** for centered, scroll-locked modal behavior. The viewport hosts the fixed overlay container; the popup alone does not handle positioning or scroll lock.
- **Title and Description are optional but recommended.** If omitted, `aria-labelledby` / `aria-describedby` are simply absent from the popup.
- **Nested dialogs are supported.** The `FloatingTree` pattern handles nesting automatically.
- **No positioning middleware.** Dialogs are centered via CSS, not Floating UI positioning.

## Authoring rule for new primitives

Each styleable surface = one part. Layout infrastructure (overlay, scroll lock, focus manager, portal) wraps a `renderElement` call rather than fusing with it. The dialog split — `Backdrop` (semi-transparent surface) vs. `Viewport` (fixed centering + scroll lock) — exists because mosaic needs to style each layer independently. Apply the same decomposition to future primitives that combine positioning with a styled surface.

## ARIA

- Popup: `role="dialog"`, `aria-labelledby` (from Title), `aria-describedby` (from Description)
- Trigger: `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`
