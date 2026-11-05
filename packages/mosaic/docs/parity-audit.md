# Parity audit — Phase 4 reference

The parity audit is the confidence step of a Mosaic migration. It diffs the
legacy implementation and shared API contract against the new behavior,
including the helpers and Clerk runtime they call.

Use this workflow when the current task implements or reviews a Mosaic
migration or changes its migrated behavior. Do not start it for unrelated work
because the branch already contains Mosaic changes. Record the task's component
scope and exact legacy/new revisions before comparing. A renamed counterpart
still counts; a same-name match is only a discovery shortcut.
A shared-library task does not trigger this full workflow solely because Mosaic
is a downstream consumer.

- Classify every legacy behavior: each effect, guard, error path, empty or loading state, permission gate, revalidate or reload call, reset-on-close, derived label or count, and pagination trigger.
- Each one is **Migrated** (points at a state, transition, context field or prop in the new code), **Deliberately changed** (names the new behavior and why) or **Deferred** (not implemented; say whether a ticket tracks it).
- A Deferred item tracked only by a `// TODO` is a regression at risk of shipping. Surface it as a tracked item.

For a requested read-only parity review, name the current task's feature folders
explicitly from the repository root:

```bash
node scripts/mosaic-parity-gate.mjs review sign-out-button sign-up-button
```

This command prints scoped guidance without changing files or registering scope
for later requests. It does not run an audit. Use feature names from the request,
not every changed feature on the branch. A renamed or historical feature can be
named even when its folder is absent from the current checkout.

Edit hooks provide the same guidance for current feature paths. A style-only edit
does not require a behavioral audit. The reminder is conditional on changing
migrated behavior, and emits at most once per tool action. Shell-only edits and
read-only reviews without the explicit command have no automatic reminder.
There is no parity Stop hook or completion gate. Follow this workflow whenever
the current task calls for it, whether a reminder appeared or not.

Run it as a read-only subagent (Explore in Claude Code) that returns a
conclusion, not file dumps. Put its table under `## Parity audit` in
`tmp/mosaic-parity/<feature>.md`, next to the Phase 1 inventory. The table guides
the work and the PR discussion. `tmp/` is ignored by git, so nothing is committed.
A populated note proves neither parity nor execution of the checks. Inspect the
source citations and actual test results, and distinguish measured outcomes from
source-only conclusions and checks that could not run.

- For a migration with views, also compare each screen with the legacy screenshot from [Migration → Screens](migration.md#screens), and put the pairs in a Legacy / Mosaic table in the PR description. A behavior audit reads code; it misses a dropped identity preview or an error shown as plain text.

## The subagent prompt

Fill in the scope, revisions, and file lists and hand this to an Explore agent:

```
In the repo at <repo-root>, audit a Mosaic migration for behavioral parity.

CURRENT TASK: <requested Mosaic components/behavior; exclude unrelated branch changes>
REVISIONS: <legacy revision and new revision, including relevant working-tree changes>
ACCEPTED DIFFERENCES: <user decisions and explicit exclusions, or none>

LEGACY component files (the spec — behavior must be preserved or consciously changed):
  <absolute paths to the legacy component + its sub-forms/flows>

NEW Mosaic files (model / controller / view / wrapper):
  <absolute paths to the *.model.tsx, *.controller.tsx, *.view.tsx, *.tsx>

Read the shared public prop types, relevant callers, and Mosaic rules as well.
Follow calls into shared helpers and Clerk runtime until you can establish the
observable outcome. Do not stop at matching method names or argument objects.

Enumerate EVERY relevant behavior — each: prop and mode-dependent option, default,
callback order/awaiting, effect, guard, error path,
empty/loading state, permission gate, revalidate/reload call, reset-on-close,
derived label/count, pagination trigger. For each one, find where it lives in
the new implementation and classify it:

  - Preserved: same observable contract, with source and verification evidence.
  - Parity gap: introduced loss or incompatible contract; identify the failing condition.
  - Intentional difference: cite the user decision or Mosaic rule, and required disclosure.
    If intent is not established, mark Decision needed rather than inventing approval.
  - Verification gap: relevant outcome is untested or blocked; name the missing probe.
  - Optional improvement: inherited defect or refactor outside the migration contract.
    Keep it separate; do not require a fix to complete parity work.

For each in-scope action check success, pending, and a representative rejection.
Use the existing real-Clerk/fake-FAPI feature harness where it can exercise the
behavior. Assert final DOM, error delivery, resource state, and navigation as
relevant. A mock of the Clerk method cannot prove that method's runtime effects.
Use a controlled boundary failure for a wallet or external modal when the harness
cannot model it, and state what that leaves unverified.

Use focused type checks for mode-dependent contracts, including options accepted
but silently ignored. Verify runtime forwarding separately. Check loading both
before Clerk loads and after a failed mutation, since runtime state changes may
unmount the controller that owns the pending state or error.

For callbacks, record internal/consumer order, awaiting, and throw/rejection
behavior. Compare them with headless.md before demanding legacy ordering.
For redirects, exercise explicit URLs and omitted props with a non-default
provider setting; follow runtime defaults through to the navigation destination.

Quote ONLY the relevant branch from each file (the conditional, the effect, the
guard). Never dump whole files. Return the table below, gaps first. Include the
test command/case, expected and observed outcome, and any limitation. An existing
test that asserts only re-enablement does not verify error delivery or recovery.

Check differences against packages/mosaic/AGENTS.md and the relevant docs.
Use models.md for public contracts, controllers.md for error ownership,
headless.md for callback composition, and testing.md for test boundaries.
Quote the applicable rule and distinguish its requirement from your suggested
implementation. Lost errors require an observable error path; that does not
automatically require a new onError API or a particular message.
Raise unresolved rule conflicts and product choices with the user. A ticket,
TODO, or difference label does not resolve a parity gap or verification gap.
```

## Output table format

| Contract / condition                | Classification | Source evidence (legacy → new, types/rules/runtime)    | Verification (expected → observed; command/case) | Disclosure / decision / next step              |
| ----------------------------------- | -------------- | ------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------- |
| Rejected mutation delivers an error | Parity gap     | Legacy rejection → controller captures and drops error | Fake FAPI rejects; no observable error           | Restore an error path; API choice remains open |

List intentional differences in the PR description, including their consumer
impact. Keep optional improvements separate from required fixes. Record deferred
work with its approval and ticket without changing its underlying classification.

## Calibration: headless auth buttons (#10588)

At the originally reviewed commit `ecb1a5508614aad8614e74ba53554864afdfd824`:

- Trace rejected actions through `usePendingAction` to their observable error
  destination. Capturing an error and returning only `isPending` loses it.
- Compare `SignUpButtonProps` in shared types, not just `SignUpProps`. Check that
  `unsafeMetadata` is accepted only in modal mode and forwarded there.
- Exercise sign-out through fake FAPI, including rejection. Follow `clerk.signOut`
  state emission and `useUser` loading state; a method mock hides this path.
- Disclose async `onClick` behavior under `mergeProps(internal, consumer)`, initial
  fallback rendering, and the changed sign-out redirect default. The original
  review requested documentation for these, not restoration of legacy behavior.
- Inspect modal `appearance` support as an API difference. Establish the intended
  Mosaic contract before removing or restoring it.
- Do not require missing-MetaMask message mapping or sign-up continuation as
  parity fixes. Both limitations existed in the legacy button. Sharing the four
  buttons, deduplicating option lists, and the requested pending presentation are
  optional improvements unless a separately established contract requires them.

## Grep list (shared with Phase 1)

```bash
rg -n 'useEffect|handleError|card\.setError|useReverification|revalidate|<Protect|checkAuthorization|useCalloutLabel|useFetch|useInView' \
  packages/ui/src/components/<Feature>/ packages/react/src/components/<Feature>.tsx
```

## Worked example — `OrganizationProfileDomainsSection`

A historical example: the domains section was migrated before Mosaic became
its own package, and that code is not in `packages/mosaic` today. The audit
run against the finished migration surfaced three candidates for investigation,
each tracked only by a buried `// TODO`:

1. **Per-field error mapping.** Legacy `handleError(err, [field])` mapped errors
   to the specific field; the new add/verify flow collapses every failure to one
   `errorMessage` string in the controller's machine context.
2. **Step-up reverification on domain delete.** Legacy `RemoveDomainForm` left a
   TODO to wrap `domain.delete()` in `useReverification`; the new remove flow
   omits the step-up entirely.
3. **Pending-invitations callout.** Legacy `useCalloutLabel` computed a count
   from `totalPendingInvitations + totalPendingSuggestions`; the new view
   receives the counts but never renders the callout.

None of these failed a test or a typecheck. Establish the baseline contract before
classifying them. In particular, an unimplemented legacy reverification TODO
does not establish a regression. Require a fix only when the migration loses
behavior or violates an applicable rule. Record inherited improvements separately
and keep any approved deferral and ticket attached to its underlying finding.
