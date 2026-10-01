import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { resolveLocalization } from '../../../localization';
import { enterpriseAccountErrorMessage } from './user-profile-enterprise-accounts-feedback';
import { EnterpriseAccountActionError } from './user-profile-enterprise-accounts-section.types';

const messages = resolveLocalization({ locale: 'en' }).messages.userProfileEnterpriseAccountsSection;

function apiError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
  return new ClerkAPIResponseError('Invalid', { status: 422, data });
}

describe('enterprise account error messages', () => {
  it('localizes errors raised by the model', () => {
    expect(enterpriseAccountErrorMessage(new EnterpriseAccountActionError('unavailable'), messages)).toBe(
      messages.errors.unavailable,
    );
    expect(enterpriseAccountErrorMessage(new EnterpriseAccountActionError('missing_verification_url'), messages)).toBe(
      messages.errors.missingVerificationUrl,
    );
  });

  it('shows the first API error, preferring its long message', () => {
    expect(
      enterpriseAccountErrorMessage(
        apiError([
          { code: 'oauth_error', message: 'Short', long_message: 'The identity provider is unavailable.' },
          { code: 'other', message: 'Second' },
        ]),
        messages,
      ),
    ).toBe('The identity provider is unavailable.');
    expect(enterpriseAccountErrorMessage(apiError([{ code: 'oauth_error', message: 'Short' }]), messages)).toBe(
      'Short',
    );
  });

  it('falls back to the generic message', () => {
    expect(enterpriseAccountErrorMessage(apiError([]), messages)).toBe(messages.errors.generic);
    expect(enterpriseAccountErrorMessage(new TypeError('Failed to fetch'), messages)).toBe(messages.errors.generic);
  });
});
