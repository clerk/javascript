# Sign-in and sign-up flow

> [!NOTE]
> Proposal, not decided. Agent-drafted. Paths are relative to `packages/`.

## Goal

FAPI sends the next step on every sign-in and sign-up. Clients render it instead of rebuilding FAPI's flow from fragments. Until FAPI ships it, a function in `shared` computes the same shape from today's fields.

## Current state

FAPI decides the flow but sends only pieces: `status`, `missing_fields`, `unverified_fields`, `protect_check`, transferable verifications. Every client puts them back together:

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

The only next-step signal FAPI sends today is per sign-up verification: `next_action` is `needs_prepare` or `needs_attempt` (`shared/src/types/json.ts:475`). Nothing in `ui/src` reads it.

Adding one step, the protect check (#8329), touched about 15 source files in `ui` and `clerk-js`.

## Proposal

```ts
await signUp.update({ username });

switch (signUp.nextStep.type) {
  case 'fields': // { fields }
  case 'verify_email': // { target, sent }
  case 'verify_phone': // { target, sent }
  case 'complete':
  default: // a step this client doesn't know
}
```

Each step is a step of the auth flow, not a screen. Sign-in steps match today's statuses; sign-up splits `missing_requirements` into its real steps.

| Flow    | Steps, in order                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------- |
| Sign-in | `protect`, `transfer`, `identifier`, `first_factor`, `second_factor`, `client_trust`, `new_password` |
| Sign-up | `protect`, `transfer`, `enterprise_sso`, `fields`, `verify_email`, `verify_phone`                    |
| Both    | `complete` (`createdSessionId`), `unknown`                                                           |

Verify steps carry `strategy` or `target`, and `sent`: whether a code or link is already out, so a reload doesn't send another.

- **Nothing new to call.** `nextStep` is a field. Every method stays and returns `{ error }` as today. Read `signIn.nextStep` after `await`: the resource is updated before the promise resolves (`clerk-js/src/core/resources/Base.ts:140`, `:235`).
- **Nothing acts on its own.** FAPI reports the step and never sends a code or redirects. A custom screen before a verify step is just not sending the code yet.
- **Works everywhere.** A resource field works in vanilla JS, React, Vue, Expo, iOS and Android. No hook.
- **Reload keeps the target.** Today a reload loses which phone or email got the code.

### Screens and navigation

The client derives the screen from the step. It doesn't store the step:

```ts
const step = getSignUpNextStep(signUp);
const screen = editing ? 'fields' : step.type;
```

- **The URL shows, the server decides.** Back, forward and a link to the start render that page. FAPI's step only changes after the user submits there. A route redirects only when FAPI's state makes it impossible, as `ui` does today (`ui/src/components/SignIn/SignInFactorTwo.tsx:47`).
- **No step machine.** A machine whose states copy the step is a second source of truth. Busy and errors come from `useForm` or `usePendingAction`. The only local state is a back move, like `editing` above. This is an exception to "the machine owns the step" in [Controllers](../controllers.md#multi-step-flows), for flows whose step FAPI owns.
- **A step can span screens, or share one.** `enterprise_sso` is a chooser in one client and a redirect in another.
- **The step says where, the resource says what.** A factor screen lists other methods from `signIn.supportedFirstFactors`, as `ui` does (`SignInFactorOne.tsx:84`). The step doesn't copy them.

### Transfer moves to FAPI

A sign-in created with `intent: 'sign_in_or_up'` whose identifier has no account comes back as a sign-up, with the sign-up's next step. Without the intent, behaviour is unchanged.

This removes the 3 client transfer copies. A transfer never asks the user anything, and is single-use, so it is safer in one place.

### Version skew

clerk-js sends `__clerk_api_version` on every request (`clerk-js/src/core/fapiClient.ts:151`). FAPI sends a step type only to API versions that know it. A client that still meets an unknown type renders a "Start over" fallback, never a spinner. How FAPI gates responses by version today is unverified.

### Bridge

`getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/getNextStep.ts`) compute the step from today's fields. Mosaic uses them from day one, so it works against any FAPI. Once FAPI sends `next_step`, they will return it, and once the minimum supported API version has it, the computing half is deleted.

Against the same fixtures, `getSignUpNextStep` matches `navigateToNextStepSignUp` except for transfer, which `ui` handles before routing. It disagrees with `completeSignUpFlow` when fields and email are both missing (fields first, D2).

What the bridge can't compute, so FAPI must send:

- **The sign-up order.** Today it is client code.
- **`target` for sign-in.** Nothing says which email or phone a code went to. `ui` keeps the chosen factor in component state (`ui/src/components/SignIn/SignInFactorOne.tsx:89-91`, `:168`), so a reload loses it.
- **`sent` per target for sign-in.** FAPI sends `first_factor_verification` only after a prepare, and it stays `unverified` until it is verified, fails or expires, so the bridge reads `sent` from it. It has no identification, so after a code to one email, a second email with the same strategy also reads as sent. `ui` has the same bug today: switching to a second phone or email with the same strategy sends no code (`ui/src/components/SignIn/SignInFactorOneCodeForm.tsx:52-57`).

## Phases

| Phase | Change                                                           | Behaviour change                  |
| ----- | ---------------------------------------------------------------- | --------------------------------- |
| 1     | `getNextStep` bridge in `shared`, used by Mosaic                 | None for existing surfaces        |
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

## Vocabulary

- **Next step**: what the user must do next, as FAPI reports it. Mosaic maps each step type to a route; the route proposes, the step decides.
- **Bridge**: the client-side computation of the next step for FAPI versions that don't send it.

## Appendix: suspected gaps

Not reproduced, so they don't drive the design.

- Sign-in-or-up guide: `handleVerify` falls through to the sign-in, and "new code" always resends the sign-in code.
- `SignUpStart.tsx` and the email-link verify route have no `continuePath`.
- `useSetSessionWithTimeout.ts` skips `navigateOnSetActive`.
- Web3 `complete` without `redirectUrl` uses the after-sign-in URL, even for a sign-up.
