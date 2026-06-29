import { ClerkInstanceContext } from '@clerk/shared/react';
import type { LoadedClerk, SessionTokenSignalValue } from '@clerk/shared/types';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { __internal_useToken } from '../useToken';

function createClerkHarness(initialValue: SessionTokenSignalValue, loaded = true) {
  let current = initialValue;
  const listeners = new Set<() => void>();
  const getToken = vi.fn();

  const state = {
    sessionTokenSignal: vi.fn(() => current),
    __internal_effect: vi.fn((callback: () => void) => {
      const listener = () => callback();
      listeners.add(listener);
      callback();
      return () => listeners.delete(listener);
    }),
  };

  const clerk = {
    loaded,
    session: { getToken },
    __internal_state: state,
  } as unknown as LoadedClerk;

  return {
    clerk,
    getToken,
    state,
    setValue(value: SessionTokenSignalValue) {
      current = value;
      listeners.forEach(listener => listener());
    },
  };
}

function createWrapper(clerk: LoadedClerk) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <ClerkInstanceContext.Provider value={{ value: clerk }}>{children}</ClerkInstanceContext.Provider>;
  };
}

describe('__internal_useToken', () => {
  it('returns unloaded token state before Clerk loads', () => {
    const harness = createClerkHarness({ isLoaded: false, token: undefined }, false);

    const { result } = renderHook(() => __internal_useToken(), {
      wrapper: createWrapper(harness.clerk),
    });

    expect(result.current).toEqual({ isLoaded: false, token: undefined });
    expect(harness.state.__internal_effect).not.toHaveBeenCalled();
  });

  it('returns loaded null token state when signed out', () => {
    const harness = createClerkHarness({ isLoaded: true, token: null });

    const { result } = renderHook(() => __internal_useToken(), {
      wrapper: createWrapper(harness.clerk),
    });

    expect(result.current).toEqual({ isLoaded: true, token: null });
  });

  it('returns the active session token when present', () => {
    const harness = createClerkHarness({ isLoaded: true, token: 'token_1' });

    const { result } = renderHook(() => __internal_useToken(), {
      wrapper: createWrapper(harness.clerk),
    });

    expect(result.current).toEqual({ isLoaded: true, token: 'token_1' });
  });

  it('re-renders when the token signal updates', () => {
    const harness = createClerkHarness({ isLoaded: true, token: 'token_1' });

    const { result } = renderHook(() => __internal_useToken(), {
      wrapper: createWrapper(harness.clerk),
    });

    act(() => {
      harness.setValue({ isLoaded: true, token: 'token_2' });
    });

    expect(result.current).toEqual({ isLoaded: true, token: 'token_2' });
  });

  it('does not call getToken on mount', () => {
    const harness = createClerkHarness({ isLoaded: true, token: 'token_1' });

    renderHook(() => __internal_useToken(), {
      wrapper: createWrapper(harness.clerk),
    });

    expect(harness.getToken).not.toHaveBeenCalled();
  });
});
