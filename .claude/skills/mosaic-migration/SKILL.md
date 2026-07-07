---
name: mosaic-migration
description: >-
  Migrate a legacy / pre-Mosaic UI component into Mosaic. Use when moving a component
  from the old styled system into the machine / controller / view split, splitting a
  logic-heavy component into those three layers, or verifying migration parity so no
  behavior that lived implicitly in the legacy component is silently dropped. This is
  the end-to-end workflow; `mosaic-machine` covers authoring the machine and
  `references/mosaic-architecture.md` covers the layer contract.
---

# Migrating a component into Mosaic

Mosaic flow UI follows a **machine → controller → view** split (see
`references/mosaic-architecture.md` → "Flow and data architecture"). Migrating a
legacy component means taking logic that was fused into one file and pulling it
apart into those three layers.

**The core risk this skill exists to manage:** a legacy component fuses
rendering, data-fetching, and flow logic into one blob. Splitting it three ways
silently drops behavior that was only ever _implicit_ — a per-field error map, a
step-up reverification, an empty-state gate, a derived callout. None of it
surfaces as a failing test or a type error. It only surfaces when someone diffs
old against new. So the spine of this workflow is **treat the legacy component
as the spec, and prove the new layers cover every line of it.**

Do not write the machine first and then ask "did I get everything?" — that means
proving a negative. Invert it: enumerate the legacy behavior first, then make
each layer account for a specific row.

For authoring the machine itself (setup, states, guards, `invoke`, React
wiring), use the `mosaic-machine` skill. This skill is the surrounding workflow.

---

## Phase 1 — Inventory the legacy behavior (the spec)

Locate the legacy files (usually under `packages/ui/src/components/<Feature>/`).
Then grep them for the primitives that carry hidden, load-bearing logic. Every
hit is a row you must consciously place or drop later:

| Primitive                         | The behavior it usually hides                      |
| --------------------------------- | -------------------------------------------------- |
| `useEffect`                       | sync-on-load, reset-on-close, derived side effects |
| `handleError` / `card.setError`   | per-field error mapping                            |
| `useReverification`               | step-up reverification before a mutation           |
| `revalidate` / `.reload()`        | cache invalidation timing after a mutation         |
| `<Protect` / `checkAuthorization` | permission gating and section visibility           |
| `useCalloutLabel`                 | derived, computed labels / counts                  |
| `useFetch` / `useOrganization`    | data loading, pagination, loading/empty states     |
| `useInView`                       | infinite-scroll / intersection triggers            |

```bash
rg -n 'useEffect|handleError|card\.setError|useReverification|revalidate|<Protect|checkAuthorization|useCalloutLabel|useFetch|useInView' \
  packages/ui/src/components/<Feature>/
```

Turn the hits into a **behavior inventory** — one row per: effect, guard, error
path, empty/loading state, permission gate, revalidate, reset-on-close, derived
label. This list is finite and is the contract the migration must satisfy.

## Phase 2 — Design the split (map every row to a layer)

Assign each inventory row to exactly one layer. A row with no home is a behavior
you are about to drop.

- **machine** (`*.machine.ts`): pure flow rules — states, events, guards, async
  `invoke`, error transitions. No React hooks, no Clerk hooks, no Clerk resource
  objects. Author it with the `mosaic-machine` skill.
- **controller** (`*.controller.tsx`): the only layer that may touch Clerk.
  Reads Clerk hooks/resources, injects async effects into machine context,
  gates permissions, owns `revalidate` timing and first-page-load empty-state,
  derives view props.
- **view** (`*.view.tsx`): rendering only — receives a snapshot plus explicit
  props, renders UI, sends events. Derived booleans (`actor.can(...)`) come from
  the controller so the view never re-implements a guard.

## Phase 3 — Implement and test per layer

File shape: `<feature>.machine.ts` · `<feature>.controller.tsx` ·
`<feature>.view.tsx` · `<feature>.tsx` (thin composition wrapper).

Each layer is testable in isolation — that isolation is what makes the
migration verifiable:

- **machine**: drive `createActor → start → send` in plain JS; reach transient
  states with `mockActor`. No React, no Clerk fixtures.
- **view**: render directly with a fake snapshot and a fake `send`. No Clerk
  providers.
- **controller**: test against a mocked Clerk for the gating / `hidden` /
  empty-state logic. This is the **highest-risk, least-covered layer** — it
  holds the Clerk resource semantics that can't be proven by the pure machine
  tests. Concentrate scrutiny here.

## Phase 4 — Verify parity (the confidence step)

Machine and view tests only cover branches you remembered to write. To catch the
ones you didn't, run an automated diff of legacy against new.

Launch an **Explore subagent** with the prompt in
`references/parity-audit.md`. Give it the legacy file paths and the new
machine/controller/view paths. It returns a table classifying every legacy
behavior as:

- **Migrated** — points at a specific state / transition / context field.
- **Deliberately changed** — names the new behavior and why (e.g. infinite
  scroll → "Load more" button).
- **Deferred** — a real tracked ticket, **not** a `// TODO` buried in a machine
  file. A buried TODO is invisible at review time; that is exactly how the
  domains-section migration shipped three regressions.

Every inventory row from Phase 1 must land in exactly one bucket. The table is
**ephemeral**: it drives the work and the PR discussion, then is discarded. It is
not committed.

## Phase 5 — Ship

Tests green, then a changeset and a conventional commit. See the `clerk-monorepo`
skill for the dev loop and the hard rules. In short: `pnpm changeset` describing
the user-facing change, scope `ui`, and remember non-major `packages/ui` changes
load into older SDKs in the wild, so keep the public surface backwards
compatible.
