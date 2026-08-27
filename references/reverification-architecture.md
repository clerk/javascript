# Legacy reverification flow and Mosaic migration review

This document records the legacy reverification behavior that the Mosaic replacement must either preserve or
deliberately change. It also records the architecture used by the current Mosaic work.

The legacy implementation is under `packages/ui/src/components/UserVerification/`. The Mosaic implementation is one
block module under `packages/ui/src/mosaic/blocks/reverification/`.

## Architecture decision

For this work, the established implementation pattern is:

```text
integration caller
  supplies plain data and async operations
        |
        v
actor-owning view
  creates the controller actor, renders snapshots, emits events
        |
        +----------> pure controller
        |
        v
standalone interaction
  renders the reverification body from controlled props
        |
        v
dialog content
  adds dialog header and footer chrome without owning the root
```

This is the pattern implemented by `origin/carp/mosaic-user-profile-delete-account`:

- `UserProfileDeleteSectionView` accepts `onDelete`, calls `useMachine`, derives block props from the snapshot, and
  sends events.
- `userProfileDeleteSectionMachine` owns the flow and invokes the injected delete operation.
- `Destructive` is a controlled block. It owns only the half-typed confirmation phrase because nothing outside the
  block can use it.

The reverification implementation follows the same shape:

- `ReverificationView` accepts an initial challenge plus `prepare`, `attempt`, `onComplete`, and `onCancel`; it
  owns the actor and derives `actor.can(...)` values.
- `reverificationController` owns factor selection, preparation, submission, resend, help, completion, and
  cancellation transitions.
- `Reverification` is the block's standalone interaction and `ReverificationDialogContent` composes it with dialog chrome. The answer belongs to the controller because
  guards and attempts use it.

The controller, actor-owning view, standalone interaction, dialog content, messages, and shared vocabulary are internal roles of one cohesive block
module. They are colocated behind one `index.ts`.

No separate controller is required to match that precedent. Before the flow becomes reachable, it will still need a
production integration wrapper that translates Clerk resources into the plain interface above. That wrapper is an
adapter, regardless of whether the codebase calls it a controller.

This convention conflicts with the current `references/mosaic-architecture.md`, which describes a controller owning
the actor and a view receiving a fake snapshot and `send`. The implementation and its tests should be reviewed against
one convention consistently. Under the convention selected here, asking the view to own the actor is intentional.

## Legacy end-to-end lifecycle

The dialog is only one part of reverification. The full legacy lifecycle is:

1. `useReverification(fetcher)` calls the protected operation.
2. A `session_reverification_required` result opens the internal reverification modal with a required level and two
   callbacks.
3. Closing the modal calls `afterVerificationCancelled`, rejects the protected operation with
   `reverification_cancelled`, and does not retry it.
4. The UI calls `session.startVerification({ level })`. An absent level defaults to `second_factor`. The request is
   cached by level and the cache is invalidated when the flow unmounts.
5. The returned `SessionVerificationResource.status` selects first-factor or second-factor UI.
6. The chosen method is prepared when necessary and attempted.
7. `needs_second_factor` updates the cached verification resource and routes to the second-factor step.
8. `complete` updates the cache, awaits `clerk.setActive({ session: response.session.id })`, then calls
   `afterVerification`. The modal closes without firing cancellation, and `useReverification` retries the original
   protected operation once.

The ordering in step 8 is load-bearing. Completion is not merely a notification that an attempt returned
`complete`; session activation must finish before the protected operation is retried.

## Legacy factor selection

### First factor

The legacy flow:

- keeps only `password`, `email_code`, `phone_code`, and `passkey`;
- gives a primary email address or phone number priority among otherwise equivalent factors;
- uses the instance's preferred sign-in strategy to choose between password and one-time-code ordering;
- prefers a supported passkey before either ordering;
- compares email and phone factors by their resource ID, rather than treating every factor with the same strategy as
  identical;
- filters passkeys from the alternatives list when WebAuthn is unavailable; and
- sorts alternatives as email code, phone code, passkey, then password.

The initial-factor helper has an edge case: it can still fall back to a passkey in some unsupported-WebAuthn factor
sets because passkeys remain in the array used by the fallback sort. The Mosaic integration should preserve the
intended capability check, not that bug.

If no first factor can be selected, legacy renders an unavailable `ErrorCard` rather than an alternatives list.

### Second factor

The legacy flow:

- keeps `phone_code`, `totp`, and `backup_code`;
- starts with TOTP, otherwise phone code, otherwise the first remaining factor;
- compares phone factors by phone-number ID and other factors by strategy; and
- sorts alternatives as TOTP, phone code, then backup code.

Landing on the wrong route is corrected from the verification resource status: first factor routes forward to second
factor, while second factor routes back to first factor.

## Legacy behavior by method

| Method      | Stage  | Prepare                      | Attempt                                                                      | Other behavior                                                                              |
| ----------- | ------ | ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Password    | First  | No                           | `attemptFirstFactorVerification({ strategy: 'password', password })`         | API field errors can land on the password field; global errors land on the card.            |
| Email code  | First  | On entry and resend          | Six digits automatically call `attemptFirstFactorVerification`               | A successfully prepared factor is remembered to avoid preparing the unchanged factor again. |
| Phone code  | First  | On entry and resend          | Six digits automatically call `attemptFirstFactorVerification`               | Preparation carries the phone-number ID and the factor's `default` value.                   |
| Passkey     | First  | Inside `verifyWithPasskey()` | `verifyWithPasskey()` prepares WebAuthn, gets a credential, then attempts it | Alternatives omit passkey when WebAuthn is unavailable.                                     |
| Phone code  | Second | On entry and resend          | Six digits automatically call `attemptSecondFactorVerification`              | Preparation uses the phone-number ID.                                                       |
| TOTP        | Second | No                           | Six digits automatically call `attemptSecondFactorVerification`              | No resend action.                                                                           |
| Backup code | Second | No                           | Form submission calls `attemptSecondFactorVerification`                      | API field errors can land on the backup-code field.                                         |

Code resend is throttled for 30 seconds by `TimerButton`. The legacy timer decrements an in-memory counter with
`setInterval`; it is not a wall-clock deadline. Moving to a `Date.now()` deadline would be a reliability improvement,
not legacy parity. The interval also remains mounted and continues decrementing while an attempt is in flight. The
Mosaic delayed transition belongs to `verifyingCooldown`, so entering `submitting` cancels that timer and returning
after a failed attempt resumes from the frozen count.

## Errors, help, and unavailable states

Legacy `handleError` inspects Clerk errors rather than choosing error placement from the active strategy:

- errors with `meta.paramName` are mapped to the matching form control;
- the first global API error is rendered at card level;
- Clerk runtime errors render at card level;
- `reverification_cancelled` is ignored by general error UI; and
- unknown errors are rethrown.

Preparation errors are sent to card-level error handling. OTP attempt errors reset the input after the error feedback
has been shown.

Both help and unavailable states render `ErrorCard`. That surface includes an Email support action using the instance's
support email. Help also offers Back. The unavailable state includes all three pieces of copy: title, subtitle, and
message.

## Mosaic parity audit

| Legacy behavior                                                                               | Status               | Current Mosaic evidence or gap                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller-owned selection, preparation, attempt, resend, and cancellation                    | Migrated             | Explicit controller states and injected `prepare` / `attempt` operations.                                                                                                                                                            |
| First-factor success can continue to second factor                                            | Migrated             | `needs_second_factor` replaces the challenge and returns through `starting`.                                                                                                                                                         |
| Six-digit email, phone, and TOTP codes submit automatically                                   | Migrated             | `CHANGE_VALUE` normalizes to six digits and targets `submitting`.                                                                                                                                                                    |
| The unchanged prepared factor is not prepared again after opening alternatives and going Back | Migrated             | The module-derived `preparedFactorKey` survives `SHOW_ALTERNATIVES` / `BACK`.                                                                                                                                                        |
| Cancel calls its completion exactly once                                                      | Migrated             | `cancelled` is a final state with a cancel entry action.                                                                                                                                                                             |
| Start verification, loading, level default, and cache lifecycle                               | Deferred             | The view starts from an already-built `ReverificationChallenge`; no Clerk integration exists.                                                                                                                                        |
| Filter, capability-check, sort, and choose the starting factor                                | Deferred             | The caller supplies ordered factors and an optional `initialFactor`; the module derives and validates identities.                                                                                                                    |
| Preserve Clerk preparation data                                                               | Deferred             | The custom first-factor phone type omits `default`; an adapter must retain or look up the original factor.                                                                                                                           |
| Field error versus card error based on Clerk error metadata                                   | Deferred integration | The controller accepts semantic `answer` / `flow` errors. The future adapter must normalize Clerk error metadata into that vocabulary.                                                                                               |
| Activate the completed session before retrying the protected action                           | Migrated contract    | A complete attempt retains its `sessionId`; `completing` awaits `complete(result)` before entering the final state.                                                                                                                  |
| Update and invalidate the verification cache                                                  | Deferred             | No integration layer exists.                                                                                                                                                                                                         |
| Close without cancellation, then retry the protected operation once                           | Deferred             | `onComplete` / `onCancel` remain injected operations until the integration adapter exists.                                                                                                                                           |
| Email support from help and unavailable states                                                | Migrated             | Both message paths expose the injected support email as their primary action.                                                                                                                                                        |
| Unavailable title, subtitle, message, and support action                                      | Partially migrated   | The new message renders title, message, and support action, but still omits the subtitle.                                                                                                                                            |
| Alternative-method explanatory text                                                           | Partially migrated   | Legacy renders “Don’t have any of these?” next to Get help; the new choose footer renders only Get help.                                                                                                                             |
| Identifier formatting                                                                         | Deferred             | The new labels use `safeIdentifier` directly instead of `formatSafeIdentifier`.                                                                                                                                                      |
| Localization                                                                                  | Deferred             | The block accepts strings, but the actor-owning view currently reads an English base object directly.                                                                                                                                |
| Resend timing                                                                                 | Deliberately changed | Mosaic starts the cooldown after successful prepare instead of mount/click. Its state-local timer also freezes during `submitting`; legacy's mounted interval keeps decrementing. Neither implementation uses a wall-clock deadline. |
| Empty or invalid `initialFactor`                                                              | Deliberately changed | Mosaic opens factor selection when factors exist; legacy first factor shows unavailable and second factor remains loading when no current factor is selected.                                                                        |
| Submit empty or incomplete answers                                                            | Deliberately changed | Mosaic guards submit and automatically submits fixed-length codes; legacy's Continue path can invoke an OTP attempt with an empty value.                                                                                             |
| Password-only help path                                                                       | Deliberately changed | Mosaic links directly to help; legacy reaches help through its alternatives surface.                                                                                                                                                 |

## Interface review

The controller/view/interaction split is sound, but the current external interface is shallower than the delete-account
precedent. Delete account asks its caller for one operation. Reverification asks its caller to understand factor IDs,
stage tags, initial-factor policy, lossy resource translation, preparation, attempt result normalization, activation,
and modal completion semantics.

Before production integration:

1. Add one integration wrapper that owns Clerk hooks/resources and translates them into the existing plain controller
   dependencies. It does not need to be named or factored as a controller.
2. Make challenge construction one reusable function so filtering, capability checks, ordering, and initial-factor
   selection cannot drift across callers or tests. Factor identities are already derived and duplicate identities
   are rejected by the controller.
3. Normalize Clerk errors into the controller's `answer` / `flow` vocabulary. Plain rejected errors deliberately fall
   back to flow-level messages rather than inferring placement from strategy.
4. Implement `onComplete(result)` by activating `result.sessionId`, then retrying the protected operation. A failed
   completion now enters `completionFailed`; retry invokes only `complete(result)`, never the successful attempt.
5. Restore the unavailable subtitle and alternative-method explanatory text.
6. Wire the existing localization namespace before the flow is reachable.

These items deepen the module by moving policy out of every future caller. Adding a pass-through controller without
moving any of this policy would not.

## Verification snapshot

On the current branch, the four targeted files contain 51 tests: 19 controller, 16 actor-owning view, 14 dialog-content,
and 2 standalone interaction tests. The targeted Vitest run passes all 51. The run reports that Vite did not exit within its
10-second close timeout, although Vitest reports the tests themselves closed successfully.

Browser QA was not performed as part of this review.
