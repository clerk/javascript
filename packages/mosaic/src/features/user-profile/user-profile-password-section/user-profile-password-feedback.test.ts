import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { PasswordStrength } from '@clerk/shared/types';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { FormSubmitError } from '../../../components/form';
import { MosaicLocalizationProvider, resolveLocalization, useErrorText } from '../../../localization';
import { passwordFormError } from './user-profile-password-errors';
import { passwordFieldFeedback } from './user-profile-password-feedback';

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

  it('returns the generic form error for unexpected failures, never their message', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(
      passwordFormError(new Error('Connection interrupted'), true, settings, messages, localization.locale, resolver()),
    ).toMatchObject({ banner: 'Something went wrong. Please try again.' });
    expect(passwordFormError(undefined, true, settings, messages, localization.locale, resolver())).toBeInstanceOf(
      FormSubmitError,
    );
    log.mockRestore();
  });
});

describe('password field feedback', () => {
  const feedback = (validation: Parameters<typeof passwordFieldFeedback>[0]) =>
    passwordFieldFeedback(validation, { ...settings, show_zxcvbn: true }, messages, localization.locale);
  const strength = (state: PasswordStrength['state'], suggestions: string[] = []): PasswordStrength => ({
    state,
    keys: [],
    result: {
      feedback: { warning: null, suggestions },
      score: 0,
      password: '',
      guesses: 0,
      guessesLog10: 0,
      calcTime: 0,
    },
  });

  it('prefers complexity feedback over strength feedback', () => {
    expect(feedback({ complexity: { require_numbers: true }, strength: strength('fail') })).toEqual({
      type: 'error',
      message: 'Your password must contain a number.',
    });
  });

  it('reports minimum length as info and other complexity failures as errors', () => {
    expect(feedback({ complexity: { min_length: true, require_numbers: true } })).toEqual({
      type: 'info',
      message: 'Your password must contain 12 or more characters.',
    });
    expect(feedback({ complexity: { require_uppercase: true } })).toMatchObject({ type: 'error' });
  });

  it('maps strength results to error, warning, and success', () => {
    expect(feedback({ complexity: {}, strength: strength('fail', ['anotherWord']) })).toEqual({
      type: 'error',
      message: 'Your password is not strong enough. Custom suggestion.',
    });
    expect(feedback({ complexity: {}, strength: strength('pass') })).toEqual({
      type: 'warning',
      message: messages.rules.stronger,
    });
    expect(feedback({ complexity: {}, strength: strength('excellent') })).toEqual({
      type: 'success',
      message: messages.rules.strong,
    });
  });

  it('only reports a strong password when strength was checked or is disabled', () => {
    expect(feedback({ complexity: {} })).toBeUndefined();
    expect(
      passwordFieldFeedback({ complexity: {} }, { ...settings, show_zxcvbn: false }, messages, localization.locale),
    ).toEqual({ type: 'success', message: messages.rules.strong });
  });
});
