# Parity audit — Phase 4 reference

The parity audit is the confidence step of a Mosaic migration. It diffs the
legacy component against the new machine/controller/view and classifies every
legacy behavior, so behavior that lived implicitly in the old blob can't be
silently dropped.

Run it as an **Explore subagent** (read-only, returns a conclusion, not file
dumps). It is **ephemeral** — the table guides the work and the PR discussion,
then is discarded. Nothing is committed.

## The subagent prompt

Fill in the two file lists and hand this to an Explore agent:

```
In the repo at <repo-root>, audit a Mosaic migration for behavioral parity.

LEGACY component files (the spec — behavior must be preserved or consciously changed):
  <absolute paths to the legacy component + its sub-forms/flows>

NEW Mosaic files (machine / controller / view / wrapper):
  <absolute paths to the *.machine.ts, *.controller.tsx, *.view.tsx, *.tsx>

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
```

## Output table format

| Legacy behavior                                         | Layer it should live in | Status                      | Evidence (legacy → new)                                                           |
| ------------------------------------------------------- | ----------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| Per-field error mapping via `handleError(err, [field])` | machine/view            | Deferred (only a `// TODO`) | `AddDomainForm.tsx` handleError → `*-add-verify.machine.ts` single `errorMessage` |

`Status` is one of: **Migrated** · **Deliberately changed** · **Deferred**.

## Grep list (shared with Phase 1)

```bash
rg -n 'useEffect|handleError|card\.setError|useReverification|revalidate|<Protect|checkAuthorization|useCalloutLabel|useFetch|useInView' \
  packages/ui/src/components/<Feature>/
```

## Worked example — `OrganizationProfileDomainsSection`

The audit run against the finished domains migration surfaced three behaviors
that the machine/controller/view split dropped, each tracked only by a buried
`// TODO` (i.e. invisible at review time):

1. **Per-field error mapping.** Legacy `handleError(err, [field])` mapped errors
   to the specific field; the new add/verify machine collapses every failure to
   one `errorMessage` string in context.
2. **Step-up reverification on domain delete.** Legacy `RemoveDomainForm` left a
   TODO to wrap `domain.delete()` in `useReverification`; the new remove machine
   omits the step-up entirely.
3. **Pending-invitations callout.** Legacy `useCalloutLabel` computed a count
   from `totalPendingInvitations + totalPendingSuggestions`; the new view
   receives the counts but never renders the callout.

None of these failed a test or a typecheck. They are exactly the class of
regression this audit exists to catch — surface them as tracked Deferred items,
not `// TODO`s.
