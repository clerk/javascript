# Why adopt the Mosaic state machine?

The [README](./README.md) explains **how** to use the library. This document
answers **why** — by walking through three real migrations from today's
`@clerk/ui` code, showing what collapses and what the numbers look like.

The README already covers the delete-organization flow (`idle → confirming →
deleting`) and the ConfigureSSO Wizard (see the worked example in the `<details>`
block and the parity test at
[`__tests__/wizard-migration.test.tsx`](./__tests__/wizard-migration.test.tsx)).
Everything below is a fresh example.

---

## The pattern this library replaces

Two patterns appear over and over in `@clerk/ui` flows:

1. **`useLoadingStatus`** — a hand-rolled 3-state machine:

   ```ts
   // hooks/useLoadingStatus.ts
   type Status = 'idle' | 'loading' | 'error';
   export const useLoadingStatus = () => {
     const [state, setState] = useSafeState({ status: 'idle' as Status });
     return {
       status: state.status,
       setIdle: () => setState({ status: 'idle' }),
       setError: () => setState({ status: 'error' }),
       setLoading: () => setState({ status: 'loading' }),
       isLoading: state.status === 'loading',
       isIdle: state.status === 'idle',
     };
   };
   ```

   It IS a state machine — three named states with named transitions — but
   it has no guards (nothing stops `setLoading()` from being called while
   already loading), no `invoke` (the caller must coordinate `setLoading` /
   `setError` / `setIdle` manually), and it's bound to React state so it can
   only be driven and tested by rendering.

2. **Parallel state objects** — forms pair `useLoadingStatus` with
   `useCardState` (a second implicit machine for card-level error display).
   The two must be kept in sync by hand in every handler:

   ```ts
   // WaitlistForm.tsx (simplified)
   const status = useLoadingStatus();
   const card = useCardState();

   const handleSubmit = async e => {
     status.setLoading();
     card.setLoading();
     try {
       await clerk.joinWaitlist({ emailAddress });
       wizard.nextStep();
     } catch (error) {
       handleError(error, [emailField], card.setError);
     } finally {
       status.setIdle();
       card.setIdle();
     }
   };
   ```

   Four coordinated state calls surrounding every async operation. Miss one
   and the UI hangs in loading.

---

## Migration 1 (Simple): async submit form — `WaitlistForm`

**Archetype:** `idle → submitting → success | error`

**Source:** `components/Waitlist/WaitlistForm.tsx`

### Before (real code, abridged)

```tsx
const status = useLoadingStatus(); // 'idle' | 'loading' | 'error'
const card = useCardState(); // separate error/loading state for the card
const wizard = useWizard(); // step 0 = form, step 1 = success screen

const handleSubmit = async e => {
  e.preventDefault();
  status.setLoading();
  card.setLoading();
  card.setError(undefined);
  await clerk
    .joinWaitlist({ emailAddress: formState.emailAddress.value })
    .then(() => {
      wizard.nextStep();
      if (ctx.afterJoinWaitlistUrl) {
        setTimeout(() => navigate(ctx.afterJoinWaitlistUrl), 2000);
      }
    })
    .catch(error => handleError(error, [formState.emailAddress], card.setError))
    .finally(() => {
      status.setIdle();
      card.setIdle();
    });
};
```

Problems:

- Two state objects (`status` + `card`) must be driven in lockstep.
- `finally` is load-bearing: forget it and the button spins forever.
- `wizard.nextStep()` is a third piece of state in a third abstraction.
- Nothing prevents calling `status.setLoading()` while already in `loading`
  (e.g. a double-submit race).
- No React-free test path — every assertion requires rendering.

### After

```ts
import { createMachine } from '@/mosaic/machine/createMachine';
import { assign } from '@/mosaic/machine/assign';

type Context = { error: string | null };
type Event = { type: 'SUBMIT'; emailAddress: string } | { type: 'NAVIGATE_DONE' };

const waitlistMachine = createMachine<Context, Event>({
  id: 'waitlist',
  initial: 'idle',
  context: { error: null },
  states: {
    idle: {
      on: { SUBMIT: 'submitting' },
    },
    submitting: {
      // Double-submit is impossible: SUBMIT is not handled here.
      invoke: {
        src: (ctx, event) =>
          clerk.joinWaitlist({ emailAddress: (event as Extract<Event, { type: 'SUBMIT' }>).emailAddress }),
        onDone: {
          target: 'success',
          actions: assign(() => ({ error: null })),
        },
        onError: {
          target: 'idle',
          actions: assign((_ctx, e) => ({ error: String(e.error) })),
        },
      },
    },
    success: {
      // Optional auto-navigate on entry:
      entry: [
        (ctx, event) => {
          if (afterJoinWaitlistUrl) {
            setTimeout(() => navigate(afterJoinWaitlistUrl), 2000);
          }
        },
      ],
    },
  },
});
```

In React:

```tsx
const [snapshot, send] = useMachine(waitlistMachine);

<Form.Root
  onSubmit={e => {
    e.preventDefault();
    send({ type: 'SUBMIT', emailAddress: formState.emailAddress.value });
  }}
>
  <Form.SubmitButton isLoading={snapshot.value === 'submitting'} />
  {snapshot.context.error && <Card.Alert>{snapshot.context.error}</Card.Alert>}
</Form.Root>;
```

### What collapsed

| Before                                   | After                                             |
| ---------------------------------------- | ------------------------------------------------- |
| 2 state objects (`status` + `card`)      | 1 machine                                         |
| 4 manual state calls per submit          | 1 `send({ type: 'SUBMIT' })`                      |
| `finally` block (load-bearing)           | gone — `invoke` always exits `submitting`         |
| Double-submit possible                   | impossible — `SUBMIT` not handled in `submitting` |
| Logic testable only with React           | pure actor test, no rendering needed              |
| `isLoading` derived from `status.status` | `snapshot.value === 'submitting'`                 |

**Net: 2 `useState` instances deleted, 1 hand-rolled hook replaced, impossible
state (both `status.isLoading` and `card.isLoading` out of sync) eliminated.**

---

## Migration 2 (Medium): modal/selection soup — `APIKeysPage`

**Archetype:** `closed | revoking(payload) | copying(payload)` — mutually
exclusive UI modes carrying typed context

**Source:** `components/APIKeys/APIKeys.tsx`

### Before (real code, abridged)

```tsx
const [apiKey, setAPIKey] = useState<APIKeyResource | null>(null);
const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
const [selectedAPIKeyID, setSelectedAPIKeyID] = useState('');
const [selectedAPIKeyName, setSelectedAPIKeyName] = useState('');
const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

const handleRevoke = (apiKeyID: string, apiKeyName: string) => {
  setSelectedAPIKeyID(apiKeyID);
  setSelectedAPIKeyName(apiKeyName);
  setIsRevokeModalOpen(true);
};

const handleCreateAPIKey = async params => {
  // …create key…
  setIsCopyModalOpen(true);
  setAPIKey(apiKey);
  // …
};
```

Problems:

- 5 `useState` calls, but only 3 logical states: `closed`, `revoking`, `copying`.
- Both modal booleans can be `true` at once — no code prevents it.
- `selectedAPIKeyID` and `selectedAPIKeyName` are only meaningful when
  `isRevokeModalOpen` is true; in `closed` state they're stale strings.
- `apiKey` is only meaningful when `isCopyModalOpen` is true.
- The close handler for revoke must zero out three pieces of state atomically:
  ```tsx
  onClose={() => {
    setSelectedAPIKeyID('');
    setSelectedAPIKeyName('');
    setIsRevokeModalOpen(false);
  }}
  ```
  Forget one and the modal re-opens with stale data.

### After

```ts
type ModalContext =
  | { mode: 'closed' }
  | { mode: 'revoking'; id: string; name: string }
  | { mode: 'copying'; apiKey: APIKeyResource };

type ModalEvent =
  | { type: 'REVOKE'; id: string; name: string }
  | { type: 'COPY'; apiKey: APIKeyResource }
  | { type: 'CLOSE' };

const apiKeyModalMachine = createMachine<{ modal: ModalContext }, ModalEvent>({
  id: 'apiKeyModal',
  initial: 'closed',
  context: { modal: { mode: 'closed' } },
  states: {
    closed: {
      on: {
        REVOKE: {
          target: 'revoking',
          actions: assign((_ctx, e) => ({ modal: { mode: 'revoking', id: e.id, name: e.name } })),
        },
        COPY: {
          target: 'copying',
          actions: assign((_ctx, e) => ({ modal: { mode: 'copying', apiKey: e.apiKey } })),
        },
      },
    },
    revoking: { on: { CLOSE: { target: 'closed', actions: assign(() => ({ modal: { mode: 'closed' } })) } } },
    copying: { on: { CLOSE: { target: 'closed', actions: assign(() => ({ modal: { mode: 'closed' } })) } } },
  },
});
```

In React:

```tsx
const [modal, send] = useMachine(apiKeyModalMachine);

// Open revoke:
<APIKeysTable onRevoke={(id, name) => send({ type: 'REVOKE', id, name })} />

// The revoke modal — typed context, no stale strings:
<RevokeAPIKeyConfirmationModal
  isOpen={modal.value === 'revoking'}
  apiKeyID={modal.value === 'revoking' ? modal.context.modal.id : ''}
  apiKeyName={modal.value === 'revoking' ? modal.context.modal.name : ''}
  onClose={() => send({ type: 'CLOSE' })}
/>

// The copy modal — context guarantees apiKey is non-null when open:
<CopyAPIKeyModal
  isOpen={modal.value === 'copying'}
  apiKeySecret={modal.value === 'copying' ? modal.context.modal.apiKey.secret : ''}
  onClose={() => send({ type: 'CLOSE' })}
/>
```

### What collapsed

| Before                                           | After                                                |
| ------------------------------------------------ | ---------------------------------------------------- | -------- | -------- |
| 5 `useState` calls                               | 1 machine + 1 `useMachine`                           |
| Both modals can be open simultaneously           | impossible — `closed                                 | revoking | copying` |
| Stale `selectedAPIKeyID` when modal closed       | impossible — payload only exists in `revoking` state |
| 3-call atomic close (must zero ID + name + bool) | 1 `send({ type: 'CLOSE' })`                          |
| `onClose` handler is load-bearing                | gone — `CLOSE` transitions atomically                |
| Logic testable only with React                   | pure actor test, no rendering needed                 |

**Net: 5 `useState` calls → 1 machine. 3 impossible states made
unrepresentable. Atomic close replacing a fragile 3-setter dance.**

---

## Migration 3 (Complex): coordinated flags — `SignInStart`

**Archetype:** a `useLoadingStatus` machine glued to a conditional UI branch
with a coordinating flag — shows where to draw the machine boundary honestly

**Source:** `components/SignIn/SignInStart.tsx`

`SignInStart` has 8+ pieces of state. Not all of them belong in a machine —
this is the example that makes the case _and_ names the limits.

### Before (real code, abridged)

```tsx
const status = useLoadingStatus();      // 'idle' | 'loading' | 'error'
// …
const [alternativePhoneCodeProvider, setAlternativePhoneCodeProvider] =
  useState<PhoneCodeChannelData | null>(null);
// …
const [shouldAutofocus,    setShouldAutofocus]    = useState(!isMobileDevice() && !hasSocialOrWeb3Buttons);
const [hasSwitchedByAutofill, setHasSwitchedByAutofill] = useState(false);
const [identifierAttribute, setIdentifierAttribute] = useState<SignInStartIdentifier>(…);
```

The `status + alternativePhoneCodeProvider` pair coordinates: when an
alternative phone-code provider is selected, the component renders a
provider-specific form; when that form submits, `status` goes to loading.
These two pieces of state define the real view-model of the component:

```
                SELECT_PROVIDER
idle ──────────────────────────────► provider_selected
  ▲                                        │
  │  CLEAR_PROVIDER / BACK                 │ SUBMIT
  │                                        ▼
  └──────────────────────── submitting ◄──┘
                                   │
                      onDone ──────┘──► idle (with side effects)
                      onError ─────────► idle (error in context)
```

### After (the coordinated subset)

```ts
type SignInContext = {
  selectedProvider: PhoneCodeChannelData | null;
  error: string | null;
};
type SignInEvent =
  | { type: 'SELECT_PROVIDER'; provider: PhoneCodeChannelData }
  | { type: 'CLEAR_PROVIDER' }
  | { type: 'SUBMIT'; identifier: string };

const signInStartMachine = createMachine<SignInContext, SignInEvent>({
  id: 'signInStart',
  initial: 'idle',
  context: { selectedProvider: null, error: null },
  states: {
    idle: {
      on: {
        SELECT_PROVIDER: {
          target: 'provider_selected',
          actions: assign((_ctx, e) => ({ selectedProvider: e.provider, error: null })),
        },
        SUBMIT: 'submitting',
      },
    },
    provider_selected: {
      on: {
        CLEAR_PROVIDER: {
          target: 'idle',
          actions: assign(() => ({ selectedProvider: null })),
        },
        SUBMIT: 'submitting',
      },
    },
    submitting: {
      invoke: {
        src: (_ctx, event) => signIn.create({ identifier: (event as any).identifier }),
        onDone: { target: 'idle', actions: assign(() => ({ error: null })) },
        onError: {
          target: 'idle',
          actions: assign((_ctx, e) => ({ error: String(e.error) })),
        },
      },
    },
  },
});
```

### What stays as `useState` (honest boundary)

Not every piece of state in this component belongs in the machine:

| State                   | Keep as `useState`? | Why                                                              |
| ----------------------- | ------------------- | ---------------------------------------------------------------- |
| `identifierAttribute`   | yes                 | A UI selection with no async lifecycle — simple controlled input |
| `hasSwitchedByAutofill` | yes                 | A one-shot flag reset on the next user action, no transitions    |
| `shouldAutofocus`       | yes                 | Pure UI concern, no business logic                               |

**The rule:** reach for a machine when state has an _async lifecycle_ (a
promise that must complete before transitioning) or when two or more pieces
of state are _mutually constraining_ (setting one must clear another). A
single boolean that never interacts with async is fine as `useState`.

### What collapsed (the coordinated subset)

| Before                                                               | After                                |
| -------------------------------------------------------------------- | ------------------------------------ |
| `useLoadingStatus` (React-bound)                                     | machine state `submitting`           |
| `alternativePhoneCodeProvider !== null` check                        | machine state `provider_selected`    |
| Manual `setAlternativePhoneCodeProvider(null)` atomically with reset | `CLEAR_PROVIDER` transition          |
| `status.setLoading() / setIdle() / setError()`                       | `invoke` (no manual calls)           |
| No guard on double-submit                                            | `SUBMIT` not handled in `submitting` |
| Logic testable only with React                                       | pure actor test                      |

**Net: `useLoadingStatus` + 1 `useState` → 1 machine. The machine draws an
explicit boundary; the 3 independent `useState`s above stay exactly where
they are.**

---

## When NOT to reach for a machine

A machine earns its keep when **two or more** of these are true:

- The state has an async lifecycle (a promise, a fetch, a mutation).
- Two or more values must transition atomically (setting one requires
  clearing another).
- The same impossible combination would be a bug (both modals open, loading
  AND showing an error from a previous submit).
- The logic needs to be tested without rendering.

A machine is **overkill** when:

- There's a single boolean with no guards or async. `const [isOpen, setIsOpen]
= useState(false)` is fine.
- The state changes only in response to direct user input with no
  side-effects (`identifierAttribute`, `shouldAutofocus`).
- You'd end up with a two-state machine (`true | false`) and a single event.
  That's just a boolean.

The test: if you can't draw a diagram with at least 3 states or an async
arrow, `useState` is probably the right tool.

---

## How to migrate incrementally

You don't have to commit to migrating every piece of state at once. The
patterns above show a few natural entry points:

1. **Start with the submit path.** Any component that calls
   `status.setLoading()` / `status.setIdle()` / `status.setError()` can have
   those three calls replaced by an `idle → submitting` machine with `invoke`.
   The rest of the component can stay unchanged. This is a low-risk first step
   because you're replacing a known-bad pattern (manual `finally` calls) with
   a safer one.

2. **Then pull in the payload.** If the component also manages data that rides
   with the async operation (an `apiKey`, an `error`), add `context` to the
   machine. This is where the "impossible state" wins start to show up.

3. **Finally, absorb the coordinating flags.** If any `useState` values always
   get set or cleared atomically with the submit state, move them into the
   machine's `context` and wire them up as transitions. This is the full
   migration.

---

## The proven precedent

The ConfigureSSO Wizard was the most complex existing implicit machine in
`@clerk/ui`. It was a hand-rolled `reduce(state, event, config)` pure reducer
plus a React seam full of `useRef` mirrors and two "adjust-state-during-
render" passes. The migration parity test
([`__tests__/wizard-migration.test.tsx`](./__tests__/wizard-migration.test.tsx))
confirms the machine version reproduces every behavior while discarding the
seam entirely. The comparison table at the bottom of the README's worked
example is worth reading if you're considering a similar migration.
