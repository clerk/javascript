# Controllers

Read this when you write or change a `*.controller.ts(x)`, a state machine, or how a feature handles pending state, errors, dialogs or focus after a removal. It covers which tool holds the state and how actions are wrapped; the machine runtime itself is in `src/machine/README.md`.

Worked examples: `src/features/switcher/switcher.controller.tsx` wraps a model; `src/features/user-profile/user-profile-profile-section/user-profile-edit-username.controller.ts` takes its one effect as a prop.

## Rules

- No Clerk imports. Effects arrive as injected plain functions, from a model or as a prop. If a controller needs a Clerk fact, the model supplies it as data.
- No machine snapshot in the return value. Return the plain props the view reads (`open`, `pendingKey`, `isDeleting`, `errorMessage`), never `snapshot` or `send`.
- Pass the model's `status` through (`if (model.status !== 'ready') return { status: model.status };`), so the wrapper branches on one value.
- An absent model callback stays absent, so a capability the instance lacks never reaches the view as a dead affordance.
- Only the controller decides what closes the surface. `onSelectOrganization` closes on success; a switch that leaves the menu useful does not; a navigation closes before it hands off.
- Dismissing must not abandon an in-flight effect. Closing may hide the surface, but the busy action keeps running, and only one action runs at a time. A surface that shows the action's error refuses to close once the action can no longer be cancelled; while a reverification challenge can still be cancelled, closing cancels it (`canClose` in `src/blocks/confirm/confirm.controller.ts`).
- Check [Reuse before you write](../AGENTS.md#reuse-before-you-write) before holding any state by hand.

## Which one holds the state

| The interaction…                                                              | Hold it in                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Is a boolean or a controlled value, no async, nothing else depends on it      | `useState`                                                  |
| Has an async lifecycle, or two values that must change together               | A machine, in the controller file                           |
| Has a coordinated async core plus some UI-only flags beside it                | Both: a machine for the core                                |
| Is one async action from a button or a row, needing only pending and an error | `usePendingAction`                                          |
| Is a form                                                                     | `useForm`                                                   |
| Is a confirm step before an action                                            | `useConfirmController` with `Confirmation` or `Destructive` |

The choice is invisible from outside: the controller returns plain props either way, so swapping one for the other later is a change to one file. Do not front-load a machine for a flow that has not earned one, and do not leave a coordinated async flow in flag soup because it started as one boolean. A single open boolean earns nothing; a two-state machine with one event is a boolean spelled long. `src/machine/ADOPTION.md` has the full criteria, including what stays `useState` inside a component that has a machine.

`useConfirmController` earns a machine because the confirm is async, a failure must land back on the confirming step with a reason, and a cancelled reverification must close without one. `useSwitcherController` earns one because `open` and `pendingKey` constrain each other.

### `usePendingAction`

`usePendingAction({ errorFallback })` covers the async actions a button or row starts: set a default, sign out a device, accept a request, connect an account. Every `run(key, action)` from one hook shares one lock, so one hook covers a whole section and a second click anywhere is ignored while one is in flight. It owns the error (see [Errors](#errors)).

```ts
const actions = usePendingAction({ errorFallback: messages.errors.generic });

return {
  rows: rows.map(row => ({
    ...row,
    isPending: actions.pendingKey === row.id,
    error: actions.errorKey === row.id ? actions.error : undefined,
  })),
  onRemove: id => void actions.run(id, () => onRemove(id)),
};
```

When direct actions and a confirmation must not run together, keep each owner and combine their pending state in the section controller:

```ts
const actions = usePendingAction();
const remove = useConfirmController<UserProfileEmail>({
  onConfirm: contact => removalFocus.remove(contact.id),
  reverification,
});

return {
  contacts: contacts.map(contact => ({ ...contact, isPrimaryPending: actions.pendingKey === contact.id })),
  isDisabled: actions.isPending || remove.isPending,
  remove,
};
```

Pass `isDisabled` to every control that starts one of the actions, including the item that opens the confirmation. `remove.isPending` stays true after the dialog closes during a reverification until the confirmed action settles, and the controller ignores `confirm` until then, so closing the dialog never lets a second action start. Put each row's pending state on the row the controller returns, so views render it without comparing pending keys.

- `run` resolves `true` on success, so the caller can close a dialog or move focus. A cancelled reverification resolves `false`, shows no error and releases the lock.
- To hold pending through an OAuth redirect, await a delay inside the action (`user-profile-connected-accounts-section.controller.ts`).
- It is not for a form (`useForm`), a confirm step (`useConfirmController`), an action whose result drives other state (a machine), or a check that reruns as the user types (`useDebouncedAsync`, or a field's `validateAsync`).

For a direct action in `ActionMenu`, opt in with `status: 'idle'` and set it to `'pending'` in the click event while the request runs and no dialog is open yet; the menu closes on the next render unless an action is pending. While pending, the menu reserves room for a spinner, disables its actions and blocks dismissal. It closes when the status returns to `'idle'`. Leave `status` undefined for ordinary actions that close through the menu's own click.

### Confirm steps and step-up verification

`useConfirmController({ onConfirm, reverification, errorFallback })` owns one confirm dialog: open, pending, error, and the verify step a reverified action swaps in. It is generic over a payload. Create it in the wrapper or controller and pass it to the view, which hands it to the block ([Views → Blocks](views.md#blocks)).

An action Clerk may interrupt for verification goes through `useReverificationFlow` in the model ([Models → Step-up verification](models.md#step-up-verification)). The controller passes the returned `reverification` on, and the block shows the verify step inside the same dialog:

```ts
const removalFocus = useListRemovalFocus({ ids, onRemove: onRemoveEmail, fallback });
const remove = useConfirmController<UserProfileEmail>({
  onConfirm: email => removalFocus.remove(email.id),
  reverification,
});
```

For a direct action with no confirm step, keep it under `usePendingAction`, so its lock and ordinary errors stay with the section, and pass the `reverification` controller to `ReverificationDialog` in the view. The dialog opens once `visible` is true, so it skips the loading card, and offers dismissal only while the controller has a cancel callback. Return focus with the hook's `lastKey`, which outlives the run, unlike `pendingKey`.

### `useForm`

`useUserProfileEditUsernameController` holds `isOpen` in `useState` and hands the async part to `useForm`:

```tsx
const [isOpen, setIsOpen] = useState(false);
const form = useForm({
  initialValues: { username },
  onSubmit: values => onSubmit(values.username),
  onSuccess: () => setIsOpen(false),
});
```

- Mutations and required revalidation go in `onSubmit`. Success UI, such as closing the dialog or a toast, goes in the synchronous `onSuccess(result, submittedValues)`, whose result type comes from `onSubmit`.
- `onSuccess` runs during the completion transition, before `isSubmitting` clears, and only while the form is mounted. Use it to close or show UI, not to reset or resubmit. Rejection and a cancelled reverification skip it.
- A resolved `onSubmit` counts as success even if it returned early. Prevent no-op submissions with `canSubmit`, or return a result that lets `onSuccess` tell them apart.
- Unmounting does not cancel the request. If an identity change should discard its completion UI, unmount the form, for example through the composing component's React `key`.

## Machines

A machine is declared in the controller's own file, and the controller is the only thing that sends to it. `src/machine/README.md` covers the runtime, and shared async test helpers are in `src/__tests__/async.ts`.

- A machine never calls Clerk. An effect that differs per action rides on the event and is assigned to context, then runs in `invoke` (`src/blocks/confirm/confirm.controller.ts`). An effect fixed for the controller's lifetime is seated by `useMachine(machine, { context })`, which re-seats context every render (`onRedirect` in `waitlist.controller.ts`).
- `assign` stays pure. An effect the machine starts runs in `invoke`.
- The runtime has no spawned actors, parallel states or history states. Effects that run side by side, like `useForm`'s per-field `validateAsync`, run in the hook and report back by event, and the machine drops stale results. Screens that can sit on top of any state, like reverification's method picker and help, may be a stack in context.
- A phase of an action the user can see (queued, pending, failed) is a named state, not a context field plus a predicate.
- To keep dismissal from abandoning an effect, model `open` as context and give `OPEN`/`CLOSE` no target in the busy state: `busy: { on: { CLOSE: { actions: assign(() => ({ open: false })) } }, invoke: … }`.
- A transition shared across states in a `const` needs `target: 'name' as const`, or the target widens to `string` and the machine rejects it.
- Context holds the `ErrorDescription`, never copy. A machine whose surface shows no error still logs it, so a failure is never silent (`switcher.controller.tsx`).

### Multi-step flows

A flow with several steps on one surface is one machine and one form. No existing flow follows every rule below yet, so each names the closest example.

- **The machine owns the step.** Each step is a state, and the controller derives the step the view shows from the snapshot, so an async state maps to the screen that stays up while it runs (`viewStep` in `reverification.controller.ts`). No `useState` step beside it, and no separate open flag.
- **Guards live in the machine.** What allows a step to continue is a guard on its event. The controller reads it with `actor.can(event)` rather than writing a `canContinue` that repeats it.
- **Async work is a named state with `invoke`.** Testing a connection is a `testing` state, not a `pending` field in context and not a call in a transition action. Its result lands in context from `onDone`, beside the state that waited for it, not in a `usePendingAction` flag (`starting` and `submitting` in `reverification.controller.ts`).
- **One `useForm` holds every step's values.** Its `onSubmit` is the last step's save, and `canSubmit` covers only that save (`create-organization.controller.ts`). Values are not copied into machine context with `TYPE` events.
- **Navigation is machine events.** Continue and back send `NEXT` and `BACK` with the values the guard needs, and the machine chooses the next step. The controller routes the form's submit by step: a middle step sends `NEXT`, and only the last step runs `form.handleSubmit`, so Enter never saves early.

```ts
const [snapshot, send, actor] = useMachine(machine, { context: { testConnection: model.onTestConnection } });
const form = useForm<SsoValues, void>({ initialValues, onSubmit: values => model.onSave(values) });
const next = { type: 'NEXT', values: form.values } as const;

return {
  step: viewStep(snapshot.value),
  form,
  isTesting: snapshot.value === 'testing',
  canContinue: actor.can(next),
  onSubmit: event => {
    if (snapshot.value === 'review') {
      form.handleSubmit(event);
      return;
    }
    event.preventDefault();
    send(next);
  },
  onBack: () => send({ type: 'BACK' }),
};
```

The view side is in [Views → Moving between screens](views.md#moving-between-screens-on-one-surface).

**Exception: sign-in and sign-up.** FAPI owns their step, so there is no step machine. The controller derives the screen from `getSignInNextStep` or `getSignUpNextStep`, and keeps what the step can't say in the route, such as the factor the user picked ([Sign-in and sign-up flow](internals/sign-in-sign-up-flow.md#pick-the-screen)).

## Wrapping actions

- **One wrapper for every action**, so each is wrapped the same way and only one is in flight (`runAction` in `switcher.controller.tsx`).
- **Hold the surface still while an action runs.** `setActive` swaps the active organization while its promise is in flight, so the live model would rearrange the popup mid-action. Freeze the model the action started from and render it until the action settles (`context.frozenModel ?? model`). This also covers the model dropping `ready → loading` during Clerk's transitive state.
- **Derive view props.** A `pendingKey` run through `useSpinDelay`, a `mode` forced by a capability flag: anything the view would otherwise re-derive.

## Composition and dialog lifetime

- Prefer one controller-derived contract above the view, forwarding the model's display data through the controller when needed.
- Mount a component once the model is ready, so its controller receives the narrowed model and takes it non-null, instead of repeating loading branches. A model that can drop back to `loading` during an action keeps its controller mounted and freezes the model instead ([Wrapping actions](#wrapping-actions)), since unmounting stops the actor and loses the pending state.
- Decide which dialog state survives closing and reopening, and keep reset behavior consistent with the pending action's lifetime.
- Route a rejected dynamic import to an error owner rather than leaving an unhandled rejection. When adding lazy loading or Suspense, consider a boundary around the dialog content that leaves the trigger and parent available.

## Removing a row takes focus with it

A dialog returns focus to its trigger on close. When the action removes the row the trigger sits on, the trigger unmounts and focus falls to `<body>`: the menu item that opened the dialog unmounted with the menu, and a dialog mounted at the section has no floating-tree ancestor to walk back to.

Hand focus to a surviving element with `useListRemovalFocus` (`src/hooks/`) in the controller or wrapper, between the confirm controller and the model call. `remove` records which row went, and `finalFocus` picks the row that took its place, the last row when it was the last, or `fallback()` once the list is empty. The view registers each row's trigger with `registerTrigger(id)` and passes `finalFocus` to the block, which resolves it after the row has gone:

```ts
const removalFocus = useListRemovalFocus({
  ids: methods.map(method => method.id),
  onRemove,
  fallback: () => sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? sectionRef.current,
});
const remove = useConfirmController<Method>({ onConfirm: method => removalFocus.remove(method.id) });
```

A cancelled or failed removal keeps its trigger, so `finalFocus` returns `null` and the dialog's default applies.

## Errors

One path, so every error a user sees goes through the `errors.*` catalog.

- **Owners map, nothing else does.** A failure is owned by `usePendingAction` (button and row actions), `useConfirmController` (confirm dialogs) or `useForm` (forms). Use one instead of catching in a feature. A controller with its own machine maps in the machine's `onError` (`organization-list.controller.ts`).
- **Single-error owners call `toLocalizableError(cause)`** from `src/utils/errors.ts`, including its global-first `SaveError` behavior. A machine that displays every error uses `toLocalizableErrors(cause)`, which keeps each error and its parameter name; reverification routes matching parameters to the active field and the rest to the banner.
- **Forms map through `save`.** The model's `save` rethrows a Clerk error as a `SaveError`, and the form machine turns it into field and global errors. A controller can also reject a submit with `FormSubmitError` (`src/components/form/`) to set field errors itself. A submit rejected by a cancelled reverification is not an error: the form returns to editing with its values and no message.
- **Owners hold an `ErrorDescription`**: a `LocalizableError` (Clerk gave a `code`) or an `UnlocalizableError` (`{ cause }`). `toLocalizableError` logs the second as `[Clerk] Could not localize error`. Branch with `isLocalizableError` only when a feature handles the two differently.
- **Owners resolve copy at render; views get a string.** Owners return `errorMessage` from `useErrorText()`, which tries the catalog entry for `code__paramName`, then `code`, then Clerk's message, then the feature's `errorFallback`, then the generic error. Views never call `useErrorText` on an error they did not create.
- **`errorFallback` is the copy for faults Clerk cannot describe** (code bugs, non-Clerk errors). An `UnlocalizableError` renders the fallback, never its cause's `.message`. `network_error` has catalog copy, but network failures can also arrive as raw, unlocalizable errors.
- Known gaps, not precedent: `useForm` resolves copy when the save fails instead of at render (it takes an `errorFallback` and uses `form.error` when none is given), the profile picture row resolves its error in the view, and the password section maps its own errors (`user-profile-password-errors.ts`).

## Testing

The feature test covers the controller ([Testing](testing.md)). Hold the FAPI request an action makes to assert its in-flight state, then release or fail it to assert what closes the surface. Timing that is awkward to drive through FAPI can get a smaller test.

- **Errors:** reject with `clerkApiError(code, message, { paramName })` from `src/__tests__/clerk-errors.ts` to assert catalog copy. Reject with a plain `Error` (silence `console.error`), such as `new Error('socket disconnected')`, to assert the fallback shows and the raw message does not. Test `clerkApiError('network_error', …)` separately rather than assuming every network fault has a code.
- **Dialog lifetime:** for a dialog that clears on close, fail a submit, close, reopen, and assert the error is gone and the field is back to its initial value (or the saved draft, if it is meant to survive). Hold the submit while dismissing to check that closing neither unlocks a second mutation nor abandons the first. For a dynamic import, reject the loader and assert the error UI and recovery.
- **Removal focus:** test the removal, not just the cancel. Assert `toHaveFocus()` on the row that should catch it; a suite that only checks focus after cancelling passes while every real removal drops focus.
