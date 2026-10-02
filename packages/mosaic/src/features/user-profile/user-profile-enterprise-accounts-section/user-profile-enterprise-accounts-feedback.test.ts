import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { resolveLocalization } from '../../../localization';
import { enterpriseAccountErrorMessage } from './user-profile-enterprise-accounts-feedback';

const messages = resolveLocalization({ locale: 'en' }).messages.userProfileEnterpriseAccountsSection;
const errorText = ({ message }: { message?: string }) => message || messages.errors.generic;

function apiError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
  return new ClerkAPIResponseError('Invalid', { status: 422, data });
}

describe('enterprise account error messages', () => {
  it('shows the first API error, preferring its long message', () => {
    expect(
      enterpriseAccountErrorMessage(
        apiError([
          { code: 'oauth_error', message: 'Short', long_message: 'The identity provider is unavailable.' },
          { code: 'other', message: 'Second' },
        ]),
        errorText,
        messages.errors.generic,
      ),
    ).toBe('The identity provider is unavailable.');
    expect(
      enterpriseAccountErrorMessage(
        apiError([{ code: 'oauth_error', message: 'Short' }]),
        errorText,
        messages.errors.generic,
      ),
    ).toBe('Short');
  });

  it('falls back to the generic message', () => {
    expect(enterpriseAccountErrorMessage(apiError([]), errorText, messages.errors.generic)).toBe(
      messages.errors.generic,
    );
    expect(enterpriseAccountErrorMessage(new TypeError('Failed to fetch'), errorText, messages.errors.generic)).toBe(
      messages.errors.generic,
    );
  });
});
