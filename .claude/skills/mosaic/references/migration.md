# Migrating a component into Mosaic

Migrating a legacy component means taking logic that was fused into one file and
pulling it apart into the model / controller / view layers (see the skill
overview and `references/mosaic-architecture.md` → "Flow and data architecture").
`packages/ui/src/mosaic/user-button/` is the fullest worked example of the
finished shape.

**The core risk this workflow exists to manage:** a legacy component fuses
rendering, data-fetching, and flow logic into one blob. Splitting it three ways
silently drops behavior that was only ever _implicit_ — a per-field error map, a
step-up reverification, an empty-state gate, a derived callout. None of it
surfaces as a failing test or a type error. It only surfaces when someone diffs
old against new. So the spine of this workflow is **treat the legacy component
as the spec, and prove the new layers cover every line of it.**

Do not write the new layers first and then ask "did I get everything?" — that
means proving a negative. Invert it: enumerate the legacy behavior first, then
make each layer account for a specific row.

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

- Clerk reads, mutations, permission gating, revalidate timing, first-page-load
  empty-state, capability flags → **model** (`models.md`).
- Interaction state: what is open, what is in flight, what closes the surface,
  and the flow rules behind it → **controller** (`controllers.md`). Whether it
  holds that in `useState` or a machine is a Phase 3 decision, not a Phase 2 one
  — the inventory rows are the same either way.
- Rendering and labels → **view** (`views.md`).

Two rows deserve extra care because they have no obvious home:

- **A capability the instance lacks** belongs in the model, expressed by omitting
  the callback — not as a `disabled` prop the view has to interpret.
- **Pure derivation** (slot layout, ordering a consumer's list) belongs in
  `*.layout.ts` / `*.utils.ts` beside the view, where it gets its own test.

## Phase 3 — Implement and test per layer

File shape: `<feature>.model.tsx` · `<feature>.controller.tsx` ·
`<feature>.view.tsx` · `<feature>.tsx` (composition wrapper), plus
`<feature>.types.ts` for the data contract the model and view share, and
`<feature>.messages.ts` for the strings.

Only now decide how the controller holds its state: the inventory tells you
whether the interaction has the async lifecycle and mutually-constraining values
that earn a machine, or whether it is `useState` (`controllers.md` → "Which one
holds the state").

Each layer is testable in isolation — that isolation is what makes the migration
verifiable. Follow the recipes in `testing.md`: the model against a mocked Clerk,
the controller against a fake model object, the view against plain props. The
**model** is the highest-risk, least-covered layer — concentrate scrutiny there.
Finish with one `*.integration.test.tsx` proving the layers compose.

## Phase 4 — Verify parity (the confidence step)

Machine and view tests only cover branches you remembered to write. To catch the
ones you didn't, run an automated diff of legacy against new.

Launch an **Explore subagent** with the prompt in `parity-audit.md`. Give it the
legacy file paths and the new model/controller/view paths. It returns a table
classifying every legacy behavior as:

- **Migrated** — points at a specific state / transition / context field.
- **Deliberately changed** — names the new behavior and why (e.g. infinite
  scroll → "Load more" button).
- **Deferred** — a real tracked ticket, **not** a `// TODO` buried in a
  controller or model. A buried TODO is invisible at review time; that is exactly
  how the domains-section migration shipped three regressions.

Every inventory row from Phase 1 must land in exactly one bucket. The table is
**ephemeral**: it drives the work and the PR discussion, then is discarded. It is
not committed.

## Phase 5 — Ship

Tests green, then a changeset and a conventional commit. See the `clerk-monorepo`
skill for the dev loop and the hard rules. In short: `pnpm changeset` describing
the user-facing change, scope `ui`, and remember non-major `packages/ui` changes
load into older SDKs in the wild, so keep the public surface backwards
compatible.
