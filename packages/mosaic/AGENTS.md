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
| Write a model                             | [Models](docs/models.md)                                                          |
| Write a controller                        | [Controllers](docs/controllers.md)                                                |
| Author or debug a state machine           | [Controllers](docs/controllers.md), then [Machine runtime](src/machine/README.md) |
| Write a view                              | [Views](docs/views.md)                                                            |
| Test a feature                            | [Testing](docs/testing.md)                                                        |
| Migrate legacy behavior                   | [Migration](docs/migration.md)                                                    |
| Review migration parity                   | [Parity audit](docs/parity-audit.md)                                              |

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
| A date shown to the user                                                | `formatDate` (`src/utils/format-date.ts`)                                                                     |
| Current time for display labels                                         | `useNow` + `MosaicProvider` ([#10098](https://github.com/clerk/javascript/pull/10098), once available)        |
| Whether enterprise SSO permits adding another identification            | `allowsIdentificationCreation` (`src/utils/allows-identification-creation.ts`)                                |
| An inline message row that animates open and closed                     | `useHeldMessage`, `useMessageHeight`, `FeedbackBody` (`src/utils/feedback.tsx`) + `styles/feedback.styles.ts` |
| A table whose sorting, paging and search are done by the server         | `useServerDataTable` (`src/hooks/`)                                                                           |
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

## Lint

Mosaic runs stricter lint rules than the rest of the repo: the `packages/mosaic` block in the root `eslint.config.mjs`, plus the layer import guards in `packages/mosaic/eslint/config.mjs`, which only load through `packages/mosaic/eslint.config.mjs`. Lint with `pnpm lint` from `packages/mosaic`. Running `eslint` from the repo root skips the import guards.

Every disable directive in `src` needs a `-- reason` (`@eslint-community/eslint-comments/require-description`). The reason is not a code comment under the root no-comments rule. Write why the rule does not apply here, not what the code does; it is what a reviewer judges.

### When `sonarjs/cognitive-complexity` fires

The limit flags code worth a second look. It is not a score to game.

1. Simplify in place first: return early, replace branch chains with a lookup table, remove nesting.
2. Extract a helper only when it names a real concept a reader would look for. Do not split a function just to lower the score. Logic spread across helpers that only make sense together is harder to follow than one longer function.
3. If the complexity is inherent and the function reads best as one unit, disable the rule on that function with a reason:

   ```ts
   // eslint-disable-next-line sonarjs/cognitive-complexity -- One pass over the keyboard event; each branch handles a separate key.
   ```
