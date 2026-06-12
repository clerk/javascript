import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { notifyNativeSessionChanged } from '../nativeSessionEvents';
import { useNativeSession } from '../useNativeSession';

const mocks = vi.hoisted(() => {
  return {
    getSession: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
    },
  };
});

vi.mock('../../specs/NativeClerkModule', () => {
  return {
    default: {
      configure: vi.fn(),
      getSession: mocks.getSession,
      getClientToken: vi.fn(),
      refreshClient: vi.fn(),
    },
  };
});

describe('useNativeSession', () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  test('reads the native session on mount', async () => {
    mocks.getSession.mockResolvedValue({
      sessionId: 'sess_123',
      user: { id: 'user_123' },
    });

    const { result } = renderHook(() => useNativeSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.sessionId).toBe('sess_123');
    expect(result.current.user?.id).toBe('user_123');
  });

  test('refreshes when the native session changes', async () => {
    mocks.getSession.mockResolvedValueOnce(null).mockResolvedValueOnce({
      sessionId: 'sess_456',
      user: { id: 'user_456' },
    });

    const { result } = renderHook(() => useNativeSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isSignedIn).toBe(false);

    act(() => {
      notifyNativeSessionChanged();
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('sess_456');
    });

    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.user?.id).toBe('user_456');
  });

  test('removes the native session listener on unmount', async () => {
    mocks.getSession.mockResolvedValue(null);

    const { unmount } = renderHook(() => useNativeSession());

    await waitFor(() => {
      expect(mocks.getSession).toHaveBeenCalledTimes(1);
    });

    unmount();

    act(() => {
      notifyNativeSessionChanged();
    });

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mocks.getSession).toHaveBeenCalledTimes(1);
  });
});
