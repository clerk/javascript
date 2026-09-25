import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { FormSubmitError } from '../../../components/form';
import { resolveLocalization } from '../../../localization';
import { passwordFormError } from './user-profile-password-feedback';
import { UserProfilePasswordUpdateError } from './user-profile-password-section.types';

const settings = { min_length: 12, max_length: 64 };
const localization = resolveLocalization({
  locale: 'en',
  overrides: {
    userProfilePasswordSection: {
      suggestions: { anotherWord: 'Custom suggestion.' },
      passwordErrors: { form_password_size_in_bytes_exceeded: 'Custom byte error.' },
    },
  },
});
const messages = localization.messages.userProfilePasswordSection;
function format(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data'], current = false) {
  const result = passwordFormError(
    new ClerkAPIResponseError('Invalid', { status: 422, data }),
    current,
    settings,
    messages,
    localization.locale,
  );
  expect(result).toBeInstanceOf(FormSubmitError);
  if (!(result instanceof FormSubmitError)) {
    throw new Error('Expected form error');
  }
  return result;
}

describe('password error feedback', () => {
  it('combines recognized requirements in a localized list', () => {
    expect(
      format([
        { code: 'form_password_no_uppercase', message: 'raw', meta: { param_name: 'new_password' } },
        { code: 'form_password_no_number', message: 'raw', meta: { param_name: 'new_password' } },
      ]).fields?.newPassword,
    ).toBe('Your password must contain an uppercase letter and a number.');
  });

  it('formats backend strength suggestions using Mosaic overrides', () => {
    expect(
      format([
        {
          code: 'form_password_not_strong_enough',
          message: 'raw',
          meta: {
            param_name: 'new_password',
            zxcvbn: { suggestions: [{ code: 'anotherWord', message: 'raw suggestion' }] },
          },
        },
      ]).fields?.newPassword,
    ).toBe('Your password is not strong enough. Custom suggestion.');
  });

  it('localizes byte errors and falls back for unknown errors', () => {
    expect(
      format([{ code: 'form_password_size_in_bytes_exceeded', message: 'raw', meta: { param_name: 'password' } }])
        .fields?.newPassword,
    ).toBe('Custom byte error.');
    expect(
      format([
        {
          code: 'future_error',
          message: 'short',
          long_message: 'Detailed error',
          meta: { param_name: 'new_password' },
        },
      ]).fields?.newPassword,
    ).toBe('Detailed error');
  });

  it('keeps current-password errors and banner fallbacks separate', () => {
    const errors = [
      { code: 'form_password_incorrect', message: 'Incorrect', meta: { param_name: 'current_password' } },
    ];
    expect(format(errors, true).fields?.currentPassword).toBe('Incorrect');
    expect(format(errors).banner).toBe('Incorrect');
    expect(format([{ code: 'unknown', message: 'Other', meta: { param_name: 'unmapped' } }]).banner).toBe('Other');
  });

  it('uses the configured maximum length', () => {
    expect(
      format([{ code: 'form_password_length_too_long', message: 'raw', meta: { param_name: 'new_password' } }]).fields
        ?.newPassword,
    ).toBe('Your password must contain less than 64 characters.');
  });

  it('retains the server fallback for untranslated special codes', () => {
    expect(
      format([
        {
          code: 'form_new_password_matches_current',
          message: 'Use a different password',
          meta: { param_name: 'new_password' },
        },
      ]).fields?.newPassword,
    ).toBe('Use a different password');
  });

  it('handles missing and unrecognized suggestion metadata without leaking codes', () => {
    expect(
      format([{ code: 'form_password_not_strong_enough', message: 'raw', meta: { param_name: 'new_password' } }]).fields
        ?.newPassword,
    ).toBe('Your password is not strong enough.');
    expect(
      format([
        {
          code: 'form_password_not_strong_enough',
          message: 'raw',
          meta: {
            param_name: 'new_password',
            zxcvbn: { suggestions: [{ code: 'futureSuggestion', message: 'raw' }] },
          },
        },
      ]).fields?.newPassword,
    ).toBe('Your password is not strong enough.');
  });

  it('localizes update errors raised before the request is sent', () => {
    const translate = (code: UserProfilePasswordUpdateError['code']) =>
      passwordFormError(new UserProfilePasswordUpdateError(code), true, settings, messages, localization.locale);

    expect(translate('unavailable')).toMatchObject({ banner: 'Password update is no longer available.' });
    expect(translate('current_password_required')).toMatchObject({
      fields: { currentPassword: 'Current password is required.' },
    });
  });
});
