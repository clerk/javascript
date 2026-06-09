# Headless Primitive Review Checklist

Patterns captured from Frederick's (`@Ephem`) review of the Dialog PR (#8474) and the
follow-up applied to Accordion (commit `ca1985ab4f`). Run every new/changed primitive through
this list. The merged **Dialog** and **Accordion** primitives are the reference implementations
— when in doubt, match them.

Reference files:

- `src/primitives/dialog/dialog-trigger.tsx`, `dialog-popup.tsx` — consumer ref merge.
- `src/primitives/dialog/dialog-root.tsx`, `dialog-context.ts`, `dialog-title.tsx` — SSR id hoist.
- `src/primitives/accordion/accordion-trigger.tsx`, `accordion-panel.tsx` — wired-id pinning.

---

## 1. Merge the consumer ref

Any part with an internal ref (transition/measurement ref, or a floating-ui `refs.setReference`
/ `refs.setFloating`) must merge a consumer-supplied `ref` instead of clobbering it. Use
`useMergeRefs` from `@floating-ui/react`. floating-ui types `setReference`/`setFloating` as
methods, so the `unbound-method` lint is a false positive here — disable it inline exactly as
Dialog does:

```tsx
import { useMergeRefs } from '@floating-ui/react';

const { render, ref: consumerRef, ...otherProps } = props;
const { refs } = useXContext();

// floating-ui types `setReference` as a method signature, but at runtime it's
// a stable callback that doesn't use `this`, so the unbound-method check is a
// false positive here.
// eslint-disable-next-line @typescript-eslint/unbound-method
const combinedRef = useMergeRefs([refs.setReference, consumerRef]);
// ...defaultProps: { ref: combinedRef }
```

For a part with its own measurement ref (e.g. a collapsible/accordion panel):
`useMergeRefs([panelRef, consumerRef])` (no eslint-disable needed for a plain `useRef`).

## 2. Protect wired ids

When the primitive wires ids into an aria pairing (`id` ⇄ `aria-controls` / `aria-labelledby`
/ `aria-describedby`), a consumer-supplied `id` must not silently break it. Re-pin after merge:

```tsx
const merged = mergeProps<'button'>(defaultProps, otherProps);
// The wired id is owned by the primitive: a consumer-supplied id must not
// override it, or the aria pairing would silently break.
merged.id = wiredId;
// ...props: merged
```

## 3. SSR-safe id hoisting

Generate ids with `useId()` **at the Root**, pass them down via context, and consume them
directly in subcomponents. Do **not** generate a local `useId()` in a subcomponent and register
it back to the root via a layout effect (the original Dialog.Title anti-pattern). The labelling
subcomponent should `Omit` `id` from its public props so it can't be overridden:

```tsx
// root: const labelId = useId();  → context
// title: export type XTitleProps = Omit<ComponentProps<'h2'>, 'id'>;
//        defaultProps = { id: labelId };   // wired unconditionally, no layout effect
```

Primitives whose ids are already deterministically derived from a root `useId()` + a consumer
`value` (e.g. Tabs `${tabsId}-tab-${value}`) already satisfy this — just re-pin per #2.

## 4. Lint cleanups (match Accordion's merged diff)

- `export interface XProps extends ComponentProps<'t'> {}` → `export type XProps = ComponentProps<'t'>`
  (`no-empty-object-type`).
- Drop non-null assertions on `renderElement({...})!` → `renderElement({...})`; and refactor
  `arr[i]!.foo` to a null-checked local const (`no-non-null-assertion`).
- Curly braces on single-line `if`; blank line between third-party and local imports
  (autofix: `eslint src --fix`).
- No unused vars/args — drop unused `event` params and unused test bindings.

## 5. Tree-shaking

Per-file parts, `export * as X from './parts'`, package `"sideEffects": false`, and a matching
`exports` entry + `vite.config.ts` lib entry. Verify each `index.ts` / `parts.ts`.

## 6. No changeset for a private package

`@clerk/headless` is `private`. Frederick: _"Headless package isn't public, so I don't think it
needs a changeset."_ The repo still requires one → use an **empty** changeset (`pnpm changeset:empty`).

## 7. Per-primitive aria test

Add a test proving a consumer-supplied `id` on the labelling/controlling part does **not** break
the `aria-controls` / `aria-labelledby` (/ `aria-describedby`) pairing. Mirror the Accordion test
added in `ca1985ab4f`.

---

## Per-primitive status

| Primitive    | 1 ref merge | 2 wired id | 3 id hoist | 4 lint | 7 aria test |
| ------------ | :---------: | :--------: | :--------: | :----: | :---------: |
| Dialog       |     ✅      |     ✅     |     ✅     |   ✅   |     ✅      |
| Accordion    |     ✅      |     ✅     |    n/a¹    |   ✅   |     ✅      |
| Tabs         |     ✅      |     ✅     |    ✅²     |   ✅   |     ✅      |
| Tooltip      |     ✅      |    ✅³     |    n/a³    |   ✅   |     ✅      |
| Popover      |     ✅      |     ✅     |     ✅     |   ✅   |     ✅      |
| Select       |     ✅      |    ✅³     |    n/a³    |   ✅   |     ✅      |
| Menu         |     ✅      |    ✅³     |    n/a³    |   ✅   |     ✅      |
| Autocomplete |     ✅      |    ✅³     |    n/a³    |   ✅   |     ✅      |
| Collapsible  |     ✅      |     ✅     |    ✅⁴     |   ✅   |     ✅      |

¹ Accordion ids are derived deterministically from item `value` — no subcomponent registration.
² Tabs ids are `${tabsId}-tab-${value}` derived from a root `useId()` — already SSR-safe.
³ Tooltip/Select/Menu/Autocomplete ids are owned by floating-ui (`useRole`); the wired id is
re-pinned after merge so a consumer `id` can't override it, and there is no local-`useId`
registration to hoist.
⁴ Collapsible ids are derived deterministically from a single root `useId()` — already SSR-safe.
