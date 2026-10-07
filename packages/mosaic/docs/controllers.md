# Controllers

The controller sits between the view and the outside world. It holds the **local
state** — what is open, what is in flight, what the view may do next — and wraps
the model's actions so the surface can report and survive them.

It does **not** touch Clerk. Its effects arrive as injected plain functions:
from a model (`models.md`) when a wrapper composes the two, or as a prop when a
leaf view calls its own controller. That keeps the controller independent of
where its effects come from.

Worked examples:

- `packages/mosaic/src/features/user-button/user-button.controller.tsx` — wraps a model
- `packages/mosaic/src/features/user-profile/user-profile-account-section/user-profile-edit-username.controller.ts`
  — takes its one effect as a prop

See `packages/mosaic/ARCHITECTURE.md` → "Controllers" for the layer contract.

## Which one holds the state

A controller is not a machine wrapper. It is the layer that owns the
interaction, and it holds that state in whichever tool the interaction's
complexity calls for:

| The interaction…                                                              | Hold it in                                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Is a boolean or a controlled value, no async, nothing else depends on it      | `useState`                                                                |
| Has an async lifecycle, or two values that must change together               | A machine, same file                                                      |
| Has a coordinated async core plus some UI-only flags beside it                | Both — machine for the core                                               |
| Is one async action from a button or a row, needing only pending and an error | `usePendingAction`                                                        |
| Is a form                                                                     | `useForm`                                                                 |
| Is a confirm step before an action                                            | `useConfirmationController` / `useDestructiveController` with their block |

Check `packages/mosaic/AGENTS.md` → "Reuse before you write" before holding any
of this by hand. If nothing there fits, ask the user before adding a new pattern.

`usePendingAction({ errorFallback })` covers the async actions a button or a
list row starts: set a default, sign out a device, accept or decline a request,
connect an account. One hook covers a whole section: every `run(key, action)`
shares one lock, so a second click anywhere is ignored while one is in flight.
It owns the error (see "Errors"):

```ts
const actions = usePendingAction({ errorFallback: messages.errors.generic });

return {
  rows: rows.map(row => (actions.errorKey === row.id ? { ...row, error: actions.error } : row)),
  pendingId: actions.pendingKey,
  onRemove: id => void actions.run(id, () => onRemove(id)),
};
```

`run` resolves `true` on success, so the caller can close a dialog or move
focus. To hold pending through an OAuth redirect, await a delay inside the
action (`user-profile-connected-accounts-section.controller.ts`). It is not for:

- a form → `useForm`
- a confirm step → `Confirmation` / `Destructive` and their controllers
- an action whose result drives other state → a machine
- a check that reruns as the user types → `useDebouncedAsync` (`hooks/`), or a
  form field's `validateAsync`

`useConfirmationController` earns a machine: the confirm is async, and a failure
must land back on the confirming step with a reason. `useUserButtonController`
earns one because `open` and `pendingKey` constrain each other and dismissing
must not abandon an in-flight invoke. `useDestructiveController` is the middle
ground: its states never overlap, so one `useState` holding a status union is
enough.

A single open boolean earns nothing. A two-state machine with one event is a
boolean spelled long. `useUserProfileEditUsernameController` holds `isOpen` in
`useState` and hands the async part to `useForm`:

```tsx
const [isOpen, setIsOpen] = useState(false);
const form = useForm({
  initialValues: { username },
  onSubmit: async values => {
    await onSubmit(values.username);
    setIsOpen(false);
  },
});
```

The choice is invisible from outside — the controller returns plain props either
way, so the view and its tests are unaffected, and swapping one for the other
later is a change to one file. Don't front-load a machine for a flow that has
not earned one; don't leave a coordinated async flow in flag soup because it
started as one boolean.

`packages/mosaic/src/machine/ADOPTION.md` is the full criteria, including its
"honest boundary" table of what stays `useState` inside a component that does
have a machine.

## Machines

A machine is declared in the controller's own file. There is no
`*.machine.ts` in a feature, and the controller is the only thing that sends to
it. The runtime is documented next to the code:
`packages/mosaic/src/machine/README.md` covers the mental model, `setup`,
`createActor` / `useMachine`, and the API at a glance; the files in `machine/`
are the full API. Two directories one letter apart: `machine/` is the runtime,
`machines/` holds standalone machines. Shared async test helpers are in
`src/__tests__/async.ts`.

A machine never calls Clerk. The effect it invokes arrives through context as a
plain function, seated by `useMachine(machine, { context })`, which re-seats
context every render so the machine always invokes the latest one. From
`user-profile-rename-passkey.controller.ts`:

```ts
saving: {
  invoke: fromPromise(async context => context.onRename?.(context.passkeyId, context.name), {
    onDone: { target: 'idle' },
    onError: {
      target: 'editing',
      actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
    },
  }),
}

const [snapshot, send] = useMachine(userProfileRenamePasskeyMachine, {
  context: { passkeyId: id, savedName: name, onRename },
});
```

An effect that differs per action can ride on the event instead and be assigned
to context, as `confirmationMachine` does with `CONFIRM`
(`blocks/confirmation/confirmation.controller.ts`).

Context holds the `ErrorDescription`, never copy (see "Errors"). A machine whose
surface shows no error still logs it, so a failure is never silent
(`user-button.controller.tsx`).

## Responsibilities

- **Hold the interaction state.** In React state or a machine — see "Which one
  holds the state" above.
- **Pass the model's `status` through.** The wrapper then branches on one value:

  ```tsx
  if (model.status !== 'ready') {
    return { status: model.status };
  }
  ```

- **Wrap actions to drive pending state.** One helper, so every action is wrapped
  the same way and only one can be in flight:

  ```tsx
  const runAction = (keyFor, fn, closeOnSuccess = false) =>
    fn
      ? (...args) => send({ type: 'RUN', key: keyFor(...args), run: async () => fn(...args), closeOnSuccess })
      : undefined;
  ```

  An absent model callback stays absent, so a capability the instance does not
  offer never reaches the view as a dead affordance.

- **Decide what closes the surface.** Only the controller knows whether an action
  ends the interaction. `onSelectOrganization` closes on success; a switch that
  leaves the menu useful does not; a navigation closes _before_ it hands off.
- **Hold the surface still while an action runs.** `setActive` swaps the active
  organization while its promise is still in flight, so the live model would
  rearrange the popup mid-action. Freeze the model the action started from and
  render that until it settles:

  ```tsx
  const resolvedModel = context.frozenModel ?? model;
  ```

  Freezing also covers the model dropping `ready → loading` during Clerk's
  transitive state, which would otherwise flash the fallback.

- **Derive view props.** A `pendingKey` run through
  `useSpinDelay`, a `mode` forced by a capability flag — anything the view would
  otherwise have to re-derive.

## Composition and dialog lifetime

When a wrapper composes the controller above the view, prefer one
controller-derived contract, forwarding the model's display data through the
controller when needed. Where practical, mount a
separate component only once the model is ready, so its controller receives the
narrowed ready model instead of repeating loading branches. Keep the supported
injected-effect leaf composition described in `views.md`.

Decide which dialog state survives closing and reopening. Verify that the next
interaction does not retain an unintended error or draft, and keep reset behavior
consistent with the pending action's lifetime. Handle rejected dynamic imports
through an appropriate error owner rather than leaving unhandled rejections.

When introducing lazy loading or Suspense, consider a boundary around dialog
content that leaves the trigger and parent available. Choose that boundary from
the feature's loading behavior; it does not require restructuring every dialog.

## Rules

- **No Clerk imports.** If a controller needs a Clerk fact, the model supplies it
  as data.
- **No machine snapshot in the return value.** Return the plain props the view
  reads (`open`, `pendingKey`, `isDeleting`, `errorMessage`), never `snapshot`
  and `send`.
- Dismissing must not abandon an in-flight effect. Model `open` as context, and
  give `OPEN`/`CLOSE` no target in the busy state so they don't leave it:

  ```ts
  busy: {
    on: { CLOSE: { actions: assign(() => ({ open: false })) } },
    invoke: fromPromise(context => context.run(), { /* … */ }),
  }
  ```

## Errors

One path, so every error a user sees goes through the `errors.*` catalog:

- **Owners map, nothing else does.** A failure is owned by one of
  `usePendingAction` (button and row actions), `useConfirmationController`,
  `useDestructiveController`, or `useForm` (forms). The first three call
  `toLocalizableError(cause)` from `utils/errors.ts`. Use one of them instead of
  catching in a feature. A controller with its own machine maps in the machine's
  `onError` (`user-profile-rename-passkey.controller.ts`).
- **Forms map through `save`.** A model wraps a form's Clerk call in
  `save(run, fields, params)` from `utils/errors.ts`, which rethrows a Clerk
  error as a `SaveError` with each error routed to the field it names. The form
  machine turns a `SaveError` into field and global errors. A controller can also
  reject a submit with `FormSubmitError` (`components/form`) to set field errors
  itself.
- **Owners hold an `ErrorDescription`.** It is either a `LocalizableError`
  (Clerk gave a `code`) or an `UnlocalizableError` (`{ cause }`, the original
  failure). `toLocalizableError` logs the second as
  `[Clerk] Could not localize error`. Branch with `isLocalizableError` only
  when a feature handles the two differently.
- **Owners resolve copy at render; views get a string.** Owners return
  `errorMessage` from `useErrorText()`: the
  catalog entry for `code__paramName`, then `code`, then Clerk's message, then
  the feature's `errorFallback`, then the generic error. Views never call
  `useErrorText` on an error they did not create themselves.
- Not there yet, each with a follow-up: `useForm` resolves when the save fails
  and falls back to `form.error` instead of taking an `errorFallback`; the
  profile picture row resolves its controller's error in the view; and the
  password section maps its own errors (`user-profile-password-errors.ts`).
- **`errorFallback` is the feature's copy for faults Clerk cannot describe**
  (code bugs, non-Clerk errors). An `UnlocalizableError` renders the fallback,
  never its cause's `.message`. A failure carrying the Clerk code `network_error`
  has catalog copy, but network failures may also arrive as raw errors and remain
  unlocalizable. Preserve the cause and check the unknown-error fallback too.
- In tests, reject with `clerkApiError(code, message, { paramName })` from
  `src/__tests__/clerk-errors.ts` to assert catalog copy. Reject with a plain
  `Error` (silence `console.error`) to assert the fallback.

## Testing

The feature test covers the controller by default. Hold the
FAPI request an action makes to assert its in-flight state (the spinner, the rows
stood down), then release or fail it to assert what closes the surface. Timing
that is awkward to drive through FAPI can get a smaller test. See `testing.md`.
