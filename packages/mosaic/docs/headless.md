# Headless primitives

`packages/mosaic/src/primitives/` is the unstyled, accessible primitive layer
inside Mosaic, one folder per primitive (Dialog, Menu, Select, …). Every part emits **zero
styles** — positioning, keyboard nav, focus management, dismiss, and ARIA are
delegated to `@floating-ui/react`; all appearance is applied externally via
`data-*` selectors and consumer classNames.

Internal to `@clerk/mosaic`: import by relative path; there is no subpath export.

## Read this for the _what_

Per-primitive API docs (parts, props, keyboard, data attributes, ARIA) live
**next to the code** and are the source of truth:

- **`packages/mosaic/src/primitives/<name>/README.md`** — one per primitive (TagInput has none yet).
- **`packages/mosaic/src/primitives/README.md`** — overview, plus the (not yet
  used) guide to consuming from `@clerk/ui`.

This file is the _how-to_ for the conventions every primitive shares.

## Consuming a primitive

Every primitive is a compound component exported as a namespace: render
`Root` + parts (`<Select.Root>`, `<Select.Trigger>`, …). Usage is in each
primitive's README.

- **Each element-rendering part accepts native props for its tag plus a `render`
  prop.** Pass-through parts (`Root`, `Portal`) render no element of their own.
- **Style by className/`data-*`**, never by a slot attribute — the primitives
  don't emit one.
- **`render` takes a function or an element.** `render={props => <X {...props} />}`
  or `render={<Link />}`; the element is cloned with the part's computed props
  and refs merged in.

## Authoring a part: the useRender contract

Every part that renders a DOM element calls **`useRender`** (from
`primitives/utils`) instead of returning JSX. It is the single mechanism behind
`render` overrides, state→`data-*` mapping, and ref merging.

Copy `src/primitives/select/select-trigger.tsx`: it is the reference part. Its
params are documented on `UseRenderParams*` in `utils/use-render.tsx`.

- **`ownProps satisfies DefaultProps<Tag>`** for authored defaults, not `as`.
- **`mergeProps(internal, consumer)` — internal first, consumer second.** Event
  handlers chain (internal fires, then consumer), `style` shallow-merges,
  `className` concatenates, everything else the consumer overwrites. This lets
  consumers extend behavior without breaking ARIA/handlers the primitive owns.
- **Positioners pass `enabled: mounted`**, so the floating DOM doesn't exist
  until the first frame (`select/select-positioner.tsx`).

### state → data-attribute mapping

Map each `state` key to a `data-*` object or `null`. Use presence (`null` when
off) for flags like `selected`/`disabled`. Use a pair (`data-open` /
`data-closed`) only when consumers need to style the off state.

## File layout of a primitive

Mirror `src/primitives/select/`: `<name>-root.tsx` (context provider), one
`<name>-<part>.tsx` per part, `<name>-context.ts` with a guard hook that throws
outside Root, `parts.ts` aliasing each part, `index.ts` exporting the namespace,
plus a test and a README.

`index.ts` must also re-export every public prop type (`select/index.ts`).
Without them, a `.d.ts` rollup that consumes the part hits TS2742 (see
`primitives/README.md`).

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

Styling off these in StyleX: `stylex.md` → "Reacting to `data-*` state".

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
`children: <Freeze frozen={!open}>{children}</Freeze>` (`select/select-popup.tsx`).

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

Any new part with an exit transition needs one of the two;
`grep -rn 'Freeze frozen' src/primitives` shows the current users.

## Shared hooks and utils

`primitives/hooks/index.ts` and `primitives/utils/index.ts` are the lists. Use
`useControllableState` for any controlled/uncontrolled prop pair, and
`useTransition` for any part with enter/exit (spread `transitionProps` on the
animated element). Add `cssVars()` to floating-ui middleware **after** `arrow()`,
or the transform origin won't follow the arrow.

## Testing

Primitive tests run on **happy-dom** (the `primitives` project in Mosaic's
`vitest.config.mts`), and `toHaveNoViolations` (axe) is registered in
`src/primitives/test-utils/vitest.setup.ts`.
