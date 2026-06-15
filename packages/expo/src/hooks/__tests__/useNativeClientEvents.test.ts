import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { addNativeSessionListener, type NativeSessionSnapshot } from '../nativeSessionEvents';
import { useNativeClientEvents } from '../useNativeClientEvents';

const mocks = vi.hoisted(() => {
  return {
    addListener: vi.fn(),
    nativeListener: undefined as ((snapshot?: NativeSessionSnapshot) => void) | undefined,
    remove: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    NativeEventEmitter: vi.fn().mockImplementation(() => ({
      addListener: mocks.addListener,
    })),
    Platform: {
      OS: 'ios',
    },
  };
});

vi.mock('../../utils/native-module', () => {
  return {
    ClerkExpoModule: {},
    isNativeSupported: true,
  };
});

describe('useNativeClientEvents', () => {
  beforeEach(() => {
    mocks.nativeListener = undefined;
    mocks.remove.mockReset();
    mocks.addListener.mockReset();
    mocks.addListener.mockImplementation((_eventName, listener) => {
      mocks.nativeListener = listener;
      return { remove: mocks.remove };
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('forwards native refresh payloads to native session listeners', async () => {
    const sessionSnapshots: Array<NativeSessionSnapshot | undefined> = [];
    const removeNativeSessionListener = addNativeSessionListener(snapshot => {
      sessionSnapshots.push(snapshot);
    });

    const { result, unmount } = renderHook(() => useNativeClientEvents());

    act(() => {
      mocks.nativeListener?.({
        sessionId: 'sess_123',
        clientToken: 'client-token',
        user: { id: 'user_123' },
      });
    });

    await waitFor(() => {
      expect(result.current.nativeClientEvent?.sessionId).toBe('sess_123');
    });

    expect(result.current.nativeClientEvent?.clientToken).toBe('client-token');
    expect(result.current.nativeClientEvent?.user?.id).toBe('user_123');
    expect(sessionSnapshots).toEqual([
      {
        sessionId: 'sess_123',
        clientToken: 'client-token',
        user: { id: 'user_123' },
      },
    ]);

    removeNativeSessionListener();
    unmount();
  });
});
