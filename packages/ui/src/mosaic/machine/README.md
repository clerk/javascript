# Mosaic state machine

A tiny, dependency-free helper for modelling **flows** — anything that moves
through a sequence of steps: a delete confirmation, a multi-step wizard, a
sign-in attempt, a "save" button that goes idle → saving → saved.

You don't need to know state-machine theory to use it. This README starts from
the problem and builds up; the deep material is collapsed at the bottom.

---

## Why bother? The problem it solves

A flow is usually built from a pile of `useState` booleans:

```tsx
const [isOpen, setIsOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [error, setError] = useState(null);
const [confirmValue, setConfirmValue] = useState('');
```

The trouble is that nothing stops the _impossible_ combinations — `isDeleting`
**and** `isOpen === false`, an `error` while still `isDeleting`. The rules
("you can only delete after confirming the name") live scattered across event
handlers, and you can't test any of it without rendering the component.

A state machine flips that around: you list the **states** the flow can be in,
and the **events** that move between them. Impossible combinations become
unrepresentable, the rules live in one object, and you can drive the whole thing
in a plain test with no React at all.

---

## The mental model in 60 seconds

Four words. That's the whole vocabulary:

| Term           | Plain meaning                                                                            |
| -------------- | ---------------------------------------------------------------------------------------- |
| **state**      | A named step the flow can be in — `idle`, `loading`, `success`. Only ever one at a time. |
| **event**      | Something that happens — a click, a fetch resolving. You `send` events.                  |
| **context**    | The extra data that rides along — a typed value, an error, a result.                     |
| **transition** | A rule: "in state X, event Y takes you to state Z."                                      |

A flow that loads data has three steps and looks like this:

```
        FETCH                resolves
 idle ─────────►  loading  ───────────►  success
                     │
                     │ rejects
                     ▼
                  failure
```

That diagram _is_ the machine. The rest of this doc is how you write it down and
run it.

---

## Your first machine

```ts
import { createMachine } from '@/mosaic/machine/createMachine';
import { assign } from '@/mosaic/machine/assign';

const loader = createMachine({
  initial: 'idle', // where it starts
  context: { data: null, error: null }, // the data that rides along
  states: {
    idle: {
      on: { FETCH: 'loading' }, // event FETCH → go to 'loading'
    },
    loading: {
      // `invoke` runs a promise on entry and branches on the result.
      invoke: {
        src: () => fetchThing(),
        onDone: {
          target: 'success',
          // copy the resolved value into context
          actions: assign((_ctx, event) => ({ data: event.output })),
        },
        onError: {
          target: 'failure',
          actions: assign((_ctx, event) => ({ error: String(event.error) })),
        },
      },
    },
    success: {},
    failure: { on: { FETCH: 'loading' } }, // allow a retry
  },
});
```

That's the whole flow, as one readable object. Notice there's no way to be in
`loading` _and_ have an `error` — the shape forbids it.

### Eliminating boilerplate with `setup`

Once a machine grows beyond a few states, explicitly repeating the context and
event types on every `assign` call gets noisy:

```ts
// Without setup — types must be restated every time
assign<LoaderContext, Extract<LoaderEvent, { type: 'SET_QUERY' }>>((_, e) => ({
  query: e.query,
}));
```

`setup<TContext, TEvent>()` pre-binds both types once per file and returns
factory functions that don't require repeating them:

```ts
import { setup } from '@/mosaic/machine/setup';

const { createMachine, assign } = setup<LoaderContext, LoaderEvent>();

const loader = createMachine({
  // no <LoaderContext, LoaderEvent> needed
  initial: 'idle',
  context: { query: '', data: null, error: null },
  states: {
    idle: {
      on: {
        SET_QUERY: {
          actions: assign((_, e) => ({ query: e.query })), // e: { type: 'SET_QUERY'; query: string } ✓
        },
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: async ctx => fetchData(ctx.query),
        onDone: {
          target: 'success',
          actions: assign((_, e) => ({ data: String(e.output), error: null })), // e: DoneInvokeEvent<unknown>
        },
        onError: {
          target: 'failure',
          actions: assign((_, e) => ({ error: String(e.error) })), // e: ErrorInvokeEvent
        },
      },
    },
    success: {},
    failure: { on: { FETCH: 'loading' } },
  },
});
```

The `assign` returned by `setup` narrows the event type from its position:

- Inside `on['SET_QUERY']` → `e: { type: 'SET_QUERY'; query: string }`
- Inside `onDone` → `e: DoneInvokeEvent<unknown>`
- Inside `onError` → `e: ErrorInvokeEvent`
- Inside `after[delay]` → `e: AfterEvent`

You no longer need to import `DoneInvokeEvent`, `ErrorInvokeEvent`, or `AfterEvent`
in machine files — they flow through contextual typing automatically.

### Running it

A machine on its own does nothing — it's just a description. To run it you wrap
it in an **actor** (the running instance):

```ts
import { createActor } from '@/mosaic/machine/createActor';

const actor = createActor(loader);

actor.subscribe(snapshot => {
  console.log(snapshot.value); // 'idle' | 'loading' | 'success' | 'failure'
  console.log(snapshot.context); // { data, error }
});

actor.start();
actor.send({ type: 'FETCH' }); // → 'loading', then 'success'/'failure' when the promise settles
```

`actor.getSnapshot()` returns the current `{ value, context, status }` at any
time. `value` is the state name; `context` is the riding data.

### In React

`useMachine` does the create + start + subscribe for you:

```tsx
import { useMachine } from '@/mosaic/machine/useMachine';

function Loader() {
  const [snapshot, send] = useMachine(loader);

  if (snapshot.value === 'idle') return <button onClick={() => send({ type: 'FETCH' })}>Load</button>;
  if (snapshot.value === 'loading') return <Spinner />;
  if (snapshot.value === 'failure') return <Error retry={() => send({ type: 'FETCH' })} />;
  return <Result data={snapshot.context.data} />;
}
```

The component is now a straight mapping from state → UI. No boolean juggling.

---

## A few more building blocks

You've already seen `states`, `on`, `context`, `assign`, and `invoke`. The rest:

- **`guard`** — a condition on a transition. "CONFIRM only works once the typed
  name matches":
  ```ts
  CONFIRM: { target: 'deleting', guard: context => context.confirmValue === context.name }
  ```
- **state-node `guard`** — a condition on _entering a state at all_ ("may
  navigation land here right now?"). Every transition that targets the state
  checks it. This is what gates wizard steps.
- **`always`** — an eventless transition that fires the moment its guard is true,
  with no event sent. Good for "as soon as X is ready, move on."
- **`entry` / `exit`** — actions to run when a state is entered or left.
- **`type: 'final'`** — a terminal state; the flow is done, further events are
  ignored.
- **`initial` as a function** — `(context) => stateId`, when the starting step is
  computed (e.g. a wizard resuming on the furthest step the user has unlocked).

### API at a glance

| Export                                   | What it is                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `createMachine(config)`                  | Build the definition. A plain, inert, inspectable object.                                                                     |
| `assign(updater)`                        | A `(context, event) => Partial<context>` context update, used inside `actions`.                                               |
| `createActor(machine, options?)`         | The running instance: `.start()`, `.stop()`, `.send(event)`, `.getSnapshot()`, `.subscribe(fn)`, `.can(event)`, `.recheck()`. |
| `mockActor(machine, { value, context })` | An actor teleported straight to any step — render a transient/unreachable state for docs and snapshots.                       |
| `useMachine(machine, options?)`          | React: own an actor for the component's life → `[snapshot, send]`. Accepts `onDone` callback fired when the machine finishes. |
| `useActor(actor)`                        | React: bind to a **shared** actor → `[snapshot, send]`.                                                                       |
| `useSelector(actor, selector, equals?)`  | React: subscribe to one **slice** — re-renders only when that slice changes.                                                  |

### Two behaviors worth knowing

**Nothing happens on a no-op.** If an event is blocked by a guard or isn't
handled in the current state, the snapshot is returned _by reference unchanged_
and subscribers are **not** notified. That's what lets `useSelector` skip
re-renders, and lets a caller detect "the flow didn't move" with a `===` check.

**`recheck()` for guards that read the outside world.** A guard can read live
external data (an SWR cache, a store) through a closure, not just `context`.
When that data changes, call `actor.recheck()`. It re-seats the flow if the
current step is no longer valid, and fires any `always` transition that was
waiting on the data. (This is the seam the wizard's "the connection backing this
step was just deleted" handling sits on.)

### Testing & docs

Because a machine runs without React, most tests just drive the actor in plain
JS — see [`__tests__/machine.test.ts`](./__tests__/machine.test.ts). For a step
you can't easily click to (a `deleting` state hidden behind a 2-second mutation,
a guard-gated wizard step), `mockActor` drops you straight in:

```ts
const actor = mockActor(loader, { value: 'failure', context: { error: 'Network error' } });
render(<Loader actor={actor} />); // snapshot a state you'd otherwise have to provoke
```

---

<details>
<summary><strong>Worked example: migrating the ConfigureSSO Wizard (before → after)</strong></summary>

The wizard engine at `components/ConfigureSSO/elements/Wizard/` was hand-built as
a pure reducer (`reducer.ts`) plus a React seam (`useWizardMachine.ts`). It's the
strongest existing proof that this abstraction earns its keep, and it maps onto
the library one-to-one. The live migration test —
[`__tests__/wizard-migration.test.tsx`](./__tests__/wizard-migration.test.tsx) —
asserts the two are behaviorally identical.

### What the wizard does

Steps come from a runtime `descriptors[]` array. Each step has an **entry guard**
("may navigation land here?"). On load the wizard seats on the _furthest step
reachable by a contiguous run of holding guards_. `NEXT`/`PREV` move one slot;
`GOTO` jumps to any reachable step.

### Before: a reducer + a React seam full of workarounds

The pure reducer is clean:

```ts
// reducer.ts (abridged)
type WizardEvent = { type: 'NEXT' } | { type: 'PREV' } | { type: 'GOTO'; step: string };
const guardHolds = step => (step.guard ? step.guard() : true);

export const reduce = (state, event, config) => {
  const steps = config.descriptors;
  switch (event.type) {
    case 'NEXT': {
      const i = steps.findIndex(s => s.id === state.current);
      if (i < 0) return state; // unknown current → no-op
      const next = steps[i + 1];
      if (!next) return state; // terminal → same ref (host bubbles)
      if (!guardHolds(next)) return state; // blocked → same ref
      return { current: next.id, direction: 1, hasNavigated: true };
    }
    // …PREV mirrors NEXT; GOTO rejects unknown / current / blocked…
  }
};
```

The complexity is in the **React seam** — because the state lived inside React,
it needed ref-mirrors and two "adjust-state-during-render" passes:

```ts
// useWizardMachine.ts (abridged)
const [state, setState] = useState(() => initialState(config));
const [pendingNextFrom, setPendingNextFrom] = useState(null);

const configRef = useRef(config);
configRef.current = config; // mirror for stable handlers
const stateRef = useRef(state);
stateRef.current = state; // mirror

// #1 re-seat off a step whose guard broke (during render)
if (!isNested) {
  /* …if current step's guard is false, setState(initialState(config))… */
}

// #2 resolve a parked NEXT once its guard catches up to a just-resolved await
if (pendingNextFrom !== null) {
  /* …re-reduce NEXT against the FRESH config… */
}

const goNext = useCallback(() => {
  const next = reduce(stateRef.current, { type: 'NEXT' }, configRef.current);
  if (next !== stateRef.current) {
    setState(next);
    return;
  }
  // same-ref: terminal → bubble to parent, else blocked → park a deferred advance
}, []);
```

### After: a machine factory

Each descriptor becomes a state node whose entry `guard` gates every transition
landing on it; `initial` is the derived furthest-reachable step.

```ts
function createWizardMachine(descriptors) {
  const ids = descriptors.map(d => d.id);
  const guardHolds = d => (d.guard ? d.guard() : true);

  const furthestReachable = () => {
    if (descriptors.length === 0) return '';
    let i = 0;
    while (i + 1 < descriptors.length && guardHolds(descriptors[i + 1])) i++;
    return descriptors[i].id;
  };
  const navigated = direction => assign(() => ({ direction, hasNavigated: true }));

  const states = {};
  descriptors.forEach((d, i) => {
    const nextId = ids[i + 1];
    const prevId = ids[i - 1];
    states[d.id] = {
      guard: d.guard, // entry guard — gates every transition that targets this step
      on: {
        ...(nextId ? { NEXT: { target: nextId, actions: navigated(1) } } : {}),
        ...(prevId ? { PREV: { target: prevId, actions: navigated(-1) } } : {}),
        GOTO: descriptors
          .filter(t => t.id !== d.id)
          .map(t => ({ target: t.id, guard: (_c, e) => e.step === t.id, actions: navigated(0) })),
      },
    };
  });

  return createMachine({
    id: 'wizard',
    initial: furthestReachable,
    context: { direction: 0, hasNavigated: false },
    states,
  });
}
```

Driving it needs no refs and no render-phase passes:

```ts
const actor = createActor(createWizardMachine(descriptors));
actor.start(); // seats on the furthest-reachable step
actor.send({ type: 'NEXT' }); // advances iff the next step's entry guard holds
actor.recheck(); // external data changed → re-seat off a now-broken step
```

### What collapses, and why

| Seam concern (before)                      | Machine primitive (after)                                                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reduce` event union + `guardHolds`        | `on` transitions + state-node `guard`                                                                                                                                |
| `initialState` furthest-reachable walk     | derived `initial: furthestReachable`                                                                                                                                 |
| every no-op returns `=== state`            | no-op = same snapshot ref + no notify, for free                                                                                                                      |
| `configRef` / `stateRef` render mirrors    | the actor _is_ the live state — `send` reads it synchronously                                                                                                        |
| re-seat clamp (adjust-state-during-render) | `actor.recheck()`                                                                                                                                                    |
| `pendingNextFrom` deferred advance         | **gone** — that race only existed because React owned the state; an actor reads live guards synchronously, so `await mutation; send({ type: 'NEXT' })` just advances |
| terminal/first bubble detection            | the same same-ref no-op signal (`!actor.can(event)` at a boundary)                                                                                                   |

The reducer modelled a state machine by hand; the seam existed only to paper over
React owning the state. Moving the state into an actor deletes that second half.

### Stepper view by introspection

The breadcrumb (`isCompleted` positional / `isReachable` guard-driven) reads
straight off `machine.states` — no running instance, which is how docs enumerate
every step without clicking through:

```ts
const deriveStepper = (machine, current) => {
  const ids = Object.keys(machine.states);
  const currentIndex = ids.indexOf(current);
  return ids.map((id, i) => ({
    id,
    isCompleted: currentIndex >= 0 && i < currentIndex,
    isReachable: machine.states[id].guard ? machine.states[id].guard() : true,
  }));
};
```
