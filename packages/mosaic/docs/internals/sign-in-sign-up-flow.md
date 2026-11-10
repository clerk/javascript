# Sign-in and sign-up flow

How sign-in and sign-up decide which screen to show, from the step FAPI says comes next. Paths are relative to `packages/`.

## The model

A step is a step of the auth flow, not a screen. FAPI owns the step, the order of steps, and whether a code is already sent. Mosaic owns the routes, the layout and copy, and when to send a code. FAPI never names a screen or a route.

Today FAPI sends `status`, `missing_fields` and `unverified_fields`, not a step. Until it sends `nextStep`, `getSignInNextStep` and `getSignUpNextStep` in `shared` compute it from those fields (see [Bridge](#bridge)).

There is no step machine and no local copy of the step. Each step has one route, and what the step can't say lives in the route, such as the factor the user picked in `factorOne`'s `:factor` param.

## Pick the screen

The route and the step can disagree: the user went back, opened an old link, or the sign-in reset. The screen is the route when the step allows it, otherwise the step's route, and "Start over" when the step is `unknown`.

```tsx
const step = getSignInNextStep(signIn);
const { route } = useRouterScope(signInRoutes, { routing, path, root: 'start' });
const screen = step.type === 'unknown' ? 'startOver' : allowedRoute(route, step) ? route : routeFor(step);
```

- `routeFor(step)` returns the step's route, from the lists below.
- `allowedRoute(route, step)` is `true` for `start`, for the step's own route, and for `continue` while sign-up verifies, so the user can edit a field.
- The component that owns the route table computes `screen` during render, with no effect.

## Move on after a submit

A screen calls the method, shows `error` if there is one, then calls `next(getSignInNextStep(signIn))`. The step is current after `await`, because the resource updates before the promise resolves.

- `complete`: `finalize()`, then leave the flow.
- `transfer`: `signUp.create({ transfer: true, unsafeMetadata })`, then `next` with the sign-up's step.
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
- `enterprise_sso` → `enterpriseConnections`, or straight to the IdP
- `fields` (`fields`) → `continue`
- `verify_email` (`target`, `sent`) → `verifyEmail`
- `verify_phone` (`target`, `sent`) → `verifyPhone`

`identifier` and `start` are what Mosaic shows before the resource exists; a sign-in with no status and a sign-up not yet created both return them. `sent` means a code or link is out, so a reload doesn't send another.

## Back, forward and reload

- FAPI's state changes only on submit. A route redirects only when the step doesn't allow it.
- Back to `start` shows the identifier form; submitting it creates a new sign-in. Forward to `factorOne` still works.
- Reload on `factorOne` keeps the picked factor (`:factor`) and sends no second code (`sent`).
- Virtual routing has no history: a remount starts at `start`, and FAPI's state is kept.

## Entry actions

The controller runs these on `start`, then calls `next(step)`.

- Ticket (`__clerk_ticket`): the model exposes `redeemTicket: () => signUp.ticket({ unsafeMetadata })`. A ticket works only once, so redeem it once: keep the "already started" flag in a component that doesn't remount, so a remount or StrictMode can't redeem it twice. A failed redemption shows its error on `start`.
- Email-link return (`__clerk_status`): only `verified` continues by step. `transferable` and the error statuses show their own screen, as `ui/src/common/EmailLinkVerify.tsx` does.

## Bridge

`getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/nextStep.ts`) compute the step from today's fields, and return FAPI's `nextStep` once it is sent. They can't compute three things, so FAPI must send them:

- The sign-up order.
- `target` for sign-in. Nothing says which email or phone a code went to.
- `sent` per target for sign-in. `first_factor_verification` has no identification, so after a code to one email, a second email with the same strategy also reads as sent.
