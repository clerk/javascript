import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { type NativeClientSnapshot, useNativeClientEvents } from '../useNativeClientEvents';

const mocks = vi.hoisted(() => {
  return {
    moduleAddListener: vi.fn(),
    nativeModule: {} as unknown,
    nativeListener: undefined as ((snapshot?: NativeClientSnapshot) => void) | undefined,
    remove: vi.fn(),
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
    mocks.nativeModule = {
      addListener: mocks.moduleAddListener,
    };
    mocks.nativeListener = undefined;
    mocks.remove.mockReset();
    mocks.moduleAddListener.mockReset();
    mocks.moduleAddListener.mockImplementation((_eventName, listener) => {
      mocks.nativeListener = listener;
      return { remove: mocks.remove };
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('stores native client change payloads', async () => {
    const { result, unmount } = renderHook(() => useNativeClientEvents());

    expect(mocks.moduleAddListener).toHaveBeenCalledWith('clerkNativeClientChanged', expect.any(Function));

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

  test('does not subscribe modules without an Expo event emitter', () => {
    mocks.nativeModule = {
      configure: vi.fn(),
      getClientToken: vi.fn(),
      syncClientStateFromJs: vi.fn(),
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { unmount } = renderHook(() => useNativeClientEvents());

    expect(mocks.moduleAddListener).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
    unmount();
  });
});
