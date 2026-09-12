# Machines

A machine is **not a layer**. It is one of the two ways a controller
(`controllers.md`) can hold its state — the one to reach for when the
interaction has an async lifecycle, an error path back to a previous step, a
terminal state that must never reopen, or two values that must change together.
It is declared in the controller's own file — there is no `*.machine.ts` in a
feature — and the controller is the only thing that sends to it.

A flow without those properties does not need one: `useState` in the controller
is the right answer for a boolean that never touches async, and a controller can
run a machine for its coordinated core with `useState` flags beside it. The view
cannot tell the difference either way. `machine/ADOPTION.md` is the judgement
call, with real before/after migrations and an "honest boundary" table of what
stays `useState`.

The machine runtime is documented **next to the code**, and that in-tree doc is
the source of truth (it is updated in the same diff when the runtime changes and
is readable by every tool, not just Claude Code). Read:

- **`packages/ui/src/mosaic/machine/README.md`** — the mental model (state /
  event / context / transition), your first machine, `setup` to drop the type
  boilerplate, running it with `createActor` / `useMachine`, and the API at a
  glance (`assign`, `invoke`, `guard`, `always`, `entry`/`exit`, `final`,
  `mockActor`, `useActor`, `useSelector`, `recheck()`).
- **`packages/ui/src/mosaic/machine/ADOPTION.md`** — when a flow is worth a
  machine and when it isn't.

Two directories one letter apart: `machine/` is the runtime, `machines/` holds
standalone machines and the shared `__tests__/test-utils.ts`. A feature's own
machine goes in its `*.controller.tsx`, not in either.

## Injected effects

A machine never calls Clerk. The effect it invokes arrives through context as a
plain function, seated by the controller — `useMachine` re-seats context via
`useLayoutEffect` every render, so the machine always invokes the latest one:

```ts
deleting: {
  invoke: fromPromise(context => context.deleteAccount(), {
    onDone: 'deleted',
    onError: {
      target: 'confirming',
      actions: assign((_, event) => ({
        errorMessage: event.error instanceof Error ? event.error.message : 'Something went wrong.',
      })),
    },
  }),
}
```

To wire it to Clerk data see `models.md`; to render its state see `views.md`; to
test it see `testing.md`; to migrate a legacy component into this pattern see
`migration.md`.
