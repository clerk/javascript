# AGENTS.md — `@clerk/mosaic`

Mosaic is Clerk's next-generation component library. These rules apply to everything under `packages/mosaic`, on top of the repo-root `AGENTS.md`.

This file holds the rules every change follows. `docs/` holds one guide per task; each opens with a "Read this when" line that matches its line below.

Every line under a `## Rules` heading is a requirement. To break one, ask first ([When nothing fits](#when-nothing-fits-ask-first)). "Prefer" marks a default you may leave with a reason in the PR.

## Principles

1. **Clerk stops at the model.** Everything past it is plain data and plain functions, so controllers and views are tested without Clerk.
2. **Reuse, then ask.** A shared answer beats a local one, and a missing one is a question for the user, not a one-off.
3. **One owner per concern.** Busy state, error copy, strings, tokens and each rule in these docs have one home; everything else derives from it or links to it.
4. **Test what the user sees.** A flow is tested from FAPI in to the screen out, once, at the boundary that owns the behavior.

## Scope of a change

The docs describe the Mosaic we are building toward. Code that differs from them is out of date, not precedent, so do not copy it.

- The rules apply to everything your change adds or rewrites.
- Code you touch but do not rewrite may predate a rule. Fix it when the fix is small, and name what you left in the PR.
- If code or a test contradicts a rule in these docs, stop and ask which one is right, and fix the loser in the same PR.

## Task guides

Read every line that matches your task. Paths below are relative to this package.

- Add a feature, or a file to one → [Features](docs/features.md), then the guide for each layer below. If the repo's `packages/ui` has a legacy version, [Migration](docs/migration.md) first
- Write or change a model, or add a Clerk read, mutation or permission check → [Models](docs/models.md)
- Build a feature from a design before Clerk's API can back it → [Models → Before the API exists](docs/models.md#before-the-api-exists)
- Write or change a controller, or how a feature handles pending state, errors, dialogs or removal focus → [Controllers](docs/controllers.md)
- Write or debug a state machine → [Controllers → Machines](docs/controllers.md#machines), then [Machine runtime](src/machine/README.md)
- Build a flow with several steps on one surface → [Controllers → Multi-step flows](docs/controllers.md#multi-step-flows), then [Views → Moving between screens](docs/views.md#moving-between-screens-on-one-surface)
- Write or change a view, a dialog or step it renders, or a feature's copy → [Views](docs/views.md)
- Add a styled component, or change a token, a `.cl-<slot>` class or `data-<axis>` attribute, `MosaicProvider`, or the CSS build → [Theming](docs/theming.md)
- Write or change a `*.styles.ts` or `*.stylex.ts` file → [StyleX](docs/stylex.md)
- Add or change a transition, a hover or press color change, or reduced-motion handling → [Motion](docs/motion.md)
- Add or change a loading skeleton → [Skeletons](docs/skeletons.md)
- Write or change a headless primitive under `src/primitives/` → [Headless primitives](docs/headless.md)
- Add or rename a public prop that shows, hides or configures part of a component → [Public visibility props](docs/public-props.md)
- Write, move or review a test → [Testing](docs/testing.md)
- Fix or silence a lint error → [Lint](docs/lint.md)
- Move a legacy component's logic or styles into Mosaic → [Migration](docs/migration.md)
- Check that a migration kept every legacy behavior → [Parity audit](docs/parity-audit.md)
- Add or change a component's Swingset page → [Documenting components](docs/documenting-components.md)
- Prove a change in a browser → [verify-mosaic](.claude/skills/verify-mosaic/SKILL.md)
- Remove or rename a public export, prop, `--cl-*` token or styling hook, or change a public type or default → [Breaking changes](docs/breaking-changes.md)
- Review a Mosaic change → [Reuse before you write](#reuse-before-you-write), [Shaping a fix](#shaping-a-fix), and the lines for what the change touches
- Change these docs, `.claude/rules/` or the verify-mosaic skill → [Writing docs](docs/writing-docs.md)

## Before editing a file

Before you change a file that matches a pattern below, read its guide, even for a one-line change.

- `src/**/*.styles.ts`, `src/**/*.stylex.ts` → [StyleX](docs/stylex.md)
- `src/**/*.model.ts(x)` → [Models](docs/models.md)
- `src/**/*.controller.ts(x)` → [Controllers](docs/controllers.md)
- `src/**/*.view.tsx` → [Views](docs/views.md)
- `src/**/__tests__/**`, `src/**/*.test.ts(x)`, `src/**/*.test-d.ts` → [Testing](docs/testing.md)

## Ports of legacy components are migrations

For a current task that implements or reviews a Mosaic migration, or changes its migrated behavior, search `packages/react/src/components/` and `packages/ui/src/components/` for the counterpart. A headless port framed as a new feature is a [migration](docs/migration.md) too. Unrelated work does not acquire this workflow merely because the branch already contains Mosaic changes.

1. Read the counterpart, shared prop types, and relevant helper/runtime calls. Write the Phase 1 inventory to `tmp/mosaic-parity/<feature>.md` before the model. Record the task scope, exact revisions, accepted differences, and exclusions alongside the legacy path and `## Inventory` section.
2. Before you call the work done, review it, or open a PR, run the [parity audit](docs/parity-audit.md) in a read-only subagent and put its table under `## Parity audit` in the same file. Reading the doc is not running the audit.
3. Use the audit's classifications to separate parity gaps, intentional differences needing disclosure, missing verification, and optional improvements. List intentional differences and approved deferrals in the PR description. Do not require inherited improvements or refactors as parity fixes.
4. Listing a difference does not make it acceptable. Cite any conflicting rule in this file or `docs/`, and fix the gap or raise it with the user. Do not infer intentional behavior from the implementation. Preserve decisions the user already made, and leave unresolved product choices open.
5. Inspect the actual results of focused type and behavior checks. For relevant async actions, include a representative failure through the existing fake FAPI or supported browser setup. A populated note is process bookkeeping, not proof of parity.

`tmp/` is ignored by git, so the file stays out of the PR. The hooks in `.claude/settings.json` and `.codex/hooks.json` (`scripts/mosaic-parity-gate.mjs`) give conditional guidance for the feature paths in the current edit. They do not inspect branch history or notes, deny edits, or block completion. For a read-only parity review, run the explicit scoped command in [Parity audit](docs/parity-audit.md). These reminders do not run the audit or verify its evidence.

## Layers in one paragraph

A flow lives in `src/features/<feature>/`. The **model** (`*.model.ts(x)`) is the only file that reads Clerk hooks or calls Clerk resources, and answers with plain data, plain callbacks and a `status`. The **controller** (`*.controller.ts(x)`) holds local state and wraps the model's callbacks for pending, errors and closing. The **view** (`*.view.tsx`) renders plain props. No Clerk resource reaches the controller and no machine snapshot reaches the view. The file shape and how a wrapper composes the layers are in [Features](docs/features.md).

## Reuse before you write

Most problems a feature hits already have a shared answer. Find the line for your problem and use it. Do not write a local version, even a small one. A PR that adds, renames or changes the signature of a shared helper in `src/hooks/`, `src/utils/`, `src/blocks/`, `src/components/form/` or `src/machine/` updates this list, and any doc that names it, in the same PR.

- An async action from a button or row: pending, an error, one lock → `usePendingAction` (`src/hooks/`)
- A form: values, validation, submit, field errors, success UI → `useForm` (`src/components/form/`), with `validateAsync` for server checks and `onSuccess` for mounted success UI
- A `<form>` element, without the browser's validation popup → `Form` (`src/primitives/form/`)
- A model save whose Clerk errors should land on form fields → `save` (`src/utils/errors.ts`) in the model, or reject with `FormSubmitError`
- A confirm step before an action → `useConfirmController` (`src/blocks/confirm/`) with `Confirmation` (`src/blocks/confirmation/`)
- A delete that needs the user to type a phrase → `useConfirmController` (`src/blocks/confirm/`) with `Destructive` (`src/blocks/destructive/`)
- An action that may need step-up verification → `useReverificationFlow` (`src/features/reverification/`) in the model, passed to `useConfirmController`
- A direct action that needs step-up verification → `useReverificationFlow` in the model, with `ReverificationDialog` (`src/blocks/reverification/`) in the view
- Showing any error to the user → One of the owners above. They call `toLocalizableError` (or `toLocalizableErrors` for all errors) and resolve copy with `useErrorText`
- Moving focus after a list row is removed → `useListRemovalFocus` (`src/hooks/`)
- A debounced, abortable async check as the user types → `useDebouncedAsync` (`src/hooks/`)
- A spinner that should not flash or flicker → `useSpinDelay` (`src/hooks/`)
- A placeholder for content that is still loading → `Skeleton` (`src/components/skeleton/`), see [Skeletons](docs/skeletons.md)
- A date shown to the user → `formatDate` (`src/utils/format-date.ts`)
- Any current time read during render → `useNow` (`src/hooks/`), with `until` to stop ticking at a deadline
- An inline message row; height is undefined until measured → `useHeldMessage`, `useMessageHeight`, `FeedbackBody` (`src/utils/feedback.tsx`) + `src/styles/feedback.styles.ts`
- Data read from a Clerk resource that should be cached across mounts → A query hook in `src/queries/`, called from the model (`src/queries/use-user-sessions-query.ts`)
- The seconds left on a resend cooldown, for display → `useResendSeconds` (`src/hooks/`), from a `resendAvailableAt` time kept in the machine
- An avatar or logo row: picker, drop target, Upload button or manage menu → `AvatarUpload` (`src/blocks/avatar-upload/`), laid out by the caller
- Any other file picker or drop zone, such as a metadata or key file → `FileUpload` (`src/primitives/file-upload/`), see its `README.md`
- An inline notice inside content: info, warning, error or success → `Banner` (`src/components/banner/`); a form-level error on a card uses `Card.Banner`
- Siblings that slide when an item is added or removed → `useLayoutAnimation` (`src/primitives/hooks/`)
- An input that reformats as the user types without moving the caret → `useFormattedInput` (`src/primitives/hooks/`)
- Arrow-key navigation with one tab stop across a group of items → `useComposite`, with `useCompositeItems` and `useCompositeItem` (`src/primitives/hooks/`)
- A panel that animates open and closed to its measured size → `usePanelSize` (`src/primitives/hooks/`)
- One screen replacing another on the same card or dialog → `Flow` (`src/components/flow/`), see [Views](docs/views.md)
- An interaction with an async lifecycle or two values that move together → A machine in the controller file, via `setup()` (`src/machine/`)
- Styles several components share → `src/styles/*.styles.ts`
- Anything else small: a permission, verification codes, backup codes, avatar files, a list patch → List `src/utils/`, `src/hooks/` and `src/primitives/hooks/` first; most of these already have a helper

## Signs you are about to invent a pattern

Stop and check the list above if you are writing any of these in a feature:

- `try`/`catch` around a Clerk call in a controller or view
- `useState` for a pending flag, or for "which row is busy"
- `error.message` rendered to the user, or a hard-coded error string
- a ref map of buttons to restore focus after a removal
- `setTimeout` to debounce or to delay a spinner
- `stylex.create` inside a `.tsx` file
- a conditional or early return that swaps one screen for another on the same card or dialog
- `Card.Root` in a screen or a `*Steps` component
- a value check, `preventDefault` or `useId` for a form in a view

The form rule applies when you add or rewrite a form. Some existing forms predate it.

## When nothing fits: ask first

If no line fits, or a shared helper almost fits but would need a change, **stop and ask the user before writing code**. Say:

1. the problem, in one sentence
2. which shared helpers you checked and why each does not fit
3. the shape you propose: a new shared helper, a change to an existing one, or a one-off in the feature

Do not solve it locally and mention it at the end. A one-off that duplicates a shared helper is the thing this rule exists to prevent.

## Shaping a fix

A bug in a feature is often a gap in a shared helper. These rules apply to `fix` PRs as much as to features.

- **Fix the owner, don't wrap it.** When a shared helper (`src/hooks/`, `src/blocks/`, `src/components/`, `src/machine/`, or `@clerk/shared`) behaves wrongly, change the helper and its tests, then delete the workarounds. Do not spread a helper's return value to swap one method, copy a `||` that undoes one of its fields, or add a second hook beside it for one caller.
- **A changed shared signature is a new pattern.** A new parameter, a return type that goes from `void` to a promise, or a returned field whose meaning changes all go through "When nothing fits: ask first".
- **One source of truth for busy.** When a machine, `usePendingAction` or `useForm` already knows an action is running, derive the flag from it: `isDisabled: actions.isPending || remove.isPending`. Do not mirror it into a second lock, or turn machine state into a promise to feed one.
- **Handle staleness through lifecycle.** A new identity remounts through a React `key`. A busy action keeps running when its surface closes (Controllers → Rules). Do not thread run ids or `AbortSignal`s through the model, controller and machine.
- **Extend a contract with an options object.** Make a field required when every caller has it: `connect(strategy, { walletName, onTarget })`, not `connect(strategy, walletName?, onTarget?)`.
- **Pass shared results through whole.** The view gets `form`, not an object that renames `form.id`, `form.isSubmitting` and `form.handleSubmit`.
- **Keep controller state off model types.** Pending and error flags the controller sets go on a row type the controller builds, not as optional fields on the type the model returns.
- **Narrowing and machines** follow [Controllers → Composition](docs/controllers.md#composition-and-dialog-lifetime) and [Controllers → Machines](docs/controllers.md#machines).
