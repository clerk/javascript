import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { resolveLocalization } from '../../../localization';
import { connectedAccountFeedback } from './user-profile-connected-accounts-feedback';
import { ConnectedAccountActionError } from './user-profile-connected-accounts-section.types';

const errorText = ({ message }: { message?: string }) => message ?? 'Fallback';
const messages = resolveLocalization({ locale: 'en' }).messages.userProfileConnectedAccounts;

function apiError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
  return new ClerkAPIResponseError('Invalid', { status: 422, data });
}

describe('connected account error messages', () => {
  it('retains the internal action code and cause in localized feedback', () => {
    const cause = new ConnectedAccountActionError('unavailable');
    const feedback = connectedAccountFeedback(cause, messages, errorText);
    expect(feedback).toBeInstanceOf(ConnectedAccountActionError);
    expect(feedback.cause).toBe(cause);
    expect(feedback).toMatchObject({ code: 'unavailable', cause, message: messages.errors.unavailable });
  });

  it('localizes errors raised by the model', () => {
    expect(connectedAccountFeedback(new ConnectedAccountActionError('unavailable'), messages, errorText).message).toBe(
      messages.errors.unavailable,
    );
    expect(
      connectedAccountFeedback(new ConnectedAccountActionError('missing_verification_url'), messages, errorText)
        .message,
    ).toBe(messages.errors.missingVerificationUrl);
  });

  it('shows the first API error, preferring its long message', () => {
    expect(
      connectedAccountFeedback(
        apiError([
          { code: 'oauth_error', message: 'Short', long_message: 'GitHub is unavailable right now.' },
          { code: 'other', message: 'Second' },
        ]),
        messages,
        errorText,
      ).message,
    ).toBe('GitHub is unavailable right now.');
    expect(
      connectedAccountFeedback(apiError([{ code: 'oauth_error', message: 'Short' }]), messages, errorText).message,
    ).toBe('Short');
  });

  it('passes the API code, parameter, and fallback copy to the canonical formatter', () => {
    expect(
      connectedAccountFeedback(
        apiError([
          { code: 'form_param_invalid', message: 'Short', long_message: 'Long', meta: { param_name: 'strategy' } },
        ]),
        messages,
        ({ code, paramName, message }) => `${code}:${paramName}:${message}`,
      ).message,
    ).toBe('form_param_invalid:strategy:Long');
  });

  it('falls back to the generic message', () => {
    expect(connectedAccountFeedback(apiError([]), messages, errorText).message).toBe(messages.errors.generic);
    expect(connectedAccountFeedback(new Error('Popup closed'), messages, errorText).message).toBe(
      messages.errors.generic,
    );
  });
});
