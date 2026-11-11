# Headless primitives

Read this when you write or change a part under `src/primitives/`, add a primitive, or give a part an enter or exit transition. It covers the conventions every primitive shares: `useRender`, file layout, the animation lifecycle, frozen exits and reading direction. Each primitive's own API (parts, props, keyboard, data attributes, ARIA) is in its `src/primitives/<name>/README.md`, and `src/primitives/README.md` is the overview.

Worked example: `src/primitives/select/` (`select-trigger.tsx` is the reference part).

## Rules

- A primitive emits no styles. Positioning, list navigation, focus, dismiss and ARIA come from `@floating-ui/react`, and roving-tabindex groups use `useComposite` with `useCompositeItem` (`src/primitives/hooks/use-composite.ts`). Appearance is applied from outside through `data-*` selectors and classes.
- Import primitives by relative path inside Mosaic; there is no subpath export.
- Every part that renders a DOM element calls `useRender` (`src/primitives/utils/use-render.tsx`) instead of returning JSX, is a `React.forwardRef`, and passes its `ref` to `useRender` (`mosaic/forward-ref-parts` enforces this).
- Type authored defaults with `ownProps satisfies DefaultProps<Tag>`, not `as`.
- `mergeProps(internal, consumer)`: internal first. Handlers chain (internal, then consumer), `style` shallow-merges, `className` concatenates, and the consumer overwrites anything else, ARIA included.
- `index.ts` re-exports every public prop type, or a `.d.ts` rollup of a consumer hits TS2742 (`src/primitives/README.md`).
- A part with an exit transition freezes its children while closed ([Exiting content must be frozen](#exiting-content-must-be-frozen)).
- Read direction with `useDirection()`, never from the DOM ([Reading direction](#reading-direction)).

## Consuming a primitive

A primitive is a compound component exported as a namespace: `Root` plus parts (`<Select.Root>`, `<Select.Trigger>`). Each element-rendering part accepts native props for its tag and a `render` prop; pass-through parts (`Root`, `Portal`) render no element. Style a part by class or `data-*`; primitives emit no slot attribute.

`render` takes a function (`render={props => <X {...props} />}`) or an element (`render={<Link />}`), which is cloned with the part's props and refs merged in. A render function must apply the computed props and ref, or it drops the primitive's behavior.

## Authoring a part

Copy `select-trigger.tsx`; `useRender`'s params are documented on `UseRenderParams*`. `useRender` is the one mechanism behind `render` overrides, state-to-`data-*` mapping and ref merging.

- **State to data attributes.** Map each `state` key to a `data-*` object or `null`. Use presence (`null` when off) for flags like `selected` and `disabled`, and a pair (`data-open` / `data-closed`) only when consumers style the off state.
- **Positioners pass `enabled: mounted`**, so the floating DOM does not exist until the first frame (`select-positioner.tsx`).
- **Shared hooks and utils.** `src/primitives/hooks/index.ts` and `src/primitives/utils/index.ts` are the lists. Use `useControllableState` for a controlled/uncontrolled prop pair and `useTransition` for any part with enter or exit. Add `cssVars()` to the floating-ui middleware after `arrow()`, or the transform origin will not follow the arrow.

## File layout

Mirror `src/primitives/select/`:

- `<name>-root.tsx`, the context provider
- one `<name>-<part>.tsx` per part
- `<name>-context.ts`, with a guard hook that throws outside `Root`
- `parts.ts`, aliasing each part
- `index.ts`, exporting the namespace and every public prop type
- a test and a `README.md`

## Animation lifecycle

Enter and exit timing lives in CSS. The primitive only toggles `data-*` attributes and unmounts off the Web Animations API. Root spreads `transitionProps` from `useTransition` onto the popup.

- **Initially open:** `mounted` is true, with `data-open` and no starting style. Set `animateOnMount: true` to play an entrance on mount.
- **Opened after mount:** the first committed frame carries `data-open`, `data-starting-style` and an inline `transition: none`. One frame later `data-starting-style` clears and the CSS transitions run to the resting style.
- **Close:** `data-closed` and `data-ending-style` are applied. Once every animation on the element finishes (`useAnimationsFinished`), `mounted` flips false and the element unmounts.

How to style off these attributes is in [StyleX → State on another element](stylex.md#state-on-another-element), and which curve each phase takes is in [Motion](motion.md).

### Exiting content must be frozen

Anything that animates out outlives `open` by the length of its exit, and whatever closed it has usually changed the data behind it: a picked menu item, a selected option, a switched account, a machine back at `idle`, a cleared form. The subtree re-renders with the new data under the exit and flashes the next screen. This applies to every part with an exit transition: popups, sheets, panels, steps and inline regions.

- **`Freeze` (the default).** Wrap the children and keep the animating element live: `children: <Freeze frozen={!open}>{children}</Freeze>` (`select-popup.tsx`).
- **A held snapshot**, when the outgoing content is a distinct value you still have. `FlowStep` keeps the last open `children` in a ref and renders them while closed, because its `children` change when the step moves on.

Either way:

- Gate on `!open`, never `!mounted`. `mounted` stays true through the whole exit, so `!mounted` freezes nothing.
- Freeze the children, not the animating element, which has to stay live for `data-ending-style` to land and the animation to run.

`grep -rn 'Freeze frozen' src/primitives` lists the current users.

## Reading direction

Read the direction with `useDirection()` from `src/primitives/direction-provider`, never from the DOM `dir` attribute or computed style. It returns `ltr` outside a `DirectionProvider`. Use `readingDirectionKeys(direction)` for the previous and next arrow keys, or pass `rtl: direction === 'rtl'` to `useComposite` or floating-ui's `useListNavigation` (`tabs/tabs-list.tsx`). `MosaicProvider` renders the `DirectionProvider` from its `direction` prop.

## Testing

Primitive tests run on happy-dom (the `primitives` project in `vitest.config.mts`), and `toHaveNoViolations` (axe) is registered in `src/primitives/test-utils/vitest.setup.ts`.
