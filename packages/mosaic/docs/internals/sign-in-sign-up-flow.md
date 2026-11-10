# Sign-in and sign-up flow

How sign-in and sign-up decide which screen to show, from the step FAPI says comes next. Paths are relative to `packages/`.

## The model

A step is a step of the auth flow, not a screen. FAPI owns the step, the order of steps, and whether a code is already sent. Mosaic owns the routes, the layout and copy, and when to send a code. FAPI never names a screen or a route.

Today FAPI sends `status`, `missing_fields` and `unverified_fields`, not a step. Until it sends `nextStep`, `getSignInNextStep` and `getSignUpNextStep` in `shared` compute it from those fields (see [Bridge](#bridge)).

There is no step machine and no local copy of the step. The route decides what shows; the step decides which routes are usable and where a submit goes.

## Routes and steps

Each flow owns one route table through `useRouterScope`. Paths match `ui`'s, so links carry over.

Sign-in:

- `identifier` → `start` (`''`)
- `protect` → `protectCheck` (`protect-check`)
- `first_factor` (`strategy`, `sent`) → `factorOne` (`factor-one/:factor?`)
- `second_factor` (`strategy`, `sent`) → `factorTwo` (`factor-two`)
- `client_trust` → `clientTrust` (`client-trust`)
- `new_password` → `resetPassword` (`reset-password`)
- `transfer` → runs the transfer, then the sign-up's route
- `complete` (`createdSessionId`) → `finalize()`, then leaves

Sign-up:

- `start` → `start` (`''`)
- `protect` → `protectCheck` (`protect-check`)
- `enterprise_sso` → `enterpriseConnections` (`enterprise-connections`), or straight to the IdP
- `fields` (`fields`) → `continue` (`continue`)
- `verify_email` (`target`, `sent`) → `verifyEmail` (`verify-email-address`)
- `verify_phone` (`target`, `sent`) → `verifyPhone` (`verify-phone-number`)
- `transfer` → runs the transfer, then the next step's route
- `complete` (`createdSessionId`) → `finalize()`, then leaves

`identifier` and `start` are what Mosaic shows before the resource exists; a sign-in with no status and a sign-up not yet created both return them. `sent` means a code or link is out, so a reload doesn't send another. `unknown` shows "Start over" on every route.

## How the route and the step fit together

- `routeFor(step)` returns the step's route.
- `allowedRoute(route, step)` is `true` for `start`, for the step's own route, and for `continue` while sign-up verifies, so the user can edit a field.
- The table owner resolves the route during render, with no effect. The factor the user picked lives in `factorOne`'s `:factor` param.
- A screen calls the method, shows `error` if any, then `next(step)`. The resource is updated before the promise resolves (`clerk-js/src/core/resources/Base.ts:140`).
- `next(step)`: `complete` calls `finalize()` and leaves; `transfer` calls `signUp.create({ transfer: true, unsafeMetadata })` as `ui` does, then moves on; anything else is `go(routeFor(step))`. An error stays on the current screen.

```tsx
const step = getSignInNextStep(signIn);
const { route, go } = useRouterScope(signInRoutes, { routing, path, root: 'start' });
const shown = step.type === 'unknown' ? 'startOver' : allowedRoute(route, step) ? route : routeFor(step);
```

## Back, forward and reload

- FAPI's state changes only on submit. A route redirects only when the step makes it unusable, as `ui` does.
- Back to `start` shows the identifier form; submitting it creates a new sign-in. Forward to `factorOne` still works.
- Reload on `factorOne` keeps the picked factor (`:factor`) and sends no second code (`sent`).
- Virtual routing has no history: a remount starts at `start`, and FAPI's state is kept.

## Entry actions

The controller runs these on `start`, then calls `next(step)`.

- Ticket (`__clerk_ticket`): the model exposes `redeemTicket: () => signUp.ticket({ unsafeMetadata })`. A ticket is single-use, so guard on "not started yet", kept above the component that remounts. A failed redemption shows its error on `start`.
- Email-link return (`__clerk_status`): only `verified` continues by step. `transferable` and the error statuses show their own screen, as `ui/src/common/EmailLinkVerify.tsx` does.

## Bridge

- `getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/nextStep.ts`) compute the step from today's fields. Once FAPI sends `nextStep` they return it.
- A step type a client doesn't know shows "Start over", never a spinner.
- It can't compute three things, so FAPI must send them:
  - The sign-up order. Today it is client code.
  - `target` for sign-in. Nothing says which email or phone a code went to.
  - `sent` per target for sign-in. `first_factor_verification` has no identification, so a second email with the same strategy also reads as sent. `ui` has the same bug.
