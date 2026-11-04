# Parity audit

Read this when you review whether a migrated feature kept every legacy behavior, or before you open a migration PR. It covers how to run the audit and how to report it; the migration itself is in [Migration](migration.md).

## Rules

- Classify every legacy behavior: each effect, guard, error path, empty or loading state, permission gate, revalidate or reload call, reset-on-close, derived label or count, and pagination trigger.
- Each one is **Migrated** (points at a state, transition, context field or prop in the new code), **Deliberately changed** (names the new behavior and why) or **Deferred** (not implemented; say whether a ticket tracks it).
- A Deferred item tracked only by a `// TODO` is a regression at risk of shipping. Surface it as a tracked item.
- Run it as a read-only subagent that returns a conclusion, not file dumps. Put its table under `## Parity audit` in `tmp/mosaic-parity/<feature>.md`, next to the Phase 1 inventory. The table guides the work and the PR discussion; nothing is committed.

## The subagent prompt

Fill in the two file lists and hand this to a read-only agent:

```
In the repo at <repo-root>, audit a Mosaic migration for behavioral parity.

LEGACY component files (the spec — behavior must be preserved or consciously changed):
  <absolute paths to the legacy component + its sub-forms/flows>

NEW Mosaic files (model / controller / view / wrapper):
  <absolute paths to the *.model.tsx, *.controller.tsx, *.view.tsx, *.tsx>

Enumerate EVERY behavior in the legacy files — each: effect, guard, error path,
empty/loading state, permission gate, revalidate/reload call, reset-on-close,
derived label/count, pagination trigger. For each one, find where it lives in
the new files and classify it:

  - Migrated            → points at a specific new state / transition / context field / prop
  - Deliberately changed → the new behavior differs on purpose; name the new behavior and why
  - Deferred            → not implemented in the new code; note whether a tracked ticket exists
                           or it is only a buried `// TODO`

Quote ONLY the relevant branch from each file (the conditional, the effect, the
guard). Never dump whole files. Return the result as the table below, most
severe gaps first, then a short list of any Deferred items that are tracked only
by a `// TODO` (these are the regressions at risk of shipping).

Then check every row that is not Migrated against packages/mosaic/AGENTS.md and
packages/mosaic/docs/. List each one that breaks a rule there, with the rule it
breaks, such as a failure that is never shown or logged. These must be fixed or
raised with the user; they cannot ship as Deliberately changed.
```

To find the legacy behaviors, start from the search in [Migration → Phase 1](migration.md#phase-1-inventory-the-legacy-behavior).

## Output

| Legacy behavior                                         | Layer it should live in | Status                      | Evidence (legacy → new)                                                    |
| ------------------------------------------------------- | ----------------------- | --------------------------- | -------------------------------------------------------------------------- |
| Per-field error mapping via `handleError(err, [field])` | controller/view         | Deferred (only a `// TODO`) | `AddDomainForm.tsx` handleError → `*.controller.tsx` single `errorMessage` |

## What it catches

An audit of the organization domains section, migrated before Mosaic was its own package (that code is not in `packages/mosaic`), found three dropped behaviors, each tracked only by a `// TODO` and none failing a test or typecheck:

1. Per-field error mapping: every add or verify failure collapsed to one `errorMessage`.
2. Step-up reverification on domain delete was omitted.
3. The pending-invitations callout count reached the view but was never rendered.
