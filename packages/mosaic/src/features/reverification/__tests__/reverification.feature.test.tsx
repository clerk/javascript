import { reverificationError } from '@clerk/shared/authorization-errors';
import type { ReverificationConfig } from '@clerk/shared/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, vi } from 'vitest';

import { type FakeFapiSeed, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Card } from '../../../components/card';
import { Reverification, useReverificationFlow } from '../reverification';

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
});

const aliceSession = fapiSession({ id: 'sess_1', user: alice });

function signedIn(overrides: FakeFapiSeed = {}): FakeFapiSeed {
  return { client: fapiClient([aliceSession]), ...overrides };
}

function guardedAction(config?: ReverificationConfig) {
  return vi.fn().mockResolvedValueOnce(reverificationError(config)).mockResolvedValue({ done: true });
}

function errorCode(error: unknown) {
  if (error instanceof Error) {
    return 'code' in error && typeof error.code === 'string' ? error.code : error.message;
  }
  return 'unknown';
}

function Host({ action }: { action: () => Promise<unknown> }) {
  const [run, reverification] = useReverificationFlow(action);
  const [outcome, setOutcome] = useState('');

  return (
    <>
      <button
        type='button'
        onClick={() =>
          void run().then(
            () => setOutcome('resolved'),
            (error: unknown) => setOutcome(`rejected: ${errorCode(error)}`),
          )
        }
      >
        Run action
      </button>
      <output aria-label='Outcome'>{outcome}</output>
      <Card.Root renderBranding={false}>
        <Reverification {...reverification} />
        {reverification.onCancel ? (
          <button
            type='button'
            onClick={reverification.onCancel}
          >
            Dismiss
          </button>
        ) : null}
      </Card.Root>
    </>
  );
}

function renderReverification(action = guardedAction(), seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  return renderWithClerk(<Host action={action} />).then(view => ({ ...view, fapi, action }));
}

async function startVerification() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Run action' }));
  return user;
}

const outcome = () => screen.getByLabelText('Outcome').textContent;
const dismiss = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Dismiss' }));

describe('Reverification', () => {
  describe('starting', () => {
    it.todo('passes through when no reverification is needed', () => {
      // Nothing is rendered before the action is run
      // The action resolves with its own result
      // No challenge card opens
    });

    it.todo('opens on the first factor when the hint asks for the first factor level', () => {
      // The first factor step opens
      // No second factor step follows
    });

    it.todo('opens on the second factor when the hint asks for the second factor level', () => {
      // The second factor step opens without a first factor step
    });

    it.todo('starts verification at the second factor level when the hint carries no level', () => {
      // The second factor step opens
    });

    it.todo('lets the user dismiss the pending card while verification is starting', () => {
      // A pending card is shown while the start request is in flight
      // Dismissing rejects the action with reverification_cancelled
      // The card closes
    });

    // This can't use renderWithClerk since that awaits Clerk.load()
    it.todo('shows the pending card while Clerk is still loading', () => {
      // A pending card is shown while the session or environment is missing
      // The first step opens once Clerk is ready
    });

    // Currently wrong: entering `unavailable` calls cancel(), which closes the challenge, so the card only flashes and then disappears. Needs a product decision (keep the card until dismissed, or assert only the rejection).
    it.todo('shows the unavailable card when verification cannot be started', () => {
      // The unavailable card is shown
      // The action is rejected as cancelled
    });

    // Currently wrong: same flash as above. Enterprise SSO is dropped by the model mapping, which leaves no usable factor.
    it.todo('shows the unavailable card when none of the factors are supported', () => {
      // The unavailable card is shown when the only factor is enterprise SSO
      // The action is rejected as cancelled
    });
  });

  describe('choosing the starting method', () => {
    it.todo('starts with a passkey when the browser supports WebAuthn and the user has one', () => {
      // The passkey step opens even when the instance prefers the password
    });

    it.todo('starts with the password when the instance prefers password sign in', () => {
      // The password step opens
    });

    it.todo('starts with a code method when the instance prefers code sign in', () => {
      // The code step opens for the email address or phone number
    });

    it.todo('starts the second factor on the authenticator app when the user has one', () => {
      // The authenticator app step opens, even when a phone code is also available
    });

    it.todo('starts the second factor on a phone code when there is no authenticator app', () => {
      // The phone code step opens
    });

    it.todo('starts the second factor on the first remaining method when there is neither', () => {
      // The first listed method opens
    });

    // This is a future behavior we will need to account for, here's the PR that builds it for the existing reverification: https://github.com/clerk/javascript/pull/9127
    it.todo('offer a passkey listed as a second factor', () => {
      // The passkey is not offered on the second factor step
    });
  });

  describe('password', () => {
    // Currently wrong: the error shown is the server's English text, not a localized message. See the errors group.
    it.todo('recovers from a wrong password and completes the challenge', () => {
      // The password step opens when the action needs reverification
      // A wrong password shows the server message and stays on the step
      // The typed value is kept after the error
      // Typing again clears the error
      // Pressing Enter submits the password
      // The form is disabled and shows the verifying label while the attempt is in flight
      // The last step stays visible and pending while the session is being activated
      // The action is retried once the session is activated and resolves with its result
      // The card closes once the retried action has settled
    });
  });

  describe('email code', () => {
    // Unsure about test implementation: the fake has no request log, so counting requests needs holdRequests or counters added to the fake.
    // Currently wrong: the error shown is the server's English text, not a localized message. See the errors group.
    it.todo('sends a code and completes the challenge with the correct code', () => {
      // A code is sent once when the step opens
      // The field is usable while the code is being sent
      // A wrong code submits automatically on the last digit and shows the server error
      // The field is disabled and shows the verifying label while the attempt is in flight
      // The correct code completes the challenge
    });

    it.todo('holds a submit made while a code is being sent', () => {
      // A submit made while the first code is being sent is held
      // It is sent once the code has been sent
      // The same holds for a submit made while a resend is in flight
    });

    it.todo('discards a held submit when sending the code fails', () => {
      // The error is shown on the step
      // The held submit is not sent
      // The user can resend immediately
    });

    // Unsure about test implementation: resend is locked for 30s after the first prepare, so every resend case needs fake timers, and mixing fake Date with MSW, Clerk and userEvent in Chromium is untested.
    it.todo('resends a code once the cooldown has passed', () => {
      // Resend is disabled and shows the countdown while the cooldown runs
      // Resend is enabled again after the cooldown
      // Resending sends a new code and clears the typed value
    });
  });

  describe('phone code', () => {
    it.todo('sends an SMS code for the first factor and completes the challenge', () => {
      // The SMS code is sent through the first factor endpoints when the step opens
      // The correct code completes the challenge
    });
  });

  describe('moving from the first to the second factor', () => {
    it.todo('completes a multi factor challenge', () => {
      // The first factor step opens first
      // The second factor step opens after the first factor is verified
      // The second factor starts with an empty field and no error
      // The picker lists second factors only
      // The SMS code is sent through the second factor endpoints when the step opens
      // The correct code completes the challenge
    });
  });

  describe('second factor alternatives', () => {
    // Currently wrong: the error shown is the server's English text, not a localized message. See the errors group.
    it.todo('switches from the authenticator app to a backup code', () => {
      // The authenticator app step opens first
      // The picker offers the backup code
      // An invalid backup code shows the server error
      // A valid backup code completes the challenge
    });
  });

  describe('passkey', () => {
    // Unsure about test implementation: the fake needs clerk.__internal_getPublicCredentials stubbed to provide a credential.
    // Currently wrong: the banner shows the browser or clerk-js error message as is, which is not localized.
    it.todo('completes the challenge with the passkey', () => {
      // The passkey step opens
      // A refused credential shows an error banner and stays on the step
      // The button is disabled and shows the verifying label while the credential is being verified
      // A second attempt with an accepted credential completes the challenge
    });

    // Unsure about test implementation: needs window.PublicKeyCredential stubbed out, and it is not certain isWebAuthnSupported() reacts to that in Chromium.
    it.todo('does not offer a passkey when the browser does not support WebAuthn', () => {
      // The passkey is not the starting method
      // The passkey is not listed in the picker
    });
  });

  describe('switching methods', () => {
    // Unsure about behavior: Back keeps the typed value while picking a method clears it. It is not clear whether keeping it on Back is intended.
    // Unsure about test implementation: focus is not moved for the initially active step, only on transitions, so focus must not be asserted on the first step.
    it.todo('walks through the picker and help steps', () => {
      // The picker lists every method except the one currently shown
      // Each email address and phone number is its own method
      // Help opens from the picker and offers to email support
      // Back from help returns to the picker
      // Back from the picker returns to the method the user came from
      // Focus moves to the first field of the step the user switches to
    });

    it.todo('does not offer another method when the user has only one', () => {
      // "Use another method" is not shown
    });

    it.todo('does not list factors Mosaic cannot verify', () => {
      // Enterprise SSO is not listed in the picker
    });

    it.todo('completes the challenge with a method picked from the picker', () => {
      // Picking the password shows the password step without sending anything
      // Picking an email code shows a pending row and disables the other actions while the code is sent
      // The code step opens with an empty field and no error once the code is sent
      // Picking a phone code sends the SMS code through the first factor endpoints
      // The correct code completes the challenge
    });

    it.todo('lands on the picked method with an error when the code cannot be sent', () => {
      // The code step opens for the picked method
      // The error is shown on the step
    });

    it.todo('shows the support email from the environment', () => {
      // The help step shows the configured support email
    });

    it.todo('falls back to the default support email when the environment has none', () => {
      // The help step shows the default support email
    });
  });

  describe('finishing', () => {
    // Currently wrong: the server verification is already complete at this point, so resubmitting the same code fails with invalid_action_for_session_reverification and the user can't recover. Needs a product decision (retry finish, or restart the verification).
    it.todo('returns to the last step with an error when the session cannot be activated', () => {
      // The last step stays visible and pending while the session is being activated
      // The error is shown on the last step
      // The action is not retried
    });

    it.todo('cannot be interrupted while the action is being retried', () => {
      // The last step stays visible and pending while the action is being retried
      // Dismissing is not available
      // A second call rejects with request_already_in_progress
      // An error thrown by the retried action rejects the action and closes the card
      // A later call opens a new challenge from the first step with empty fields
    });
  });

  describe('dismissing', () => {
    it.todo('dismisses the challenge and starts fresh the next time', () => {
      // Dismissing rejects the action with reverification_cancelled
      // The card closes
      // Running the action again opens from the first step with empty fields
    });

    it.todo('can be dismissed from the method picker', () => {
      // The action is rejected with reverification_cancelled
      // The card closes
    });

    it.todo('can be dismissed from the help step', () => {
      // The action is rejected with reverification_cancelled
      // The card closes
    });

    it.todo('can be dismissed while a code is being sent', () => {
      // The action is rejected with reverification_cancelled
      // The card closes
    });

    // Unsure if this should be a test: the view has no dismiss button, so this only happens if the consumer keeps its own close control enabled during an attempt. Sign out mid attempt is the more realistic trigger.
    // Unsure about test implementation: depends on the timing of the late response, which needs a held request to control.
    it.todo('ignores a late failure from an attempt that was in flight when dismissed', () => {
      // The card closes and the action is rejected as cancelled
      // The late failure does not reopen the card or show an error
    });

    // Unsure if this should be a test: same as the late failure case above.
    // Unsure about test implementation: same as the late failure case above.
    it.todo('ignores a late success from an attempt that was in flight when dismissed', () => {
      // The card closes and the action is rejected as cancelled
      // The session is not activated
      // The action is not retried
    });

    // Unsure about test implementation: depends on the timing of the dismissed attempt's late response, which needs a held request to control.
    it.todo('starts a fresh challenge when the action is run again while a dismissed attempt is in flight', () => {
      // The new challenge opens from the first step with empty fields
      // The late response from the dismissed attempt has no effect
    });
  });

  describe('action lifecycle', () => {
    it.todo('rejects a second call while a challenge is open', () => {
      // The second call rejects with request_already_in_progress
      // The open challenge is unaffected
    });

    // Unsure about test implementation: needs the fake to support signing out mid challenge (clerk.signOut against the fake DELETE handler).
    it.todo('cancels the challenge when the user signs out', () => {
      // The card closes
      // The action is rejected as cancelled
    });

    it.todo('passes through an error that is unrelated to reverification', () => {
      // The action rejects with the original error
      // No challenge card opens
    });
  });

  describe('errors', () => {
    // Currently wrong: the model keeps only the server's longMessage or message (toError drops the error code), so nothing downstream can localize it. Known codes such as form_password_incorrect, form_code_incorrect and verification_not_sent should map to localized messages the way the old UI does.
    it.todo('shows a localized message for a wrong password', () => {
      // The message for form_password_incorrect follows the configured locale
    });

    it.todo('shows a localized message for a wrong code', () => {
      // The message for form_code_incorrect follows the configured locale
    });

    it.todo('shows the long message from the server for a Clerk error code without a localized message', () => {
      // The long message is shown
    });

    it.todo('shows the short message from the server when there is no long message', () => {
      // The short message is shown
    });

    // Currently wrong: the generic message is hardcoded English in both the model and the controller, and the localizable unstable__errors__generic message is unused.
    it.todo('shows a localized generic message when the failure is not a Clerk error', () => {
      // The generic message is shown on the step
      // The message follows the configured locale
    });

    // Unsure about behavior: a network failure surfaces as a ClerkRuntimeError (an Error) with its own English message. Needs a decision on what the user should see for network failures.
    // Unsure about test implementation: the generic fallback may only be reachable by throwing a non-Error.
    it.todo('shows a message for a network failure', () => {
      // The step stays open with an error
      // The user can try again
    });

    // Unsure about behavior: a start failure ends in the unavailable card without the reason, and a session activation failure reuses the last step's field error. Neither has a dedicated error surface.
    it.todo('explains why verification cannot continue when it cannot be started', () => {
      // The reason is shown instead of only the unavailable message
    });
  });
});

/*
  Since this file already lists a lot of the behaviors worth knowing about for reverification, here
  are a few others that might be worth knowing about, but don't deserve tests here:

  Owned by the server (tested in clerk_go/tests/fapi/session_reverification_test.go):
  - A second_factor or multi_factor request falls back to first factor when the user has no second
    factor (TestSessionReverification_FallbackLevelFirstFactor)
  - The password factor is omitted when password reverification is disabled, and a second factor
    request then falls back to first factor (PasswordDisabled, PasswordDisabled_SecondFactorFallback)
  - Second factor only strategies are rejected as first factors (SecondFactorsRejectedAsFirstFactors)
  - Phone numbers reserved for second factor are rejected as first factors, and a phone number must
    be reserved for second factor to be used as one (FirstFactor_RejectsReservedForSecondFactorPhone,
    SecondFactor_PhoneCode)
  - A passkey can satisfy the second factor, which completes a multi factor request without a second
    step, unless the instance opts out (MultiFactor_PasskeySatisfiesSecondFactor and _Disabled)
  - A TOTP code that was already consumed is rejected (TOTP_RejectsConsumedCode)
  - A pwned password is still accepted for reverification (FirstFactor_PwnedPassword)
  - Wrong passwords and codes are 422 (form_password_incorrect, form_code_incorrect). Acting in the
    wrong state is 400 (invalid_action_for_session_reverification), as is attempting a code that was
    never sent (verification_not_sent) and acting before starting (session_reverification_missing)
*/
