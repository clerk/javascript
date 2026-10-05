import { ClerkAPIResponseError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicCatalog } from './catalog';
import { MosaicLocalizationProvider, resolveLocalization } from './context';
import { toLocalizableApiError, useErrorText } from './errors';

function errorText(overrides?: MosaicCatalog) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MosaicLocalizationProvider value={resolveLocalization({ overrides })}>{children}</MosaicLocalizationProvider>
  );
  return renderHook(() => useErrorText(), { wrapper }).result.current;
}

describe('useErrorText', () => {
  it('prefers the message for the code on that field', () => {
    const text = errorText({
      'errors.form_identifier_exists__username': 'Nombre de usuario en uso.',
      'errors.form_identifier_exists': 'Ya existe.',
    });
    expect(text({ code: 'form_identifier_exists', paramName: 'username', message: 'Taken' })).toBe(
      'Nombre de usuario en uso.',
    );
  });

  it('falls back to the message for the code', () => {
    const text = errorText({ 'errors.form_identifier_exists': 'Ya existe.' });
    expect(text({ code: 'form_identifier_exists', paramName: 'username', message: 'Taken' })).toBe('Ya existe.');
  });

  it('ships English for known codes', () => {
    expect(errorText()({ code: 'form_password_incorrect', message: 'api text' })).toBe(
      'Your current password is incorrect.',
    );
  });

  it('falls back to the message Clerk sent for a code it has no text for', () => {
    expect(errorText()({ code: 'form_identifier_exists', message: 'That username is taken.' })).toBe(
      'That username is taken.',
    );
  });

  it('fills the values the error carries into its message', () => {
    const text = errorText({
      'errors.test_length': 'Your value must be between {min_length} and {max_length} characters long.',
    });
    expect(text({ code: 'test_length', params: { min_length: 4, max_length: 64 } })).toBe(
      'Your value must be between 4 and 64 characters long.',
    );
  });

  it('fills an override the same way', () => {
    const text = errorText({ 'errors.test_length': 'Entre {min_length} y {max_length} caracteres.' });
    expect(text({ code: 'test_length', params: { min_length: 4, max_length: 64 } })).toBe('Entre 4 y 64 caracteres.');
  });

  it('falls back to the generic message when there is nothing else', () => {
    expect(errorText({ 'errors.generic': 'Algo salió mal.' })({})).toBe('Algo salió mal.');
    expect(errorText()({ code: 'toString' })).toBe('Something went wrong. Please try again.');
  });
});

describe('Clerk API error localization', () => {
  function firstError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
    const error = new ClerkAPIResponseError('Invalid', { status: 422, data }).errors[0];
    if (!error) {
      throw new Error('Expected an API error');
    }
    return error;
  }

  it('localizes the API code and parameter before server text', () => {
    const error = firstError([
      { code: 'form_param_invalid', message: 'Short', long_message: 'Long', meta: { param_name: 'username' } },
    ]);
    const text = errorText({
      'errors.form_param_invalid': 'Invalid value',
      'errors.form_param_invalid__username': 'Invalid username',
    });
    expect(text(toLocalizableApiError(error, 'Retry'))).toBe('Invalid username');
  });

  it('prefers the API long message, then its short message', () => {
    const text = errorText();
    expect(text(toLocalizableApiError(firstError([{ code: 'unknown', message: 'Short', long_message: 'Long' }])))).toBe(
      'Long',
    );
    expect(text(toLocalizableApiError(firstError([{ code: 'unknown', message: 'Short' }])))).toBe('Short');
  });

  it('preserves an empty message unless the feature provides a fallback', () => {
    const error = firstError([{ code: 'unknown', message: '', long_message: '' }]);
    const text = errorText();
    expect(text(toLocalizableApiError(error))).toBe('');
    expect(text(toLocalizableApiError(error, 'Retry'))).toBe('Retry');
  });
});
