# Controllers

The controller is the adapter from Clerk resources into machine context and view
props. It is the **only layer in a Mosaic flow that may import Clerk hooks or
call Clerk resource methods** — the machine (`machines.md`) and view
(`views.md`) stay Clerk-free so they remain testable in plain JS.

See `references/mosaic-architecture.md` → "Controllers" for the canonical
example. This file is the practical checklist.

## Responsibilities

- **Read Clerk state.** Call hooks like `useOrganization()`, `useUser()`,
  `useSession()`. This is the only layer allowed to.
- **Inject async effects + live props into machine context.** Pass plain
  functions that close over live resources; `useMachine` re-seats context via
  `useLayoutEffect` every render, so the machine always reads the latest prop.

  ```tsx
  const [snapshot, send, actor] = useMachine(deleteOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      destroyOrganization: () => organization?.destroy() ?? Promise.resolve(),
    },
  });
  ```

- **Gate permissions and visibility.** Resolve `session.checkAuthorization(...)`
  and collapse loading/permission/empty into an explicit status the wrapper
  branches on — not scattered booleans:

  ```tsx
  if (!canRead || !settings.enabled || !organization) return { status: 'hidden' as const };
  if (!firstPageLoaded) return { status: 'loading' as const };
  return { status: 'ready' as const, snapshot, send, canSubmit: actor.can({ type: 'CONFIRM' }) };
  ```

- **Own revalidate timing.** Call `data.revalidate()` / `.reload()` after
  mutations. Deciding _when_ (fire-and-forget vs awaited) is controller logic,
  not view logic.
- **Handle first-page-load empty-state.** Wait for the first page before
  deciding to hide a section, so read-only users don't see a hide-then-show
  flicker.
- **Derive view props.** Expose `actor.can(...)` results (e.g. `canSubmit`) so
  the view never re-implements a machine guard.

## Rules

- Pass **plain data and plain functions** into machines and views. Do **not**
  pass Clerk resource objects through to the view.
- Branch the wrapper on the controller's `status`, not on raw `isLoaded` flags
  sprinkled through the tree.

## Testing

Test the controller against a **mocked Clerk** for the gating / `hidden` /
empty-state logic. This is the **highest-risk, least-covered layer**: it holds
the Clerk resource semantics that the pure machine tests can't reach. When a
migration loses behavior, it is usually a controller responsibility (revalidate
timing, a permission gate, an empty-state rule) that quietly went missing —
concentrate scrutiny here.
