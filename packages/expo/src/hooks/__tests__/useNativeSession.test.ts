import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isNativeSupported: true,
  ClerkExpoModule: {
    getSession: vi.fn(),
  } as Record<string, any> | null,
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

vi.mock('../../utils/native-module', () => ({
  get isNativeSupported() {
    return mocks.isNativeSupported;
  },
  get ClerkExpoModule() {
    return mocks.ClerkExpoModule;
  },
}));

import { useNativeSession } from '../useNativeSession';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = {
    getSession: vi.fn().mockResolvedValue(null),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useNativeSession', () => {
  test('isAvailable is false when native is unsupported', async () => {
    mocks.isNativeSupported = false;
    const { result } = renderHook(() => useNativeSession());
    expect(result.current.isAvailable).toBe(false);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  test('isAvailable is true when supported and module is present', () => {
    const { result } = renderHook(() => useNativeSession());
    expect(result.current.isAvailable).toBe(true);
  });

  test('calls getSession on mount when supported', async () => {
    renderHook(() => useNativeSession());
    await waitFor(() => {
      expect(mocks.ClerkExpoModule!.getSession).toHaveBeenCalledTimes(1);
    });
  });

  test('iOS shape: normalizes { sessionId } to sessionId state', async () => {
    mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce({
      sessionId: 'sess_x',
      user: { id: 'usr_x', firstName: 'Ada' },
    });

    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => {
      expect(result.current.sessionId).toBe('sess_x');
    });
    expect(result.current.user?.firstName).toBe('Ada');
    expect(result.current.isSignedIn).toBe(true);
  });

  test('Android shape: normalizes { session: { id } } to sessionId state', async () => {
    mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce({
      session: { id: 'sess_y' },
      user: { id: 'usr_y', firstName: 'Bob' },
    });

    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => {
      expect(result.current.sessionId).toBe('sess_y');
    });
    expect(result.current.user?.firstName).toBe('Bob');
    expect(result.current.isSignedIn).toBe(true);
  });

  test('null result -> sessionId=null, user=null, isSignedIn=false', async () => {
    mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.sessionId).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
  });

  test('getSession rejection clears state', async () => {
    mocks.ClerkExpoModule!.getSession.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.sessionId).toBeNull();
    expect(result.current.user).toBeNull();
  });

  test('isSignedIn is true only when sessionId is non-null', async () => {
    mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce({ sessionId: 'sess_x' });
    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => expect(result.current.isSignedIn).toBe(true));
  });

  test('refresh() calls getSession again and updates state', async () => {
    mocks
      .ClerkExpoModule!.getSession.mockResolvedValueOnce({ sessionId: 'sess_first' })
      .mockResolvedValueOnce({ sessionId: 'sess_second' });

    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => expect(result.current.sessionId).toBe('sess_first'));

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.sessionId).toBe('sess_second');
  });

  test('refresh() handles transition from signed-in to signed-out', async () => {
    mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce({ sessionId: 'sess_x' }).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => expect(result.current.isSignedIn).toBe(true));

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });

  test('refresh() resolves after state is updated', async () => {
    mocks.ClerkExpoModule!.getSession.mockResolvedValue({ sessionId: 'sess_x' });
    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      const promise = result.current.refresh();
      expect(promise).toBeInstanceOf(Promise);
      await promise;
    });
    expect(result.current.isLoading).toBe(false);
  });

  test('refresh() when unsupported sets isLoading=false and does NOT call getSession', async () => {
    mocks.isNativeSupported = false;
    const { result } = renderHook(() => useNativeSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const callsBefore = mocks.ClerkExpoModule!.getSession.mock.calls.length;

    await act(async () => {
      await result.current.refresh();
    });

    expect(mocks.ClerkExpoModule!.getSession.mock.calls.length).toBe(callsBefore);
    expect(result.current.isLoading).toBe(false);
  });
});
