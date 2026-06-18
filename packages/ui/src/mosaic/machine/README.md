# Mosaic state machine

A small, dependency-free state-machine library for Mosaic. It lets a flow — a
delete confirmation, a multi-step wizard, a sign-in attempt — be defined **as
data, outside the React lifecycle**, so the flow is easy to test in plain JS,
mock for docs, and reason about as one object instead of a handful of `useState`
booleans smeared across components.

The shape mirrors [XState v5](https://stately.ai/docs) (a machine is a config
object; a running instance is a separate "actor") but is trimmed to a tiny core:
no parallel states, history, delayed transitions, SCXML, or spawned actors.

> No barrel file — import from the individual modules
> (`./createMachine`, `./createActor`, `./assign`, `./useMachine`).

## The core idea: definition is separate from the running instance

```ts
import { createMachine } from '@/mosaic/machine/createMachine';
import { createActor } from '@/mosaic/machine/createActor';
import { assign } from '@/mosaic/machine/assign';

// 1. Definition — a plain, inert, introspectable object. Nothing runs.
const toggle = createMachine({
  id: 'toggle',
  initial: 'inactive',
  context: { count: 0 },
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: {
      on: { TOGGLE: 'inactive' },
      entry: assign(c => ({ count: c.count + 1 })),
    },
  },
});

// Static introspection — enumerate every step without running anything.
Object.keys(toggle.states); // → ['inactive', 'active']

// 2. Running instance ("actor") — a standard observable.
const actor = createActor(toggle);
actor.subscribe(snap => console.log(snap.value, snap.context));
actor.start(); // runs entry actions / immediates of the initial state
actor.send({ type: 'TOGGLE' }); // → 'active', { count: 1 }
actor.getSnapshot(); // → { value: 'active', context: { count: 1 }, status: 'active' }
```

A **snapshot** is `{ value, context, status }`. Guards, reducers (`assign`), and
actions are pure `(context, event)` functions — which is what makes the whole
thing testable without rendering a single component.

## API surface

| Export                                   | What it is                                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createMachine(config)`                  | Build an introspectable definition. Keep: `initial` (static id or `(context) => id`), `context`, `states`, `on`, `target`, `actions`/`assign`, `guard` (per-transition), state-node `guard` (per-entry), `always` (eventless), `invoke`/`onDone`/`onError`, `entry`/`exit`, `type: 'final'`. |
| `assign(updater)`                        | Context-update action. `(context, event) => Partial<context>`, shallow-merged. Pure and unit-testable on its own.                                                                                                                                                                            |
| `createActor(machine, options?)`         | Wrap a definition in a running instance: `.start()`, `.stop()`, `.send(event)`, `.getSnapshot()`, `.subscribe(listener)`, `.can(event)`, `.recheck()`.                                                                                                                                       |
| `mockActor(machine, { value, context })` | A started-but-inert actor teleported to an arbitrary state — render a transient/unreachable step for docs and snapshots.                                                                                                                                                                     |
| `useMachine(machine, options?)`          | React: create-and-own an actor for the component's lifetime → `[snapshot, send]`.                                                                                                                                                                                                            |
| `useActor(actor)`                        | React: bind a **shared** actor → `[snapshot, send]`.                                                                                                                                                                                                                                         |
| `useSelector(actor, selector, equals?)`  | React: subscribe to a memoised **slice** — re-renders only when the selected projection changes (default `Object.is`).                                                                                                                                                                       |

### No-op identity

A guard-blocked, entry-blocked, or unhandled event is a **true no-op**: the
snapshot is referentially unchanged (`getSnapshot() === before`) and subscribers
are **not** notified. This is what lets `useSelector` skip re-renders and lets a
host detect "nothing happened" by reference.

### `recheck()` — the external-data seam

Guards may read live external data (an SWR cache, a store) via closure, not just
`context`. When that data changes, call `actor.recheck()`. It:

1. re-seats to the freshly-resolved `initial` state if the **current** state's
   entry guard no longer holds (self-correction), otherwise
2. re-runs the current state's `always` transitions, resolving one that was
   parked waiting on the now-arrived data.

No notify when the current state is still enterable and no `always` applies.

## Real-world example: the ConfigureSSO Wizard

The wizard engine at `components/ConfigureSSO/elements/Wizard/` was hand-built as
a pure reducer (`reducer.ts`) plus a React seam (`useWizardMachine.ts`). It is
the strongest existing proof-of-need, and it migrates onto this library
one-to-one. (The live migration test —
[`__tests__/wizard-migration.test.tsx`](./__tests__/wizard-migration.test.tsx) —
asserts the two are behaviorally identical.)

### Before — a hand-written reducer + a React seam

```ts
// reducer.ts — the pure core (abridged)
type WizardEvent = { type: 'NEXT' } | { type: 'PREV' } | { type: 'GOTO'; step: string };

const guardHolds = (step: WizardStepDescriptor) => (step.guard ? step.guard() : true);

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
    case 'PREV': {
      /* …mirror of NEXT… */
    }
    case 'GOTO': {
      /* …find target, reject unknown / current / blocked, else advance… */
    }
    default:
      return state;
  }
};
```

```ts
// useWizardMachine.ts — the React seam (the boilerplate, abridged)
const [state, setState] = useState(() => initialState(config));
const [pendingNextFrom, setPendingNextFrom] = useState<string | null>(null);

const configRef = useRef(config);
configRef.current = config; // render mirror
const stateRef = useRef(state);
stateRef.current = state; // render mirror

// adjust-state-during-render #1: re-seat off a step whose guard broke
if (!isNested) {
  const d = config.descriptors.find(d => d.id === state.current);
  if (!d || !guardHolds(d)) {
    const seated = initialState(config);
    if (seated.current !== state.current) setState(seated);
  }
}

// adjust-state-during-render #2: resolve a parked NEXT once its guard catches up
if (pendingNextFrom !== null) {
  /* re-reduce NEXT against the FRESH config; commit, keep, or abandon */
}

const goNext = useCallback(() => {
  const next = reduce(stateRef.current, { type: 'NEXT' }, configRef.current);
  if (next !== stateRef.current) {
    setPendingNextFrom(null);
    setState(next);
    return;
  }
  // same-ref: distinguish terminal (bubble to parent) from blocked (defer) by index
  /* …isTerminal ? parent.goNext() : setPendingNextFrom(prev.current)… */
}, []);
```

The reducer is clean. The **seam** is where the complexity lives: two `useRef`
render-mirrors so the stable handlers see fresh values, and two
"adjust-state-during-render" passes (a re-seat clamp and a `pendingNextFrom`
deferred advance) that exist purely because the state lives _inside_ React and a
just-resolved `await` runs before the next render.

### After — a data-driven machine factory

The graph comes from a runtime `descriptors[]` array, so the machine is built by
a factory. Each step becomes a state node whose **entry guard** gates every
transition that lands on it; `initial` is the derived "furthest-reachable" step.

```ts
interface StepDescriptor {
  id: string;
  guard?: () => boolean;
}
interface WizardContext {
  direction: 1 | -1 | 0;
  hasNavigated: boolean;
}
type WizardEvent = { type: 'NEXT' } | { type: 'PREV' } | { type: 'GOTO'; step: string };

function createWizardMachine(descriptors: StepDescriptor[]) {
  const ids = descriptors.map(d => d.id);
  const guardHolds = (d: StepDescriptor) => (d.guard ? d.guard() : true);

  // Derived initial — the furthest contiguously-reachable step.
  const furthestReachable = () => {
    if (descriptors.length === 0) return '';
    let i = 0;
    while (i + 1 < descriptors.length && guardHolds(descriptors[i + 1])) i++;
    return descriptors[i].id;
  };

  const navigated = (direction: 1 | -1 | 0) =>
    assign<WizardContext, WizardEvent>(() => ({ direction, hasNavigated: true }));

  const states: Record<string, StateConfig<WizardContext, WizardEvent>> = {};
  descriptors.forEach((d, i) => {
    const nextId = ids[i + 1];
    const prevId = ids[i - 1];
    states[d.id] = {
      guard: d.guard, // STATE entry guard — gates every transition targeting this step
      on: {
        // one slot forward / back; no handler at the boundary → same-ref no-op
        ...(nextId ? { NEXT: { target: nextId, actions: navigated(1) } } : {}),
        ...(prevId ? { PREV: { target: prevId, actions: navigated(-1) } } : {}),
        // one GOTO candidate per OTHER step; entry guard gates landing
        GOTO: descriptors
          .filter(t => t.id !== d.id)
          .map(t => ({
            target: t.id,
            guard: (_ctx, e) => e.type === 'GOTO' && e.step === t.id,
            actions: navigated(0),
          })),
      },
    };
  });

  return createMachine<WizardContext, WizardEvent>({
    id: 'wizard',
    initial: furthestReachable,
    context: { direction: 0, hasNavigated: false },
    states,
  });
}
```

Driving it is now plain — no refs, no render-phase passes:

```ts
const actor = createActor(createWizardMachine(descriptors));
actor.start(); // seats on the furthest-reachable step

actor.send({ type: 'NEXT' }); // advances iff the next step's entry guard holds
actor.recheck(); // external data changed → re-seat off a broken step
```

### How the seam's boilerplate collapses

| Seam concern (before)                          | Machine primitive (after)                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `reduce` `NEXT/PREV/GOTO` union + `guardHolds` | `on` transitions + state-node `guard`                                                                                                      |
| `initialState` furthest-reachable derivation   | derived `initial: furthestReachable`                                                                                                       |
| every no-op returns `=== state`                | no-op = referentially-equal snapshot + no notify, for free                                                                                 |
| `configRef`/`stateRef` render mirrors          | the actor _is_ the live state — `send` reads it synchronously                                                                              |
| re-seat clamp (adjust-state-during-render)     | `actor.recheck()`                                                                                                                          |
| `pendingNextFrom` deferred advance             | **unnecessary** — the actor isn't subject to React's render-phase staleness; `await mutation; send({ type: 'NEXT' })` advances immediately |
| terminal-NEXT / first-PREV bubble detection    | the same same-ref no-op signal (`!actor.can(event)` at a boundary)                                                                         |

The reducer modeled a state machine by hand; the seam papered over the fact that
React owned the state. Moving the state into an actor deletes the second half
entirely.

### Stepper view by introspection

The breadcrumb (`isCompleted` positional / `isReachable` guard-driven) is derived
from `machine.states` + the current id — no running instance needed, which is the
swingset "navigate to each step" seam:

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

## Testing & the docs seam

Because a machine runs without React, the bulk of coverage is plain-JS actor
driving (see [`__tests__/machine.test.ts`](./__tests__/machine.test.ts)). For
transient or unreachable states — a `deleting` step hidden behind a 2s mutation,
a guard-gated wizard step — `mockActor` teleports straight in:

```ts
const actor = mockActor(machine, { value: 'deleting', context: { error: null } });
render(<Step actor={actor} />); // snapshot a state you could never click into
```
