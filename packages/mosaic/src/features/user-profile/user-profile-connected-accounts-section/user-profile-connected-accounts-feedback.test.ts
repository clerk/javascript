import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { resolveLocalization } from '../../../localization';
import { connectedAccountErrorMessage } from './user-profile-connected-accounts-feedback';
import { ConnectedAccountActionError } from './user-profile-connected-accounts-section.types';

const errorText = ({ message }: { message?: string }) => message ?? 'Fallback';
const messages = resolveLocalization({ locale: 'en' }).messages.userProfileConnectedAccounts;

function apiError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
  return new ClerkAPIResponseError('Invalid', { status: 422, data });
}

describe('connected account error messages', () => {
  it('localizes errors raised by the model', () => {
    expect(connectedAccountErrorMessage(new ConnectedAccountActionError('unavailable'), messages, errorText)).toBe(
      messages.errors.unavailable,
    );
    expect(
      connectedAccountErrorMessage(new ConnectedAccountActionError('missing_verification_url'), messages, errorText),
    ).toBe(messages.errors.missingVerificationUrl);
  });

  it('shows the first API error, preferring its long message', () => {
    expect(
      connectedAccountErrorMessage(
        apiError([
          { code: 'oauth_error', message: 'Short', long_message: 'GitHub is unavailable right now.' },
          { code: 'other', message: 'Second' },
        ]),
        messages,
        errorText,
      ),
    ).toBe('GitHub is unavailable right now.');
    expect(
      connectedAccountErrorMessage(apiError([{ code: 'oauth_error', message: 'Short' }]), messages, errorText),
    ).toBe('Short');
  });

  it('passes the API code, parameter, and fallback copy to the canonical formatter', () => {
    expect(
      connectedAccountErrorMessage(
        apiError([
          { code: 'form_param_invalid', message: 'Short', long_message: 'Long', meta: { param_name: 'strategy' } },
        ]),
        messages,
        ({ code, paramName, message }) => `${code}:${paramName}:${message}`,
      ),
    ).toBe('form_param_invalid:strategy:Long');
  });

  it('falls back to the generic message', () => {
    expect(connectedAccountErrorMessage(apiError([]), messages, errorText)).toBe(messages.errors.generic);
    expect(connectedAccountErrorMessage(new Error('Popup closed'), messages, errorText)).toBe(messages.errors.generic);
  });
});
