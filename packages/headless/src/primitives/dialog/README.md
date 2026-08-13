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

### Detached triggers

A trigger does not have to be nested inside its root. `Dialog.createHandle()` returns a handle;
pass the same handle to both, and the trigger drives the root from anywhere in the tree. The
handle also has imperative `open()` / `close()` / `isOpen` members; calls made while no root is
mounted are ignored.

```tsx
const feedbackDialog = Dialog.createHandle();

<Dialog.Trigger handle={feedbackDialog}>Give feedback</Dialog.Trigger>;

<Dialog.Root handle={feedbackDialog}>{/* ... */}</Dialog.Root>;
```

### Multiple triggers and payloads

Each trigger can carry an `id` and a `payload`. The root's children can be a function receiving
the active trigger's payload, so one dialog renders per-trigger content. Type the payload through
the handle: `Dialog.createHandle<Payload>()`. The payload is captured when the trigger opens the
dialog; for data that can change while it is open, carry an id and read live state inside.

```tsx
const detail = Dialog.createHandle<{ name: string }>();

<Dialog.Trigger handle={detail} id='a' payload={{ name: 'Alice' }}>Alice</Dialog.Trigger>
<Dialog.Trigger handle={detail} id='b' payload={{ name: 'Bob' }}>Bob</Dialog.Trigger>

<Dialog.Root handle={detail}>
  {({ payload }) => <Dialog.Popup>{payload?.name}</Dialog.Popup>}
</Dialog.Root>
```

In controlled mode, track which trigger is active with `triggerId` — `onOpenChange`'s second
argument reports the trigger behind each change:

```tsx
const [open, setOpen] = useState(false);
const [triggerId, setTriggerId] = useState<string | null>(null);

<Dialog.Root
  open={open}
  triggerId={triggerId}
  onOpenChange={(next, details) => {
    setOpen(next);
    setTriggerId(details.triggerId);
  }}
>
  {/* ... */}
</Dialog.Root>;
```

Setting `triggerId` alongside a programmatic `open` also attributes the open to that trigger —
the dialog returns focus to it on close, exactly as if it had been clicked.

### Custom focus management

`initialFocus` and `finalFocus` on `Dialog.Popup` control where focus moves on open and close.
Each accepts `true` (the default behaviour), `false` (do not move focus), a ref, or a function of
the interaction type behind the open/close (`'mouse' | 'touch' | 'pen' | 'keyboard' | ''`, empty
for programmatic) returning any of those:

```tsx
<Dialog.Popup
  initialFocus={interactionType => (interactionType === 'keyboard' ? firstFieldRef.current : false)}
  finalFocus={finalFocusRef}
>
  {/* ... */}
</Dialog.Popup>
```

The defaults stay what they were: first tabbable element on open; on close, the trigger — unless
the close was pointer-driven, where focus is left where the pointer put it (see `useReturnFocus`).

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

| Prop           | Type                                                        | Default    | Description                                                           |
| -------------- | ----------------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `open`         | `boolean`                                                   | —          | Controlled open state                                                 |
| `defaultOpen`  | `boolean`                                                   | `false`    | Initial open state (uncontrolled)                                     |
| `onOpenChange` | `(open: boolean, details: DialogOpenChangeDetails) => void` | —          | Called when open state changes; `details` names the trigger behind it |
| `modal`        | `boolean`                                                   | `true`     | Traps focus and blocks page interaction                               |
| `role`         | `'dialog' \| 'alertdialog'`                                 | `'dialog'` | The popup's ARIA role                                                 |
| `closedBy`     | `'any' \| 'closerequest' \| 'none'`                         | `'any'`    | Which gestures dismiss the dialog                                     |
| `handle`       | `DialogHandle`                                              | —          | Connects detached triggers (see `Dialog.createHandle()`)              |
| `triggerId`    | `string \| null`                                            | —          | Controls which trigger the open is attributed to                      |
| `children`     | `ReactNode \| ({ payload }) => ReactNode`                   | —          | Content, or a render function of the active trigger's `payload`       |

#### `closedBy`

Mirrors the native `<dialog closedby>` attribute.

| Value          | Escape | Outside press | Programmatic |
| -------------- | ------ | ------------- | ------------ |
| `any`          | ✅     | ✅            | ✅           |
| `closerequest` | ✅     | ❌            | ✅           |
| `none`         | ❌     | ❌            | ✅           |

```tsx
// A form dialog: Escape backs out, a stray backdrop click doesn't discard input.
<Dialog.Root closedBy='closerequest'>{/* ... */}</Dialog.Root>
```

Reach for `closerequest` on anything holding user input or confirming a destructive action.
Reserve `none` for flows the user genuinely must complete or explicitly acknowledge — it removes
the keyboard exit, so it fails the usual expectation that Escape dismisses a modal.

A single ordered enum rather than two booleans: it keeps the fourth combination — outside press
dismisses but Escape does not — unrepresentable.

### `Dialog.Portal`

| Prop   | Type                                                          | Default         | Description                      |
| ------ | ------------------------------------------------------------- | --------------- | -------------------------------- |
| `root` | `HTMLElement \| null \| React.RefObject<HTMLElement \| null>` | `document.body` | Container element to portal into |

When `root` is provided, the dialog is portaled into that container instead of `document.body`. Consumers handle layout via CSS on the container (or by omitting `Dialog.Viewport` and styling their own).

### `Dialog.Viewport`

| Prop         | Type      | Default | Description                     |
| ------------ | --------- | ------- | ------------------------------- |
| `lockScroll` | `boolean` | `true`  | Prevents body scroll while open |

### `Dialog.Trigger`

| Prop      | Type           | Default | Description                                              |
| --------- | -------------- | ------- | -------------------------------------------------------- |
| `handle`  | `DialogHandle` | —       | Drives a root elsewhere in the tree (detached trigger)   |
| `id`      | `string`       | auto    | Names this trigger for the root's `triggerId`            |
| `payload` | `Payload`      | —       | Delivered to the root's children render function on open |

### `Dialog.Popup`

| Prop           | Type                | Default | Description                             |
| -------------- | ------------------- | ------- | --------------------------------------- |
| `initialFocus` | `DialogFocusTarget` | `true`  | Where focus moves when the dialog opens |
| `finalFocus`   | `DialogFocusTarget` | `true`  | Where focus returns when it closes      |

`DialogFocusTarget` is `boolean | RefObject | (interactionType) => boolean | void | HTMLElement | null`.

### `Dialog.Backdrop`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`

No additional props beyond standard HTML attributes and the `render` prop.

## Keyboard

| Key      | Action                                      |
| -------- | ------------------------------------------- |
| `Escape` | Closes the dialog                           |
| `Tab`    | Cycles focus within the dialog (modal mode) |

## Data Attributes

| Attribute                   | Applies To                         | Description                                 |
| --------------------------- | ---------------------------------- | ------------------------------------------- |
| `data-open` / `data-closed` | Trigger, Backdrop, Viewport, Popup | Open state                                  |
| `data-nested`               | Backdrop, Viewport, Popup          | Opened from inside another floating element |
| `data-stacked`              | Backdrop, Popup                    | Layered over an open dialog                 |
| `data-stack-base`           | Popup                              | Has an open dialog layered over it          |

`data-nested` reflects any floating ancestor: the `FloatingTree` a Menu or Popover establishes
counts too.

`data-stacked` and `data-stack-base` are narrower, and are what stacking styles should use. They
describe dialog-on-dialog specifically, in the two directions of the same relationship — the one
on top, and the one it covers. A dialog opened from a menu item is `data-nested` but not
`data-stacked`: it has a floating ancestor, yet it sits on the bare page and still owns its scrim.

Both can be set at once, and that is the ordinary case rather than an edge — in a panel → prompt →
alert stack, the middle dialog is stacked on one surface while another is stacked on it.

`data-stacked` exists chiefly so the stack shows one scrim: the dialog on top drops its own
backdrop instead of compositing a darker one per level. `data-stack-base` is for whatever the
surface underneath does to signal depth.

The headless parts are unstyled. Target a part with your own className (or `render` prop) and combine it with the `data-*` state attributes above.

## Important Notes

- **`Dialog.Popup` should be a child of `Dialog.Viewport`** for centered, scroll-locked modal behavior. The viewport hosts the fixed overlay container; the popup alone does not handle positioning or scroll lock.
- **Title and Description are optional but recommended.** If omitted, `aria-labelledby` / `aria-describedby` are simply absent from the popup.
- **Nested dialogs are supported**, and covered by tests. The `FloatingTree` pattern handles it: `useDismiss` blocks both Escape and outside-press on a parent while any child is open, and `FloatingOverlay`'s scroll lock is refcounted, so the body stays locked until the last dialog closes. Style the stack with `data-stacked` / `data-stack-base`, not `data-nested`.
- **No positioning middleware.** Dialogs are centered via CSS, not Floating UI positioning.

## Authoring rule for new primitives

Each styleable surface = one part. Layout infrastructure (overlay, scroll lock, focus manager, portal) wraps a `useRender` call rather than fusing with it. The dialog split — `Backdrop` (semi-transparent surface) vs. `Viewport` (fixed centering + scroll lock) — exists because mosaic needs to style each layer independently. Apply the same decomposition to future primitives that combine positioning with a styled surface.

## ARIA

- Popup: `role="dialog"` (or `"alertdialog"`, via the root's `role`), `aria-labelledby` (from Title), `aria-describedby` (from Description)
- Trigger: `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`
