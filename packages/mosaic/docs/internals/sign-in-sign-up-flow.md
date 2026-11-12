# Sign-in and sign-up flow

How sign-in and sign-up decide which screen to show, from the step FAPI says comes next. Paths are relative to `packages/`.

## The model

A step is a step of the auth flow, not a screen. FAPI owns the step, the order of steps, and whether a code is already sent. Mosaic owns the routes, the layout and copy, and when to send a code.

Today FAPI sends `status`, `missing_fields` and `unverified_fields`, not a step. Until it sends `nextStep`, `getSignInNextStep` and `getSignUpNextStep` in `shared` compute it from those fields (see [Bridge](#bridge)).

There is no step machine and no local copy of the step. What the step can't say lives in the route, such as the factor the user picked in `factorOne`'s `:factor` param.

## Pick the screen

The route and the step can disagree: the user went back, opened an old link, or the sign-in reset. A route the step allows stays. Any other route is replaced with the step's route, so the screen and the route never drift. `unknown` shows "Start over" on whatever route it's on.

```tsx
const { step } = model;
const { route } = useRouterScope(signInRoutes, { routing, path, root: 'start' });
const screen = step.type === 'unknown' ? 'startOver' : allowedRoute(route, step) ? route : routeFor(step);
```

- `routeFor(step)` returns the step's route, from the lists below.
- `allowedRoute(route, step)` is `true` for `start`, for the step's own route, and for `continue` while sign-up verifies, so the user can edit a field. `complete` and `transfer` have no route, so they allow any route: the current screen stays up while `next` runs, and shows the error if it fails.
- The component that owns the route table computes `screen` during render, with no effect.
- This runs once the model is `ready`, and after Clerk loads there is always a step. Until then the scope gets `ready: false`, so a starting route like `factor-one` isn't reset to `start`.

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

- `complete`: the model's `finalize()`, then leave the flow. In a modal, don't `close()` when the flow leaves: `finalize()`'s navigation is the last write and takes the modal with it.
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
- `fields` (`fields`) → `continue`
- `verify_email` (`target`, `sent`) → `verifyEmail`
- `verify_phone` (`target`, `sent`) → `verifyPhone`

`identifier` and `start` are what Mosaic shows before the resource exists; a sign-in with no status and a sign-up not yet created both return them. `sent` means a code or link is out, so a reload on the same `:factor` doesn't send another. Picking a different factor always sends, because `sent` can't tell two targets with the same strategy apart (see [Bridge](#bridge)).

With no `:factor`, `factorOne` starts on the factor `determineStartingSignInFactor` picks (`shared/src/internal/clerk-js/signInFactors.ts`), the same copy `ui` uses.

## Back, forward and reload

- FAPI's state changes only on submit. A route the step doesn't allow is replaced with the step's route.
- Back to `start` shows the identifier form; submitting it creates a new sign-in. Forward to `factorOne` still works.
- Reload on `factorOne` keeps the picked factor (`:factor`) and sends no second code (`sent`).
- Virtual routing has no history: a remount starts at `start`, and FAPI's state is kept.

## Entry actions

The controller calls these model callbacks on `start`, then `next(step)`.

- Ticket (`__clerk_ticket`): `__clerk_status=sign_up` redeems it with `signUp.ticket({ unsafeMetadata })`; any other status with `signIn.ticket()`, as `ui/src/components/SignIn/SignInStart.tsx` does. A ticket works only once, so redeem it once: keep the "already started" flag in a component that doesn't remount, so a remount or StrictMode can't redeem it twice. A failed redemption shows its error on `start`.
- Email-link return (`__clerk_status`): `verified` with a `__clerk_created_session` this client has activates that session (`clerk-js/src/core/clerk.ts:2620-2636`); any other `verified` continues by step. `transferable` and the error statuses show their own screen, as `ui/src/common/EmailLinkVerify.tsx` does.
- Redirect URLs for email links and OAuth/SAML returns come from the router (the planned `useReturnUrl(name, params)`), never hand-built. That part waits for the routing follow-up.
- A step that is already `complete` or `transfer` on mount, such as a reload before it ran: `next(step)` runs it once, with the same guard as a ticket. The email-link return is handled first.

## Bridge

`getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/nextStep.ts`) compute the step from today's fields, and return FAPI's `nextStep` once it is sent. They can't compute three things, so FAPI must send them:

- The sign-up order.
- `target` for sign-in. Nothing says which email or phone a code went to.
- `sent` per target for sign-in. `first_factor_verification` has no identification, so after a code to one email, a second email with the same strategy also reads as sent.
