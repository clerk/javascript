# Parity audit

Read this when you implement or review a migration of a `packages/ui` or `packages/react` component, change behavior a migration moved, or open a migration PR. It covers how to run the audit, how to classify what it finds and how to report it; the migration itself is in [Migration](migration.md).

Worked example: [What it catches](#what-it-catches).

## Rules

- Audit the current task, not every Mosaic change on the branch. Record the features in scope and the legacy and new revisions before you compare. When you review earlier feedback, compare against the commit the reviewer saw.
- Classify every legacy behavior: each prop and mode-dependent option, default, callback order, effect, guard, error path, empty or loading state, permission gate, revalidate or reload call, reset-on-close, derived label or count, and pagination trigger. Follow shared prop types, helpers and Clerk runtime calls until the observable outcome is clear; matching method names is not parity.
- Each one is **Migrated** (points at a state, transition, context field or prop in the new code), **Deliberately changed** (names the new behavior and why) or **Deferred** (not implemented; say whether a ticket tracks it).
- A Migrated row cites the test or check that shows the behavior, not only the code that should produce it. A row with no such evidence is not Migrated yet; name the missing check.
- A Deliberately changed row cites the user's decision or the Mosaic rule behind it. If no one decided, mark it "decision needed"; do not infer intent from the code.
- A Deferred item tracked only by a `// TODO` is a regression at risk of shipping. Surface it as a tracked item.
- A defect the legacy component already had is not a parity row. List it below the table as an optional improvement.
- A difference that breaks a rule in [AGENTS.md](../AGENTS.md) or `docs/` is fixed or raised with the user, not shipped as intentional.
- An error the legacy component let reach the app, by a throw, a rejection or the console, stays observable. Losing it is a gap to fix, not a decision to ask about. Check that whatever owns the error still renders after the action fails: a failed sign-out can unmount its own button.
- For each async action in scope, check success, pending and a representative rejection through the feature's fake FAPI harness ([Testing](testing.md)). A mock of the Clerk method cannot prove that method's runtime effect.
- Run it as a read-only subagent that returns a conclusion, not file dumps. Put its table under `## Parity audit` in `tmp/mosaic-parity/<feature>.md`, beside the [Phase 1 inventory](migration.md#phase-1-inventory-the-legacy-behavior). `tmp/` is ignored by git, so nothing is committed.
- A filled table is not proof. Read the results of the checks it cites before you claim parity.
- List every Deliberately changed and Deferred row in the PR description, with its effect on consumers.

- For a migration with views, also compare each screen with the legacy screenshot from [Migration → Screens](migration.md#screens), and put the pairs in a Legacy / Mosaic table in the PR description. A behavior audit reads code; it misses a dropped identity preview or an error shown as plain text.

## The subagent prompt

Fill in the blanks and hand this to a read-only agent:

```
In the repo at <repo-root>, audit a Mosaic migration for behavioral parity.

CURRENT TASK: <requested features or behavior; exclude unrelated branch changes>
REVISIONS: <legacy revision and new revision, including working-tree changes>
ACCEPTED DIFFERENCES: <user decisions and explicit exclusions, or none>

LEGACY component files (the spec — behavior must be preserved or consciously changed):
  <absolute paths to the legacy component + its sub-forms/flows>

NEW Mosaic files (model / controller / view / wrapper):
  <absolute paths to the *.model.tsx, *.controller.tsx, *.view.tsx, *.tsx>

Follow packages/mosaic/docs/parity-audit.md → Rules. Enumerate every behavior
it lists, find where each lives in the new files, and classify it. Read the
shared prop types and follow helpers and Clerk runtime calls to the observable
outcome. For callbacks, compare order and awaiting with docs/headless.md before
demanding legacy order. For redirects, check explicit URLs and omitted props
with a non-default provider setting.

Quote ONLY the relevant branch from each file (the conditional, the effect, the
guard). Never dump whole files. Return the table below, most severe gaps first,
with the test command or case behind each Migrated row. Then list Deferred
items tracked only by a `// TODO`, legacy defects as optional improvements, and
every row that breaks a rule in packages/mosaic/AGENTS.md or
packages/mosaic/docs/, quoting the rule.
```

To find the legacy behaviors, start from the search in [Migration → Phase 1](migration.md#phase-1-inventory-the-legacy-behavior).

For a read-only review, `node scripts/mosaic-parity-gate.mjs review <feature> [feature ...]` prints the same reminder the edit hooks give. It does not run the audit.

## Output

| Legacy behavior                                         | Layer it should live in | Status                      | Evidence (legacy → new)                                                    |
| ------------------------------------------------------- | ----------------------- | --------------------------- | -------------------------------------------------------------------------- |
| Per-field error mapping via `handleError(err, [field])` | controller/view         | Deferred (only a `// TODO`) | `AddDomainForm.tsx` handleError → `*.controller.tsx` single `errorMessage` |

## What it catches

An audit of the organization domains section, migrated before Mosaic was its own package (that code is not in `packages/mosaic`), found three dropped behaviors, each tracked only by a `// TODO` and none failing a test or typecheck:

1. Per-field error mapping: every add or verify failure collapsed to one `errorMessage`.
2. Step-up reverification on domain delete was omitted.
3. The pending-invitations callout count reached the view but was never rendered.

An audit of the headless auth buttons (#10588) found a rejected action whose error `usePendingAction` captured but nothing showed, an `unsafeMetadata` option the shared props type allows only in modal mode, and a sign-out path a method mock hid from the test. It also found missing MetaMask error mapping, which the legacy button lacked too; that is an optional improvement, not a parity row.
