import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { type NativeClientSnapshot, useNativeClientEvents } from '../useNativeClientEvents';

const mocks = vi.hoisted(() => {
  return {
    addListener: vi.fn(),
    nativeModule: {} as unknown,
    nativeListener: undefined as ((snapshot?: NativeClientSnapshot) => void) | undefined,
    platform: {
      OS: 'ios',
    },
    remove: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    DeviceEventEmitter: {
      addListener: mocks.addListener,
    },
    Platform: mocks.platform,
  };
});

vi.mock('../../utils/native-module', () => {
  return {
    get ClerkExpoModule() {
      return mocks.nativeModule;
    },
    isNativeSupported: true,
  };
});

describe('useNativeClientEvents', () => {
  beforeEach(() => {
    mocks.nativeModule = {};
    mocks.nativeListener = undefined;
    mocks.platform.OS = 'ios';
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
        changed: {
          client: false,
          deviceToken: true,
        },
        deviceToken: 'device-token',
        sourceId: 'native-source',
      });
    });

    await waitFor(() => {
      expect(result.current.nativeClientEvent?.deviceToken).toBe('device-token');
      expect(result.current.nativeClientEvent?.changed).toEqual({
        client: false,
        deviceToken: true,
      });
      expect(result.current.nativeClientEvent?.sourceId).toBe('native-source');
    });

    unmount();
  });

  test('does not subscribe Android modules without React Native addListener', () => {
    mocks.platform.OS = 'android';
    mocks.nativeModule = {
      configure: vi.fn(),
      getClientToken: vi.fn(),
      syncClientStateFromJs: vi.fn(),
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { unmount } = renderHook(() => useNativeClientEvents());

    expect(mocks.addListener).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
    unmount();
  });
});
