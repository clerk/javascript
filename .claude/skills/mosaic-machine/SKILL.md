---
name: mosaic-machine
description: >
  Author and use Mosaic state machines. Use when the user is writing a state machine
  with createMachine, modelling a multi-step flow, wiring a machine to React with
  useMachine/useActor/useSelector, debugging a machine transition, or migrating from
  useState booleans to a machine.
---

# Mosaic Machine

> **XState-first rule:** Before designing any library feature or changing any API, look up how XState v5 handles the same pattern and align to it. Never invent new API shapes.

Core imports live in `packages/ui/src/mosaic/machine/`.

```ts
import { setup } from './setup'; // primary: pre-binds TContext + TEvent
import { createActor, mockActor } from './createActor';
import { useMachine, useActor, useSelector } from './useMachine';

// Lower-level (only when not using setup):
import { createMachine } from './createMachine';
import { assign } from './assign';
```

`setup<TContext, TEvent>()` returns `{ createMachine, assign, fromPromise }`. Use `fromPromise` for all `invoke` configurations — it carries the resolved type to `e.output` in `onDone.actions`.

---

## Anatomy

Use `setup<TContext, TEvent>()` at the top of each machine file. It pre-binds
both type parameters, returning a typed `createMachine` and `assign` so you
never have to restate them at call sites.

```ts
import { setup } from './setup';

// 1. Define context type — flat object, null defaults for optional fields.
interface MyContext {
  data: string | null;
  error: string | null;
}

// 2. Define the event union — SCREAMING_SNAKE_CASE types.
type MyEvent = { type: 'FETCH' } | { type: 'RETRY' } | { type: 'RESET' };

// 3. Pre-bind types once for the file.
const { createMachine, assign, fromPromise } = setup<MyContext, MyEvent>();

// 4. Factory when async deps are needed; plain createMachine() when not.
export function createMyMachine(fetchData: () => Promise<string>) {
  return createMachine({
    // no <MyContext, MyEvent> needed
    id: 'my',
    initial: 'idle',
    context: { data: null, error: null },
    states: {
      idle: {
        on: { FETCH: 'loading' },
      },
      loading: {
        // fromPromise carries the resolved type to e.output in onDone.actions.
        // A raw src function also works — e.output is `any` in that case.
        invoke: fromPromise(() => fetchData(), {
          onDone: {
            target: 'success',
            // e.output: string — typed from fetchData's return type, no cast needed
            actions: assign((_, e) => ({ data: e.output, error: null })),
          },
          onError: {
            target: 'failure',
            // e: ErrorInvokeEvent — inferred, no import needed
            actions: assign((_, e) => ({ error: String(e.error) })),
          },
        }),
      },
      success: { type: 'final' },
      failure: {
        on: { RETRY: 'loading', RESET: 'idle' },
      },
    },
  });
}
```

`assign`'s second type parameter is inferred from its position:

- Inside `on['SOME_EVENT']` → narrowed to that event member (e.g. `e.value` is safe)
- Inside `fromPromise(...).onDone` → `DoneInvokeEvent<TOutput>` where `TOutput` is the src return type
- Inside `onError` → `ErrorInvokeEvent`
- Inside `after[delay]` → `AfterEvent`

You do **not** need to import or write `DoneInvokeEvent`, `ErrorInvokeEvent`, `AfterEvent`,
or `Extract<Event, { type: 'X' }>` in machine files.

---

## Do's

**Model states, not booleans.** Replace `isOpen + isDeleting + isError` with explicit states — `idle → confirming → deleting → deleted`. Impossible combinations become unrepresentable.

**Define machines at module level or in a factory function.** They're static descriptions; creating inside a component recreates the object on every render (harmless for `useMachine` due to its `useRef` guard, but confusing and wasteful).

**Inject async deps via a factory, not module-level closure.**

```ts
// ✓ factory — testable, no import-time side effects
export const createDeleteOrgMachine = (destroyFn: () => Promise<void>) => createMachine({ ... });

// ✗ module-level capture — hard to test, couples to module load order
const machine = createMachine({ states: { deleting: { invoke: { src: () => someGlobal.destroy() } } } });
```

**Use `assign` for context updates.** It's a pure `(context, event) => Partial<context>` — the runtime merges the patch.

**Use `invoke` for async work.** Actions are synchronous side effects only; promises in actions are invisible to the machine.

**Gate navigation with state-node `guard`.** Every transition targeting the state checks it automatically — no per-transition boilerplate.

```ts
states: {
  step2: {
    guard: (ctx) => ctx.step1Complete,  // blocks all entry to step2
    on: { NEXT: 'step3', PREV: 'step1' },
  },
}
```

**Test in plain JS.** Drive `createActor → start → send` with no React. Reach unreachable/transient states with `mockActor`:

```ts
const actor = mockActor(machine, { value: 'deleting', context: { error: null } });
expect(actor.getSnapshot().value).toBe('deleting');
```

**Use `actor.recheck()` when external data a guard reads changes.** It re-seats to the derived initial if the current state's guard no longer holds, or fires any pending `always` transition.

---

## Don'ts

**Don't do async work in `actions`.** Promises returned from an action function are dropped — the machine never sees the resolved value.

**Don't mutate context directly in actions.** Side effects only; use `assign` to update context.

**Don't track "impossible" state in context.** If you find yourself checking `isDeleting && isOpen`, add a state instead of adding a guard on a context flag.

**Don't pass an async function captured at module definition time.** It can't be stubbed in tests, and it breaks the pattern of injecting live props.

---

## React patterns

### `useMachine` — own a flow for the component's lifetime

```tsx
function DeleteOrganization({ organization }: { organization: Org }) {
  const [snapshot, send] = useMachine(deleteOrgMachine, {
    // `context` is kept current via useLayoutEffect — safe to pass live props/functions.
    context: { destroyFn: () => organization.destroy() },
    // `onDone` fires once when the machine reaches a `type: 'final'` state.
    onDone: () => router.navigate('/dashboard'),
  });

  return (
    <ConfirmDialog
      open={snapshot.value === 'confirming' || snapshot.value === 'deleting'}
      onOpenChange={isOpen => send({ type: isOpen ? 'OPEN' : 'CANCEL' })}
      isDeleting={snapshot.value === 'deleting'}
      onConfirm={() => send({ type: 'CONFIRM' })}
      error={snapshot.context.error}
    />
  );
}
```

Branch on `snapshot.value` for UI, not on `snapshot.context` booleans.

`onDone` always calls the latest prop — no stale-closure risk. Do not replace it with a `useEffect` watching `snapshot.status`.

### `useActor` — bind to a shared actor

Use when the actor's lifecycle is owned by a parent or context provider.

```tsx
function StepIndicator({ actor }: { actor: WizardActor }) {
  const [snapshot] = useActor(actor);
  return <Breadcrumb currentStep={snapshot.value} />;
}
```

### `useSelector` — subscribe to a slice

Re-renders only when the selected value changes (by `Object.is`). Primary way to consume a shared actor without full-snapshot coupling.

```tsx
const error = useSelector(actor, snap => snap.context.error);
const isDeleting = useSelector(actor, snap => snap.value === 'deleting');
```

### Injecting live props

`useMachine` calls `actor.setContext(options.context)` via `useLayoutEffect` after every render. Pass functions from props without recreating the machine:

```tsx
// The machine reads `ctx.onSuccess` — always the latest prop.
const [snapshot, send] = useMachine(machine, { context: { onSuccess: props.onSuccess } });
```

### Debug logging (remove before shipping)

```tsx
import { useMachineLogger } from './useMachine';

const [snapshot, send] = useMachine(machine);
useMachineLogger('myFlow', snapshot); // logs: [myFlow] idle → loading { data: null }
```
