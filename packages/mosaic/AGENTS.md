# AGENTS.md — `@clerk/mosaic`

Mosaic is Clerk's next-generation component library. These rules apply to everything under `packages/mosaic`, on top of the repo-root `AGENTS.md`.

- `ARCHITECTURE.md` (this folder) is the contract: tokens, the `.cl-<slot>` + `data-<axis>` styling API, the CSS build, and the model → controller → view split.
- `docs/` is the how-to, one file per task: StyleX authoring, motion, headless primitives, each flow layer, testing, and migration.

## Task guides

Read the guide for the task you are doing. Paths below are relative to this package.

| Task                                      | Read                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| Author a headless primitive               | [Headless primitives](docs/headless.md)                                           |
| Style a component or change the CSS build | [StyleX](docs/stylex.md)                                                          |
| Add or debug motion                       | [Motion](docs/motion.md)                                                          |
| Build a loading skeleton                  | [Skeletons](docs/skeletons.md)                                                    |
| Write a model                             | [Models](docs/models.md)                                                          |
| Write a controller                        | [Controllers](docs/controllers.md)                                                |
| Author or debug a state machine           | [Controllers](docs/controllers.md), then [Machine runtime](src/machine/README.md) |
| Write a view                              | [Views](docs/views.md)                                                            |
| Test a feature                            | [Testing](docs/testing.md)                                                        |
| Migrate legacy behavior                   | [Migration](docs/migration.md)                                                    |
| Review migration parity                   | [Parity audit](docs/parity-audit.md)                                              |
| Add a public prop that shows or hides UI  | [Public visibility props](docs/public-props.md)                                   |
| Document a component in Swingset          | [Documenting components](docs/documenting-components.md)                          |
| Prove a change in a browser               | [verify-mosaic](.claude/skills/verify-mosaic/SKILL.md)                            |

## Before editing a file

Before you change a file that matches a pattern below, read its guide, even for a one-line change.

| File                                                               | Read                               |
| ------------------------------------------------------------------ | ---------------------------------- |
| `src/**/*.styles.ts`, `src/**/*.stylex.ts`                         | [StyleX](docs/stylex.md)           |
| `src/**/*.model.ts(x)`                                             | [Models](docs/models.md)           |
| `src/**/*.controller.ts(x)`                                        | [Controllers](docs/controllers.md) |
| `src/**/*.view.tsx`                                                | [Views](docs/views.md)             |
| `src/**/__tests__/**`, `src/**/*.test.ts(x)`, `src/**/*.test-d.ts` | [Testing](docs/testing.md)         |

## Layers in one paragraph

A flow lives in `src/features/<feature>/`. The **model** (`*.model.ts(x)`) is the only file that reads Clerk hooks or calls Clerk resources, and answers with plain data, plain callbacks and a `status`. The **controller** (`*.controller.ts(x)`) holds local state and wraps the model's callbacks for pending, errors and closing. The **view** (`*.view.tsx`) renders plain props. No Clerk resource reaches the controller and no machine snapshot reaches the view.

## Reuse before you write

Most problems a feature hits already have a shared answer. Find the row for your problem and use it. Do not write a local version, even a small one.

| Problem                                                                  | Use                                                                                                                                    |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| An async action from a button or row: pending, an error, one lock        | `usePendingAction` (`src/hooks/`)                                                                                                      |
| A form: values, validation, submit, field errors, success UI             | `useForm` (`src/components/form/`), with `validateAsync` for server checks and `onSuccess` for mounted success UI                      |
| A `<form>` element, without the browser's validation popup               | `Form` (`src/primitives/form/`)                                                                                                        |
| A model save whose Clerk errors should land on form fields               | `save` (`src/utils/errors.ts`) in the model, or reject with `FormSubmitError`                                                          |
| A confirm step before an action                                          | `useConfirmController` (`src/blocks/confirm/`) with `Confirmation` (`src/blocks/confirmation/`)                                        |
| A delete that needs the user to type a phrase                            | `useConfirmController` (`src/blocks/confirm/`) with `Destructive` (`src/blocks/destructive/`)                                          |
| An action that may need step-up verification                             | `useReverificationFlow` (`src/features/reverification/`) in the model, passed to `useConfirmController`                                |
| A direct action that needs step-up verification                          | `useReverificationFlow` in the model, with `ReverificationDialog` (`src/blocks/reverification/`) in the view                           |
| Showing any error to the user                                            | One of the owners above. They call `toLocalizableError` (or `toLocalizableErrors` for all errors) and resolve copy with `useErrorText` |
| Moving focus after a list row is removed                                 | `useListRemovalFocus` (`src/hooks/`)                                                                                                   |
| A debounced, abortable async check as the user types                     | `useDebouncedAsync` (`src/hooks/`)                                                                                                     |
| A spinner that should not flash or flicker                               | `useSpinDelay` (`src/hooks/`)                                                                                                          |
| A placeholder for content that is still loading                          | `Skeleton` (`src/components/skeleton/`), see [Skeletons](docs/skeletons.md)                                                            |
| A date shown to the user                                                 | `formatDate` (`src/utils/format-date.ts`)                                                                                              |
| A value turned into kebab case, e.g. for a `data-*` attribute            | `kebabCase` (`src/utils/kebab-case.ts`)                                                                                                |
| Current time for display labels                                          | `useNow` (`src/hooks/`)                                                                                                                |
| Whether enterprise SSO permits adding another identification             | `allowsIdentificationCreation` (`src/utils/allows-identification-creation.ts`)                                                         |
| An inline message row; height is undefined until measured                | `useHeldMessage`, `useMessageHeight`, `FeedbackBody` (`src/utils/feedback.tsx`) + `src/styles/feedback.styles.ts`                      |
| Data read from a Clerk resource that should be cached across mounts      | A query hook in `src/queries/`, called from the model (`src/queries/use-user-sessions-query.ts`)                                       |
| An item changed in place in an infinite list, kept until the next reload | `replaceInPages` (`src/utils/infinite-pages.ts`), passed to the list's `setData`                                                       |
| An organization permission checked with `checkAuthorization`             | `ORGANIZATION_PERMISSIONS` (`src/utils/permissions.ts`)                                                                                |
| A verification code's length or resend cooldown                          | `CODE_LENGTH`, `CODE_RESEND_SECONDS`, `resendUnlockTime`, `isResendUnlocked` (`src/utils/verification.ts`)                             |
| The seconds left on a resend cooldown, for display                       | `useResendSeconds` (`src/hooks/`), from a `resendAvailableAt` time kept in the machine                                                 |
| Backup codes saved to a file or printed                                  | `downloadBackupCodes`, `printBackupCodes` (`src/utils/backup-codes.ts`)                                                                |
| An avatar or logo file picker and its rejection errors                   | `AVATAR_UPLOAD`, `AVATAR_REJECTION_ERRORS` (`src/utils/avatar-upload.ts`)                                                              |
| An avatar or logo row: picker, drop target, Upload button or manage menu | `AvatarUpload` (`src/blocks/avatar-upload/`), laid out by the caller                                                                   |
| Siblings that slide when an item is added or removed                     | `useLayoutAnimation` (`src/primitives/hooks/`)                                                                                         |
| An input that reformats as the user types without moving the caret       | `useFormattedInput` (`src/primitives/hooks/`)                                                                                          |
| Arrow-key navigation with one tab stop across a group of items           | `useComposite`, with `useCompositeItems` and `useCompositeItem` (`src/primitives/hooks/`)                                              |
| A panel that animates open and closed to its measured size               | `usePanelSize` (`src/primitives/hooks/`)                                                                                               |
| One screen replacing another on the same card or dialog                  | `Flow` (`src/components/flow/`), see [Views](docs/views.md)                                                                            |
| A form on a card or dialog step                                          | `useForm` in the controller, passed to the view as `form`, see [Views](docs/views.md)                                                  |
| Deciding which part renders `Card.Root`                                  | Only the surface, never a screen or `*Steps`, see [Views](docs/views.md)                                                               |
| An interaction with an async lifecycle or two values that move together  | A machine in the controller file, via `setup()` (`src/machine/`)                                                                       |
| Styles several components share                                          | `src/styles/*.styles.ts`                                                                                                               |

## Signs you are about to invent a pattern

Stop and check the table if you are writing any of these in a feature:

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

## Shaping a fix

A bug in a feature is often a gap in a shared helper. These rules apply to `fix` PRs as much as to features.

- **Fix the owner, don't wrap it.** When a shared helper (`src/hooks/`, `src/blocks/`, `src/components/`, `src/machine/`, or `@clerk/shared`) behaves wrongly, change the helper and its tests, then delete the workarounds. Do not spread a helper's return value to swap one method, copy a `||` that undoes one of its fields, or add a second hook beside it for one caller.
- **A changed shared signature is a new pattern.** A new parameter, a return type that goes from `void` to a promise, or a returned field whose meaning changes all go through "When nothing fits: ask first".
- **One source of truth for busy.** When a machine, `usePendingAction` or `useForm` already knows an action is running, derive the flag from it: `isDisabled: actions.isPending || remove.isPending`. Do not mirror it into a second lock, or turn machine state into a promise to feed one.
- **Handle staleness through lifecycle.** A new identity remounts through a React `key`. A busy state ignores close (Controllers → Rules). Do not thread run ids or `AbortSignal`s through the model, controller and machine.
- **Extend a contract with an options object.** Make a field required when every caller has it: `connect(strategy, { walletName, onTarget })`, not `connect(strategy, walletName?, onTarget?)`.
- **Pass shared results through whole.** The view gets `form`, not an object that renames `form.id`, `form.isSubmitting` and `form.handleSubmit`.
- **Keep controller state off model types.** Pending and error flags the controller sets go on a row type the controller builds, not as optional fields on the type the model returns.
- **Narrow by mounting.** A hook that needs loaded data takes it non-null. Mount its component once the model is ready instead of checking for `null` inside (Controllers → Composition and dialog lifetime).
- **Machines:** `assign` stays pure. An effect the machine starts runs in `invoke`. The runtime has no spawned actors, so effects that run side by side, like `useForm`'s per-field `validateAsync`, run in the hook and report back by event, and the machine drops stale results. A phase of an action the user can see (queued, pending, failed) is a named state, not a context field plus a predicate. Screens that can sit on top of any state, like reverification's method picker and help, may be a stack in context, because the runtime has no parallel or history states.

If code or a test contradicts a rule in these docs, do not copy the code. Stop and ask which one is right, and fix the loser in the same PR.

## Nested radii

A part inset from a rounded surface gets its radius from that surface: `max(0px, calc(outer - border - padding))`. Do not pick a fixed step, or it stops matching when `--cl-radius-*` or `--cl-spacing` is overridden. This applies to small insets. When the inset is about as large as the outer radius or larger (Card content, TagInput tags), the part keeps its own radius.

- **Same component:** declare the outer radius, border and padding as local consts, and use them in both the surface and the calc, so changing any of them updates the inner radius (`components/select/select.styles.ts`).
- **Different component:** the parent computes the radius from the same consts and sets a `--_cl-*-radius` var, and the child reads it with a fallback (`--_cl-button-radius` in `components/action-bar/action-bar.styles.ts` and `components/button/button.styles.ts`).

Do not add a shared `concentric()` helper or a global surface-radius var. A global var inherits into nested surfaces and gives them the wrong value.

## Readability before complexity scores

Do not extract a helper or introduce a machine only to reduce a lint score.
Avoid turning a component into a hook solely to work around React's children
typing. An abstraction must clarify a responsibility or hide useful complexity. When complexity is inherent, keep the relevant logic
together and explain the tradeoff in review. Follow repository rules for any lint
exception; this guidance does not authorize a suppression.

## When nothing fits: ask first

If no row fits, or a shared helper almost fits but would need a change, **stop and ask the user before writing code**. Say:

1. the problem, in one sentence
2. which shared helpers you checked and why each does not fit
3. the shape you propose: a new shared helper, a change to an existing one, or a one-off in the feature

Do not solve it locally and mention it at the end. A one-off that duplicates a shared helper is the thing this rule exists to prevent.

## Keep the docs true

Docs say what the code cannot: rules, reasons, and which tool fits which problem. For facts the code already holds (lists of exports, tokens, builders or files, and signatures), name the file and give one example. Do not copy the list; a copy goes stale and agents trust it.

A PR that adds, renames or changes the signature of a shared helper in `src/hooks/`, `src/utils/`, `src/blocks/`, `src/components/form/` or `src/machine/` updates the table above, and any doc that names it, in the same PR.

## Breaking changes

While `@clerk/mosaic` is on 0.x, a breaking change is a `minor` changeset. Start its body with `**Breaking:**`, then give an old-to-new table and a search that finds affected usage, so an agent can migrate from the changelog alone. The changelog ships in the npm package at `node_modules/@clerk/mosaic/CHANGELOG.md`.

```md
---
'@clerk/mosaic': minor
---

**Breaking:** Rename a `UserButton` prop. Values and defaults are unchanged; TypeScript flags the old name.

| Before               | After              |
| -------------------- | ------------------ |
| `renderTriggerLabel` | `showTriggerLabel` |

Find usages with `git grep -n renderTriggerLabel`.
```

## Lint

Mosaic uses Oxlint and runs stricter lint rules than the rest of the repo. Lint with `pnpm lint` from `packages/mosaic`.

Every disable directive in `src` needs a `-- reason`. The reason is not a code comment, so the root no-comments rule does not apply. Write why the lint rule does not apply here, not what the code does; it is what a reviewer judges.

### When `sonarjs/cognitive-complexity` fires

The limit flags code worth a second look. It is not a score to game.

1. Simplify in place first: return early, replace branch chains with a lookup table, remove nesting.
2. Extract a helper only when it names a real concept a reader would look for. Do not split a function just to lower the score. Logic spread across helpers that only make sense together is harder to follow than one longer function.
3. If the complexity is inherent and the function reads best as one unit, disable the rule on that function with a reason:

   ```ts
   // eslint-disable-next-line sonarjs/cognitive-complexity -- One pass over the keyboard event; each branch handles a separate key.
   ```
