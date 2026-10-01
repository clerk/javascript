import { ClerkAPIResponseError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { FormSubmitError } from '../../../components/form';
import { MosaicLocalizationProvider, resolveLocalization, useErrorText } from '../../../localization';
import { passwordFormError } from './user-profile-password-feedback';
import { UserProfilePasswordUpdateError } from './user-profile-password-section.types';

const settings = { min_length: 12, max_length: 64 };
const localization = resolveLocalization({
  locale: 'en',
  overrides: {
    errors: {
      form_password_size_in_bytes_exceeded: 'Custom byte error.',
      form_password_incorrect__current_password: 'Le mot de passe actuel est incorrect.',
    },
    userProfilePasswordSection: {
      suggestions: { anotherWord: 'Custom suggestion.' },
    },
  },
});
const messages = localization.messages.userProfilePasswordSection;
function resolver(value = localization) {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(MosaicLocalizationProvider, { value }, children);
  return renderHook(() => useErrorText(), { wrapper }).result.current;
}
function format(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data'], current = false) {
  const result = passwordFormError(
    new ClerkAPIResponseError('Invalid', { status: 422, data }),
    current,
    settings,
    messages,
    localization.locale,
    resolver(),
  );
  expect(result).toBeInstanceOf(FormSubmitError);
  if (!(result instanceof FormSubmitError)) {
    throw new Error('Expected form error');
  }
  return result;
}

describe('password error feedback', () => {
  it('keeps a breached-password error ahead of later complexity failures', () => {
    expect(
      format([
        { code: 'form_password_pwned', message: 'raw', meta: { param_name: 'new_password' } },
        { code: 'form_password_no_uppercase', message: 'raw', meta: { param_name: 'new_password' } },
      ]).fields?.newPassword,
    ).toBe(
      'This password has been found as part of a breach and can not be used, please try another password instead.',
    );
  });
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
    expect(format(errors, true).fields?.currentPassword).toBe('Le mot de passe actuel est incorrect.');
    expect(format(errors).banner).toBe('Le mot de passe actuel est incorrect.');
    expect(format([{ code: 'unknown', message: 'Other', meta: { param_name: 'unmapped' } }]).banner).toBe('Other');
  });

  it('retains the server fallback for unknown current-password errors', () => {
    expect(
      format(
        [
          {
            code: 'future_error',
            message: 'short',
            long_message: 'Detailed error',
            meta: { param_name: 'current_password' },
          },
        ],
        true,
      ).fields?.currentPassword,
    ).toBe('Detailed error');
  });

  it('uses the configured maximum length', () => {
    expect(
      format([{ code: 'form_password_length_too_long', message: 'raw', meta: { param_name: 'new_password' } }]).fields
        ?.newPassword,
    ).toBe('Your password must contain less than 64 characters.');
  });

  it('uses the legacy wording when the new password matches the current one', () => {
    expect(
      format([
        {
          code: 'form_new_password_matches_current',
          message: 'Use a different password',
          meta: { param_name: 'new_password' },
        },
      ]).fields?.newPassword,
    ).toBe('New password cannot be the same as the current password.');
  });

  it.each([
    {
      code: 'form_password_size_in_bytes_exceeded',
      paramName: 'new_password',
      field: 'newPassword',
      current: false,
      message:
        'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
    },
    {
      code: 'form_password_validation_failed',
      paramName: 'current_password',
      field: 'currentPassword',
      current: true,
      message: 'Incorrect Password',
    },
  ])('uses the English catalog message for $code', ({ code, paramName, field, current, message }) => {
    const defaults = resolveLocalization({ locale: 'en' });
    const result = passwordFormError(
      new ClerkAPIResponseError('Invalid', {
        status: 422,
        data: [
          {
            code,
            message: 'Server fallback',
            meta: { param_name: paramName },
          },
        ],
      }),
      current,
      settings,
      defaults.messages.userProfilePasswordSection,
      defaults.locale,
      resolver(defaults),
    );
    expect(result).toMatchObject({ fields: { [field]: message } });
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
      passwordFormError(
        new UserProfilePasswordUpdateError(code),
        true,
        settings,
        messages,
        localization.locale,
        resolver(),
      );

    expect(translate('unavailable')).toMatchObject({ banner: 'Password update is no longer available.' });
    expect(translate('current_password_required')).toMatchObject({
      fields: { currentPassword: 'Current password is required.' },
    });
  });
});
