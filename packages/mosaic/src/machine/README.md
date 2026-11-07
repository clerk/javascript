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

```text
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
import { setup } from '../../machine/setup';

const { createMachine, createInvoke } = setup<LoaderContext, LoaderEvent>();

const loader = createMachine({
  initial: 'idle', // where it starts
  context: { query: '', data: null, error: null }, // the data that rides along
  states: {
    idle: {
      on: {
        SET_QUERY: ({ event }) => ({ context: { query: event.query } }), // stay put, patch context
        FETCH: { target: 'loading' }, // event FETCH → go to 'loading'
      },
    },
    loading: {
      // `invoke` runs a promise on entry and branches on the result.
      invoke: createInvoke({
        input: ({ context }) => context.query,
        src: ({ input }) => fetchThing(input),
        onDone: ({ event }) => ({ target: 'success', context: { data: event.output } }),
        onError: ({ event }) => ({ target: 'failure', context: { error: toLocalizableError(event.error) } }),
      }),
    },
    success: {},
    failure: { on: { FETCH: { target: 'loading' } } }, // allow a retry
  },
});
```

That's the whole flow, as one readable object. Notice there's no way to be in
`loading` _and_ have an `error` — the shape forbids it.

### Transitions

A transition is either `{ target: 'state' }` or a function:

```ts
(({ context, event, self, actions }, enq) => ({ target?, context?, reenter? }) | undefined)
```

- `target` is the state to enter. Leave it out to stay in the current state.
  Targeting the current state also stays: no exit or entry runs, and its invoke
  and `after` timers keep running. Set `reenter: true` to exit and enter it again,
  which restarts both.
- `context` is a shallow patch merged into context.
- Returning `undefined` with nothing queued means the event does not apply here.
  That is how a condition is written: `context.ready ? { target: 'next' } : undefined`.
- `enq(fn, ...args)` queues a fire-and-forget effect. Queued effects run after the
  transition is decided and before subscribers see the new snapshot. Never call
  an effect directly inside a transition.

`setup<TContext, TEvent, TInput>()` binds the types once per file, so `event` is
narrowed by position: `on.SET_QUERY` sees `{ type: 'SET_QUERY'; query: string }`,
`onDone` sees the invoke's output, `onError` sees `{ error: unknown }`, and
`after[delay]` sees the timer event.

A transition written outside `createMachine` widens `target` to `string`. Inline
it, or give it the return type `TransitionResult<Context, 'state'>`.

### Running it

A machine on its own does nothing — it's just a description. To run it you wrap
it in an **actor** (the running instance):

```ts
import { createActor } from '../../machine/create-actor';

const actor = createActor(loader);

actor.subscribe(snapshot => {
  console.log(snapshot.value); // 'idle' | 'loading' | 'success' | 'failure'
  console.log(snapshot.context); // { query, data, error }
});

actor.start();
actor.send({ type: 'FETCH' }); // → 'loading', then 'success'/'failure' when the promise settles
```

`actor.getSnapshot()` returns the current `{ value, context, status }`, and
`snapshot.can(event)` says whether an event would do anything right now.

### In React

`useMachine` does the create + start + subscribe for you:

```tsx
import { useMachine } from '../../machine/use-machine';

function Loader() {
  const [snapshot, send] = useMachine(loader);

  if (snapshot.value === 'idle') return <button onClick={() => send({ type: 'FETCH' })}>Load</button>;
  if (snapshot.value === 'loading') return <Spinner />;
  if (snapshot.value === 'failure') return <Error retry={() => send({ type: 'FETCH' })} />;
  return <Result data={snapshot.context.data} />;
}
```

The component is now a straight mapping from state → UI. No boolean juggling.

### Props: `input` and `provide`

A machine is declared once at module level, so it can't close over props. There
are two ways in:

- **`input`** builds the first context. Declare `context: ({ input }) => ({ … })`
  and pass `useMachine(machine, { input })`. It is read once, when the actor is
  created.
- **Named `actions` and `actors`** carry anything that should stay live. Declare
  defaults on the machine, read them in transitions (`actions.redirect`) or invoke
  them by name (`invoke: { src: 'save', input }`), and supply the real ones with
  `machine.provide({ actions, actors })`. `useMachine` re-applies the provided
  implementations on every render, so they always see the latest props.

```ts
const waitlistMachine = createMachine({
  initial: 'form',
  context: {},
  actions: { redirect: (): void => {} },
  states: {
    form: { on: { JOINED: { target: 'joined' } } },
    joined: { after: { 2000: ({ actions }, enq) => enq(actions.redirect) } },
  },
});

useMachine(waitlistMachine.provide({ actions: { redirect: () => onRedirect?.() } }));
```

A named actor is `createAsyncLogic(({ input, signal }) => promise)`. Its output
types `onDone`'s `event.output`.

---

## A few more building blocks

You've already seen `states`, `on`, `context`, and `invoke`. The rest:

- **`always`** — an eventless transition, checked when the state is entered
  and again after any transition that stays in it, even one that changes
  nothing. An event the state does not handle skips it.
  A result with only `context` is applied, then `always` is checked again.
  Listeners see one snapshot, after `always` settles. Good for "leave as soon
  as X is true."
- **`after`** — `{ [ms]: transition }`. The timer is cancelled when the state is
  left or the actor stops.
- **`entry` / `exit`** — run on entering or leaving a state. They can return a
  `context` patch and queue effects, but not change state.
- **`type: 'choice'`** — a state that picks a target immediately:
  `{ type: 'choice', choice: ({ context }) => ({ target: … }) }`. Use it with
  `initial` when the start state is derived, such as from `input`.
- **`route`** — lets `send({ type: 'machine.route', to: '#id' })` jump to a state
  with that `id`. `route: {}` always allows it; a function can refuse or patch
  context.
- **`type: 'final'`** — a terminal state; the flow is done, further events are
  ignored.

### API at a glance

The exports live in `create-machine.ts`, `setup.ts`, `create-actor.ts` and `use-machine.ts`; their JSDoc is the reference. Which React hook to reach for:

- `useMachine(machine, { input })` when the component owns the actor for its lifetime.
- `useActor(actor)` when the actor is shared or passed in, including one from `restoreActor` that renders a step directly.
- `useSelector(actor, selector)` when a component needs one slice and should re-render only when that slice changes.

### Behaviors worth knowing

**Nothing happens on a no-op.** If no transition applies, the snapshot is
returned _by reference unchanged_ and subscribers are **not** notified. That's
what lets `useSelector` skip re-renders, and lets a caller detect "the flow
didn't move" with a `===` check.

**Effects before notify.** Effects queued with `enq` run before the snapshot
swaps, and subscribers are notified after. A listener never sees a state whose
effects have not run.

### Testing & docs

Because a machine runs without React, most tests just drive the actor in plain
JS — see [`__tests__/machine.test.ts`](./__tests__/machine.test.ts). For a step
you can't easily click to (a `deleting` state hidden behind a 2-second mutation),
`restoreActor` drops you straight in:

```ts
const actor = restoreActor(loader, loader.resolveState({ value: 'failure', context: failedContext }));
render(<Loader actor={actor} />); // snapshot a state you'd otherwise have to provoke
```

A component that takes an actor reads it with `useActor(actor)` instead of
`useMachine`.

---

## Worked example: the ConfigureSSO wizard

[`__tests__/wizard-migration.test.tsx`](./__tests__/wizard-migration.test.tsx)
ports the ConfigureSSO wizard's hand-written reducer and its React seam onto a
machine, and replays the reducer's test cases against it. Its header maps each
reducer concept to the machine one:

| Seam concern (before)                      | Machine (after)                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `reduce` event union + `guardHolds`        | `on` transitions that return `undefined` when the target step's guard fails                            |
| `initialState` furthest-reachable walk     | `initial: 'seat'`, a `choice` state that picks the furthest reachable step                             |
| every no-op returns `=== state`            | no-op = same snapshot ref + no notify                                                                  |
| `configRef` / `stateRef` render mirrors    | the actor _is_ the live state — `send` reads it synchronously                                          |
| re-seat clamp (adjust-state-during-render) | `send({ type: 'machine.route', to: '#seat' })` when the current step's guard stops holding             |
| `pendingNextFrom` deferred advance         | **gone** — an actor reads live guards synchronously, so `await mutation; send({ type: 'NEXT' })` works |
| terminal/first bubble detection            | the same no-op signal (`!snapshot.can(event)` at a boundary)                                           |
