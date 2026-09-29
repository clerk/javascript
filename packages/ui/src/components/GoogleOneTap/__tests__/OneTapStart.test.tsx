import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { clearFetchCache } from '../../../hooks/useFetch';
import { OneTapStart } from '../one-tap-start';

const { createFixtures } = bindCreateFixtures('GoogleOneTap');

const initialize = vi.fn();

const mountOneTap = async () => {
  const { wrapper, fixtures } = await createFixtures();
  fixtures.environment.displayConfig.googleOneTapClientId = 'client-id';
  const release = vi.fn();
  const register = vi.fn().mockReturnValue(release);
  fixtures.clerk.__internal_registerProtectCheckHandler = register;

  render(<OneTapStart />, { wrapper });
  await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));

  const callback = initialize.mock.calls[0][0].callback as (response: { credential: string }) => Promise<void>;
  return { fixtures, register, release, callback };
};

describe('OneTapStart', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    initialize.mockReset();
    clearFetchCache();
    window.google = { accounts: { id: { initialize, prompt: vi.fn(), cancel: vi.fn() } } };
  });

  it('claims both Protect flows only while it authenticates, not on mount', async () => {
    const { fixtures, register, release, callback } = await mountOneTap();
    let finishAuth!: (value: SignInResource) => void;
    fixtures.clerk.authenticateWithGoogleOneTap.mockReturnValue(
      new Promise(resolve => {
        finishAuth = resolve;
      }),
    );
    fixtures.clerk.handleGoogleOneTapCallback.mockResolvedValue(undefined);
    expect(register).not.toHaveBeenCalled();

    const pending = callback({ credential: 'cred' });

    expect(register).toHaveBeenCalledWith(['signIn', 'signUp']);
    expect(register.mock.invocationCallOrder[0]).toBeLessThan(
      fixtures.clerk.authenticateWithGoogleOneTap.mock.invocationCallOrder[0],
    );
    expect(release).not.toHaveBeenCalled();

    finishAuth(fixtures.signIn);
    await pending;

    expect(fixtures.clerk.handleGoogleOneTapCallback).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
    expect(release.mock.invocationCallOrder[0]).toBeGreaterThan(
      fixtures.clerk.handleGoogleOneTapCallback.mock.invocationCallOrder[0],
    );
  });

  it('releases the claim when authentication throws', async () => {
    const { fixtures, register, release, callback } = await mountOneTap();
    fixtures.clerk.authenticateWithGoogleOneTap.mockRejectedValue(new Error('nope'));

    await callback({ credential: 'cred' });

    expect(register).toHaveBeenCalledWith(['signIn', 'signUp']);
    expect(fixtures.clerk.handleGoogleOneTapCallback).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledTimes(1);
  });
});
