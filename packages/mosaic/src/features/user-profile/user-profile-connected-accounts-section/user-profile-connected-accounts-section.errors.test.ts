import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { resolveLocalization } from '../../../localization';
import { connectedAccountErrorMessage } from './user-profile-connected-accounts-section.errors';
import { ConnectedAccountActionError } from './user-profile-connected-accounts-section.model';

const messages = resolveLocalization({ locale: 'en' }).messages.userProfileConnectedAccounts;

function apiError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
  return new ClerkAPIResponseError('Invalid', { status: 422, data });
}

describe('connected account error messages', () => {
  it('localizes errors raised by the model', () => {
    expect(connectedAccountErrorMessage(new ConnectedAccountActionError('unavailable'), messages)).toBe(
      messages.errors.unavailable,
    );
    expect(connectedAccountErrorMessage(new ConnectedAccountActionError('missing_verification_url'), messages)).toBe(
      messages.errors.missingVerificationUrl,
    );
  });

  it('shows the first API error, preferring its long message', () => {
    expect(
      connectedAccountErrorMessage(
        apiError([
          { code: 'oauth_error', message: 'Short', long_message: 'GitHub is unavailable right now.' },
          { code: 'other', message: 'Second' },
        ]),
        messages,
      ),
    ).toBe('GitHub is unavailable right now.');
    expect(connectedAccountErrorMessage(apiError([{ code: 'oauth_error', message: 'Short' }]), messages)).toBe('Short');
  });

  it('falls back to the generic message', () => {
    expect(connectedAccountErrorMessage(apiError([]), messages)).toBe(messages.errors.generic);
    expect(connectedAccountErrorMessage(new Error('Popup closed'), messages)).toBe(messages.errors.generic);
  });
});
