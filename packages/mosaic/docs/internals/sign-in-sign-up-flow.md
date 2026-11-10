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
await signIn.password({ identifier, password });

switch (signIn.nextStep.type) {
  case 'verify': // { purpose, strategy, target: '+1 ••• 42', sentAt }
  case 'collect': // { fields }
  case 'new_password':
  case 'protect': // { token, sdkUrl }
  case 'complete':
  default: // a step this client doesn't know
}
```

| Step           | Fields                                                                                         | Client calls                                       |
| -------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `verify`       | `purpose` (first factor, second factor, client trust, sign-up), `strategy`, `target`, `sentAt` | `prepare…` when `sentAt` is unset, then `attempt…` |
| `collect`      | `fields`                                                                                       | `signUp.update(values)`                            |
| `new_password` |                                                                                                | `resetPassword(password)`                          |
| `protect`      | `token`, `sdkUrl`, `uiHints`                                                                   | `submitProtectCheck(proof)`                        |
| `complete`     | `createdSessionId`                                                                             | `finalize()`                                       |

- **Nothing new to call.** `nextStep` is a field. Every method stays and returns `{ error }` as today. Read `signIn.nextStep` after `await`: the resource is updated before the promise resolves (`clerk-js/src/core/resources/Base.ts:140`, `:235`).
- **Nothing acts on its own.** FAPI reports the step and never sends a code or redirects. A custom screen before `verify` is just not calling `prepare` yet.
- **Works everywhere.** A resource field works in vanilla JS, React, Vue, Expo, iOS and Android. No hook.
- **Reload keeps the target.** Today a reload loses which phone or email got the code.

### Transfer moves to FAPI

A sign-in created with `intent: 'sign_in_or_up'` whose identifier has no account comes back as a sign-up, with the sign-up's next step. Without the intent, behaviour is unchanged.

This removes the 3 client transfer copies. A transfer never asks the user anything, and is single-use, so it is safer in one place.

### Version skew

clerk-js sends `__clerk_api_version` on every request (`clerk-js/src/core/fapiClient.ts:151`). FAPI sends a step type only to API versions that know it. A client that still meets an unknown type renders a "Start over" fallback, never a spinner. How FAPI gates responses by version today is unverified.

### Bridge

`getNextStep(resource)` in `shared` returns `resource.nextStep` when FAPI sent it, and otherwise computes the same shape from today's fields. Mosaic uses it from day one, so it works against any FAPI. Once the minimum supported API version has the field, the computing half is deleted.

## Phases

| Phase | Change                                                           | Behaviour change                  |
| ----- | ---------------------------------------------------------------- | --------------------------------- |
| 1     | `getNextStep` bridge in `shared`, used by Mosaic                 | None for existing surfaces        |
| 2     | FAPI sends `next_step`, `clerk-js` exposes `nextStep` (additive) | None until a client reads it      |
| 3     | FAPI transfers on `intent: 'sign_in_or_up'`                      | Only for clients that pass it     |
| 4     | `ui`, iOS and Android read `nextStep` and delete their routers   | Sign-up order becomes FAPI's (D2) |

## Decisions

| #   | Decision                                                                    | Rejected                                                                                                                          |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| D1  | FAPI owns the next step                                                     | Pure functions in `shared` only: iOS, Android and every pinned copy still drift. A React hook: React only, and skews with the SDK |
| D2  | Sign-up order: protect, enterprise SSO, collect, verify email, verify phone | Verify first: sends a code before a taken username is caught                                                                      |
| D3  | FAPI transfers, opt-in by intent                                            | Transfer inside a client action (iOS, Android today): a hidden side effect, copied per client                                     |
| D4  | An unknown step type renders a fallback                                     | Throwing, or a spinner: dead ends when FAPI adds a step                                                                           |

## Vocabulary

- **Next step**: what the user must do next, as FAPI reports it. Mosaic maps each step type to a route; the route proposes, the step decides.
- **Bridge**: the client-side computation of the next step for FAPI versions that don't send it.

## Appendix: suspected gaps

Not reproduced, so they don't drive the design.

- Sign-in-or-up guide: `handleVerify` falls through to the sign-in, and "new code" always resends the sign-in code.
- `SignUpStart.tsx` and the email-link verify route have no `continuePath`.
- `useSetSessionWithTimeout.ts` skips `navigateOnSetActive`.
- Web3 `complete` without `redirectUrl` uses the after-sign-in URL, even for a sign-up.
