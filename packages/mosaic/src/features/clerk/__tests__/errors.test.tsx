import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicLocalizationProvider, resolveLocalization, useErrorText } from '../../../localization';
import { CancelledError, describeError, MosaicError } from '../../../utils/errors';
import { callClerk, describeClerkError } from '../errors';

function errorText() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MosaicLocalizationProvider value={resolveLocalization({})}>{children}</MosaicLocalizationProvider>
  );
  return renderHook(() => useErrorText(), { wrapper }).result.current;
}

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (cause) {
    return cause;
  }
  throw new Error('Expected a rejection');
}

function apiError(data: ConstructorParameters<typeof ClerkAPIResponseError>[1]['data']) {
  return new ClerkAPIResponseError('Invalid', { status: 422, data });
}

describe('callClerk', () => {
  it('resolves with what the run resolved with', async () => {
    await expect(callClerk(() => Promise.resolve(42))).resolves.toBe(42);
  });

  it('reads every Clerk API error by code, param and long message, in response order', async () => {
    const cause = apiError([
      { code: 'first', message: 'Short', long_message: 'Long', meta: { param_name: 'password' } },
      { code: 'second', message: 'Global' },
    ]);
    const error = await rejection(callClerk(() => Promise.reject(cause)));
    expect(error).toBeInstanceOf(MosaicError);
    expect(error instanceof MosaicError && error.issues).toEqual([
      { code: 'first', paramName: 'password', message: 'Long' },
      { code: 'second', message: 'Global' },
    ]);
  });

  it('names the field an issue belongs to only when the caller listed it', async () => {
    const cause = apiError([
      { code: 'taken', message: 'Taken', meta: { param_name: 'email_address' } },
      { code: 'blocked', message: 'Blocked', meta: { param_name: 'role' } },
    ]);
    const error = await rejection(callClerk(() => Promise.reject(cause), { fields: ['emailAddress'] }));
    expect(error instanceof MosaicError && error.issues).toEqual([
      { code: 'taken', paramName: 'email_address', message: 'Taken', field: 'emailAddress' },
      { code: 'blocked', paramName: 'role', message: 'Blocked' },
    ]);
  });

  it('adds the params a message needs to every issue', async () => {
    const cause = apiError([{ code: 'form_username_invalid_length', message: 'Bad' }]);
    const params = { min_length: 4, max_length: 64 };
    const error = await rejection(callClerk(() => Promise.reject(cause), { params }));
    expect(error instanceof MosaicError && error.issues[0].params).toEqual(params);
  });

  it('reads a Clerk runtime error by its code, which the catalog localizes', async () => {
    const cause = new ClerkRuntimeError('Failed to fetch', { code: 'network_error' });
    const error = await rejection(callClerk(() => Promise.reject(cause)));
    expect(error instanceof MosaicError && error.issues).toEqual([{ code: 'network_error' }]);
    expect(errorText()(describeError(error), 'Unable to save.')).toBe(
      'Unable to reach the server. Check your connection and try again.',
    );
  });

  it('reads a run that throws before it returns a promise', async () => {
    const cause = new ClerkRuntimeError('Gone', { code: 'organization_changed' });
    const error = await rejection(
      callClerk(() => {
        throw cause;
      }),
    );
    expect(error instanceof MosaicError && error.issues).toEqual([{ code: 'organization_changed' }]);
  });

  it.each([
    ['a cancel', new CancelledError()],
    ['a MosaicError the run already threw', new MosaicError([{ code: 'generic' }])],
    ['a code fault', new TypeError('x is undefined')],
    ['a Clerk API error that carries no errors', apiError([])],
    ['something that is not an error', 'nope'],
    ['an empty rejection', undefined],
  ])('lets %s through untouched', async (_, cause: unknown) => {
    const run = async (): Promise<never> => {
      await Promise.resolve();
      throw cause;
    };
    await expect(callClerk(run)).rejects.toBe(cause);
  });
});

describe('describeClerkError', () => {
  it('reads a Clerk error a model holds, such as a failed query, as its first issue', () => {
    const cause = apiError([
      { code: 'not_allowed_access', message: 'Short', long_message: 'Long', meta: { param_name: 'role' } },
    ]);
    expect(describeClerkError(cause)).toEqual({ code: 'not_allowed_access', paramName: 'role', message: 'Long' });
  });

  it.each(['nope', undefined])('keeps the cause of a rejection that is not an error, such as %s', cause => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(describeClerkError(cause)).toEqual({ cause });
  });

  it('keeps the cause of anything Clerk did not report', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const cause = new TypeError('x is undefined');
    expect(describeClerkError(cause)).toEqual({ cause });
  });
});
