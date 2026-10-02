import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SaveError, toLocalizableError } from './form-error';

function silenceConsole() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('toLocalizableError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads the global error a save left, code and all', () => {
    const cause = new SaveError({ global: { code: 'action_blocked', message: 'Raw server sentence.' } });
    expect(toLocalizableError(cause)).toEqual({
      code: 'action_blocked',
      message: 'Raw server sentence.',
    });
  });

  it('falls back to the first field error when a save named only fields', () => {
    const cause = new SaveError({ fields: { name: { code: 'form_param_nil', paramName: 'name' } } });
    expect(toLocalizableError(cause)).toEqual({ code: 'form_param_nil', paramName: 'name' });
  });

  it('has nothing to say when a save carried nothing', () => {
    expect(toLocalizableError(new SaveError({}))).toEqual({});
  });

  it('maps a Clerk API error that never went through save', () => {
    const cause = new ClerkAPIResponseError('Forbidden', {
      status: 403,
      data: [{ code: 'not_allowed_access', message: 'Short', long_message: 'Long', meta: { param_name: 'role' } }],
    });
    expect(toLocalizableError(cause)).toEqual({
      code: 'not_allowed_access',
      paramName: 'role',
      message: 'Long',
    });
  });

  it('maps a Clerk runtime error by its code', () => {
    const cause = new ClerkRuntimeError('Network down.', { code: 'network_error' });
    expect(toLocalizableError(cause)).toMatchObject({ code: 'network_error' });
  });

  it('never shows the message of a plain error', () => {
    const log = silenceConsole();
    const cause = new Error('Cannot read properties of undefined');
    expect(toLocalizableError(cause)).toEqual({});
    expect(log).toHaveBeenCalledWith(cause);
  });

  it('has nothing to say for something that is not an error at all', () => {
    silenceConsole();
    expect(toLocalizableError('nope')).toEqual({});
  });
});
