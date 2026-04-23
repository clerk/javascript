---
name: use-headless
description: Conventions and API reference for building components with @clerk/headless primitives. Use when creating or modifying components that use Select, Menu, Dialog, Popover, Tooltip, Autocomplete, Tabs, or Accordion from @clerk/headless.
when_to_use: headless primitive, Select, Menu, Dialog, Popover, Tooltip, Autocomplete, Tabs, Accordion, floating component, dropdown, modal
disable-model-invocation: true
---

# @clerk/headless Primitives

Headless, accessible React compound components built on `@floating-ui/react`. They emit zero styles — all visual styling is applied externally via `data-cl-*` attribute selectors.

**Package:** `packages/headless` — import via sub-path exports (e.g., `@clerk/headless/select`).

## Compound Component Pattern

Every primitive is a single export with dot-accessed parts:

```tsx
import { Select } from '@clerk/headless/select';

<Select
  value={value}
  onValueChange={setValue}
>
  <Select.Trigger>
    <Select.Value placeholder='Pick...' />
  </Select.Trigger>
  <Select.Positioner>
    <Select.Popup>
      <Select.Option
        value='a'
        label='Option A'
      >
        Option A
      </Select.Option>
    </Select.Popup>
  </Select.Positioner>
</Select>;
```

## Standard Part Names (floating primitives)

| Part       | Role                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| Root       | Wraps with FloatingTree/FloatingNode, provides context                         |
| Trigger    | Reference element — gets `getReferenceProps()`                                 |
| Portal     | Conditional `FloatingPortal` gated on `mounted`                                |
| Positioner | Floating container with positioning styles, FloatingFocusManager, FloatingList |
| Popup      | Visual content wrapper — gets `transitionProps` + `popupRef`                   |
| Arrow      | Optional `FloatingArrow` wrapper                                               |

## The `render` Prop

Every part accepts a `render` prop for element customization:

```tsx
{
  /* Render as a different element */
}
<Select.Trigger render={<a href='#' />} />;

{
  /* Render function for full control */
}
<Select.Trigger render={props => <MyButton {...props} />} />;
```

When using `render`, all computed props (refs, ARIA, event handlers, data attributes) are merged onto the rendered element automatically via `mergeProps`.

## Data Attributes

All prefixed `data-cl-`. Present as empty string `""`, absent when inactive.

**Structural:**

- `data-cl-slot="<primitive>-<part>"` — identifies each part (e.g., `select-trigger`, `menu-item`)
- `data-cl-side="top|bottom|left|right"` — on Positioner/Arrow

**State (on interactive parts):**

- `data-cl-open` / `data-cl-closed` — mutually exclusive
- `data-cl-selected` — selected option/item
- `data-cl-active` — keyboard-focused/highlighted item
- `data-cl-disabled` — disabled item

**Animation lifecycle (on Popup, via `transitionProps`):**

- `data-cl-starting-style` — first frame only, set enter-from CSS values here
- `data-cl-ending-style` — during exit animation
- `data-cl-open` / `data-cl-closed` — for keyframe animations

All timing lives in CSS. JS is duration-agnostic.

## Animation Pattern (Tailwind v4)

```tsx
<Select.Popup className='data-cl-starting-style:opacity-0 data-cl-starting-style:-translate-y-1 data-cl-ending-style:opacity-0 data-cl-ending-style:-translate-y-1 transition-[opacity,transform] duration-150 ease-out' />
```

## Primitive Reference

### Select

```
Import: @clerk/headless/select
Parts: Select.Trigger, Select.Value, Select.Portal, Select.Positioner, Select.Popup, Select.Option, Select.Arrow
```

| Prop                   | Type                      | Default          | Description                                                  |
| ---------------------- | ------------------------- | ---------------- | ------------------------------------------------------------ |
| `items`                | `SelectItem[]`            | —                | `{ label, value }` for label resolution before options mount |
| `value`                | `string`                  | —                | Controlled selected value                                    |
| `defaultValue`         | `string`                  | —                | Uncontrolled default                                         |
| `onValueChange`        | `(value: string) => void` | —                |                                                              |
| `open` / `defaultOpen` | `boolean`                 | `false`          |                                                              |
| `onOpenChange`         | `(open: boolean) => void` | —                |                                                              |
| `alignItemWithTrigger` | `boolean`                 | `true`           | Overlay selected item on trigger (native `<select>` style)   |
| `placement`            | `Placement`               | `'bottom-start'` |                                                              |
| `sideOffset`           | `number`                  | `4`              |                                                              |

**Select.Option** props: `value: string`, `label?: string`, `disabled?: boolean`
**State attributes:** Trigger: `data-cl-open`/`data-cl-closed`. Option: `data-cl-selected`, `data-cl-active`, `data-cl-disabled`.

### Menu

```
Import: @clerk/headless/menu
Parts: Menu.Trigger, Menu.Portal, Menu.Positioner, Menu.Popup, Menu.Item, Menu.Separator, Menu.Arrow
```

| Prop                   | Type                      | Default                                            | Description |
| ---------------------- | ------------------------- | -------------------------------------------------- | ----------- |
| `open` / `defaultOpen` | `boolean`                 | `false`                                            |             |
| `onOpenChange`         | `(open: boolean) => void` | —                                                  |             |
| `placement`            | `Placement`               | `'bottom-start'` (root) / `'right-start'` (nested) |             |
| `sideOffset`           | `number`                  | `4` (root) / `0` (nested)                          |             |

**Supports nesting** — nest `<Menu>` inside a parent `<Menu>` for submenus. Trigger auto-detects nesting and becomes a `menuitem`. Uses `safePolygon` for safe hover zones.

**Menu.Item** props: `label: string`, `disabled?: boolean`, `closeOnClick?: boolean` (default `true`)
**State attributes:** Trigger: `data-cl-open`/`data-cl-closed`. Item: `data-cl-active`, `data-cl-disabled`.

### Dialog

```
Import: @clerk/headless/dialog
Parts: Dialog.Trigger, Dialog.Portal, Dialog.Backdrop, Dialog.Popup, Dialog.Title, Dialog.Description, Dialog.Close
```

| Prop                   | Type                      | Default | Description                      |
| ---------------------- | ------------------------- | ------- | -------------------------------- |
| `open` / `defaultOpen` | `boolean`                 | `false` |                                  |
| `onOpenChange`         | `(open: boolean) => void` | —       |                                  |
| `modal`                | `boolean`                 | `true`  | Trap focus and block interaction |

**No Positioner** — centered via CSS. Uses `FloatingOverlay` with `lockScroll` in Backdrop.
**Dialog.Backdrop** props: `lockScroll?: boolean` (default `true`)
**State attributes:** Trigger: `data-cl-open`/`data-cl-closed`.

### Popover

```
Import: @clerk/headless/popover
Parts: Popover.Trigger, Popover.Portal, Popover.Positioner, Popover.Popup, Popover.Arrow
```

| Prop                   | Type                      | Default    | Description |
| ---------------------- | ------------------------- | ---------- | ----------- |
| `open` / `defaultOpen` | `boolean`                 | `false`    |             |
| `onOpenChange`         | `(open: boolean) => void` | —          |             |
| `modal`                | `boolean`                 | `false`    |             |
| `placement`            | `Placement`               | `'bottom'` |             |
| `sideOffset`           | `number`                  | `4`        |             |

**State attributes:** Trigger: `data-cl-open`/`data-cl-closed`.

### Tooltip

```
Import: @clerk/headless/tooltip
Parts: Tooltip.Trigger, Tooltip.Portal, Tooltip.Positioner, Tooltip.Popup, Tooltip.Arrow, Tooltip.Group
```

| Prop                   | Type                      | Default | Description      |
| ---------------------- | ------------------------- | ------- | ---------------- |
| `open` / `defaultOpen` | `boolean`                 | `false` |                  |
| `onOpenChange`         | `(open: boolean) => void` | —       |                  |
| `placement`            | `Placement`               | `'top'` |                  |
| `sideOffset`           | `number`                  | `4`     |                  |
| `delay`                | `number`                  | `200`   | Open delay (ms)  |
| `closeDelay`           | `number`                  | `0`     | Close delay (ms) |

**No FloatingFocusManager** — tooltips don't receive focus.
**Tooltip.Group** wraps `FloatingDelayGroup` for instant switching between adjacent tooltips. Props: `delay`, `timeoutMs`.
**State attributes:** Trigger: `data-cl-open`/`data-cl-closed`.

### Autocomplete

```
Import: @clerk/headless/autocomplete
Parts: Autocomplete.Input, Autocomplete.Portal, Autocomplete.Positioner, Autocomplete.Popup, Autocomplete.Option, Autocomplete.Arrow, Autocomplete.List
```

| Prop                               | Type                      | Default          | Description    |
| ---------------------------------- | ------------------------- | ---------------- | -------------- |
| `value` / `defaultValue`           | `string`                  | —                | Selected value |
| `onValueChange`                    | `(value: string) => void` | —                |                |
| `inputValue` / `defaultInputValue` | `string`                  | `''`             | Input text     |
| `onInputValueChange`               | `(value: string) => void` | —                |                |
| `open` / `defaultOpen`             | `boolean`                 | `false`          |                |
| `onOpenChange`                     | `(open: boolean) => void` | —                |                |
| `placement`                        | `Placement`               | `'bottom-start'` |                |
| `sideOffset`                       | `number`                  | `4`              |                |

**Two modes:** `Positioner` (portal, floating) or `List` (inline, for embedding inside another floating element like a Popover).
**Uses virtual focus** — focus stays on input, `aria-activedescendant` tracks active option.
**Autocomplete.Option** props: `value: string`, `label?: string`, `disabled?: boolean`
**State attributes:** Option: `data-cl-selected`, `data-cl-active`, `data-cl-disabled`. Input: `data-cl-open`/`data-cl-closed`.

### Tabs

```
Import: @clerk/headless/tabs
Parts: Tabs.List, Tabs.Tab, Tabs.Panel, Tabs.Indicator
```

| Prop                     | Type                      | Default | Description |
| ------------------------ | ------------------------- | ------- | ----------- |
| `value` / `defaultValue` | `string`                  | —       | Active tab  |
| `onValueChange`          | `(value: string) => void` | —       |             |

**Not a floating primitive** — no Positioner. Uses `Composite` for keyboard navigation.
**Tabs.Tab** props: `value: string`, `disabled?: boolean`
**Tabs.Indicator** — animated indicator that tracks the active tab via CSS custom properties (`--cl-tab-indicator-left`, `--cl-tab-indicator-width`).
**State attributes:** Tab: `data-cl-selected`, `data-cl-disabled`.

### Accordion

```
Import: @clerk/headless/accordion
Parts: Accordion.Item, Accordion.Trigger, Accordion.Panel
```

| Prop                     | Type                        | Default | Description         |
| ------------------------ | --------------------------- | ------- | ------------------- |
| `value` / `defaultValue` | `string[]`                  | `[]`    | Open items          |
| `onValueChange`          | `(value: string[]) => void` | —       |                     |
| `multiple`               | `boolean`                   | `false` | Allow multiple open |

**Not a floating primitive.** Each `Item` takes a `value: string`.
**State attributes:** Item/Trigger: `data-cl-open`/`data-cl-closed`. Trigger: `data-cl-disabled`.

## Key Hooks

- **`useControllableState(controlled, default, onChange)`** — standard controlled/uncontrolled pattern. Used for `open`, `value`, `inputValue`.
- **`useFloatingTransition({ open, ref })`** — returns `{ mounted, transitionProps }`. Gate Portal/Positioner on `mounted`. Spread `transitionProps` onto Popup.

## Testing

Stack: Vitest + real Chromium (`@vitest/browser-playwright`).

```tsx
// Query parts by slot
document.querySelector('[data-cl-slot="select-positioner"]');

// Query by ARIA role
screen.getByRole('combobox'); // Select trigger
screen.getByRole('option'); // Select option
screen.getByRole('tooltip'); // Tooltip popup
screen.getByRole('dialog'); // Dialog popup
screen.getByRole('menu'); // Menu positioner
screen.getByRole('menuitem'); // Menu item

// Open floating components
await user.click(screen.getByRole('combobox')); // Select/Menu
await user.hover(trigger); // Tooltip

// Always call cleanup() in afterEach
```
