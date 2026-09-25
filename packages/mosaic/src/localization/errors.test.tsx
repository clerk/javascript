import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicCatalog } from './catalog';
import { MosaicLocalizationProvider, resolveLocalization } from './context';
import { useErrorText } from './errors';

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
    expect(errorText()({ code: 'avatar_file_type_invalid', message: 'api text' })).toBe(
      'File type not supported. Please upload a JPG, PNG, GIF, or WEBP image.',
    );
  });

  it('falls back to the message Clerk sent for a code it has no text for', () => {
    expect(errorText()({ code: 'form_identifier_exists', message: 'That username is taken.' })).toBe(
      'That username is taken.',
    );
  });

  it('fills the values the error carries into its message', () => {
    expect(errorText()({ code: 'form_username_invalid_length', params: { min_length: 4, max_length: 64 } })).toBe(
      'Your username must be between 4 and 64 characters long.',
    );
  });

  it('fills an override the same way', () => {
    const text = errorText({ 'errors.form_username_invalid_length': 'Entre {min_length} y {max_length} caracteres.' });
    expect(text({ code: 'form_username_invalid_length', params: { min_length: 4, max_length: 64 } })).toBe(
      'Entre 4 y 64 caracteres.',
    );
  });

  it('falls back to the generic message when there is nothing else', () => {
    expect(errorText({ 'errors.generic': 'Algo salió mal.' })({})).toBe('Algo salió mal.');
    expect(errorText()({ code: 'toString' })).toBe('Something went wrong. Please try again.');
  });
});
