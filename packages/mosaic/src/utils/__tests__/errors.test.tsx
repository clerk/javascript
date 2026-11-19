import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { isLocalizableError, MosaicLocalizationProvider, resolveLocalization, useErrorText } from '../../localization';
import { describeError, describeErrors, MosaicError } from '../errors';

function errorText() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MosaicLocalizationProvider value={resolveLocalization({})}>{children}</MosaicLocalizationProvider>
  );
  return renderHook(() => useErrorText(), { wrapper }).result.current;
}

function silenceConsole() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('describeError', () => {
  it('reads the first issue an action left, code and all', () => {
    const cause = new MosaicError([{ code: 'action_blocked', message: 'Raw server sentence.' }, { code: 'second' }]);
    expect(describeError(cause)).toEqual({ code: 'action_blocked', message: 'Raw server sentence.' });
  });

  it('prefers an issue that names no field, as a form banner would', () => {
    const field = { code: 'field', paramName: 'password', field: 'password' };
    const global = { code: 'global' };
    expect(describeError(new MosaicError([field, global]))).toEqual(global);
  });

  it('falls back to the first field issue when every issue names a field', () => {
    const field = { code: 'form_param_nil', paramName: 'name', field: 'name' };
    expect(describeError(new MosaicError([field]))).toEqual(field);
  });

  it('keeps the cause of an error Mosaic cannot describe and never shows its message', () => {
    const log = silenceConsole();
    const cause = new Error('Cannot read properties of undefined');
    const error = describeError(cause);
    expect(error).toEqual({ cause });
    expect(isLocalizableError(error)).toBe(false);
    expect(errorText()(error, 'Unable to save.')).toBe('Unable to save.');
    expect(log).toHaveBeenCalledWith('[Clerk] Could not localize error', cause);
  });

  it('keeps the cause of something that is not an error at all', () => {
    silenceConsole();
    expect(describeError('nope')).toEqual({ cause: 'nope' });
    expect(describeError(undefined)).toEqual({ cause: undefined });
  });
});

describe('describeErrors', () => {
  it('reads every issue in the order the action reported them', () => {
    const field = { code: 'field', paramName: 'password', field: 'password' };
    const global = { code: 'global' };
    expect(describeErrors(new MosaicError([field, global]))).toEqual([field, global]);
  });

  it.each([new Error('private detail'), undefined])('keeps a single logged fallback for %s', cause => {
    const log = silenceConsole();
    expect(describeErrors(cause)).toEqual([{ cause }]);
    expect(log).toHaveBeenCalledWith('[Clerk] Could not localize error', cause);
  });
});
