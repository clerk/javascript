# AGENTS.md — `@clerk/mosaic`

Mosaic is Clerk's next-generation component library. These rules apply to everything under `packages/mosaic`, on top of the repo-root `AGENTS.md`.

- `ARCHITECTURE.md` (this folder) is the contract: tokens, the `.cl-<slot>` + `data-<axis>` styling API, the CSS build, and the model → controller → view split.
- `docs/` is the how-to, one file per task: StyleX authoring, motion, headless primitives, each flow layer, testing, and migration.

## Layers in one paragraph

A flow lives in `src/features/<feature>/`. The **model** (`*.model.ts(x)`) is the only file that reads Clerk hooks or calls Clerk resources, and answers with plain data, plain callbacks and a `status`. The **controller** (`*.controller.ts(x)`) holds local state and wraps the model's callbacks for pending, errors and closing. The **view** (`*.view.tsx`) renders plain props. No Clerk resource reaches the controller and no machine snapshot reaches the view.

## Reuse before you write

Most problems a feature hits already have a shared answer. Find the row for your problem and use it. Do not write a local version, even a small one.

| Problem                                                                 | Use                                                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| An async action from a button or row: pending, an error, one lock       | `usePendingAction` (`src/hooks/`)                                                                             |
| A form: values, validation, submit, field errors                        | `useForm` (`src/components/form/`), with `validateAsync` for a server-side check                              |
| A model save whose Clerk errors should land on form fields              | `save` in the model (`src/utils/errors.ts`), or reject with `FormSubmitError`                                 |
| A confirm step before an action                                         | `Confirmation` + `useConfirmationController` (`src/blocks/confirmation/`)                                     |
| A delete that needs the user to type a phrase                           | `Destructive` + `useDestructiveController` (`src/blocks/destructive/`)                                        |
| An action that may need step-up verification                            | `useReverificationFlow` (`src/features/reverification/`), passed to `useDestructiveController`                |
| Showing any error to the user                                           | One of the owners above. They call `toLocalizableError` and resolve copy with `useErrorText`                  |
| Moving focus after a list row is removed                                | `useListRemovalFocus` (`src/hooks/`)                                                                          |
| A debounced, abortable async check as the user types                    | `useDebouncedAsync` (`src/hooks/`)                                                                            |
| A spinner that should not flash or flicker                              | `useSpinDelay` (`src/hooks/`)                                                                                 |
| An inline message row that animates open and closed                     | `useHeldMessage`, `useMessageHeight`, `FeedbackBody` (`src/utils/feedback.tsx`) + `styles/feedback.styles.ts` |
| Siblings that slide when an item is added or removed                    | `useLayoutAnimation` (`src/primitives/hooks/`)                                                                |
| An interaction with an async lifecycle or two values that move together | A machine in the controller file, via `setup()` (`src/machine/`)                                              |
| Styles several components share                                         | `src/styles/*.styles.ts`                                                                                      |

## Signs you are about to invent a pattern

Stop and check the table if you are writing any of these in a feature:

- `try`/`catch` around a Clerk call in a controller or view
- `useState` for a pending flag, or for "which row is busy"
- `error.message` rendered to the user, or a hard-coded error string
- a ref map of buttons to restore focus after a removal
- `setTimeout` to debounce or to delay a spinner
- `stylex.create` inside a `.tsx` file

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
