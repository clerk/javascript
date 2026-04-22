# Dialog

A modal or non-modal dialog overlay. Handles focus trapping, scroll locking, ARIA labeling, and enter/exit animations.

## When to Use

- Confirmations, alerts, forms, or any content that requires user attention before continuing.
- When you need focus trapping and scroll lock (modal behavior).
- Prefer Dialog over Popover when the content is not anchored to a trigger element and should appear centered/overlaid.

## Usage

```tsx
import { Dialog } from '@/primitives/dialog';

<Dialog>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Backdrop>
    <Dialog.Popup>
      <Dialog.Title>Confirm Action</Dialog.Title>
      <Dialog.Description>Are you sure you want to proceed?</Dialog.Description>
      <Dialog.Close>Cancel</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Backdrop>
</Dialog>;
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Dialog>;
```

### Non-modal

```tsx
<Dialog modal={false}>{/* Focus is not trapped, page remains interactive */}</Dialog>
```

## Parts

| Part                 | Default Element | Description                                     |
| -------------------- | --------------- | ----------------------------------------------- |
| `Dialog`             | —               | Root context provider                           |
| `Dialog.Trigger`     | `<button>`      | Opens/closes the dialog on click                |
| `Dialog.Backdrop`    | `<div>`         | Overlay + portal + focus manager host           |
| `Dialog.Popup`       | `<div>`         | The dialog content container                    |
| `Dialog.Title`       | `<h2>`          | Dialog heading, wired to `aria-labelledby`      |
| `Dialog.Description` | `<p>`           | Dialog description, wired to `aria-describedby` |
| `Dialog.Close`       | `<button>`      | Closes the dialog on click                      |

## Props

### `Dialog` (root)

| Prop           | Type                      | Default | Description                             |
| -------------- | ------------------------- | ------- | --------------------------------------- |
| `open`         | `boolean`                 | —       | Controlled open state                   |
| `defaultOpen`  | `boolean`                 | `false` | Initial open state (uncontrolled)       |
| `onOpenChange` | `(open: boolean) => void` | —       | Called when open state changes          |
| `modal`        | `boolean`                 | `true`  | Traps focus and blocks page interaction |

### `Dialog.Backdrop`

| Prop         | Type      | Default | Description                     |
| ------------ | --------- | ------- | ------------------------------- |
| `lockScroll` | `boolean` | `true`  | Prevents body scroll while open |

### `Dialog.Trigger`, `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`

No additional props beyond standard HTML attributes and the `render` prop.

## Keyboard

| Key      | Action                                      |
| -------- | ------------------------------------------- |
| `Escape` | Closes the dialog                           |
| `Tab`    | Cycles focus within the dialog (modal mode) |

## Data Attributes

| Attribute                         | Applies To        | Description                             |
| --------------------------------- | ----------------- | --------------------------------------- |
| `data-cl-slot`                    | All parts         | Part identifier (e.g. `"dialog-popup"`) |
| `data-cl-open` / `data-cl-closed` | Trigger, Backdrop | Open state                              |

## Important Notes

- **`Dialog.Popup` must be a child of `Dialog.Backdrop`.** The backdrop hosts the portal, overlay, and focus manager — the popup alone does not handle these.
- **Title and Description are optional but recommended.** If omitted, `aria-labelledby` / `aria-describedby` are simply absent from the popup.
- **Nested dialogs are supported.** The `FloatingTree` pattern handles nesting automatically.
- **No positioning middleware.** Dialogs are centered via CSS, not Floating UI positioning.

## ARIA

- Popup: `role="dialog"`, `aria-labelledby` (from Title), `aria-describedby` (from Description)
- Trigger: `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`
