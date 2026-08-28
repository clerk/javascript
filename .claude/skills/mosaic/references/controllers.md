# Controllers

The controller sits between the view and the outside world. It holds the **local
state** — what is open, what is in flight, what the view may do next — and wraps
the model's actions so the surface can report and survive them.

It does **not** touch Clerk. Its effects arrive as injected plain functions:
from a model (`models.md`) when a wrapper composes the two, or as a prop when a
leaf view calls its own controller. That is what lets a controller test run
against a fake object instead of a mocked Clerk.

Worked examples:

- `packages/ui/src/mosaic/user-button/user-button.controller.tsx` — wraps a model
- `packages/ui/src/mosaic/user-profile/user-profile-delete-section/user-profile-delete-section.controller.ts`
  — takes its one effect as a prop

See `references/mosaic-architecture.md` → "Controllers" for the layer contract.

## Which one holds the state

A controller is not a machine wrapper. It is the layer that owns the
interaction, and it holds that state in whichever tool the interaction's
complexity calls for:

| The interaction…                                                         | Hold it in                  |
| ------------------------------------------------------------------------ | --------------------------- |
| Is a boolean or a controlled value, no async, nothing else depends on it | `useState`                  |
| Has an async lifecycle, or two values that must change together          | A machine, same file        |
| Has a coordinated async core plus some UI-only flags beside it           | Both — machine for the core |

`useUserProfileDeleteSectionController` earns a machine on three counts: the
delete is async, a failure must land back on the previous step with a reason,
and `deleted` is terminal so the dialog must never reopen. `useUserButtonController`
earns one because `open` and `pendingKey` constrain each other and dismissing
must not abandon an in-flight invoke.

A single `isEditing` boolean earns nothing. A two-state machine with one event
is a boolean spelled long:

```tsx
export function useSectionController({ onSave }: { onSave: () => void }) {
  const [isEditing, setIsEditing] = React.useState(false);
  return {
    isEditing,
    onEdit: () => setIsEditing(true),
    onCancel: () => setIsEditing(false),
  };
}
```

The choice is invisible from outside — the controller returns plain props either
way, so the view and its tests are unaffected, and swapping one for the other
later is a change to one file. Don't front-load a machine for a flow that has
not earned one; don't leave a coordinated async flow in flag soup because it
started as one boolean.

`packages/ui/src/mosaic/machine/ADOPTION.md` is the full criteria, including its
"honest boundary" table of what stays `useState` inside a component that does
have a machine.

## Responsibilities

- **Hold the interaction state.** In React state or a machine — see "Which one
  holds the state" below.
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

- **Derive view props.** `actor.can(...)` results, a `pendingKey` run through
  `useSpinDelay`, a `mode` forced by a capability flag — anything the view would
  otherwise have to re-derive.

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

## Testing

Feed the controller a **fake model object** — a plain literal with
`status: 'ready'` and `vi.fn()` callbacks — and render a tiny harness that
surfaces what it returns. No Clerk mocking. Assert the pending key, what closes
the surface, and that an absent model callback stays absent. See `testing.md`.
