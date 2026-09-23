# Testing Mosaic

Read this before writing, extending, or reviewing any test in `packages/mosaic`.
It covers primitives, styled components, blocks, and flows.

The guiding rule, from Testing Library:

> The more your tests resemble the way your software is used, the more
> confidence they can give you.

Mosaic has two kinds of users. **End users** click, type, tab, and read what
screen readers announce. **Developers** pass props, style `.cl-<slot>` classes
and `data-<axis>` attributes, and override `--cl-*` tokens. A test should act
like one of them. If it reads internal state, imports a private module to mock,
or inspects compiled CSS, it is a third user the code now has to satisfy. Those
tests break on safe refactors and still pass when real behavior breaks.

## The shape: a trophy, not a pile of unit tests

| Layer            | What it is in Mosaic                                                                        | How much                                 |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Static           | TypeScript, ESLint, `@stylexjs` lint rules                                                  | Free. Let types catch prop shape errors. |
| Unit             | Pure functions and state machines that have a real input space                              | Only where the branching justifies it    |
| **Integration**  | A feature, block, or component rendered for real, driven with `userEvent` and role queries  | **The bulk of the suite**                |
| Visual / browser | Layout, motion, gestures, and computed styles. jsdom cannot check any of these (see below). | A few, in a real browser                 |
| **End-to-end**   | The published package in a real app against a real Clerk instance (Playwright)              | A few critical journeys per component    |

Coverage is not a goal. Past ~70% the returns fall off, and chasing a number
leads to tests of trivial code.

## Which level owns what

- **End-to-end** proves the published component works in a real app against
  real Clerk: it mounts from public exports, its stylesheet loads, and the
  critical journeys complete (open, switch, manage, sign out). These are slow,
  so keep to the paths a customer would notice first.
- **jsdom integration** owns the branches: loading and hidden states,
  capability gates, errors, pending states, one-action-at-a-time, focus return,
  and instance settings that are awkward to set up on a real instance.
- Do not assert a journey in jsdom only because the E2E suite exists, and do
  not add an E2E test for a branch jsdom already covers.

## Rules

### 1. Test a behavior once, at the highest level that can reach it cheaply

Before you write a test, check whether the behavior is already covered one layer
up. If the integration test proves "single-session mode hides _Sign out of all
accounts_", do not assert the same thing again in the model, the layout helper,
and the view.

- **Flows:** test through the feature's integration test by default.
- **Styled components:** test only what the wrapper adds (slot classes,
  defaults, naming wiring, warnings). Do not retest keyboard, focus, or
  open/close behavior that the headless primitive already owns.
- **Near-copy flows** (add email and add phone, edit name and edit username)
  get one `describe.each` rather than two copied files.

### 2. Mock at the package boundary, nothing inside Mosaic

- Mock `@clerk/shared/react` (Clerk hooks and resources). That is the boundary
  a flow depends on.
- Stub browser APIs jsdom lacks (`IntersectionObserver`, `ResizeObserver`,
  `matchMedia`) when a test needs them.
- **Never `vi.mock` a relative path inside `packages/mosaic`** (`../user-button.controller`,
  `../../../hooks/useOrganizationListInView`, `../useMosaicEnvironment`). If the
  helper wraps a Clerk hook, mock the Clerk hook it calls.
- Never mock the model, controller, or view to test the component that composes
  them. Mocking a layer removes the confidence that it wires up correctly.

### 3. Assert what a user can observe

Assert text, roles, accessible names and descriptions, focus, `aria-*` state,
and the calls that leave Mosaic (`setActive`, `signOut`, `navigate`, a
consumer's `onClick`). Do not assert:

- machine state names or context (`getSnapshot().value === 'methodPickerPreparing'`)
- internal busy keys (`'select-org:org_1'`, `userButtonBusyKeys.*`)
- which internal hook was called with what (`useUserButtonModel` `toHaveBeenCalledWith`)
- React context values read through a probe component
- DOM nesting (`firstElementChild.tagName`, `children.length`, chained
  `querySelector` through internal wrappers)

To check that something is pending, assert what the user sees: the button is
`aria-busy` or disabled, a spinner has an accessible label, a second click does
nothing. Hold the promise open with `deferred()` from
`src/machines/__tests__/test-utils.ts`.

### 4. Never assert CSS values to prove how something looks

jsdom does not load the StyleX stylesheet, compute styles, lay out boxes, or run
animations. A test that checks CSS in jsdom only checks that the source says
what the source says. It fails when someone refactors the styles and passes when
the layout is visibly broken.

Do not:

- build a `stylex.create` "probe" and assert its atoms are, or are not, on an
  element
- compare `className` strings or StyleX-generated class names
- assert `toHaveStyle`, `getComputedStyle`, or `element.style.*` to prove a
  visual result
- copy a component's style object into a test (`transitionProperty`, `height`,
  container query strings)
- mock `offsetHeight`, `getBoundingClientRect`, or `getAnimations`, then assert
  the CSS value computed from your own mocked numbers

Check visual work in swingset (`pnpm --filter @clerk/swingset dev`) and look at it. If
a visual regression needs an automated guard, it belongs in a real browser test
(screenshot or real layout), not in jsdom.

**What _is_ contract and gets tested:**

- The styling contract mechanism (`themeProps` emitting `.cl-<slot>`,
  `data-<axis>`, and presence `data-<state>`) is pinned once, centrally, in
  `src/__tests__/props.test.ts`.
- Each part gets **one** test that lists its slot classes (see `card.test.tsx`,
  "renders each compound slot with its stable class"). Do not write one `it.each` case per variant value
  that only checks a `data-*` attribute.
- Public `--cl-*` variable **names** can be pinned, because renaming one breaks
  consumer themes. Pin the name, not its value.
- A headless primitive whose public output _is_ a CSS variable that consumers
  read (for example the drawer's swipe progress var) may assert that variable.
  Prefer driving it with real input in a browser when geometry is involved.

### 5. Query like a user

Use Testing Library's query priority:

1. `getByRole` with `name`
2. `getByLabelText`
3. `getByText`
4. `getByTestId`, only for parts with no role or text (a backdrop, a viewport)

Do not locate elements by `.cl-*` class in a behavior test. The class is the
styling contract, not a handle for finding things. Drive interactions with
`userEvent.setup()`, not `fireEvent`, unless you are simulating something
`userEvent` cannot do (a raw pointer sequence in a primitive).

### 6. Do not write these tests at all

- "renders its children" (the next test queries the same text anyway)
- "forwards the ref", once per component (one shared table test at most)
- per-variant `it.each` blocks that only check a `data-*` attribute
- wrapper tests with the model, controller, and view all mocked
- controller or model harness tests that render internal values into
  `<output data-testid>` and parse them back
- `renderHook` tests of an internal hook with one consumer. Test that consumer.
- snapshot tests of markup

## What to write, by kind

### Flow (feature or block)

**Default: one integration test per feature.** Render the real wrapper under
`<MosaicProvider>` with a mocked `@clerk/shared/react`, then drive it with
`userEvent` and role queries. `src/features/user-button/__tests__/user-button.integration.test.tsx`
is the model to copy, minus two things it still does: it mocks the internal
`useOrganizationListInView` hook (mock `useOrganizationList` instead) and finds
the spinner by `.cl-spinner`.

The mock pattern: mutable module-level variables reset in `beforeEach`, read on
every call, so a test opts into a condition by setting one flag.

```tsx
let user: FakeUser | null;
let singleSessionMode: boolean;
let signOut: ReturnType<typeof vi.fn>;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: true, user }),
    useClerk: () => ({ signOut, __internal_environment: { authConfig: { singleSessionMode } } }),
  };
});

it('does not offer sign out of all accounts in single-session mode', async () => {
  singleSessionMode = true;
  renderUserButton();
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: /open account menu/i }));

  expect(screen.queryByRole('menuitem', { name: /sign out of all/i })).not.toBeInTheDocument();
});
```

Cover, through the DOM: loading and signed-out states, each capability gate,
each action reaching Clerk with the right arguments, what closes and what stays
open, errors shown to the user, pending states, and focus return.

**Add a unit test only when the integration test cannot reach the case
cheaply:**

- A pure helper with a real matrix of inputs (`*.layout.ts`, `*.utils.ts`, URL
  routing across many redirect options). Test the function directly, as a
  table.
- A state machine with a complex async lifecycle (cancellation, abandoned
  `invoke`, races). Assert what leaves the machine (the callbacks it calls, the
  values the view renders), not state names. For a transient state that is hard
  to reach, `mockActor` is fine (see `machine/README.md` → "Testing & docs").

The model/controller/view split is a way to organize code. It does not require a
test file per layer.

### Headless primitive (`src/primitives/`)

This is where most isolated tests belong, because the primitive's behavior _is_
its public API. Test keyboard navigation, focus management (initial, trap,
return), ARIA roles and state, controlled vs uncontrolled props, and callback
payloads. Run `axe` (`toHaveNoViolations`) on the open and closed states.
Primitives run on happy-dom (see `vitest.config.mts`). Pointer geometry, scroll
alignment, and animation timing are not real there, so keep those tests few and
favor a browser check.

### Styled component (`src/components/`)

Small. Test what the styled layer adds: one slot-class test, defaults and prop
wiring a developer would rely on, accessible naming the component wires up
(`toHaveAccessibleName`), warnings, and behavior the primitive does not own.
Add an `axe` check on a realistic composition.

### Machine library (`src/machine/`)

State names and transitions are this library's public API, so asserting them
here is correct. That does not extend to feature machines built with it.

## Before you add a test, ask

1. Would this test fail if a user-visible behavior broke?
2. Would it still pass after a refactor that keeps behavior the same (merging
   the controller into the view, renaming a state, moving a style)?
3. Is this behavior already asserted somewhere else?

If the answer to 1 or 2 is no, or 3 is yes, do not write it.

When you edit an existing file that uses a pattern this doc rules out, do not
add more tests in that pattern. Write new tests the way this doc describes.

### End-to-end (`integration/tests/mosaic/`)

Playwright tests tagged `@mosaic`, run against the `next.appRouterMosaic.*`
long-running app, which is built from the `next-app-router-mosaic` template.
That template installs `@clerk/mosaic` from pkglab and renders components
through public exports only. `integration/tests/mosaic/user-button.test.ts` is
the model to copy. It creates its users and organizations through the Backend
API in `beforeAll`, removes them in `afterAll`, and queries by role. Add a
component to the template and a suite here once it is exported publicly.

## Running

- `pnpm --filter @clerk/mosaic test <substring>` runs matching unit and jsdom
  integration files.
- `pnpm test:integration:mosaic` runs the E2E suite. It needs the integration
  setup in the `clerk-monorepo` skill's `references/setup-and-footguns.md`.
