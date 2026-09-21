# Headless primitives

`@clerk/headless` (`packages/headless/`) is the unstyled, accessible primitive
layer under Mosaic: Accordion, Autocomplete, Collapsible, Dialog, Drawer,
FileUpload, Menu, OTP, Popover, Select, Tabs, Tooltip. Every part emits **zero
styles** — positioning, keyboard nav, focus management, dismiss, and ARIA are
delegated to `@floating-ui/react`; all appearance is applied externally via
`data-*` selectors and consumer classNames.

The package is `private: true` and consumed by `@clerk/mosaic`. It is planned
to later move into the Mosaic package. Mosaic currently bundles Headless into
its published artifact.

## Read this for the _what_

Per-primitive API docs (parts, props, keyboard, data attributes, ARIA) live
**next to the code** and are the source of truth:

- **`packages/headless/src/primitives/<name>/README.md`** — one per primitive.
- **`packages/headless/README.md`** — package overview, the primitive table, and
  the full **consuming-from-`@clerk/ui`** guide (the `makeCustomizable` wrapper,
  the TS2742 annotation requirement, pass-through parts, the `render` escape
  hatch).

This file is the _how-to_ for the shared conventions — what every primitive has
in common, so you can author a new one or a new part without re-deriving the
pattern.

## Consuming a primitive

Every primitive is a compound component exported as a namespace. Import from the
subpath; render `Root` + parts:

```tsx
import { Select } from '@clerk/headless/select';

<Select.Root>
  <Select.Trigger>
    <Select.Value placeholder='Choose…' />
  </Select.Trigger>
  <Select.Positioner>
    <Select.Popup>
      <Select.Option
        value='a'
        label='A'
      />
    </Select.Popup>
  </Select.Positioner>
</Select.Root>;
```

- **Each element-rendering part accepts native props for its tag plus a `render`
  prop.** Pass-through parts (`Root`, `Portal`) render no element of their own
  and have their own APIs instead. Unused parts tree-shake out.
- **Style by className/`data-*`**, never by a slot attribute — the primitives
  don't emit one.
- **`render` is the override escape hatch.** It takes a function
  (`render={props => <X {...props} />}`) **or an element**
  (`render={<Link />}`) — the element is cloned with the part's computed props
  and refs merged in.
- **From `@clerk/ui`**, wrap element-rendering parts with `makeCustomizable` to
  get the theme-aware `sx` prop; pass-through parts (`Root`, `Portal`) are used
  directly. See `packages/headless/README.md`.

## Authoring a part: the useRender contract

Every part that renders a DOM element calls **`useRender`** (from
`../../utils`) instead of returning JSX. This is the single mechanism behind
`render` overrides, state→`data-*` mapping, and ref merging. (It replaced the
old `renderElement` helper — `renderElement` no longer exists.)

```tsx
'use client';
import React from 'react';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useSelectContext } from './select-context';

export type SelectTriggerProps = ComponentProps<'button'>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, refs, getReferenceProps } = useSelectContext();

    const ownProps = { type: 'button' } satisfies DefaultProps<'button'>;
    const defaultProps = { ...ownProps, ...getReferenceProps() };

    return useRender({
      defaultTagName: 'button',
      render,
      state: { open },
      stateAttributesMapping: {
        open: v => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      ref: [refs.setReference, ref],
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
```

`useRender` params:

| Param                              | Purpose                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `defaultTagName`                   | Tag rendered when no `render` is given.                                                     |
| `render`                           | Consumer override: a render function **or** a React element (cloned with merged props).     |
| `props`                            | Props to spread onto the element. Pass refs via `ref`, not here.                            |
| `ref`                              | A ref or **array** of refs; merged internally (`useMergeRefs`). E.g. `[refs.setX, ref]`.    |
| `state` + `stateAttributesMapping` | Maps state values to `data-*` attrs (below).                                                |
| `enabled`                          | When `false`, returns `null`. Positioners pass `enabled: mounted` to gate the floating DOM. |

Rules that hold for **every** part:

- **`'use client';`** at the top of every component file.
- **`React.forwardRef`** for any part that renders an element.
- **`const { render, ...otherProps } = props;`** — pull `render` out, spread the rest.
- **`ownProps satisfies DefaultProps<Tag>`** for authored defaults. `DefaultProps`
  is the tag's props widened to allow `data-*` keys — `satisfies` type-checks
  every key against the real element without an `as` cast.
- **`mergeProps(internal, consumer)` — internal first, consumer second.** Event
  handlers chain (internal fires, then consumer), `style` shallow-merges,
  `className` concatenates, everything else the consumer overwrites. This lets
  consumers extend behavior without breaking ARIA/handlers the primitive owns.

### state → data-attribute mapping

`stateAttributesMapping` maps each `state` key to a function returning a
`data-*` object or `null` (omit). Return the boolean-off branch as `null` for
presence attrs, or a second attribute for on/off pairs:

```ts
// presence: attr only when true
selected: v => (v ? { 'data-selected': '' } : null),
disabled: v => (v ? { 'data-disabled': '' } : null),
// pair: data-open vs data-closed
open: v => (v ? { 'data-open': '' } : { 'data-closed': '' }),
```

Consumers then style off `[data-selected]`, `[data-open]`, etc.

## File layout of a primitive

Every `primitives/<name>/` folder follows the same shape:

| File                | Holds                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `<name>-root.tsx`   | Context provider; owns floating/interaction/transition state. Often wraps `FloatingTree`.      |
| `<name>-<part>.tsx` | One file per part (`-trigger`, `-popup`, `-positioner`, …), each a `forwardRef` + `useRender`. |
| `<name>-context.ts` | Context type + `createContext` + guard hook (below).                                           |
| `parts.ts`          | Re-exports each part under its short alias.                                                    |
| `index.ts`          | Public entry: namespace + prop-type re-exports.                                                |
| `<name>.test.tsx`   | Tests (real Chromium via vitest browser mode, not jsdom).                                      |
| `README.md`         | The primitive's API docs.                                                                      |

**Context + guard hook** — the pattern that makes "used outside Root" a clear error:

```ts
export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select compound components must be used within <Select.Root>');
  return ctx;
}
```

**`parts.ts`** — alias each part; this is what the namespace spreads:

```ts
export { type SelectTriggerProps, SelectTrigger as Trigger } from './select-trigger';
export { type SelectOptionProps, SelectOption as Option } from './select-option';
// …
```

**`index.ts`** — namespace + public prop types (the prop types must be
re-exported here or `@clerk/ui`'s `.d.ts` rollup hits TS2742):

```ts
export * as Select from './parts';
export type { SelectProps, SelectTriggerProps, SelectOptionProps /* … */ } from './parts';
```

**`Portal`** parts take an optional `root` and gate on `mounted`:

```tsx
export function SelectPortal(props: {
  children: ReactNode;
  root?: HTMLElement | RefObject<HTMLElement | null> | null;
}) {
  const { mounted } = useSelectContext();
  if (!mounted) return null;
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
```

## Animation lifecycle (`data-*` driven)

All enter/exit timing lives in **CSS**; the primitives only toggle `data-*`
attributes and drive unmount off the Web Animations API. Root spreads
`transitionProps` (from `useTransition`) onto the Popup; the lifecycle:

- **Open** → synchronously `mounted=true`, status `'starting'`: first committed
  frame carries `data-open` + `data-starting-style` + inline `transition: none`
  (snapshot frame). One rAF later `data-starting-style` clears → CSS transitions
  fire toward the resting style.
- **Close** → status `'ending'`: `data-closed` + `data-ending-style` applied.
  After all animations on the element finish (`useAnimationsFinished`),
  `mounted` flips false and the element unmounts.

Consumer CSS keys off these: `[data-starting-style] { opacity: 0 }`,
`[data-open] { animation: … }`, `[data-ending-style] { opacity: 0 }`.

### Exiting content must be frozen

Anything that animates out outlives `open` by the length of its exit, and
whatever closed it has usually already changed the data behind it — picking a
menu item, selecting an option, switching account, a machine returning to `idle`,
a form clearing. The subtree re-renders with the new data and swaps visibly under
the exit, which reads as a flash of the next screen. This applies to **every part
with an exit transition**, not only popups: a sheet, a panel, a step, an inline
region that fades out all have the same window.

Two ways to hold the old frame, depending on whether the part re-renders for
reasons of its own while closed:

**`Freeze`** — wrap the children, keep the animating element live:

```tsx
const { render, children, ...otherProps } = props;
const { open, popupRef, transitionProps } = useMenuContext();

const defaultProps = {
  ...transitionProps,
  children: <Freeze frozen={!open}>{children}</Freeze>,
};
```

**A held snapshot** — keep the last open `children` in a ref and render those
while closed. `FlowStep` does this: its `children` prop genuinely changes when the
step value moves on, so there is a correct old value to render rather than a frame
to hold.

```tsx
if (open) activeChildrenRef.current = children;
// ...
children: open ? children : activeChildrenRef.current,
```

Reach for `Freeze` by default; reach for the snapshot when the outgoing content is
a distinct element you still have.

Two things to get right either way:

- Gate on **`!open`**, never `!mounted`. `mounted` stays true through the whole
  exit — that is precisely the window this covers, so `!mounted` freezes nothing.
- Freeze the **children**, not the animating element. It has to stay live for
  `data-closed` / `data-ending-style` to land on it and for the animation to run.

In place today: Popover, Select, Combobox, Menu, Dialog (`Freeze`), Flow
(snapshot). Not yet: Drawer, Autocomplete, Tooltip, and the Accordion /
Collapsible / Tabs panels. Any new part with an exit transition needs one of the
two.

**Positioners** gate the floating layer on `mounted` via `useRender`'s
`enabled`, so the positioned DOM doesn't exist until the first frame:

```tsx
const element = useRender({ defaultTagName: 'div', render, enabled: mounted, ref: [refs.setFloating, ref], props });
if (!element) return null;
```

## Shared hooks (`@clerk/headless/hooks`)

| Hook                    | Signature (abridged)                                                | Purpose                                                                |
| ----------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `useControllableState`  | `(controlled, defaultValue, onChange?) => [value, setValue]`        | Dual-mode controlled/uncontrolled state; `onChange` fires either way.  |
| `useTransition`         | `({ open, ref }) => { mounted, transitionStatus, transitionProps }` | Enter/exit lifecycle; spread `transitionProps` onto the animated part. |
| `useTransitionStatus`   | `(open) => { mounted, transitionStatus, setMounted }`               | Lower-level phase machine (`'starting'` / `'ending'` / `undefined`).   |
| `useAnimationsFinished` | `(ref, open) => (cb) => void`                                       | Runs `cb` once all CSS animations finish; aborts on rapid toggles.     |
| `useDataTable`          | `(opts) => { rows, sorting, pagination, rowSelection, … }`          | Table state (sort/filter/paginate/select), controlled or uncontrolled. |

## Shared utils (`@clerk/headless/utils`)

- **`useRender`, `mergeProps`, `ComponentProps<Tag>`, `DefaultProps<Tag>`, `RenderProp`** — the part-authoring primitives (above).
- **`Freeze({ frozen, children })`** — holds its subtree's DOM at the last
  committed frame while `frozen` (a suspended boundary whose `display: none` is
  undone in an insertion effect). Wrap a transitioning popup's children in it so
  they don't swap under the exit animation; see above.
- **`cssVars({ sideOffset? }): Middleware`** — floating-ui middleware setting
  `--cl-anchor-width/height`, `--cl-available-width/height`, `--cl-transform-origin`
  on the floating element. Place it **after** `arrow()`.
- **`resetLayoutStyles(el): () => void`** — temporarily forces flex/grid
  alignment to `initial` for accurate `scrollHeight`/`scrollWidth` measurement;
  restores on next rAF. Call the returned cleanup from effect cleanup.

## Testing

Tests run in **real Chromium** (vitest browser mode), not jsdom, and include
`axe` accessibility assertions. `pnpm test` in `packages/headless`. See
`testing.md` for the Mosaic flow-layer testing model (a different concern — that
covers models/controllers/views, not these primitives).
