# Sign-in and sign-up flow

> [!NOTE]
> Decided for clients: the bridge and D2, D4–D6. The FAPI side (D1, D3, phases 2–3) is a proposal to the FAPI team. Paths are relative to `packages/`.

## Summary

Today FAPI says what a sign-in or sign-up still needs (`status`, `missing_fields`, `unverified_fields`), and every client works out the next step from that. FAPI already knows the next step, so it should send it as `nextStep`. Clients map each step to a screen.

Until FAPI sends it, `shared` computes the same `nextStep` from today's fields, and Mosaic uses that.

## Who owns what

| FAPI owns                             | Mosaic owns                                               |
| ------------------------------------- | --------------------------------------------------------- |
| Which step comes next, and the order  | The routes, and which route shows a step                  |
| What a step needs: fields, the target | Layout and copy                                           |
| Whether a code is already sent        | When to send it, which factor the user picked, edit moves |

A step is a step of the auth flow, not a screen. FAPI never names a screen or a route.

## Routes

Sign-in and sign-up each own one route table, through `useRouterScope` from the routing PR (#10602). Each step has one route. The paths match `ui`'s, so links and docs carry over.

```ts
const signInRoutes = {
  start: '',
  protectCheck: 'protect-check',
  factorOne: 'factor-one/:factor?',
  factorTwo: 'factor-two',
  clientTrust: 'client-trust',
  resetPassword: 'reset-password',
} as const;

const signUpRoutes = {
  start: '',
  protectCheck: 'protect-check',
  enterpriseConnections: 'enterprise-connections',
  continue: 'continue',
  verifyEmail: 'verify-email-address',
  verifyPhone: 'verify-phone-number',
} as const;
```

| Sign-in step    | Carries            | Route                                       |
| --------------- | ------------------ | ------------------------------------------- |
| `identifier`    |                    | `start`                                     |
| `protect`       |                    | `protectCheck`                              |
| `first_factor`  | `strategy`, `sent` | `factorOne`                                 |
| `second_factor` | `strategy`, `sent` | `factorTwo`                                 |
| `client_trust`  |                    | `clientTrust`                               |
| `new_password`  |                    | `resetPassword`                             |
| `transfer`      |                    | runs the transfer, then the sign-up's route |
| `complete`      | `createdSessionId` | `finalize()`, then leaves                   |

| Sign-up step     | Carries            | Route                                         |
| ---------------- | ------------------ | --------------------------------------------- |
| `start`          |                    | `start`                                       |
| `protect`        |                    | `protectCheck`                                |
| `enterprise_sso` |                    | `enterpriseConnections`, or straight to IdP   |
| `fields`         | `fields`           | `continue`                                    |
| `verify_email`   | `target`, `sent`   | `verifyEmail`                                 |
| `verify_phone`   | `target`, `sent`   | `verifyPhone`                                 |
| `transfer`       |                    | runs the transfer, then the next step's route |
| `complete`       | `createdSessionId` | `finalize()`, then leaves                     |

`identifier` and `start` are what Mosaic shows before the resource exists, so FAPI never sends them. `sent` means a code or link is already out, so a reload doesn't send another. `unknown` shows a "Start over" screen on every route (D4).

## How the route and the step fit together

The route decides what shows. The step decides which routes are usable and where to go after a submit. Two pure functions in the feature hold the tables above:

- `routeFor(step)`: the step's route.
- `allowedRoute(route, step)`: `true` for `start`, for the step's own route, and for `continue` while sign-up verifies, so the user can edit a field.

The component that owns the route table resolves the route during render, with no effect:

```tsx
const step = getSignInNextStep(signIn);
const { route, go } = useRouterScope(signInRoutes, { routing, path, root: 'start' });
const shown = step.type === 'unknown' ? 'startOver' : allowedRoute(route, step) ? route : routeFor(step);
```

It renders the screen for `shown`. A screen moves on in its submit handler:

```ts
const { error } = await signIn.password({ password });
if (error) return showError(error);
await next(getSignInNextStep(signIn));
```

`next(step)` turns the step into a move:

- `complete`: `signIn.finalize()` sets the session active (`clerk-js/src/core/resources/SignIn.ts:1781`), then the flow is left.
- `transfer`: until FAPI transfers (phase 3), `signUp.create({ transfer: true, unsafeMetadata })`, as `ui` does (`ui/src/components/SignIn/handleSignUpIfMissingTransfer.ts:40-43`), then the sign-up's next step.
- Anything else: `go(routeFor(step))`.

An error from `finalize()` or the transfer stays on the current screen.

Methods stay as they are and return `{ error }`. The resource is updated before the promise resolves, so the step is current after `await` (`clerk-js/src/core/resources/Base.ts:140`, `:235`).

There is no step machine and no local copy of the step (D6). What the step can't say lives in the route: the factor the user picked is `factorOne`'s `:factor` param (see [Bridge](#bridge)), and editing a field is a move to `continue`. [Controllers → Multi-step flows](../controllers.md#multi-step-flows) lists this as the exception to "the machine owns the step".

#10602 has virtual routing only (`routing: 'virtual'`, `use-mosaic-location.ts:7`), which keeps the route in memory. There is no address bar to fix, so `shown` is enough. When path routing lands, the URL must follow `shown` too. #10602 already does that for unknown segments: the route falls back to the root during render, and the router replaces the URL itself (`use-router.ts:148-160`). The proposal to #10602 is the same mechanism with the feature's rule, so no feature writes a redirect effect:

```tsx
useRouterScope(signInRoutes, {
  routing,
  path,
  root: 'start',
  allow: name => allowedRoute(name, step),
  fallback: routeFor(step),
});
```

## Back, forward and links

FAPI's state changes only when the user submits. A route redirects only when FAPI's state makes it unusable. `ui` behaves the same today.

| The user                                  | Sees                | FAPI's state                                                                   |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------------------------ |
| Goes back from `factorOne` to `start`     | the identifier form | Still `first_factor`. Submitting creates a new sign-in (`SignInStart.tsx:289`) |
| Goes forward to `factorOne` again         | the factor screen   | Unchanged, so it still works                                                   |
| Reloads on `factorOne`                    | the same factor     | Unchanged. `:factor` keeps the pick, `sent` stops a second code                |
| Opens `factorTwo` before the first factor | the step's route    | `ui` redirects too (`SignInFactorTwo.tsx:47`)                                  |
| Is on `factorOne` when the sign-in resets | `start`             | `ui` redirects too (`SignInFactorOne.tsx:146-148`)                             |

Back, forward and reload apply once path routing exists. With virtual routing, a remount starts at `start`, and FAPI's state is kept.

The alternatives were to always show FAPI's step, which breaks back and links, or to reset FAPI's state on reaching `start`, which throws away a sent code.

## Entry actions

Some URLs carry an action to run before the user does anything. The controller runs it on `start`, then calls `next(step)`.

- An invitation's `__clerk_ticket`: the model exposes `redeemTicket: () => signUp.ticket({ unsafeMetadata })`. `ticket()` reads the param itself (`clerk-js/src/core/resources/SignUp.ts:1281-1283`), and `unsafeMetadata` goes along as in `ui` (`ui/src/components/SignUp/SignUpStart.tsx:153`).
- The return from an email link: `__clerk_status` says how it went (`shared/src/internal/clerk-js/queryParams.ts:29-32`). Only `verified` continues by step. `transferable` and the error statuses (expired, failed, client mismatch) show their own screen, as `ui/src/common/EmailLinkVerify.tsx` does, because no step says them.

A ticket is single-use, so the guard is "not started yet", kept above the component that remounts. "First mount" fails because a mount effect runs twice under React StrictMode, and "not redeemed" fails because a remount during the request would start a second one. A failed redemption shows its error on `start`. Mosaic has no shared helper for this yet; the first feature that needs one adds it to `src/hooks/`.

## Transfer moves to FAPI

A sign-in created with `intent: 'sign_in_or_up'` whose identifier has no account comes back as a sign-up, with the sign-up's next step. Without the intent, nothing changes. This removes the 3 client copies of transfer. A transfer never asks the user anything and is single-use, so it is safer in one place.

## Version skew

clerk-js sends `__clerk_api_version` on every request (`clerk-js/src/core/fapiClient.ts:151`). FAPI sends a step type only to API versions that know it. FAPI already does this for sign-in: before `2024-10-01`, an enterprise SSO sign-in reads `needs_identifier`. A client that still meets an unknown type shows "Start over", never a spinner.

## Bridge

`getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/nextStep.ts`) compute the step from today's fields, so Mosaic works against any FAPI. Once FAPI sends `nextStep` they return it, and once the minimum supported API version has it, the computing half is deleted.

The bridge can't compute three things, so FAPI must send them:

- The sign-up order. Today it is client code.
- `target` for sign-in. Nothing says which email or phone a code went to. `ui` keeps the chosen factor in component state (`ui/src/components/SignIn/SignInFactorOne.tsx:89-91`, `:168`), so a reload loses it.
- `sent` per target for sign-in. The bridge reads `sent` from `first_factor_verification`, which has no identification. After a code to one email, a second email with the same strategy also reads as sent. `ui` has the same bug: switching to a second phone or email with the same strategy sends no code (`ui/src/components/SignIn/SignInFactorOneCodeForm.tsx:52-57`).

## Phases

| Phase | Change                                                           | Behaviour change                  |
| ----- | ---------------------------------------------------------------- | --------------------------------- |
| 1     | Next-step bridge in `shared`, used by Mosaic                     | None for existing surfaces        |
| 2     | FAPI sends `next_step`, `clerk-js` exposes `nextStep` (additive) | None until a client reads it      |
| 3     | FAPI transfers on `intent: 'sign_in_or_up'`                      | Only for clients that pass it     |
| 4     | `ui`, iOS and Android read `nextStep` and delete their routers   | Sign-up order becomes FAPI's (D2) |

## Decisions

| #   | Decision                                                                             | Rejected                                                                                                                          |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| D1  | FAPI owns the next step                                                              | Pure functions in `shared` only: iOS, Android and every pinned copy still drift. A React hook: React only, and skews with the SDK |
| D2  | Sign-up order: protect, transfer, enterprise SSO, fields, verify email, verify phone | Verify first: sends a code before a taken username is caught                                                                      |
| D3  | FAPI transfers, opt-in by intent                                                     | Transfer inside a client action (iOS, Android today): a hidden side effect, copied per client                                     |
| D4  | An unknown step type renders a fallback                                              | Throwing, or a spinner: dead ends when FAPI adds a step                                                                           |
| D5  | Steps are flow steps (`first_factor`, `verify_email`), not generic actions           | `verify` and `collect` with a `purpose`: every client switches twice                                                              |
| D6  | The client derives the screen from the step                                          | A step machine: its states copy FAPI's step and drift from it                                                                     |

## Appendix: today's clients

Every client rebuilds the flow from FAPI's fields:

```ts
await signIn.password({ identifier, password });
if (signIn.status === 'needs_second_factor') goTo('/mfa');
if (signIn.status === 'needs_client_trust') goTo('/verify-device');
if (signIn.isTransferable) await signUp.create({ transfer: true });
```

| Client               | Copies                                 | Disagreement                                                                           |
| -------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| `ui`                 | 14 sign-in switches, 3 sign-up routers | `completeSignUpFlow` verifies first, `navigateToNextStepSignUp` collects first         |
| `clerk-js`           | redirect callback, its own transfer    | On an unknown status `clerk.ts` logs, `ui`'s `handleSignUpIfMissingTransfer` throws    |
| iOS, Android         | one router each                        | iOS verifies first (`AuthNavigation.swift`), Android collects first (`AuthRouting.kt`) |
| Custom flows, guides | one per app                            | Every app writes the branches above                                                    |

Adding one step, the protect check (#8329), touched about 15 source files in `ui` and `clerk-js`. The only next-step signal FAPI sends today is per sign-up verification: `next_action` is `needs_prepare` or `needs_attempt` (`shared/src/types/json.ts:475`), and nothing in `ui/src` reads it.

Against the same fixtures, `getSignUpNextStep` differs from `ui`'s routers (`shared/src/internal/clerk-js/navigateToNextStepSignUp.ts`, `completeSignUpFlow.ts`) in four cases:

- Transfer: `ui` transfers before routing; the bridge returns `transfer`.
- Fields and email both missing: `completeSignUpFlow` verifies first; the bridge collects first (D2).
- `enterprise_sso`: `navigateToNextStepSignUp` goes to `/continue` without a connections URL, and `completeSignUpFlow` redirects to the IdP; the bridge returns `enterprise_sso` and the client picks.
- Nothing it can place: with nothing missing, or only `web3_wallet` unverified, `ui` goes to `/continue`; the bridge returns `unknown` (D4).

## Appendix: suspected gaps

Not reproduced, so they don't drive the design.

- Sign-in-or-up guide: `handleVerify` falls through to the sign-in, and "new code" always resends the sign-in code.
- `SignUpStart.tsx` and the email-link verify route have no `continuePath`.
- `useSetSessionWithTimeout.ts` skips `navigateOnSetActive`.
- Web3 `complete` without `redirectUrl` uses the after-sign-in URL, even for a sign-up.
