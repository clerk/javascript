# Migration

Read this when you move a legacy component (under `packages/ui/src/components/<Feature>/` or `packages/react/src/components/`) into Mosaic, including a headless port framed as a new feature, whether its flow logic or only its styles. It covers the five phases from inventory to ship; the finished shape is in [Features](features.md), and the parity check is in [Parity audit](parity-audit.md).

Worked example: `src/features/reverification/`.

## Rules

- The legacy component is the spec. A legacy file fuses rendering, data fetching and flow logic, and splitting it three ways drops behavior that was only implicit (a per-field error map, a step-up reverification, an empty-state gate, a derived callout) without failing a test or a type check.
- Inventory the legacy behavior first, then make each layer account for a row. Do not write the layers first and ask what you missed.
- Apply this workflow to the current task, not every Mosaic change already on the branch.
- Write the inventory to `tmp/mosaic-parity/<feature>.md` before the model, with the legacy path and the features in scope. Run the [Parity audit](parity-audit.md) into the same file before you call the work done, review it or open a PR.
- Every inventory row lands in exactly one layer, and later in exactly one parity bucket. A row with no home is a behavior you are about to drop.
- A deferred behavior gets a tracked ticket, never a buried `// TODO`.
- Share a business-rule helper when legacy and Mosaic must behave the same. Do not extract similar presentation code only to remove duplication, since the designs may diverge.
- A component with no data or flow logic only needs its styles moved ([Styles](#styles)).

## Phase 1: inventory the legacy behavior

Locate the legacy files: the prebuilt component under `packages/ui/src/components/<Feature>/`, the `@clerk/react` component under `packages/react/src/components/`, or both. Grep them for the primitives that carry hidden logic. Every hit is a row you must place or consciously drop:

| Primitive                         | The behavior it usually hides                      |
| --------------------------------- | -------------------------------------------------- |
| `useEffect`                       | sync-on-load, reset-on-close, derived side effects |
| `handleError` / `card.setError`   | per-field error mapping                            |
| `useReverification`               | step-up reverification before a mutation           |
| `revalidate` / `.reload()`        | cache invalidation timing after a mutation         |
| `<Protect` / `checkAuthorization` | permission gating and section visibility           |
| `useCalloutLabel`                 | derived, computed labels or counts                 |
| `useFetch` / `useOrganization`    | data loading, pagination, loading and empty states |
| `useInView`                       | infinite-scroll or intersection triggers           |

```bash
rg -n 'useEffect|handleError|card\.setError|useReverification|revalidate|<Protect|checkAuthorization|useCalloutLabel|useFetch|useOrganization|\.reload\(|useInView' \
  packages/ui/src/components/<Feature>/ packages/react/src/components/<Feature>.tsx
```

Turn the hits into a behavior inventory, one row per effect, guard, error path, empty or loading state, permission gate, revalidate, reset-on-close and derived label. The table does not cover every behavior; read the files too. For shared answers (`save`, `useReverificationFlow`), use [Reuse before you write](../AGENTS.md#reuse-before-you-write).

Include shared prop types and mode-dependent options, defaults, callback order and error delivery; the full list is in [Parity audit → Rules](parity-audit.md#rules). Write the inventory to `tmp/mosaic-parity/<feature>.md`:

```md
# checkout-button parity

Legacy: packages/react/src/components/CheckoutButton.tsx

## Inventory

- `for="organization"` throws without an active organization
- …
```

### Screens

Before you build a view, screenshot each legacy screen it replaces and list what the screen shows: each header line (title, description, identity preview), alerts, the primary and secondary actions, fallback links such as "Get help", and what the actions do while a request runs. Build against that list.

To reach a screen that needs a server state, run the legacy sandbox (`pnpm dev:sandbox`, `packages/clerk-js/sandbox/README.md`) with a scenario from `packages/clerk-js/sandbox/scenarios/` that mocks the response with `@clerk/msw`, then activate it with `scenario.setScenario('<Name>')`.

For each screen, decide whether it is its own step or a state of another one. A failure the user can recover from on the same screen is an error state of that step, not a step: legacy shows a lockout as a banner on the sign-in start screen, so Mosaic does too. If the flow has a design doc in `docs/internals/`, check it before you add a step the doc has no route for.

## Phase 2: map every row to a layer

- Clerk reads, mutations, permission gates, revalidate timing, first-load empty states and capability flags go in the **model** ([Models](models.md)).
- What is open, what is in flight, what closes the surface and the flow rules behind it go in the **controller** ([Controllers](controllers.md)). Whether it holds them in `useState` or a machine is a Phase 3 decision; the rows are the same either way.
- Rendering and labels go in the **view** ([Views](views.md)).

Two rows have no obvious home:

- A capability the instance lacks goes in the model, by omitting the callback, not as a `disabled` prop the view interprets.
- Pure derivation (slot layout, ordering a consumer's list) goes in `*.layout.ts` or `*.utils.ts` beside the view, with its own test.

For pagination and derived callouts, read an existing feature that has them before choosing an implementation.

## Phase 3: implement and test

Lay the files out as in [Features → File shape](features.md#file-shape). Now decide how the controller holds its state, using what the inventory says about async lifecycles and values that constrain each other ([Controllers → Which one holds the state](controllers.md#which-one-holds-the-state)).

Test with one `*.feature.test.tsx` that uses the feature the way a user would ([Testing](testing.md)). Turn each inventory row into a test there by default. The model is the highest-risk layer, so its rows (revalidation, permission gates, empty states) each get one.

## Phase 4: verify parity

Tests cover only the branches you remembered. Run the [Parity audit](parity-audit.md) against the legacy files and the new layers, and place every Phase 1 row as Migrated, Deliberately changed (such as infinite scroll becoming a "Load more" button) or Deferred, under `## Parity audit` in `tmp/mosaic-parity/<feature>.md`.

## Phase 5: ship

Tests green, then a changeset and a conventional commit with scope `mosaic` (the `clerk-monorepo` skill has the dev loop and changeset rules). If the migration removes or changes legacy code in `packages/ui`, keep its public surface backwards compatible: non-major `packages/ui` releases load into older SDKs in the wild.

## Styles

Nothing in the styling layer is shared between the two systems:

| Concern          | Legacy (`@clerk/ui`)                         | Mosaic                                     |
| ---------------- | -------------------------------------------- | ------------------------------------------ |
| Engine           | Emotion, runtime CSS-in-JS                   | StyleX, static CSS                         |
| Tokens           | `InternalTheme`                              | `--cl-*` custom properties                 |
| Variants         | `createVariants`                             | `stylex.create` with `themeProps`          |
| Styling contract | `customizables` / `APPEARANCE_KEYS` registry | `.cl-<slot>` class and `data-<axis>` attrs |

To move a component's styles from the old system to Mosaic:

1. Replace `createVariants` with `stylex.create`: one style key per variant value, selected by the prop at render time instead of merged by a runtime engine.
2. Replace `applyVariants(props)` with `mergeStyleProps(themeProps(slot, variants), stylex.props(..., xstyle), rest)` and spread the result onto the element. Drop any `className` or `style` props the legacy component took; callers pass `xstyle`.
3. Move stateful styling (disabled, hover, focus, invalid) into StyleX conditions: a key inside the property's value object beside `default`, with an attribute on the element itself wrapped in `:where(...)`: `cursor: { default: 'pointer', ':where([data-disabled])': 'not-allowed' }`.
4. Update token references, such as `theme.colors.$primary500` to `colorVars['--cl-color-brand']`.
5. Export the component from `src/styles/index.ts` and run `pnpm build` in `packages/mosaic`.

The rules behind these steps are in [StyleX](stylex.md) and [Theming](theming.md).
