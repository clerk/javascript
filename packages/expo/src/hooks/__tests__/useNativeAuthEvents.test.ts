import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  // Class-shaped NativeEventEmitter mock that records subscription state
  type Listener = (event: any) => void;
  const state = {
    instances: 0,
    listeners: new Map<string, Listener[]>(),
    removeFn: vi.fn(),
    moduleArg: null as any,
    constructorThrows: false,
  };

  class FakeNativeEventEmitter {
    constructor(mod?: any) {
      if (state.constructorThrows) {
        throw new Error('emitter ctor boom');
      }
      state.instances++;
      state.moduleArg = mod;
    }
    addListener(eventName: string, cb: Listener) {
      const arr = state.listeners.get(eventName) ?? [];
      arr.push(cb);
      state.listeners.set(eventName, arr);
      return { remove: state.removeFn };
    }
  }

  return {
    state,
    NativeEventEmitter: FakeNativeEventEmitter,
    triggerEvent: (eventName: string, payload: any) => {
      const arr = state.listeners.get(eventName) ?? [];
      arr.forEach(cb => cb(payload));
    },
    isNativeSupported: true,
    ClerkExpoModule: {} as Record<string, any> | null,
  };
});

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  NativeEventEmitter: mocks.NativeEventEmitter,
}));

vi.mock('../../utils/native-module', () => ({
  get isNativeSupported() {
    return mocks.isNativeSupported;
  },
  get ClerkExpoModule() {
    return mocks.ClerkExpoModule;
  },
}));

import { useNativeAuthEvents } from '../useNativeAuthEvents';

beforeEach(() => {
  mocks.state.instances = 0;
  mocks.state.listeners.clear();
  mocks.state.removeFn = vi.fn();
  mocks.state.moduleArg = null;
  mocks.state.constructorThrows = false;
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = { configure: vi.fn() };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useNativeAuthEvents', () => {
  test('returns isSupported=false and null state when native is unsupported', () => {
    mocks.isNativeSupported = false;
    const { result } = renderHook(() => useNativeAuthEvents());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.nativeAuthState).toBeNull();
  });

  test('returns isSupported=false when ClerkExpoModule is null', () => {
    mocks.ClerkExpoModule = null;
    const { result } = renderHook(() => useNativeAuthEvents());
    expect(result.current.isSupported).toBe(false);
  });

  test('constructs NativeEventEmitter with the module instance on mount', () => {
    renderHook(() => useNativeAuthEvents());
    expect(mocks.state.instances).toBe(1);
    expect(mocks.state.moduleArg).toBe(mocks.ClerkExpoModule);
  });

  test('subscribes to onAuthStateChange exactly once', () => {
    renderHook(() => useNativeAuthEvents());
    expect(mocks.state.listeners.get('onAuthStateChange')?.length).toBe(1);
  });

  test('updates nativeAuthState when an event is fired', () => {
    const { result } = renderHook(() => useNativeAuthEvents());
    act(() => {
      mocks.triggerEvent('onAuthStateChange', { type: 'signedIn', sessionId: 'sess_x' });
    });
    expect(result.current.nativeAuthState).toEqual({ type: 'signedIn', sessionId: 'sess_x' });
  });

  test('multiple events: latest event wins (state replaces, not appends)', () => {
    const { result } = renderHook(() => useNativeAuthEvents());
    act(() => {
      mocks.triggerEvent('onAuthStateChange', { type: 'signedIn', sessionId: 'sess_a' });
      mocks.triggerEvent('onAuthStateChange', { type: 'signedIn', sessionId: 'sess_b' });
    });
    expect(result.current.nativeAuthState).toEqual({ type: 'signedIn', sessionId: 'sess_b' });
  });

  test('signedOut event replaces a previous signedIn state', () => {
    const { result } = renderHook(() => useNativeAuthEvents());
    act(() => {
      mocks.triggerEvent('onAuthStateChange', { type: 'signedIn', sessionId: 'sess_x' });
    });
    expect(result.current.nativeAuthState?.type).toBe('signedIn');
    act(() => {
      mocks.triggerEvent('onAuthStateChange', { type: 'signedOut', sessionId: null });
    });
    expect(result.current.nativeAuthState?.type).toBe('signedOut');
  });

  test('subscription is removed on unmount', () => {
    const { unmount } = renderHook(() => useNativeAuthEvents());
    unmount();
    expect(mocks.state.removeFn).toHaveBeenCalledTimes(1);
  });

  test('catches NativeEventEmitter constructor errors and returns null state', () => {
    mocks.state.constructorThrows = true;
    const { result } = renderHook(() => useNativeAuthEvents());
    expect(result.current.nativeAuthState).toBeNull();
    expect(result.current.isSupported).toBe(true);
  });

  test('re-renders do not re-subscribe (effect dependency is empty)', () => {
    const { rerender } = renderHook(() => useNativeAuthEvents());
    rerender();
    rerender();
    expect(mocks.state.instances).toBe(1);
    expect(mocks.state.listeners.get('onAuthStateChange')?.length).toBe(1);
  });

  test('a fresh mount after unmount creates a new subscription', () => {
    const { unmount } = renderHook(() => useNativeAuthEvents());
    unmount();
    renderHook(() => useNativeAuthEvents());
    expect(mocks.state.instances).toBe(2);
  });
});
