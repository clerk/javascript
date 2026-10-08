import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { isLocalizableError, MosaicLocalizationProvider, resolveLocalization, useErrorText } from '../../localization';
import { SaveError, toLocalizableError } from '../errors';

function errorText() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MosaicLocalizationProvider value={resolveLocalization({})}>{children}</MosaicLocalizationProvider>
  );
  return renderHook(() => useErrorText(), { wrapper }).result.current;
}

function silenceConsole() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('toLocalizableError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads the global error a save left, code and all', () => {
    const cause = new SaveError({ global: { code: 'action_blocked', message: 'Raw server sentence.' } });
    expect(toLocalizableError(cause)).toEqual({ code: 'action_blocked', message: 'Raw server sentence.' });
  });

  it('falls back to the first field error when a save named only fields', () => {
    const cause = new SaveError({ fields: { name: { code: 'form_param_nil', paramName: 'name' } } });
    expect(toLocalizableError(cause)).toEqual({ code: 'form_param_nil', paramName: 'name' });
  });

  it('keeps the cause of a save that carried nothing', () => {
    silenceConsole();
    const cause = new SaveError({});
    expect(toLocalizableError(cause)).toEqual({ cause });
  });

  it('maps a Clerk API error by its code, field and message', () => {
    const cause = new ClerkAPIResponseError('Forbidden', {
      status: 403,
      data: [{ code: 'not_allowed_access', message: 'Short', long_message: 'Long', meta: { param_name: 'role' } }],
    });
    expect(toLocalizableError(cause)).toEqual({ code: 'not_allowed_access', paramName: 'role', message: 'Long' });
  });

  it('maps a Clerk runtime error by its code', () => {
    const cause = new ClerkRuntimeError('Something broke.', { code: 'cannot_render_user_missing' });
    expect(toLocalizableError(cause)).toEqual({ code: 'cannot_render_user_missing' });
  });

  it('localizes a network failure instead of falling back', () => {
    const error = toLocalizableError(new ClerkRuntimeError('Failed to fetch', { code: 'network_error' }));
    expect(errorText()(error, 'Unable to save.')).toBe(
      'Unable to reach the server. Check your connection and try again.',
    );
  });

  it('keeps the cause of an error Clerk cannot describe and never shows its message', () => {
    const log = silenceConsole();
    const cause = new Error('Cannot read properties of undefined');
    const error = toLocalizableError(cause);
    expect(error).toEqual({ cause });
    expect(isLocalizableError(error)).toBe(false);
    expect(errorText()(error, 'Unable to save.')).toBe('Unable to save.');
    expect(log).toHaveBeenCalledWith('[Clerk] Could not localize error', cause);
  });

  it('keeps the cause of something that is not an error at all', () => {
    silenceConsole();
    expect(toLocalizableError('nope')).toEqual({ cause: 'nope' });
    expect(toLocalizableError(undefined)).toEqual({ cause: undefined });
  });

  it('keeps the cause of a Clerk API error that carries no errors', () => {
    silenceConsole();
    const cause = new ClerkAPIResponseError('Server error', { status: 500, data: [] });
    expect(toLocalizableError(cause)).toEqual({ cause });
  });
});
