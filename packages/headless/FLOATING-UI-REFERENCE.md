# Floating UI React — Comprehensive Reference

> **Package**: `@floating-ui/react` v0.27.x
> **Purpose**: Drive architectural decisions for our component primitives. Before implementing any floating behavior manually, check this document first — floating-ui almost certainly handles it already.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Hook: useFloating](#core-hook-usefloating)
3. [Middleware (Positioning)](#middleware-positioning)
4. [Interaction Hooks](#interaction-hooks)
5. [Components](#components)
6. [Transition System](#transition-system)
7. [Recommended Patterns by Component Type](#recommended-patterns-by-component-type)
8. [Current Repo Audit](#current-repo-audit)
9. [Things Floating-UI Handles That You Should NOT Reimplement](#things-floating-ui-handles-that-you-should-not-reimplement)

---

## Architecture Overview

Floating UI React has a layered architecture:

```
┌─────────────────────────────────────────────────────┐
│  Components (FloatingPortal, FloatingFocusManager,  │
│  FloatingList, FloatingTree, FloatingOverlay, etc.)  │
├─────────────────────────────────────────────────────┤
│  Interaction Hooks (useClick, useHover, useDismiss,  │
│  useRole, useListNavigation, useTypeahead, etc.)     │
├─────────────────────────────────────────────────────┤
│  useInteractions (merges all hook props together)    │
├─────────────────────────────────────────────────────┤
│  useFloating (core positioning + context)            │
├─────────────────────────────────────────────────────┤
│  Middleware (offset, flip, shift, size, arrow, etc.) │
└─────────────────────────────────────────────────────┘
```

**Key principle**: `useFloating` creates a `context` object. All interaction hooks receive this context and return `ElementProps`. `useInteractions` merges them into `getReferenceProps`, `getFloatingProps`, and `getItemProps` — spread these onto your elements and everything works.

---

## Core Hook: useFloating

```ts
const { refs, floatingStyles, context, placement, isPositioned } = useFloating({
  open,
  onOpenChange: setOpen,
  placement: 'bottom-start',
  middleware: [offset(4), flip(), shift()],
  whileElementsMounted: autoUpdate, // <-- critical, see below
  nodeId, // for FloatingTree
});
```

### autoUpdate

`autoUpdate` handles **all** repositioning automatically:

- **Ancestor scroll** listeners on all overflow ancestors
- **Window resize** listener
- **Reference element resize** via `ResizeObserver`
- **Floating element resize** via `ResizeObserver`
- **Layout shift** detection via `IntersectionObserver` (element moves without scroll/resize)
- **Animation frames** (opt-in via `animationFrame: true` for smooth tracking)

Options:

```ts
autoUpdate(referenceEl, floatingEl, update, {
  ancestorScroll: true, // listen to scroll events
  ancestorResize: true, // listen to resize events on overflow ancestors
  elementResize: true, // ResizeObserver on reference + floating
  layoutShift: true, // IntersectionObserver for layout changes
  animationFrame: false, // poll with rAF (use for drag-and-drop)
});
```

**Rule**: Always use `whileElementsMounted: autoUpdate`. It handles scroll repositioning, resize, and layout shifts automatically. Never add your own scroll listeners for positioning.

---

## Middleware (Positioning)

All middleware runs in order. The order matters.

### `offset(value)`

Displaces the floating element from its reference.

```ts
offset(4)                          // 4px on main axis
offset({ mainAxis: 4, crossAxis: 0, alignmentAxis: -4 })
offset(({ placement }) => ...)     // dynamic
```

### `flip(options?)`

Flips the floating element to the opposite side when it overflows.

```ts
flip();
flip({
  fallbackAxisSideDirection: 'end', // try end alignment before flipping axis
  crossAxis: true, // also flip cross axis
  fallbackPlacements: ['top', 'right'], // explicit fallback order
  fallbackStrategy: 'bestFit', // 'bestFit' | 'initialPlacement'
  padding: 5, // viewport padding
});
```

### `shift(options?)`

Shifts the floating element along the main axis to keep it in view.

```ts
shift();
shift({
  padding: 5, // viewport padding
  limiter: limitShift(), // prevent over-shifting
  crossAxis: true, // also shift cross axis
  mainAxis: true,
});
```

### `size(options?)`

Resizes the floating element to fit within available space. **This is how you set maxHeight for dropdowns.**

```ts
size({
  apply({ availableWidth, availableHeight, elements, rects }) {
    Object.assign(elements.floating.style, {
      maxHeight: `${availableHeight}px`,
      width: `${rects.reference.width}px`, // match trigger width
    });
  },
  padding: 5,
});
```

### `arrow(options)`

Positions an arrow element.

```ts
arrow({ element: arrowRef, padding: 8 });
```

### `autoPlacement(options?)`

Automatically chooses the best placement. Alternative to `flip()`.

```ts
autoPlacement({ allowedPlacements: ['top', 'bottom'] });
```

### `hide(options?)`

Hides the floating element when the reference is fully clipped or detached.

```ts
hide();
hide({ strategy: 'referenceHidden' }); // default: hides when reference scrolls out
hide({ strategy: 'escaped' }); // hides when floating element escapes boundary
```

Returns `middlewareData.hide.referenceHidden` — useful for adding `visibility: hidden` when the reference scrolls out of view.

### `inline(options?)`

Positions relative to individual client rects (for multi-line text selections).

### Middleware order recommendation:

```ts
middleware: [
  offset(4),
  flip(), // or autoPlacement()
  shift(),
  size(), // after flip/shift so it uses final available space
  arrow({ element: arrowRef }),
];
```

---

## Interaction Hooks

### `useClick(context, options?)`

Opens/closes on click.

```ts
useClick(context, {
  event: 'click', // 'click' | 'mousedown'
  toggle: true, // toggle on repeated clicks
  ignoreMouse: false, // ignore mouse (useful when combined with useHover)
  keyboardHandlers: true, // Enter/Space for non-button elements
  stickIfOpen: true, // keep open if already open from hover
});
```

### `useHover(context, options?)`

Opens on hover.

```ts
useHover(context, {
  enabled: true,
  delay: { open: 75, close: 0 },
  restMs: 150, // wait for cursor to "rest" before opening
  mouseOnly: false, // ignore touch
  move: true, // keep open while cursor moves over floating
  handleClose: safePolygon({ blockPointerEvents: true }), // safe triangle
});
```

- `safePolygon()`: Creates a "safe zone" triangle between reference and floating so the user can move their cursor without closing the popup. **Essential for nested menus.**

### `useFocus(context, options?)`

Opens on focus.

```ts
useFocus(context, {
  visibleOnly: true, // only for :focus-visible (keyboard focus)
});
```

### `useDismiss(context, options?)`

Closes on escape key, outside click, or ancestor scroll.

```ts
useDismiss(context, {
  escapeKey: true,
  outsidePress: true, // or (event) => !event.target.closest('.toast')
  outsidePressEvent: 'pointerdown', // 'pointerdown' | 'mousedown' | 'click'
  referencePress: false,
  ancestorScroll: false, // close on scroll
  bubbles: true, // bubble through FloatingTree (nested dismissal)
  capture: false,
});
```

### `useRole(context, options?)`

Adds ARIA attributes automatically.

```ts
useRole(context, { role: 'tooltip' }); // 'tooltip' | 'dialog' | 'alertdialog' | 'menu' | 'listbox' | 'grid' | 'tree'
// Component roles: 'select' | 'label' | 'combobox'
```

**What it adds automatically by role:**
| Role | Reference gets | Floating gets |
|------|---------------|---------------|
| `tooltip` | `aria-describedby` | `role="tooltip"`, `id` |
| `dialog` | `aria-expanded`, `aria-haspopup="dialog"`, `aria-controls` | `role="dialog"`, `id` |
| `menu` | `aria-expanded`, `aria-haspopup="menu"`, `aria-controls` | `role="menu"`, `id` |
| `listbox` | `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-activedescendant` (if virtual) | `role="listbox"`, `id` |
| `select` | button text set to selected label | (used with listbox) |
| `combobox` | `role="combobox"`, `aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-activedescendant` | `role="listbox"`, `id` |

### `useListNavigation(context, options)`

Arrow key navigation through list items. **This is the big one.**

```ts
useListNavigation(context, {
  listRef: elementsRef, // ref to array of DOM elements
  activeIndex, // current active item index
  onNavigate: setActiveIndex, // callback when navigation occurs
  selectedIndex, // currently selected item (for initial focus)

  // Behavior options:
  virtual: false, // true = aria-activedescendant (focus stays on input)
  loop: false, // wrap around at ends
  nested: false, // nested menu behavior (arrow keys open/close)
  focusItemOnOpen: 'auto', // auto-detect based on input type
  focusItemOnHover: true, // sync focus when hovering items

  // Scrolling:
  scrollItemIntoView: true, // AUTO scroll-into-view on navigation!
  // Can also be: { block: 'nearest', inline: 'nearest' } (ScrollIntoViewOptions)

  // Grid:
  orientation: 'vertical', // 'vertical' | 'horizontal' | 'both'
  cols: 1, // > 1 enables grid navigation

  // Advanced:
  allowEscape: false, // allow null activeIndex (for combobox)
  openOnArrowKeyDown: true, // arrow key opens the floating
  disabledIndices: [], // manually mark disabled indices
  rtl: false,
  virtualItemRef, // for nested virtual navigation
});
```

**Critical**: `scrollItemIntoView: true` handles scrolling items into view automatically when navigating with arrow keys. **Do not reimplement this.** It calls `element.scrollIntoView({ block: 'nearest' })` on the active item.

### `useTypeahead(context, options)`

Type-ahead search in lists.

```ts
useTypeahead(context, {
  listRef: labelsRef, // ref to string labels array
  activeIndex,
  selectedIndex,
  onMatch: index => {}, // called with matching index
  onTypingChange: isTyping => {}, // track typing state
  resetMs: 750, // reset typed string after this
  findMatch: null, // custom match function
  ignoreKeys: [],
});
```

### `useClientPoint(context, options?)`

Position relative to mouse cursor (for context menus).

```ts
useClientPoint(context, {
  axis: 'both', // 'x' | 'y' | 'both'
  x: null, // explicit x coordinate
  y: null, // explicit y coordinate
});
```

### `useInteractions(propsList)`

Merges all interaction hook results.

```ts
const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
  useClick(context),
  useDismiss(context),
  useRole(context),
  useListNavigation(context, { ... }),
]);
```

---

## Components

### `FloatingPortal`

Portals content outside the React root into `document.body`.

```tsx
<FloatingPortal
  id='my-portal'
  root={customElement}
>
  {floatingContent}
</FloatingPortal>
```

- `preserveTabOrder`: Maintains tab order based on React tree (not DOM tree). Use with non-modal `FloatingFocusManager`.

### `FloatingFocusManager`

Focus management for floating elements.

```tsx
<FloatingFocusManager
  context={floatingContext}
  disabled={false}
  modal={true} // trap focus (true) or just manage it (false)
  initialFocus={0} // 0 = first tabbable, -1 = floating element itself, or a ref
  returnFocus={true} // return focus to reference on close
  restoreFocus={false} // restore focus if active element is removed
  guards={true} // render focus guard elements
  visuallyHiddenDismiss // hidden dismiss button for touch screen readers
  closeOnFocusOut={true} // close when focus leaves (non-modal)
  order={['content']} // focus cycle order: 'reference' | 'floating' | 'content'
  outsideElementsInert={false} // make outside elements inert (pointer block without backdrop)
>
  {children}
</FloatingFocusManager>
```

**Key patterns:**
| Component Type | modal | initialFocus | returnFocus |
|---|---|---|---|
| Dialog | `true` | `0` | `true` |
| Popover | `false` (usually) | `0` | `true` |
| Combobox/Autocomplete | `false` | `-1` | `true` |
| Select | `false` | `0` | `true` |
| Menu (root) | `false` | `0` | `true` |
| Menu (nested) | `false` | `-1` | `false` |
| Tooltip | N/A (no focus manager needed) | N/A | N/A |

### `FloatingList`

Manages ordered lists of items with index tracking.

```tsx
<FloatingList
  elementsRef={elementsRef}
  labelsRef={labelsRef}
>
  {items.map(item => (
    <ListItem key={item.id} />
  ))}
</FloatingList>
```

### `useListItem(props?)`

Registers an item in the `FloatingList`.

```tsx
const { ref, index } = useListItem({ label: 'Item label' });
// ref: callback ref to attach to the DOM element
// index: the item's position in the list (auto-managed)
```

### `FloatingTree` / `FloatingNode`

Nested floating element coordination.

```tsx
// Wrap the root-level floating element:
function MyComponent(props) {
  const parentId = useFloatingParentNodeId();
  if (parentId === null) {
    return (
      <FloatingTree>
        <MyComponentInner {...props} />
      </FloatingTree>
    );
  }
  return <MyComponentInner {...props} />;
}

function MyComponentInner(props) {
  const nodeId = useFloatingNodeId();
  return <FloatingNode id={nodeId}>{/* content */}</FloatingNode>;
}
```

**When you need FloatingTree:**

- `useDismiss` with `bubbles` option (nested dismissal)
- Nested menus with `useHover`
- Nested virtual list navigation
- Custom parent-child communication via `tree.events`

Related hooks:

- `useFloatingNodeId()` — get a node ID for registration
- `useFloatingParentNodeId()` — get parent's node ID (null if root)
- `useFloatingTree()` — access the tree context (for events)

### `FloatingOverlay`

Overlay/backdrop for modals.

```tsx
<FloatingOverlay
  lockScroll={true}
  style={{ background: 'rgba(0,0,0,0.5)' }}
>
  {children}
</FloatingOverlay>
```

- `lockScroll`: Prevents body scrolling while overlay is visible.

### `FloatingArrow`

SVG arrow that automatically positions itself.

```tsx
<FloatingArrow
  ref={arrowRef}
  context={floatingContext}
  width={14}
  height={7}
  tipRadius={0}
  strokeWidth={1}
  stroke='#ccc'
  fill='white'
/>
```

### `FloatingDelayGroup` / `NextFloatingDelayGroup`

Groups tooltips so hovering between them shares delay (instant switch).

```tsx
<FloatingDelayGroup delay={{ open: 300, close: 200 }}>
  <Tooltip>...</Tooltip>
  <Tooltip>...</Tooltip>
</FloatingDelayGroup>
```

### `Composite` / `CompositeItem`

Single-tab-stop navigation outside floating contexts (e.g., menubars, toolbars).

```tsx
<Composite
  orientation='horizontal'
  loop
>
  <CompositeItem>Tab 1</CompositeItem>
  <CompositeItem>Tab 2</CompositeItem>
  <CompositeItem>Tab 3</CompositeItem>
</Composite>
```

Supports grid layout with `cols`, `itemSizes`, `dense`.

---

## Transition System

Floating UI provides two transition hooks:

### `useTransitionStatus(context, options?)`

Low-level: returns a `status` string for CSS class-based transitions.

```ts
const { isMounted, status } = useTransitionStatus(context, {
  duration: 200, // or { open: 200, close: 150 }
});
// status: 'unmounted' | 'initial' | 'open' | 'close'
```

### `useTransitionStyles(context, options?)`

Higher-level: returns inline styles for CSS transitions.

```ts
const { isMounted, styles } = useTransitionStyles(context, {
  duration: 200,
  initial: { opacity: 0, transform: 'scale(0.95)' },
  open: { opacity: 1, transform: 'scale(1)' },
  close: { opacity: 0, transform: 'scale(0.95)' },
  common: { transition: 'all 200ms ease' },
});
```

Styles can be placement-aware:

```ts
initial: ({ side }) => ({
  transform: side === 'top' ? 'translateY(8px)' : 'translateY(-8px)',
});
```

### Our custom approach

We use a custom `useFloatingTransition` hook that uses CSS data attributes (`data-cl-open`, `data-cl-closed`, `data-cl-starting-style`, `data-cl-ending-style`) and `Web Animations API` (`getAnimations().finished`) instead of JS-managed durations. This is a valid approach that avoids duplicating duration values between CSS and JS. However, we could potentially simplify by using `useTransitionStatus` as the state machine and only keeping our CSS-attribute mapping on top.

---

## Recommended Patterns by Component Type

### Tooltip

```
Hooks: useFloating + useHover + useFocus + useDismiss + useRole('tooltip')
Components: FloatingPortal, FloatingArrow
Focus: No FloatingFocusManager needed (tooltips don't receive focus)
Tree: FloatingTree/FloatingNode for nested tooltip dismiss handling
Delay group: FloatingDelayGroup for tooltip clusters
```

### Popover

```
Hooks: useFloating + useClick + useDismiss + useRole('dialog')
Components: FloatingPortal, FloatingFocusManager, FloatingArrow
Focus: modal=false usually, initialFocus=0, returnFocus=true
Tree: FloatingTree/FloatingNode
```

### Dialog

```
Hooks: useFloating + useClick + useDismiss + useRole('dialog')
Components: FloatingPortal, FloatingOverlay, FloatingFocusManager
Focus: modal=true, initialFocus=0, returnFocus=true
Overlay: FloatingOverlay with lockScroll
Tree: FloatingTree/FloatingNode
Note: No positioning middleware needed (centered via CSS)
```

### Select

```
Hooks: useFloating + useClick + useDismiss + useRole('listbox')
      + useListNavigation + useTypeahead
Components: FloatingPortal, FloatingFocusManager, FloatingList, FloatingArrow
Focus: modal=false, initialFocus=0
List: FloatingList with elementsRef + labelsRef
Items: useListItem for each option
Navigation: useListNavigation with loop=true, selectedIndex
Typeahead: useTypeahead for type-to-select
Sizing: size() middleware for maxHeight
```

### Combobox / Autocomplete

```
Hooks: useFloating + useDismiss + useRole('listbox')  ← NOTE: no useClick
      + useListNavigation(virtual=true) + optional useTypeahead
Components: FloatingPortal, FloatingFocusManager, FloatingList, FloatingArrow
Focus: modal=false, initialFocus=-1 (keep focus on input)
       visuallyHiddenDismiss=true
List: FloatingList with elementsRef + labelsRef
Items: useListItem for each option
Navigation: useListNavigation with virtual=true, loop=true, allowEscape=true
Sizing: size() middleware for maxHeight + width matching
ARIA: useRole('listbox') auto-sets aria-activedescendant on the input
```

### Menu

```
Hooks: useFloating + useClick + useHover(nested only) + useDismiss(bubbles)
      + useRole('menu') + useListNavigation(nested flag) + useTypeahead
Components: FloatingPortal, FloatingFocusManager, FloatingList, FloatingArrow
Focus: modal=false, initialFocus=0 (root) / -1 (nested), returnFocus=!nested
Hover: useHover with safePolygon for submenus
Tree: FloatingTree/FloatingNode + tree.events for cross-menu communication
Close: tree.events.emit('click') to close entire menu tree
```

---

## Current Repo Audit

### What we're doing right

| Primitive        | Status                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tooltip**      | Correct: useHover + useFocus + useDismiss + useRole('tooltip'). No FloatingFocusManager (correct).                                                                                    |
| **Popover**      | Correct: useClick + useDismiss + useRole('dialog'). FloatingFocusManager with configurable modal.                                                                                     |
| **Dialog**       | Correct: useClick + useDismiss + useRole('dialog'). FloatingOverlay + FloatingFocusManager. No positioning middleware (correct).                                                      |
| **Select**       | Correct: useClick + useDismiss + useRole('listbox') + useListNavigation + useTypeahead. FloatingList + FloatingFocusManager.                                                          |
| **Autocomplete** | Correct: useDismiss + useRole('listbox') + useListNavigation(virtual=true). FloatingList + FloatingFocusManager(initialFocus=-1, modal=false).                                        |
| **Menu**         | Correct: useClick + useHover(nested) + useDismiss(bubbles) + useRole('menu') + useListNavigation(nested) + useTypeahead. safePolygon for submenus. FloatingTree events for close-all. |
| **All**          | Correct: FloatingTree/FloatingNode pattern with parentId check. autoUpdate via whileElementsMounted.                                                                                  |

### What we should improve

1. **Select: `scrollItemIntoView` not set**
   `useListNavigation` in Select does not pass `scrollItemIntoView: true`. Arrow-key navigation through a long Select list won't auto-scroll items into view. **Autocomplete does set this correctly** (`scrollItemIntoView: true`).
   Note: `scrollItemIntoView` is smart — it only scrolls for keyboard navigation, not mouse hover.
   **Fix**: Add `scrollItemIntoView: true` to Select's useListNavigation options.

2. **Menu: `scrollItemIntoView` not set**
   Same issue — if a menu has many items and overflows, arrow-key navigation won't scroll.
   **Fix**: Add `scrollItemIntoView: true` to Menu's useListNavigation options.

3. **Menu: No transitions**
   Menu uses raw `open` check (`if (!open) return null`) instead of the `useFloatingTransition` pattern used by all other primitives. No enter/exit animations.
   **Fix**: Add `useFloatingTransition` + `mounted` gating + `transitionProps` spread, consistent with other primitives.

4. **Autocomplete: Wrong `useRole` role**
   Autocomplete uses `useRole(context, { role: 'listbox' })` but should use `useRole(context, { role: 'combobox' })`. The `'combobox'` role automatically sets `role="combobox"` on the input, `aria-autocomplete="list"`, and `aria-activedescendant`. Currently, `aria-autocomplete="list"` is manually set on the input — switching to `role: 'combobox'` lets floating-ui handle this automatically.
   **Fix**: Change to `useRole(floatingContext, { role: 'combobox' })`.

5. **Select: `alignItemWithTrigger` bypasses `autoUpdate`**
   When `alignItemWithTrigger=true`, the Select overrides `floatingStyles` with imperatively computed `position: fixed` values calculated once at open time in `useLayoutEffect`. Since `autoUpdate` only updates `floatingStyles` (which is then ignored), **the popup drifts on scroll/resize**.
   `inner()` middleware was designed for this but is deprecated in v0.27, so the custom approach is the right direction — it just needs to recompute on scroll/resize events.
   **Fix**: Either integrate the offset calculation into a custom middleware (so it runs inside `computePosition` and benefits from `autoUpdate`), or add scroll/resize listeners that re-trigger the `useLayoutEffect`.

6. **Select: Missing `shift()` middleware**
   Select uses `offset → flip → size → arrow` but no `shift()`. If the select is near the viewport edge on the cross-axis, it could get clipped.
   **Fix**: Add `shift({ padding: 5 })` between `flip()` and `size()`.

7. **Custom transition system vs floating-ui's**
   We have `useFloatingTransition` → `useTransitionStatus` → `useAnimationsFinished` (3 custom hooks). Floating-ui has `useTransitionStatus` and `useTransitionStyles` built-in.
   Our approach (CSS-driven with data attributes, using `getAnimations().finished`) is a valid and arguably better approach since it avoids JS-managed durations. **Keep our approach**, but be aware floating-ui's exists for simpler cases.

8. **Tooltip: Missing `FloatingDelayGroup` support**
   When multiple tooltips are near each other (toolbar buttons, icon rows), users expect instant switching between them. `FloatingDelayGroup` / `NextFloatingDelayGroup` handles this.
   **Suggestion**: Consider adding delay group support to the Tooltip primitive.

9. **`useMergeRefs` underutilized**
   Only Menu uses floating-ui's `useMergeRefs`. Dialog.Popup and Select.Option manually create combined ref callbacks. `SelectOption` in particular has a fragile `typeof itemRef === "function"` guard — `useListItem` returns a callback ref, so the guard works today but `useMergeRefs` handles all ref types robustly.
   **Fix**: Use `useMergeRefs` wherever multiple refs are combined (Dialog.Popup, Select.Option).

10. **`size` middleware data-attribute guard (Autocomplete + Select)**
    Both use `elements.floating.getAttribute("data-cl-slot")` inside middleware `apply()` to conditionally skip. This couples positioning infrastructure to component-level slot semantics.
    **Fix**: Conditionally include the `size` middleware only in the code path where the Positioner is used, or use separate configurations.

11. **Menu: `hasFocusInside` is dead state**
    `hasFocusInside` is tracked via `setHasFocusInside` (called in `MenuItem.onFocus` and `MenuTrigger.onFocus`) but the boolean value is never consumed anywhere. This appears to be leftover scaffolding from the floating-ui menu recipe.
    **Fix**: Either use `hasFocusInside` for something meaningful or remove it.

---

## Things Floating-UI Handles That You Should NOT Reimplement

| Feature                                   | Floating-UI Solution                                 | Notes                                                                            |
| ----------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Scroll-into-view on arrow key nav**     | `useListNavigation({ scrollItemIntoView: true })`    | Calls `scrollIntoView({ block: 'nearest' })` automatically                       |
| **Repositioning on scroll**               | `autoUpdate` via `whileElementsMounted`              | Listens to all ancestor scroll events                                            |
| **Repositioning on resize**               | `autoUpdate`                                         | Window resize + ResizeObserver on elements                                       |
| **Max-height for dropdowns**              | `size()` middleware                                  | `availableHeight` in `apply` callback                                            |
| **Match trigger width**                   | `size()` middleware                                  | `rects.reference.width` in `apply` callback                                      |
| **Escape key dismissal**                  | `useDismiss({ escapeKey: true })`                    | Default behavior                                                                 |
| **Outside click dismissal**               | `useDismiss({ outsidePress: true })`                 | Default behavior                                                                 |
| **Focus trapping**                        | `FloatingFocusManager({ modal: true })`              | Full modal focus trap                                                            |
| **Focus return on close**                 | `FloatingFocusManager({ returnFocus: true })`        | Default behavior                                                                 |
| **Scroll lock**                           | `FloatingOverlay({ lockScroll: true })`              | For dialogs/modals                                                               |
| **ARIA attributes**                       | `useRole(context, { role })`                         | Handles aria-expanded, aria-haspopup, aria-controls, aria-activedescendant, etc. |
| **List item index management**            | `FloatingList` + `useListItem`                       | Auto-tracks indices, handles dynamic add/remove                                  |
| **Typeahead/type-to-select**              | `useTypeahead`                                       | Character matching with configurable reset timeout                               |
| **Safe hover zones for submenus**         | `safePolygon()` in `useHover({ handleClose })`       | Triangle/polygon safe zone between trigger and submenu                           |
| **Nested floating dismiss**               | `useDismiss({ bubbles: true })` + `FloatingTree`     | Escape closes innermost first                                                    |
| **Portal rendering**                      | `FloatingPortal`                                     | Escapes overflow:hidden ancestors                                                |
| **Tab order preservation in portals**     | `FloatingPortal({ preserveTabOrder: true })`         | Maintains React tree tab order                                                   |
| **Arrow positioning**                     | `arrow()` middleware + `FloatingArrow` component     | Auto-positioned SVG arrow                                                        |
| **Virtual focus (aria-activedescendant)** | `useListNavigation({ virtual: true })`               | Focus stays on input while items are "virtually" focused                         |
| **Grid navigation**                       | `useListNavigation({ cols: n })`                     | 2D arrow key navigation                                                          |
| **Disabled item skipping**                | `useListNavigation` reads `disabled`/`aria-disabled` | Or pass `disabledIndices`                                                        |
| **Cursor "rest" detection**               | `useHover({ restMs: 150 })`                          | Only open after cursor stops moving                                              |
| **Delay groups for tooltips**             | `FloatingDelayGroup`                                 | Instant switch between grouped tooltips                                          |
| **Non-floating list navigation**          | `Composite` / `CompositeItem`                        | For menubars, toolbars, tab lists                                                |
| **Mouse cursor positioning**              | `useClientPoint`                                     | For context menus                                                                |
| **Hiding when reference scrolls away**    | `hide()` middleware                                  | Sets `middlewareData.hide.referenceHidden`                                       |

---

## Quick Reference: Which Hooks/Components for Each Primitive

```
                    useFloating  useClick  useHover  useFocus  useDismiss  useRole      useListNav  useTypeahead  FocusManager  FloatingList  FloatingOverlay  FloatingTree
Tooltip                 x                     x         x         x       tooltip                                                                                  x
Popover                 x           x                              x       dialog                                     x                                             x
Dialog                  x           x                              x       dialog                                     x                          x                  x
Select                  x           x                              x       listbox          x            x             x              x                              x
Autocomplete            x                                          x       listbox          x                          x              x                              x
Menu                    x           x         x*                   x       menu             x            x             x              x                              x
Context Menu            x                                          x       menu             x            x             x              x                              x
```

\*hover for nested submenus only
