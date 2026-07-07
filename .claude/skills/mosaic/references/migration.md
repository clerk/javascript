# Migrating a component into Mosaic

Migrating a legacy component means taking logic that was fused into one file and
pulling it apart into the machine / controller / view layers (see the skill
overview and `references/mosaic-architecture.md` → "Flow and data architecture").

**The core risk this workflow exists to manage:** a legacy component fuses
rendering, data-fetching, and flow logic into one blob. Splitting it three ways
silently drops behavior that was only ever _implicit_ — a per-field error map, a
step-up reverification, an empty-state gate, a derived callout. None of it
surfaces as a failing test or a type error. It only surfaces when someone diffs
old against new. So the spine of this workflow is **treat the legacy component
as the spec, and prove the new layers cover every line of it.**

Do not write the machine first and then ask "did I get everything?" — that means
proving a negative. Invert it: enumerate the legacy behavior first, then make
each layer account for a specific row.

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

- Flow rules (states, events, guards, async `invoke`, error transitions) →
  **machine** (`machines.md`).
- Clerk reads, mutations, permission gating, revalidate timing, first-page-load
  empty-state → **controller** (`controllers.md`).
- Rendering, labels, derived booleans → **view** (`views.md`).

## Phase 3 — Implement and test per layer

File shape: `<feature>.machine.ts` · `<feature>.controller.tsx` ·
`<feature>.view.tsx` · `<feature>.tsx` (thin composition wrapper).

Each layer is testable in isolation — that isolation is what makes the migration
verifiable. Follow the testing recipe in each layer's reference: machine via
`createActor`/`mockActor` (no React, no Clerk), view via a fake snapshot + fake
`send`, controller against a mocked Clerk. The controller is the highest-risk,
least-covered layer — concentrate scrutiny there.

## Phase 4 — Verify parity (the confidence step)

Machine and view tests only cover branches you remembered to write. To catch the
ones you didn't, run an automated diff of legacy against new.

Launch an **Explore subagent** with the prompt in `parity-audit.md`. Give it the
legacy file paths and the new machine/controller/view paths. It returns a table
classifying every legacy behavior as:

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
