# Testing a Mosaic flow

A flow is three layers (`models.md` · `controllers.md` · `views.md`), and each is
tested in isolation. That isolation is the point: **only the model test mocks
Clerk**. The controller runs against a fake model object, and the view runs
against plain props.

Tests are Vitest + React Testing Library, co-located in `__tests__/` next to the
feature and named for the layer they cover.

`packages/ui/src/mosaic/user-button/__tests__/` is the canonical set to copy from:

| File                               | Covers                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| `user-button.model.test.tsx`       | Clerk → plain data. The only file that mocks Clerk.         |
| `user-button.controller.test.tsx`  | Fake model → view props. Pending, closing, gating.          |
| `user-button.view.test.tsx`        | Plain props → DOM. What each surface carries and withholds. |
| `user-button.test.tsx`             | The wrapper's branching, with all three layers mocked out.  |
| `user-button.integration.test.tsx` | Real layers against a mocked Clerk, driving the real DOM.   |
| `user-button.layout.test.ts`       | Pure derivation, no React.                                  |
| `user-button.utils.test.ts`        | Pure helpers, no React.                                     |

Shared helpers live in `packages/ui/src/mosaic/machines/__tests__/test-utils.ts`:
`deferred<T>()` (a promise whose `resolve`/`reject` are captured, so you can
assert an in-flight state before settling it), `tick()` (flush microtasks so an
`invoke`'s `onDone`/`onError` runs), and `noop`.

Run one file with `pnpm --filter @clerk/ui test <substr>`.

---

## Model — mock Clerk, assert the plain data

Mock `@clerk/shared/react` with mutable module-level vars reset in `beforeEach`,
so a test opts into a condition by setting one flag rather than rewriting the
mock. Build the environment **per read**, not once, or a flag set inside a test
won't be seen:

```tsx
let isUserLoaded: boolean;
let user: FakeUser | null;
let singleSessionMode: boolean;
let environmentHydrated: boolean;

// Built per read rather than once, so a test setting any of the flags above is answered by it.
function environment() {
  return environmentHydrated
    ? { displayConfig: { branded }, authConfig: { singleSessionMode }, organizationSettings: { enabled: true } }
    : null;
}

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
    // Stubbed with a sentinel so the assertion is that this exact function reaches Clerk,
    // rather than that some function did.
    usePortalRoot: () => getContainer,
    useClerk: () => ({ setActive, signOut, buildSignInUrl: () => '/sign-in', __internal_environment: environment() }),
  };
});
```

Stub at the **helper the model actually reads through**, not one layer deeper —
the paginated lists come from `useOrganizationListInView`, so that is the fetch
boundary to mock.

Then `renderHook(() => useUserButtonModel(options))` and assert:

- `status` is `loading` until every load flag that affects layout has answered,
  and `hidden` — not `loading` — once Clerk says nobody is signed in.
- A capability the instance lacks makes its callback `undefined`
  (`singleSessionMode` → no `onSignOutAll`; no permission → no `onInviteMembers`).
- Calling a callback reaches Clerk with the right arguments, and revalidates
  after the mutation.

These are the assertions no other layer can make. When a migration loses
behavior, it is almost always here.

## Controller — fake model, no Clerk

Build a `ready()` factory that returns a plain model literal with `vi.fn()`
callbacks, render a harness that surfaces what the controller returns, and drive
it. There is no Clerk mocking in this file at all:

```tsx
function ready(overrides: Partial<UserButtonReadyModel> = {}): UserButtonReadyModel {
  return {
    status: 'ready',
    organizationsEnabled: true,
    activeSession: { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' },
    memberships: [],
    additionalSessions: [],
    ...overrides,
  };
}

function Harness({ model, ...options }: { model: UserButtonModel } & UserButtonControllerOptions) {
  const c = useUserButtonController(model, options);
  if (c.status !== 'ready') return <output data-testid='status'>{c.status}</output>;
  return (
    <div>
      <output data-testid='open'>{String(c.open)}</output>
      <output data-testid='pending'>{c.pendingKey ?? ''}</output>
      <button onClick={() => c.onSelectOrganization?.('org_1')}>select-org</button>
    </div>
  );
}

it('runs a model action through the machine and keys the affordance', async () => {
  const onSelectOrganization = vi.fn(() => Promise.resolve());
  render(<Harness model={ready({ onSelectOrganization })} />);

  fireEvent.click(screen.getByText('open'));
  fireEvent.click(screen.getByText('select-org'));

  expect(onSelectOrganization).toHaveBeenCalledWith('org_1');
  await waitFor(() => expect(screen.getByTestId('pending')).toHaveTextContent('select-org:org_1'));

  await act(async () => {
    await tick();
  });
  expect(screen.getByTestId('open')).toHaveTextContent('false');
});
```

Assert what only the controller decides: `loading`/`hidden` passing through, which
actions close the surface and which leave it open, that a hand-off closes _before_
it runs, that an absent model callback stays absent, and that a second action
cannot start while one is in flight. Use `deferred()` + `act()` to hold an effect
open and observe the in-flight state.

For a transient state you can't easily drive to, teleport in with
`mockActor(machine, { value, context })` — see `machine/README.md` →
"Testing & docs".

## View — plain props, no Clerk, no machine

Pass plain data and `vi.fn()` callbacks. Assert what renders and that the right
callback fires. **Wrap in `<MosaicProvider>`** — it is not a Clerk provider; it
supplies the icon-override context, and wrapping keeps the test tree matching
production.

Give the fixture **every** callback by default, so a test opts a surface _out_ of
an affordance rather than having to opt into it — that way "this row is absent"
is an explicit assertion rather than an accident of the fixture.

```tsx
const alice = { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' };

function renderView(overrides: Partial<UserButtonProps> = {}) {
  const props = { ...allCallbacks, activeSession: alice, memberships: [], ...overrides };
  render(
    <MosaicProvider>
      <UserButtonView {...props} />
    </MosaicProvider>,
  );
  return props;
}

it('omits sign-out-of-all when the instance does not offer it', async () => {
  renderView({ onSignOutAll: undefined });
  await userEvent.click(screen.getByRole('button', { name: /open account menu/i }));
  expect(screen.queryByText(m.footer.signOutAll)).not.toBeInTheDocument();
});
```

Because the view is pure rendering, a test can assert "props X render element Y
and clicking Z calls W" for every branch without any of the flow or data
machinery.

## Wrapper — mock all three layers

The wrapper's own job is only which status renders what, so mock the model,
controller, and view out and assert the branching:

```tsx
vi.mock('../user-button.model', () => ({ useUserButtonModel: () => ({ status: 'loading' }) }));
vi.mock('../user-button.controller', () => ({ useUserButtonController: () => controller }));
vi.mock('../user-button.view', () => ({ UserButtonView: () => <output data-testid='view' /> }));
```

## Integration — real layers, mocked Clerk

One file per connected component, proving the layers compose. It mocks Clerk the
same way the model test does, then renders the real wrapper and drives the real
DOM with `userEvent`. It is the only place that catches wiring bugs the isolated
tests each pass: an action that should close the popup but doesn't, a model
callback the controller forgot to wrap, a prop name that drifted between layers.

Keep it about **composition**, not coverage — the per-layer tests own the
branches.
