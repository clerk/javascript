# Machines

The machine runtime is documented **next to the code**, and that in-tree doc is
the source of truth (it's updated in the same diff when the runtime changes and
is readable by every tool, not just Claude Code). Read:

- **`packages/ui/src/mosaic/machine/README.md`** — the mental model (state /
  event / context / transition), your first machine, `setup` to drop the type
  boilerplate, running it with `createActor` / `useMachine`, and the API at a
  glance (`assign`, `invoke`, `guard`, `always`, `entry`/`exit`, `final`,
  `mockActor`, `useActor`, `useSelector`, `recheck()`).
- **`packages/ui/src/mosaic/machine/ADOPTION.md`** — when a flow is worth a
  machine and when it isn't, with real before/after migrations.

The machine is the pure flow layer: states, events, guards, async `invoke`,
errors — no React hooks, no Clerk. To wire it to Clerk data see `controllers.md`;
to render its snapshot see `views.md`; to test it see `testing.md`; to migrate a
legacy component into this pattern see `migration.md`.
