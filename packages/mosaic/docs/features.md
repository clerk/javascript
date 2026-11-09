# Features

Read this when you add a feature, or a file to one. It covers the model → controller → view split, the files a feature is made of, and how a wrapper composes them; each layer's own rules are in [Models](models.md), [Controllers](controllers.md) and [Views](views.md).

Worked example: `src/features/reverification/` (model, controller, view, types, messages, wrapper and a feature test).

## Rules

- Before you add a feature, check `packages/ui/src/components/` and `packages/react/src/components/` for a legacy version, including for a headless port. If one exists, this is a migration: read [Migration](migration.md) first.
- Only a `*.model.ts(x)`, or a shared Clerk-reading hook in `src/hooks/` (`useMosaicEnvironment`, `useMosaicRouter`, `useMosaicSupportEmail`), imports Clerk hooks or calls Clerk resource methods.
- What crosses each boundary is plain data: no Clerk resource reaches the controller, and no machine snapshot reaches the view.
- A feature's machine lives in its `*.controller.ts(x)`, not in `src/machine/` and not in a `*.machine.ts`.
- Import from source paths inside `packages/mosaic`; there are no published subpath barrels.
- A flow is tested as a whole, not per layer ([Testing](testing.md)).

## The layers

Read the split as _where the data comes from_ (model) → _what the user is doing to it_ (controller) → _what that looks like_ (view); the one-paragraph summary is in [AGENTS.md → Layers](../AGENTS.md#layers-in-one-paragraph). A machine is not a layer. It is one of two ways a controller holds its state, chosen by the interaction's complexity ([Controllers → Which one holds the state](controllers.md#which-one-holds-the-state)).

## File shape

A feature lives in `src/features/<feature>/`, one file per role, each prefixed with the feature name. Use `.ts` unless the file renders JSX.

| File                         | Holds                                                                       |
| ---------------------------- | --------------------------------------------------------------------------- |
| `<feature>.model.ts(x)`      | The Clerk adapter                                                           |
| `<feature>.controller.ts(x)` | Local state, a machine if it has one, and action wrapping                   |
| `<feature>.view.tsx`         | Rendering only                                                              |
| `<feature>.tsx`              | The composition wrapper and the public props type                           |
| `<feature>.types.ts`         | The data contract the model and view share                                  |
| `<feature>.messages.ts`      | Every string the feature renders ([Views](views.md#where-the-strings-live)) |
| `<feature>.layout.ts`        | Pure derivation, such as which affordance goes in which slot                |
| `<feature>.utils.ts`         | Pure helpers                                                                |
| `<feature>.styles.ts`        | `stylex.create` atoms ([StyleX](stylex.md))                                 |
| `<feature>.skeleton.tsx`     | The loading placeholder ([Skeletons](skeletons.md))                         |
| `<name>.dialog.tsx`          | A dialog the view opens, when it would crowd the view file                  |

`*.types.ts` holds the contract so that neither the model nor the view owns it, and the two cannot drift.

The other folders under `src/` are named for what they hold; `src/components/` has one folder per component and nothing else. Shared helpers are in the table in [AGENTS.md](../AGENTS.md#reuse-before-you-write), and test helpers are under `src/__tests__/`.

## Composition

Two shapes, chosen by whether the slice fetches its own data.

- **A wrapper composes the layers** when the slice is a connected component. It calls the model, hands it to the controller, branches on `status`, and renders the view with the rest (`src/features/switcher/switcher.tsx`). `loading` renders the caller's `fallback`; `hidden` renders nothing, because signed out is an answer, not a wait.
- **A view owns its controller** when the slice is a leaf that takes its effect as a prop. There is no model: the Clerk call arrives from whoever renders it (`UserProfileUsernameRowView` calls `useUserProfileEditUsernameController` with its `onSubmit`).

Either way, the controller never imports Clerk, and its effects arrive as injected plain functions.
