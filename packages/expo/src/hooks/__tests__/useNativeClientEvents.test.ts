import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { type NativeClientSnapshot, useNativeClientEvents } from '../useNativeClientEvents';

const mocks = vi.hoisted(() => {
  return {
    addListener: vi.fn(),
    nativeListener: undefined as ((snapshot?: NativeClientSnapshot) => void) | undefined,
    remove: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    DeviceEventEmitter: {
      addListener: mocks.addListener,
    },
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

  test('stores native client change payloads', async () => {
    const { result, unmount } = renderHook(() => useNativeClientEvents());

    expect(mocks.addListener).toHaveBeenCalledWith('clerkNativeClientChanged', expect.any(Function));

    act(() => {
      mocks.nativeListener?.({
        clientToken: 'client-token',
        sourceId: 'native-source',
      });
    });

    await waitFor(() => {
      expect(result.current.nativeClientEvent?.clientToken).toBe('client-token');
      expect(result.current.nativeClientEvent?.sourceId).toBe('native-source');
    });

    unmount();
  });
});
