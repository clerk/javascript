import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { isLocalizableError, MosaicLocalizationProvider, resolveLocalization, useErrorText } from '../../localization';
import { save, SaveError, toLocalizableError, toLocalizableErrors } from '../errors';

function errorText() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MosaicLocalizationProvider value={resolveLocalization({})}>{children}</MosaicLocalizationProvider>
  );
  return renderHook(() => useErrorText(), { wrapper }).result.current;
}

function silenceConsole() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('save', () => {
  it('wraps a Clerk API error the user can act on', async () => {
    const cause = new ClerkAPIResponseError('Forbidden', {
      status: 403,
      data: [{ code: 'action_blocked', message: 'Short', long_message: 'Long' }],
    });
    await expect(save(() => Promise.reject(cause))).rejects.toBeInstanceOf(SaveError);
  });

  it('lets a cancelled reverification through untouched, so the dialog can close quietly', async () => {
    const cause = new ClerkRuntimeError('cancelled', { code: 'reverification_cancelled' });
    await expect(save(() => Promise.reject(cause))).rejects.toBe(cause);
  });
});

describe('toLocalizableError', () => {
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

describe('toLocalizableErrors', () => {
  it('preserves every API error in response order and leaves single-error callers unchanged', () => {
    const cause = new ClerkAPIResponseError('Invalid', {
      status: 422,
      data: [
        { code: 'first', message: 'Short', long_message: 'Long', meta: { param_name: 'password' } },
        { code: 'second', message: 'Global' },
        { code: 'third', message: 'Other', meta: { param_name: 'session_id' } },
      ],
    });
    const errors = toLocalizableErrors(cause);
    expect(errors).toEqual([
      { code: 'first', message: 'Long', paramName: 'password' },
      { code: 'second', message: 'Global' },
      { code: 'third', message: 'Other', paramName: 'session_id' },
    ]);
    expect(toLocalizableError(cause)).toEqual(errors[0]);
  });

  it('preserves global-first SaveError behavior for single-error callers', () => {
    const global = { code: 'global' };
    const field = { code: 'field', paramName: 'password' };
    const cause = new SaveError({ fields: { password: field }, global });
    expect(toLocalizableErrors(cause)).toEqual([global, field]);
    expect(toLocalizableError(cause)).toEqual(global);
  });

  it.each([
    new Error('private detail'),
    undefined,
    new SaveError({}),
    new ClerkAPIResponseError('Empty', { status: 500, data: [] }),
  ])('keeps a single logged fallback for %s', cause => {
    const log = silenceConsole();
    expect(toLocalizableErrors(cause)).toEqual([{ cause }]);
    expect(log).toHaveBeenCalledWith('[Clerk] Could not localize error', cause);
  });
});
