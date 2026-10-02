# Testing a Mosaic flow

We follow [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests):

- **Mostly integration.** Most tests render the real feature against a real
  Clerk and use it the way a user would.
- **Not too many.** Each test should buy confidence that the feature works for
  a user. Past that point, tests cost more than they return.
- **Don't test implementation details.** A test that breaks on a refactor that
  keeps the behavior is testing the wrong thing.
- **Static checks come first.** TypeScript and ESLint catch typos and shape
  errors, so tests don't need to.

A flow is three layers (`models.md` · `controllers.md` · `views.md`), but it is
**not** tested per layer. The props between layers are internal contracts that
change every time the flow grows, so tests pinned to them get rewritten with
every change and prove little about what the user sees. Test at the two stable
boundaries instead:

- **In:** the Frontend API (FAPI), the HTTP contract Clerk talks to.
- **Out:** what the user sees and can do (roles, text, focus).

Rule of thumb: **test each behavior once, at the boundary that owns it.**

## Three tiers

| Tier    | Files                       | Runs in                                | Covers                                                                  |
| ------- | --------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| Unit    | `*.test.ts(x)`              | jsdom (`--project mosaic`)             | Pure helpers, shared primitives (`useForm`, `Dialog`, machines), timing |
| Feature | `*.feature.test.tsx`        | Chromium via Vitest browser mode       | A feature end to end: real `Clerk`, real layers, FAPI faked with MSW    |
| E2E     | `/integration` (Playwright) | Real apps against a real Clerk backend | Framework wiring, redirects, real sessions. Not written per Mosaic flow |

Visual states (loading, empty, every error, every variant) are swingset stories
with plain props, reviewed by eye. Don't duplicate them as view tests.

Each behavior lives in one tier. A feature test owns everything the feature
does on screen, including edge cases, busy states, and errors. E2E only proves
what a faked FAPI can't:

- The framework SDK mounts the component.
- An action really changes the session: sign-out clears it, a switch survives a
  reload.
- A route the component sends the user to really exists.
- Components from another package, such as the `UserProfile` modal, render
  what Mosaic hands them.

Keep a feature's E2E to one short smoke file. Don't repeat modes, orderings, or
failure cases there.

Default to a feature test for behavior the user can see. Reach for a smaller
test when it is the better tool, for example:

- Logic with many combinations (ordering, labels, layout rules). Pull it into
  a pure function and unit-test the table.
- States or timing that are awkward to produce through FAPI.
- A bug that is much easier to pin down at a single layer.

Avoid per-layer tests with mocked layers that repeat what a feature test
already covers. Older per-layer tests like that can go once a feature test
covers the same behavior.

## Running

```bash
pnpm --filter @clerk/mosaic test                      # unit tests (jsdom and primitives)
pnpm --filter @clerk/mosaic test:feature              # feature tests (Chromium)
pnpm --filter @clerk/mosaic test:feature user-button  # one feature
pnpm --filter @clerk/mosaic exec vitest run           # every project
```

CI runs feature tests in their own `Mosaic Feature Tests` job, so the repo-wide
unit test job never needs a browser.

Feature tests need Chromium: run `pnpm playwright install chromium` once. They
import the built `@clerk/clerk-js`, so run `pnpm turbo build --filter=@clerk/clerk-js`
after changing it. Failure screenshots land in `packages/mosaic/.vitest/`.
Console output from passing tests only shows with `--reporter=verbose`.

## Feature tests

A feature test runs the real `Clerk` from `@clerk/clerk-js` in Chromium. MSW
answers its FAPI requests from a service worker, so everything from Clerk's
resource classes up to the rendered DOM is production code.

```tsx
it('makes the selected organization active and closes', async () => {
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: 'org_1' })]),
    memberships: [fapiMembership(acme), fapiMembership(other)],
  });
  await renderWithClerk(<UserButton />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: /Open account menu/ }));
  await user.click(await screen.findByRole('button', { name: 'Other' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
```

`packages/mosaic/src/features/user-button/__tests__/user-button.feature.test.tsx`
is the worked example.

### The toolkit (`src/__tests__/feature/`)

- **`fapi.ts`**: typed builders for FAPI JSON (`fapiEnvironment`, `fapiUser`,
  `fapiSession`, `fapiClient`, `fapiOrganization`, `fapiMembership`,
  `fapiInvitation`, `fapiSuggestion`, `fapiToken`, `fapiSessionVerification`,
  `fapiVerification`). They return the wire shapes from `@clerk/shared/types`,
  so a fixture can't invent a field.
  `fapiEnvironment(overrides)` shallow-merges per section, for example
  `{ organization_settings: { enabled: false } }`.
- **`fake-fapi.ts`**:
  - `serveFapi(seed)` registers stateful handlers and returns the live state.
    Mutations (touch, sign-out, accept) update it, so later reads see them. A
    test can assert on it (`fapi.client.sessions`) or change it.
  - `holdRequests(method, path)` holds matching requests open. Assert the
    in-flight UI, then `release()` to let them through to `serveFapi`, or
    `fail(code)` to answer with a 400 Clerk error.
- **`fake-fapi/`**: fakes for larger endpoint families, kept out of
  `fake-fapi.ts` and registered by `serveFapi`.
  - `verification.ts` fakes session reverification (`/verify` and its
    prepare and attempt endpoints). Seed it with
    `serveFapi({ verification: { firstFactors, secondFactors, secrets } })`:
    the factors the user has, and the password or code each strategy accepts.
    The fake follows the server: level `second_factor` starts on the second
    factor, `multi_factor` goes first factor then second, and a user with no
    second factor is downgraded to `first_factor`. It rejects calls the server
    rejects: before start, in the wrong status, with a strategy the user
    doesn't have, and an email, phone, or passkey attempt that wasn't
    prepared. Wrong passwords and codes answer 422.
- **`render.tsx`**: `renderWithClerk(ui)` renders inside `ClerkContextProvider`
  and `MosaicProvider`, loads Clerk, and returns `{ clerk, navigate, ... }`.
  `navigate` is the router Clerk was loaded with, called with the path.

The setup file (`vitest.setup.browser.mts`) starts the worker and focuses the
window. After each test it cleans up, resets the handlers and the shared query
cache, and **fails the test on any FAPI request without a handler**. When a
feature needs a new endpoint, add a handler to `serveFapi` that mirrors what
FAPI returns.

### Order matters

Call `serveFapi`, then any `holdRequests`, then `renderWithClerk`. Handlers
added later win, so a hold must come after the defaults it overrides. To hold a
request made during a user action, add the hold after the render and before the
click.

### Guidelines

- **Query like a user.** Roles, labels, and text. Avoid test ids.
- **Assert outcomes.** What the screen shows, where the user was sent
  (`navigate`), and what FAPI now holds. Never a controller's state or a prop.
- **Spy only at the edge of the feature.** Spy on modals another package owns
  (`clerk.openUserProfile`, `openCreateOrganization`) with
  `vi.spyOn(clerk, ...).mockImplementation(() => {})`. Don't mock Clerk hooks
  or Mosaic modules.
- **Wait for things to disappear.** Popovers and dialogs run exit transitions
  in a real browser, so use `waitFor(() => expect(...).toBeNull())`.
- **One `describe` per user task**, so the file reads like the feature's spec.

### Clerk behaviors worth knowing

- `setActive` only touches the session when the document has focus. The setup
  focuses the window, so don't blur it by accident.
- clerk-js treats a **422** from a session touch (`setActive`, focus) or a token
  request as "unauthenticated" and refetches the client. Answer those with
  400s, which is what `holdRequests(...).fail()` sends. Form errors on other
  endpoints are real 422s, for example a wrong password or code, and are
  handled as ordinary errors.
- After a touch, `getToken` is served from the token the touch returned, so
  there is no tokens request to hold during an organization switch. To observe
  Clerk's transitive state, route the action through navigation and make
  `navigate` return a pending promise.

## Unit tests

Write unit tests for:

- Pure helpers, such as a feature's `*.layout.ts`.
- Shared primitives many features use (`useForm`, `Dialog`, the machine
  library). These are stable contracts inside the package.
- Timing that is slow to drive through the UI, such as a resend countdown. Use
  fake timers.

`packages/mosaic/src/__tests__/async.ts` has `deferred<T>()`,
`tick()`, and `noop`.
