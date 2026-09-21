# Toast

Transient notifications stacked in a viewport. Toasts are added imperatively through `useToastManager()` (or a `createToastManager()` instance outside React), auto-dismiss on a timer that pauses while the viewport is hovered or focused, the window is blurred, or the tab is hidden, queue beyond a limit, and announce themselves to screen readers.

## When to Use

- Feedback for an action that has no surface of its own: a save that succeeded after the form closed, a background upload that failed.
- Anything the user does not need to acknowledge. For a confirmation the user must answer, use Dialog.

## Usage

```tsx
import { Toast } from '@/primitives/toast';

function App() {
  return (
    <Toast.Provider>
      <SaveButton />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map(toast => (
    <Toast.Root
      key={toast.id}
      toast={toast}
    >
      <Toast.Content>
        <Toast.Title />
        <Toast.Description />
      </Toast.Content>
      <Toast.Action />
      <Toast.Close aria-label='Close' />
    </Toast.Root>
  ));
}

function SaveButton() {
  const manager = Toast.useToastManager();
  return (
    <button
      type='button'
      onClick={() => manager.add({ title: 'Saved', description: 'Your changes were saved.' })}
    >
      Save
    </button>
  );
}
```

### Promise

```tsx
manager.promise(saveProfile(), {
  loading: 'Saving…',
  success: 'Profile saved',
  error: error => (error instanceof Error ? error.message : 'Could not save'),
});
```

The toast starts as `type: 'loading'` with no timeout, then updates to `type: 'success'` or `type: 'error'` with the provider timeout. The promise is re-thrown on rejection.

### Outside React

```tsx
const toastManager = Toast.createToastManager();

<Toast.Provider toastManager={toastManager}>…</Toast.Provider>;

toastManager.add({ title: 'Signed out' });
```

Calls made before the provider mounts are dropped.

## Parts

| Part                | Default Element | Description                                                                                   |
| ------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `Toast.Provider`    | —               | Owns the toast list, timers, and the queue. Renders no element.                               |
| `Toast.Portal`      | —               | Renders its children into `document.body` (or `root`).                                        |
| `Toast.Viewport`    | `<div>`         | Landmark region that holds the toasts. Hover or focus inside pauses every timer.              |
| `Toast.Root`        | `<div>`         | One toast. Focusable, closes on Escape, drives the exit transition.                           |
| `Toast.Content`     | `<div>`         | Layout wrapper. Carries `data-behind` so stacked toasts can hide their content.               |
| `Toast.Title`       | `<h2>`          | Labels the root. Defaults to `toast.title`; renders nothing without content.                  |
| `Toast.Description` | `<p>`           | Describes the root. Defaults to `toast.description`; renders nothing without content.         |
| `Toast.Action`      | `<button>`      | Merges `toast.actionProps`, then closes the toast. Renders nothing without props or children. |
| `Toast.Close`       | `<button>`      | Closes the toast.                                                                             |

Element-rendering parts accept a `render` prop and the native attributes of their default element.

## Props

### `Toast.Provider`

| Prop           | Type                   | Default | Description                                                                |
| -------------- | ---------------------- | ------- | -------------------------------------------------------------------------- |
| `timeout`      | `number`               | `5000`  | Default auto-dismiss delay in ms. `0` disables auto-dismiss.               |
| `limit`        | `number`               | `3`     | Maximum toasts shown at once. Older toasts beyond it are marked `limited`. |
| `toastManager` | `ExternalToastManager` | —       | A manager from `createToastManager()` for use outside React.               |

### `Toast.Portal`

| Prop   | Type                                                    | Default         | Description       |
| ------ | ------------------------------------------------------- | --------------- | ----------------- |
| `root` | `HTMLElement \| null \| RefObject<HTMLElement \| null>` | `document.body` | Portal container. |

### `Toast.Root`

| Prop    | Type          | Description                         |
| ------- | ------------- | ----------------------------------- |
| `toast` | `ToastObject` | The toast from `useToastManager()`. |

## `useToastManager()`

Returns `{ toasts, add, close, update, promise }`.

| Method    | Signature                                                                            | Description                                                               |
| --------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `add`     | `(options: ToastAddOptions) => string`                                               | Adds a toast at the front of the list and returns its id.                 |
| `close`   | `(id?: string) => void`                                                              | Starts the exit transition of one toast, or of every toast without an id. |
| `update`  | `(id: string, options: ToastUpdateOptions \| (toast) => ToastUpdateOptions) => void` | Merges new fields into a toast. A function receives the current toast.    |
| `promise` | `(promise: Promise<T>, options: ToastPromiseOptions<T>) => Promise<T>`               | Loading → success / error toast, see above.                               |

### `ToastObject`

| Field         | Type                              | Description                                                           |
| ------------- | --------------------------------- | --------------------------------------------------------------------- |
| `id`          | `string`                          | Assigned by `add` unless supplied.                                    |
| `title`       | `ReactNode`                       | Default content of `Toast.Title`; announced to screen readers.        |
| `description` | `ReactNode`                       | Default content of `Toast.Description`; announced to screen readers.  |
| `type`        | `string`                          | Free-form category, exposed as `data-type`.                           |
| `timeout`     | `number`                          | Per-toast auto-dismiss override. `0` keeps it until closed.           |
| `priority`    | `'low' \| 'high'`                 | `'high'` announces assertively. Default `'low'`.                      |
| `actionProps` | `ComponentPropsWithRef<'button'>` | Props for `Toast.Action`. Its `onClick` runs before the toast closes. |
| `onClose`     | `() => void`                      | Called when the toast starts closing.                                 |
| `onRemove`    | `() => void`                      | Called once the toast is removed from the list.                       |
| `data`        | `Record<string, unknown>`         | Anything the rendering code needs.                                    |
| `limited`     | `boolean`                         | True while queued beyond the provider `limit`.                        |
| `height`      | `number`                          | Measured root height, used for `--toast-offset-y`.                    |

## Keyboard

| Key      | Where           | Action                                                                 |
| -------- | --------------- | ---------------------------------------------------------------------- |
| `F6`     | Anywhere        | Moves focus to the newest toast; from inside the viewport, moves back. |
| `Escape` | On a toast      | Closes it. Focus moves to the next toast, else to where it came from.  |
| `Tab`    | Inside viewport | Moves through toasts and their buttons as usual.                       |

## Data Attributes

| Attribute             | Applies To     | Description                                                                                   |
| --------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `data-expanded`       | Viewport, Root | Present while the viewport is hovered or holds focus. Timers are paused.                      |
| `data-type`           | Root           | The toast `type`.                                                                             |
| `data-limited`        | Root           | Present while the toast is queued beyond `limit`. The root is also `inert`. Hide it with CSS. |
| `data-behind`         | Content        | Present on every toast stacked behind the frontmost one.                                      |
| `data-expanded`       | Content        | Same as on Root.                                                                              |
| `data-starting-style` | Root           | Present on the first frame after mount.                                                       |
| `data-ending-style`   | Root           | Present from `close` until the exit animations finish.                                        |

## CSS Variables

`Toast.Root` sets custom properties for stacking. `Toast.Viewport` also carries `--toast-frontmost-height`.

| Property                   | Value                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `--toast-index`            | Position in the list; `0` is the newest.                                                  |
| `--toast-offset-y`         | Sum of the heights of the toasts before this one, in px.                                  |
| `--toast-height`           | Measured height of this toast, in px.                                                     |
| `--toast-frontmost-height` | Measured height of the frontmost toast, in px. Use it to size collapsed toasts behind it. |

```css
.toast {
  position: absolute;
  bottom: 0;
  transition:
    transform 300ms,
    opacity 300ms;
  transform: translateY(calc(var(--toast-offset-y) * -1 - var(--toast-index) * 8px));
}
.toast[data-starting-style],
.toast[data-ending-style] {
  opacity: 0;
}
.toast[data-limited] {
  display: none;
}
```

A collapsed stack that expands on hover sizes every toast to the frontmost one and hides the content behind it:

```css
.toast:not([data-expanded]) {
  height: var(--toast-frontmost-height);
  transform: translateY(calc(var(--toast-index) * -8px)) scale(calc(1 - var(--toast-index) * 0.05));
}
.toast[data-expanded] {
  height: var(--toast-height);
}
.toast-content[data-behind]:not([data-expanded]) {
  opacity: 0;
}
```

## ARIA

- Viewport: `role="region"`, `aria-label="Notifications"` (override with your own label), `tabIndex="-1"`.
- Root: `role="dialog"`, `aria-modal="false"`, `tabIndex="0"`, `aria-labelledby` → Title, `aria-describedby` → Description.
- Each root renders a visually hidden live region with the toast title and description: `role="status"` / `aria-live="polite"`, or `role="alert"` / `aria-live="assertive"` for `priority: 'high'`. Content is inserted a frame after mount so screen readers announce it.

## Not yet implemented

Swipe to dismiss (`swipeDirection`, `data-swiping`, `--toast-swipe-movement-*`) and anchored toasts (`Toast.Positioner`, `Toast.Arrow`) are not part of this primitive yet.
