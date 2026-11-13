import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAuth } from '../useAuth';

const mocks = vi.hoisted(() => {
  return {
    useAuthBase: vi.fn(),
    getTokenBase: vi.fn(),
    checkInit: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    load: vi.fn(),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useAuth: mocks.useAuthBase,
  };
});

vi.mock('../../cache', () => {
  return {
    SessionJWTCache: {
      checkInit: mocks.checkInit,
      save: mocks.save,
      remove: mocks.remove,
      load: mocks.load,
    },
  };
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getTokenBase.mockResolvedValue('session-jwt');
    mocks.checkInit.mockReturnValue(true);
    mocks.useAuthBase.mockImplementation(() => ({
      isLoaded: true,
      isSignedIn: true,
      getToken: mocks.getTokenBase,
    }));
  });

  test('returns the same getToken across renders', () => {
    const { result, rerender } = renderHook(() => useAuth());
    const firstGetToken = result.current.getToken;

    rerender();

    expect(result.current.getToken).toBe(firstGetToken);
  });

  test('saves the token to the session JWT cache when getToken is called without options', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(result.current.getToken()).resolves.toBe('session-jwt');

    expect(mocks.getTokenBase).toHaveBeenCalledWith(undefined);
    expect(mocks.save).toHaveBeenCalledWith('session-jwt');
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  test('leaves the session JWT cache alone when getToken is called with options', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(result.current.getToken({ skipCache: true })).resolves.toBe('session-jwt');

    expect(mocks.getTokenBase).toHaveBeenCalledWith({ skipCache: true });
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
