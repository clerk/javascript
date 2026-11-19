# Sign-in and sign-up flow

How sign-in and sign-up decide which screen to show, from the step FAPI says comes next. Paths are relative to `packages/`.

## The model

FAPI tracks which requirements are outstanding and whether a code has been sent. When several sign-up requirements are outstanding, the shared client picks which one comes next. Mosaic maps the step to a screen and owns the routes, layout, copy, and when to send a code.

Today FAPI sends `status`, `missing_fields` and `unverified_fields`, not a step. Until it sends `nextStep`, `getSignInNextStep` and `getSignUpNextStep` in `shared` compute it from those fields (see [Bridge](#bridge)).

There is no step machine and no local copy of the step. What the step can't say lives in the route, such as the factor the user picked in `factorOne`'s `:factor` param, or whether a sign-up verify screen was reached from `continue`.

## Pick the screen

The route and the step can disagree: the user went back, opened an old link, or the sign-in reset. A route the step allows stays. Any other route is replaced with the step's route, so the screen and the route never drift. `unknown` shows "Start over" on whatever route it's on.

```tsx
const { step } = model;
const { route } = useRouterScope(signInRoutes, { routing, path, root: 'start' });
const shown = step.type === 'unknown' ? undefined : allowedRoute(route, step) ? route : routeFor(step);
```

The flow's `*.routes.ts` exports this rule as one function, so the controller and the unit test share it (`shownRoute` in `mosaic/src/features/sign-up/sign-up.routes.ts`). No route means "Start over".

- `routeFor(step)` returns the step's route, from the lists below. Sign-up's also takes the current route, so a verify step reached from `continue` stays under it.
- `allowedRoute(route, step)` is `true` for `start`, for the step's own route, and for `continue` while sign-up verifies, so the user can edit a field. `complete` and `transfer` have no route, so they allow any route: the current screen stays up while `next` runs, and shows the error if it fails.
- The component that owns the route table computes the screen during render, and passes the route shown to `useRouteGuard`, which replaces a route the step does not allow so the stored route never keeps it. It is a guard, not a route table that changes with the step: the route exists, the flow is just not ready for it.
- This runs once the model is `ready`, and after Clerk loads there is always a step. Until then the scope gets `ready: false`, so a starting route like `factor-one` isn't reset to `start`.

## Mount the screen

Sign-up renders one component per screen, so the route decides what is mounted (`SignUpView` in `mosaic/src/features/sign-up/sign-up.view.tsx`). Sign-in has no controller yet.

- `useSignUpController` sits above the screens and holds what outlives one: the route, the details form, the chosen identifier and Start over. `start` and `continue` render that one form, so a password typed on `start` is still there after Back from a verify screen. The password lives nowhere else.
- A screen with work to do on arrival owns its controller. `SignUpVerify` holds the code machine and sends the code when it mounts on a step with `sent: false`. A submit, a reload and a redirect all arrive that way. A screen that runs a controller reaches the view as a slot the wrapper builds, so `SignUpView` renders plain props only.
- `SignUpVerify` takes the sign-up's id as its `key`, so a new sign-up never reuses the last one's screen.
- A screen another feature owns arrives as a slot. The wrapper passes `TaskChooseOrganizationContent`, the task without its card, and the view mounts it on the task route.
- A screen that is not a route sits on top of one. `restricted`, `waitlist` and `actionBlocked` replace `start`, and `startOver` replaces any route. A route whose screen is not built yet (`enterpriseConnections`, `protectCheck`) shows `startOver`.

## Move on after a submit

The model makes the Clerk call and returns the next step. The methods return `{ error }` instead of rejecting, so the model throws it for `save` and the controller's error owners. The controller passes the step to `next(step)`.

```ts
submitPassword: async (password: string) => {
  await save(async () => {
    const { error } = await signIn.password({ password });
    if (error) throw error;
  }, ['password']);
  return getSignInNextStep(signIn);
},
```

- `complete`: the model's `finalize()`, then leave the flow. Creating the session clears the sign-up, so the live step drops back to `start`. Sign-up renders the model it left from while the live step is `leaving`: until the navigation takes the flow away, or until a task that continues in the flow has its data loaded, so the task replaces the screen with no skeleton between them. It keeps the action pending throughout, the way the switcher holds its `frozenModel` ([Controllers → Wrapping actions](../controllers.md#wrapping-actions)). In a modal, don't `close()` when the flow leaves: `finalize()`'s navigation is the last write and takes the modal with it.
- `transfer` from sign-in: the model's `transfer()` calls `signUp.create({ transfer: true, unsafeMetadata })`, then `next` with the sign-up's step. A sign-in with sign-up built in holds the sign-up routes under `create/`, so it stays in the component. Otherwise it leaves for the sign-up page.
- `transfer` from sign-up, when the identifier already has an account: the model's `transfer()` calls `signIn.create({ transfer: true })`, then `next` with the sign-in's step.
- `unknown`: nothing. The screen already shows "Start over".
- Anything else: `go(routeFor(step))`.
- An error from `finalize()` or the transfer stays on the current screen.

## Routes and steps

Each flow owns one route table through `useRouterScope`. Paths match `ui`'s, so links carry over.

Sign-in:

- `identifier` → `start`
- `protect` → `protectCheck`
- `first_factor` (`strategy`, `sent`) → `factorOne`
- `second_factor` (`strategy`, `sent`) → `factorTwo`
- `client_trust` → `clientTrust`
- `new_password` → `resetPassword`

Sign-up:

- `start` → `start`
- `protect` → `protectCheck`
- `enterprise_sso` → `enterpriseConnections`, which goes straight to the IdP unless there are several connections to pick from
- `verify_email` (`target`, `sent`) → `verifyEmail`, or `continueVerifyEmail` when reached from `continue`
- `verify_phone` (`target`, `sent`) → `verifyPhone`, or `continueVerifyPhone` when reached from `continue`
- `fields` (`fields`) → `continue`

Sign-up's model adds two steps of its own to the ones `getSignUpNextStep` returns, for when there is no sign-up in progress:

- `task` (`key`) → `taskChooseOrganization`: the session has a pending task that sign-up shows in its own card, and the task's data has loaded. Until it has, the step is `leaving`. Only the task route is allowed, so a visit to `start` with the task pending moves to it. A task the application gave a URL in `taskUrls`, or one sign-up has no screen for, is not a `task` step: the flow leaves for its URL.
- `leaving`: a session is active or being activated. It has no route and allows any, so the screen that started the navigation stays up.

Back from a sign-up verify screen goes to the details route above it: `continue` for the two nested routes, `start` for the others (`detailsRouteFor`).

`identifier` and `start` are what Mosaic shows before the resource exists; a sign-in with no status and a sign-up not yet created both return them. `sent` means a code or link is out, so a reload on the same `:factor` doesn't send another. Picking a different factor always sends, because `sent` can't tell two targets with the same strategy apart (see [Bridge](#bridge)).

With no `:factor`, `factorOne` starts on the factor `ui`'s `determineStartingSignInFactor` picks (`ui/src/components/SignIn/utils.ts:76`). That rule moves to `shared` so both use one copy.

## Back, forward and reload

- FAPI's state changes only on submit. A route the step doesn't allow is replaced with the step's route.
- Back to `start` shows the identifier form; submitting it creates a new sign-in. Forward to `factorOne` still works.
- Reload on `factorOne` keeps the picked factor (`:factor`) and sends no second code (`sent`). Reload on a sign-up verify route sends a code only when `sent` is false.
- Virtual routing has no history: a remount starts at `start`, and FAPI's state is kept.

## Entry actions

The controller calls these model callbacks on `start`, then `next(step)`.

- Ticket (`__clerk_ticket`): `__clerk_status=sign_up` redeems it with `signUp.ticket({ unsafeMetadata })`; any other status with `signIn.ticket()`, as `ui/src/components/SignIn/SignInStart.tsx` does. A ticket works only once, so redeem it once: keep the "already started" flag in a component that doesn't remount, so a remount or StrictMode can't redeem it twice. A failed redemption shows its error on `start`.
- Email-link return (`__clerk_status`): `verified` with a `__clerk_created_session` this client has activates that session (`clerk-js/src/core/clerk.ts:2620-2636`); any other `verified` continues by step. `transferable` and the error statuses show their own screen, as `ui/src/common/EmailLinkVerify.tsx` does.
- Redirect URLs for email links and OAuth/SAML returns come from the router (the planned `useReturnUrl(name, params)`), never hand-built. That part waits for the routing follow-up.
- A step that is already `complete` or `transfer` on mount, such as a reload before it ran: `next(step)` runs it once, with the same guard as a ticket. The email-link return is handled first.

## Bridge

`getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/nextStep.ts`) compute the step from today's fields, and return FAPI's `nextStep` once it is sent. They can't compute three things, so FAPI must send them:

- The sign-up order. Until FAPI sends it, `getSignUpNextStep` follows `ui`'s order (`shared/src/internal/clerk-js/completeSignUpFlow.ts`): verify the email, then the phone, then collect the missing fields.
- `target` for sign-in. Nothing says which email or phone a code went to.
- `sent` per target for sign-in. `first_factor_verification` has no identification, so after a code to one email, a second email with the same strategy also reads as sent.
