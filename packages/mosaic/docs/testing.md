# Testing

Read this when you write, move or review a test in `packages/mosaic` (`*.test.ts(x)`, `*.feature.test.tsx`, `*.browser.test.tsx`, `*.visual.test.tsx`, `*.test-d.ts`, or anything under `__tests__/`). It covers which tier a behavior belongs in, where test files go, the feature-test toolkit and screenshot tests; what a feature test should assert for each layer is in the Testing section of [Models](models.md#testing), [Controllers](controllers.md#testing) and [Views](views.md#testing).

Worked example: `src/features/switcher/__tests__/switcher.feature.test.tsx`.

## Rules

- A test fails if, and only if, the feature stops doing what it is for. Before writing or reviewing one, ask "when will this fail?" If the answer includes a refactor that keeps the behavior, a renamed helper, or something the test does not control (real network, timing), the test is wrong ([The Golden Rule of Assertions](https://www.epicweb.dev/the-golden-rule-of-assertions)).
- Mostly integration ([Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)). Each test should buy confidence that the feature works for a user; past that point, tests cost more than they return. TypeScript and lint catch shape errors, so tests don't need to.
- A flow is not tested per layer. The props between model, controller and view change every time the flow grows. Test at the two stable boundaries: in, the Frontend API (FAPI); out, what the user sees and can do (roles, text, focus).
- Test each behavior once, at the boundary that owns it. Do not write per-layer tests with mocked layers that repeat a feature test; older ones can go once a feature test covers the same behavior.
- Query like a user (roles, labels, text), assert outcomes (the screen, `navigate`, what FAPI now holds), and spy only at the edge of the feature.

## Three tiers

| Tier    | Files                       | Runs in                                       | Covers                                                                  |
| ------- | --------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Unit    | `*.test.ts(x)`              | jsdom (`pnpm test`; happy-dom for primitives) | Pure helpers, shared primitives (`useForm`, `Dialog`, machines), timing |
| Feature | `*.feature.test.tsx`        | Chromium (`pnpm test:feature`)                | A feature end to end: real `Clerk`, real layers, FAPI faked with MSW    |
| E2E     | `/integration` (Playwright) | Real apps against a real Clerk backend        | Framework wiring, redirects, real sessions. Not written per Mosaic flow |

A feature test owns everything the feature does on screen, including edge cases, busy states and errors. Default to one for behavior the user can see. Reach for a unit test when it is the better tool: logic with many combinations (pull it into a pure function and test the table), states or timing awkward to produce through FAPI (a resend countdown, with fake timers), or a bug much easier to pin at one layer. `src/__tests__/async.ts` has `deferred<T>()`, `tick()` and `noop`.

E2E proves only what a faked FAPI cannot: the framework SDK mounts the component, an action really changes the session (sign-out clears it, a switch survives a reload), a route the component sends the user to exists, and components from another package (the `UserProfile` modal) render what Mosaic hands them. Keep a feature's E2E to one short smoke file.

Most visual states (loading, empty, every error, every variant) are Swingset stories with plain props, reviewed by eye. A small screenshot suite covers representative compositions ([Screenshot tests](#screenshot-tests)). Do not duplicate every story as a test.

## Test placement

Keep test files out of the way of the implementation, so a folder reads at a glance.

- One test file can sit beside the code. When a folder gets a second, create `__tests__/` and move both into it.
- Features and blocks use `__tests__/` from their first test.
- Once a folder has `__tests__/`, every test file in that folder goes in it, including fixtures and helpers, which always go there.
- `__tests__/` goes in the folder whose code it tests, not a parent (`user-profile-password-section/__tests__/`, not `user-profile/__tests__/`). A test spanning several subfolders goes in the folder that holds them all.
- Type tests (`*.test-d.ts`) stay beside the code. `pnpm typecheck` skips `__tests__/`, so a type test moved there is never checked.
- Name a feature test after the component it renders.

Existing tests that break these rules move when their folder next changes.

## Running

```bash
pnpm --filter @clerk/mosaic test                      # unit tests (jsdom and primitives)
pnpm --filter @clerk/mosaic test:feature              # feature tests (Chromium)
pnpm --filter @clerk/mosaic test:feature user-button  # one feature
pnpm --filter @clerk/mosaic test:browser              # layout tests (Chromium)
pnpm --filter @clerk/mosaic exec vitest run           # every project
```

- jsdom and happy-dom have no layout engine, so every rect is 0 and a test on position, size or scrolling always passes there. Name it `*.browser.test.tsx` so it runs in Chromium.
- Feature and browser tests need `pnpm playwright install chromium` once. They import the built `@clerk/clerk-js`, so run `pnpm turbo build --filter=@clerk/clerk-js` after changing it.
- Failure screenshots land in `.vitest/`. Console output from passing tests shows only with `--reporter=verbose`.
- CI runs feature and screenshot tests in separate `Mosaic Feature Tests` and `Mosaic Visual Tests` jobs, so the repo-wide unit job never needs a browser.

## Feature tests

A feature test runs the real `Clerk` from `@clerk/clerk-js` in Chromium. MSW answers its FAPI requests from a service worker, so everything from Clerk's resource classes up to the DOM is production code.

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

  await user.click(screen.getByRole('button', { name: /Open account menu/ }));
  expect(await screen.findByRole('button', { name: 'Acme' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Other' })).toBeNull();
});
```

### The toolkit (`src/__tests__/feature/`)

- **`fapi.ts`**: typed `fapi*` builders for FAPI JSON (the file is the list). They return the wire shapes from `@clerk/shared/types`, so a fixture cannot invent a field. `fapiEnvironment(overrides)` shallow-merges per section (`{ organization_settings: { enabled: false } }`).
- **`fake-fapi.ts`**: `serveFapi(seed)` registers stateful handlers and returns the live state; mutations update it, so later reads see them and a test can assert on it (`fapi.client.sessions`). `holdRequests(method, path)` holds matching requests open: assert the in-flight UI, then `release()` them to `serveFapi`, or `fail(code?, longMessage?, paramName?)` with a 400 Clerk error.
- **`fake-fapi/`**: fakes for larger endpoint families, each seeded through its own `serveFapi` key; read the file for its shape. `verification.ts` fakes session reverification, seeded with `serveFapi({ verification: { firstFactors, secondFactors, secrets } })`. It follows the server's level rules and rejects what the server rejects (calls before start, in the wrong status, with a strategy the user lacks, or an unprepared email, phone or passkey attempt); wrong passwords and codes answer 422.
- **`menu.ts`**: `openMenu(user, trigger)` resolves with the open menu. A mouse press opens a menu one frame later, so querying a `menuitem` straight after `user.click` races it.
- **`render.tsx`**: `renderWithClerk(ui, loadOptions?)` renders inside `ClerkContextProvider` and `MosaicProvider`, loads Clerk with `standardBrowser: false` (a test's Clerk is never disposed, and its cookies would leak into later tests), and returns `{ clerk, navigate, rerender, ... }`. `navigate` is the router Clerk was loaded with.

The setup file (`vitest.setup.browser.mts`) starts the worker and focuses the window. Before each test it moves FAPI to a new host, so a late request from a previous test's Clerk fails instead of reaching this test. After each test it resets handlers and the shared query cache, and fails the test on any FAPI request without a handler or any hold never released or failed. When a feature needs a new endpoint, add a handler to `serveFapi` that mirrors what FAPI returns.

### Order matters

Call `serveFapi`, then any `holdRequests`, then `renderWithClerk`. Handlers added later win, so a hold comes after the defaults it overrides. To hold a request made during a user action, add the hold after the render and before the click.

### Guidelines

- Spy only on modals another package owns (`clerk.openUserProfile`, `openCreateOrganization`) with `vi.spyOn(clerk, ...).mockImplementation(() => {})`. Do not mock Clerk hooks or Mosaic modules.
- Never assert a controller's state or a prop.
- Popovers and dialogs run exit transitions, so wait for them to go: `waitFor(() => expect(...).toBeNull())`.
- Live regions such as `Card.Banner` are always mounted, so wait for an alert's text, not the alert: `waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(...))`.
- Control time instead of waiting it out. Do not raise a `waitFor` or `findBy*` timeout; hold the request or poll with `holdRequests()` and release it when ready.
- One `describe` per user task, so the file reads like the feature's spec.

### Clerk behaviors worth knowing

- `setActive` only touches the session when the document has focus. The setup focuses the window, so do not blur it by accident.
- clerk-js treats a 422 from a session touch (`setActive`, focus) or a token request as unauthenticated and refetches the client. Answer those with 400s, which `holdRequests(...).fail()` sends. Form errors on other endpoints are real 422s (a wrong password or code).
- After a touch, `getToken` is served from the token the touch returned, so there is no tokens request to hold during an organization switch. To observe Clerk's transitive state, route the action through navigation and make `navigate` return a pending promise.

## Screenshot tests

The `visual` project runs `*.visual.test.tsx` in Chromium with the feature project's Clerk and MSW setup. Tests and fixtures live in Mosaic beside the feature, never importing Swingset stories or fixtures.

```bash
pnpm --filter @clerk/mosaic test:visual
pnpm --filter @clerk/mosaic test:visual:update
```

- Screenshots are made and compared only inside one digest-pinned Playwright image, locally and in CI, because fonts and Chromium draw differently per OS. Both commands need Docker and install Linux dependencies into Docker volumes, leaving your `node_modules` alone. Calling Vitest directly bypasses the image.
- `test:visual` compares without changing baselines. `test:visual:update` deletes the Linux baselines, rewrites every screenshot, and on failure restores the tracked ones from the git index, so stage any baseline changes you want to keep first; unstaged edits and untracked baselines are lost. Review the changed images and commit them under each test's `__screenshots__/`. Failed comparisons write actual, expected and diff images under `.vitest/attachments/`.
- Add a screenshot only for a layout or visual state the existing ones miss. Capture the element under test (a dialog, a popup, the container), not `page`. Content taller than the viewport is cut off, so resize the viewport to the content first, as the user profile tests do.
- The suite fixes the viewport, the bundled Inter font, color scheme, locale, time zone and device scale, disables motion, hides carets, and allows zero mismatched pixels. Use deterministic fixture data and avatar fallbacks, and wait for content (including portaled menus) before capturing.
- Baselines name the browser and OS. The `Mosaic Visual Tests` job is advisory: a difference shows as a warning and in the job summary, but a failed build or a crash before images are written fails it. On a difference, download `mosaic-visual-failure-artifacts-<run-id>-<run-attempt>`, review `.vitest/attachments/`, then run `test:visual:update` locally and commit the approved baselines.
