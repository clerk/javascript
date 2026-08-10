# Testing a Mosaic flow

A flow is three layers (`machines.md` · `controllers.md` · `views.md`), and each
is tested in isolation. That isolation is the point: the machine needs no React,
the view needs no Clerk. Tests are Vitest + React Testing Library, co-located in
`__tests__/` next to the feature, named `<feature>.{machine,controller,view}.test.*`.

Canonical templates to copy from:

- `packages/ui/src/mosaic/sections/__tests__/delete-organization.machine.test.ts`
- `packages/ui/src/mosaic/sections/__tests__/delete-organization.controller.test.tsx`
- `packages/ui/src/mosaic/sections/__tests__/delete-organization.view.test.tsx`

Shared helpers live in
`packages/ui/src/mosaic/machines/__tests__/test-utils.ts`: `deferred<T>()` (a
promise whose `resolve`/`reject` are captured so you can assert an in-flight
state before settling it), `tick()` (flush microtasks so an `invoke`'s
`onDone`/`onError` runs), and `noop` (a no-op async dep).

Run one file with `pnpm --filter @clerk/ui test <substr>`.

---

## Machine — plain JS, no React

Drive the actor directly. Inject async deps through `context` as `vi.fn()`s, send
events, assert `getSnapshot().value` / `.context`. Await `tick()` when an
`invoke` needs to settle.

```ts
import { describe, expect, it, vi } from 'vitest';
import { createActor } from '../../machine/createActor';
import { deleteOrgMachine } from '../delete-organization.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

it('invokes the injected delete function after a valid confirmation', async () => {
  const destroyOrganization = vi.fn(() => Promise.resolve());
  const actor = createActor(deleteOrgMachine, {
    context: { organizationName: 'Acme Inc', destroyOrganization },
  });

  actor.start();
  actor.send({ type: 'OPEN' });
  actor.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
  actor.send({ type: 'CONFIRM' });

  expect(actor.getSnapshot().value).toBe('deleting');
  expect(destroyOrganization).toHaveBeenCalledTimes(1);

  await tick();
  expect(actor.getSnapshot().value).toBe('deleted');
});
```

For a transient/unreachable state you can't easily send your way to (mid-mutation,
a guard-gated wizard step), teleport in with `mockActor(machine, { value,
context })` — see `machine/README.md` → "Testing & docs".

## Controller — mock Clerk, assert `status`

The controller is the only layer that touches Clerk, so this is the only test
that mocks it. Mock `@clerk/shared/react` with mutable module-level vars reset in
`beforeEach`, render a tiny harness that surfaces `controller.status` (and the
snapshot once ready), and assert the loading / hidden / ready gating. Use
`deferred()` + `act()` to hold an async effect open and observe the in-flight
state.

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../machines/__tests__/test-utils';
import { useDeleteOrganizationController } from '../delete-organization.controller';

let destroy: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let checkAuthorization: ReturnType<typeof vi.fn>;
let isLoaded: boolean;
let organization: { id: string; name: string; destroy: () => Promise<void>; adminDeleteEnabled: boolean } | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization, membership: null }),
    useOrganizationList: () => ({ userMemberships: { revalidate } }),
    useSession: () => ({ isLoaded: true, session: { id: 'sess_1', checkAuthorization } }),
  };
});

beforeEach(() => {
  destroy = vi.fn();
  revalidate = vi.fn().mockResolvedValue(undefined);
  checkAuthorization = vi.fn().mockReturnValue(true);
  isLoaded = true;
  organization = { id: 'org_1', name: 'Acme Inc', destroy, adminDeleteEnabled: true };
});
afterEach(() => vi.clearAllMocks());

function Harness() {
  const controller = useDeleteOrganizationController();
  if (controller.status !== 'ready') return <output data-testid='state'>{controller.status}</output>;
  return (
    <div>
      <output data-testid='state'>{controller.snapshot.value}</output>
      <button onClick={() => controller.send({ type: 'CONFIRM' })}>Confirm</button>
    </div>
  );
}

it('is hidden when the user lacks the delete permission', () => {
  checkAuthorization.mockReturnValue(false);
  render(<Harness />);
  expect(screen.getByTestId('state')).toHaveTextContent('hidden');
});

it('drives CONFIRM → deleting → resolve → deleted', async () => {
  const gate = deferred<void>();
  destroy.mockReturnValue(gate.promise);
  render(<Harness />);
  // …open + type + confirm…
  await act(async () => gate.resolve());
  expect(revalidate).toHaveBeenCalledTimes(1);
});
```

Assert controller responsibilities here that the machine can't see: the `hidden`
gate from `checkAuthorization`, `loading` until Clerk is loaded, and that
`revalidate` fires (only) on success.

## View — fake snapshot, no Clerk

Build a plain `snapshot` object and pass a `vi.fn()` `send`. Assert what renders
per `snapshot.value` and that interactions send the right event. **Wrap the view
in `<MosaicProvider>`** — it's not a Clerk provider; it supplies the theme
context that `useRecipe`/`useSlot` read. No Clerk providers or fixtures.

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type { DeleteOrgContext } from '../delete-organization.machine';
import { DeleteOrganizationView } from '../delete-organization.view';

function snapshot(overrides: Partial<Snapshot<DeleteOrgContext>> = {}): Snapshot<DeleteOrgContext> {
  return {
    value: 'confirming',
    status: 'active',
    context: { organizationName: 'Acme Inc', confirmationValue: '', destroyOrganization: async () => {}, error: null },
    ...overrides,
  };
}

function renderView(snap: Snapshot<DeleteOrgContext>, send = vi.fn(), canSubmit = false) {
  render(
    <MosaicProvider>
      <DeleteOrganizationView
        snapshot={snap}
        send={send}
        canSubmit={canSubmit}
      />
    </MosaicProvider>,
  );
  return { send };
}

it('emits a typed confirmation event from the input', () => {
  const { send } = renderView(snapshot());
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Acme Inc' } });
  expect(send).toHaveBeenCalledWith({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
});

it('shows machine errors without Clerk fixtures', () => {
  renderView(
    snapshot({
      context: {
        organizationName: 'Acme Inc',
        confirmationValue: 'Acme Inc',
        destroyOrganization: async () => {},
        error: 'Delete failed',
      },
    }),
  );
  expect(screen.getByText('Delete failed')).toBeInTheDocument();
});
```

Pass derived booleans (`canSubmit`, from `actor.can(...)`) as props — the view
never re-implements a machine guard, so a view test never needs the machine.
