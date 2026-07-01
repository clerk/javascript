# Drawer

A modal bottom-sheet overlay with drag-to-dismiss, optional snap points, virtual-keyboard
awareness, and nesting. Built on the same Floating UI infrastructure as `Dialog` (portal, focus
trap, scroll lock, dismiss, `FloatingTree` nesting, enter/exit transitions) with a hand-rolled
pointer/transform drag engine layered on top.

The headless layer emits **raw** CSS custom properties and `data-cl-*` attributes and ships **zero
CSS**. The styled (mosaic) layer composes the actual `transform` / `opacity` / `calc()` chains from
those inputs.

## When to Use

- A sheet that slides up from the bottom edge and is dismissed by swiping down.
- Mobile-first flows where snap points (peek / half / full) make sense.
- Prefer `Dialog` for centered modals that are not anchored to the bottom and have no drag gesture.

## Usage

```tsx
import { Drawer } from '@clerk/headless/drawer';

<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Handle />
        <Drawer.Title>Sheet title</Drawer.Title>
        <Drawer.Description>Optional description.</Drawer.Description>
        <p>Sheet content.</p>
        <Drawer.Close>Close</Drawer.Close>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>;
```

### Controlled

```tsx
const [open, setOpen] = useState(false);

<Drawer.Root
  open={open}
  onOpenChange={setOpen}
>
  {/* ... */}
</Drawer.Root>;
```

### Detached trigger

A trigger rendered **outside** `Drawer.Root` can drive it through a shared handle:

```tsx
const handle = createDrawerHandle();

<>
  <Drawer.Trigger handle={handle}>Open from anywhere</Drawer.Trigger>
  <Drawer.Root handle={handle}>{/* ... */}</Drawer.Root>
</>;
```

`handle.open()` / `handle.close()` / `handle.toggle()` work imperatively; `handle.isOpen` and
`handle.subscribe(cb)` make it `useSyncExternalStore`-compatible.

### Snap points

```tsx
// Ascending fractions of the viewport the sheet can rest at; 1 = full height.
<Drawer.Root
  snapPoints={[0.4, 0.75, 1]}
  defaultActiveSnapPoint={0}
>
  {/* ... */}
</Drawer.Root>
```

Control the active point with `activeSnapPoint` / `onActiveSnapPointChange`. A slow release settles to
the nearest point; a fast flick steps one point (up = larger, down = smaller, or dismiss from the
first point when `dismissible`). An uncontrolled drawer returns to its default snap point when it
closes, so the next open starts fresh. Dragging past the fully-open edge is square-root damped so the
sheet resists overshooting.

### Handle-only dragging

```tsx
// Only a press starting on Drawer.Handle initiates the drag; the body scrolls normally.
<Drawer.Root handleOnly>{/* ... */}</Drawer.Root>
```

## Parts

| Part                 | Default Element | Description                                                      |
| -------------------- | --------------- | ---------------------------------------------------------------- |
| `Drawer.Root`        | —               | Root context provider; owns open/drag/snap/nesting state         |
| `Drawer.Trigger`     | `<button>`      | Opens the drawer (in-tree, or via a detached `handle`)           |
| `Drawer.Portal`      | —               | Portals children (defaults to `document.body`)                   |
| `Drawer.Backdrop`    | `<div>`         | Semi-transparent overlay surface                                 |
| `Drawer.Viewport`    | `<div>`         | Fixed full-viewport container; owns scroll lock                  |
| `Drawer.Popup`       | `<div>`         | The sheet (`role="dialog"`); hosts the drag gesture + focus trap |
| `Drawer.Handle`      | `<div>`         | Visual drag grip; the hit-test target when `handleOnly`          |
| `Drawer.Title`       | `<h2>`          | Heading, wired to `aria-labelledby`                              |
| `Drawer.Description` | `<p>`           | Description, wired to `aria-describedby`                         |
| `Drawer.Close`       | `<button>`      | Closes the drawer on click                                       |

## Props

### `Drawer.Root`

| Prop                      | Type                      | Default | Description                                     |
| ------------------------- | ------------------------- | ------- | ----------------------------------------------- |
| `open`                    | `boolean`                 | —       | Controlled open state                           |
| `defaultOpen`             | `boolean`                 | `false` | Initial open state (uncontrolled)               |
| `onOpenChange`            | `(open: boolean) => void` | —       | Called when open state changes                  |
| `modal`                   | `boolean`                 | `true`  | Traps focus and blocks page interaction         |
| `dismissible`             | `boolean`                 | `true`  | Allow drag / outside-press / Escape to close    |
| `handleOnly`              | `boolean`                 | `false` | Only `Drawer.Handle` starts a drag              |
| `handle`                  | `DrawerHandle`            | —       | Shared handle for a detached trigger            |
| `snapPoints`              | `number[]`                | —       | Ascending viewport fractions (0..1) to rest at  |
| `activeSnapPoint`         | `number`                  | —       | Controlled active snap index                    |
| `defaultActiveSnapPoint`  | `number`                  | last    | Uncontrolled initial active snap index          |
| `onActiveSnapPointChange` | `(index: number) => void` | —       | Called when the active snap index changes       |
| `repositionInputs`        | `boolean`                 | `true`  | Keep a focused field above the virtual keyboard |
| `autoFocus`               | `boolean`                 | `false` | Move focus into the sheet on open (see notes)   |

### `Drawer.Trigger`

| Prop     | Type           | Description                                                      |
| -------- | -------------- | ---------------------------------------------------------------- |
| `handle` | `DrawerHandle` | Drive a detached handle instead of the surrounding `Drawer.Root` |

### `Drawer.Viewport`

| Prop         | Type      | Default | Description                     |
| ------------ | --------- | ------- | ------------------------------- |
| `lockScroll` | `boolean` | `true`  | Prevents body scroll while open |

Other parts accept standard HTML attributes plus the `render` prop.

## Keyboard

| Key      | Action                                                           |
| -------- | ---------------------------------------------------------------- |
| `Escape` | Closes the drawer (closes a nested child overlay first, if open) |
| `Tab`    | Cycles focus within the sheet (modal mode)                       |

## Styling API

The headless parts emit raw inputs only — the styled layer composes them. The high-frequency vars
(`swipe-movement-y`, `snap-point-offset`, `swipe-progress`) are registered as non-inheriting custom
properties via `registerDrawerCssVars()` (a no-op where `CSS.registerProperty` is unavailable).

### CSS custom properties (on `Drawer.Popup`)

| Variable                        | Written by    | Meaning                                          |
| ------------------------------- | ------------- | ------------------------------------------------ |
| `--cl-drawer-swipe-movement-y`  | drag engine   | px live drag delta on the Y axis (0 at rest)     |
| `--cl-drawer-swipe-progress`    | drag engine   | 0..1 dismiss progress (drives backdrop fade)     |
| `--cl-drawer-snap-point-offset` | snap layer    | px resting translateY of the active snap point   |
| `--cl-drawer-swipe-strength`    | drag engine   | 0.1..1 from release velocity (scales exit speed) |
| `--cl-drawer-nested-drawers`    | nesting layer | count of open nested children                    |

### Data attributes

| Attribute                                         | Applies to                         | Meaning                         |
| ------------------------------------------------- | ---------------------------------- | ------------------------------- |
| `data-cl-open` / `data-cl-closed`                 | Trigger, Backdrop, Viewport, Popup | Open state                      |
| `data-cl-starting-style` / `data-cl-ending-style` | Backdrop, Viewport, Popup          | Enter / exit transition phase   |
| `data-cl-swiping`                                 | Popup, Backdrop                    | A drag is in progress           |
| `data-cl-snap`                                    | Popup                              | Active snap index               |
| `data-cl-expanded`                                | Popup                              | Resting at the full-height snap |
| `data-cl-nested`                                  | Popup                              | This drawer is itself nested    |
| `data-cl-nested-drawer-open`                      | Popup                              | A nested child is open          |
| `data-cl-drawer-handle`                           | Handle                             | Grip / `handleOnly` hit-test    |
| `data-cl-drawer-no-drag`                          | (consumer-set)                     | Opt a subtree out of dragging   |

Slot identity (`data-cl-slot`) is applied by the styled (mosaic) layer, not by the headless parts.

## Important Notes

- **`autoFocus` defaults to `false`** (unlike `Dialog`). Opening on touch should not move focus to an
  input and summon the keyboard, so focus goes to the sheet container by default. Set `autoFocus` to
  move focus to the first field.
- **`Drawer.Handle` is presentational** (no ARIA role). Keyboard users dismiss via `Escape` /
  `Drawer.Close`; add your own `role` / `aria-*` (via props or `render`) if you need it announced.
- **Drag never hijacks form controls.** `shouldDrag` excludes `<select>`, native `range` inputs,
  `[role="slider"]` thumbs, `[data-cl-drawer-no-drag]` subtrees, active text selections (DOM,
  `contenteditable`, and focused `input` / `textarea` selection handles), and inner content scrolled
  away from the top. Use `data-cl-drawer-no-drag` for any other custom draggable.
- **Nested overlays don't dismiss the drawer.** A `Select` / `Autocomplete` / `Menu` opened inside the
  sheet joins the same `FloatingTree`, so a press in its portal counts as inside.
- **Nested drawers** stack automatically (shared `FloatingTree`); the parent receives
  `data-cl-nested-drawer-open` and `--cl-drawer-nested-drawers` so the styled layer can scale it back.

## Out of scope (follow-ups)

- Directions other than bottom (top / left / right).
- Full iOS keyboard hardening (the pre-focus `translateY` trick and a `focus` override) plus
  snap-point-aware keyboard offsets and flick-focus suppression.
- Animated nested scale-back interpolation and `--cl-drawer-frontmost-height` peek math.
- Resize-driven recomputation of snap offsets.
- Per-trigger payloads on detached handles (`createDrawerHandle<T>()` + a render-prop `Drawer.Root`).
- `onActiveSnapPointChange` event details (the change `reason`, e.g. close-press vs. drag).
- The mosaic styled layer and a playground.

## ARIA

- Popup: `role="dialog"`, `aria-labelledby` (from Title), `aria-describedby` (from Description).
- Trigger: `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls` (in-tree).
