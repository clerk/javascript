import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { NativeAuthFlowState } from '../../specs/NativeClerkModule.types';
import { useAuthFlow } from '../useAuthFlow';

const mocks = vi.hoisted(() => ({
  auth: { isLoaded: true, isSignedIn: true },
  getAuthFlowState: vi.fn(),
  listener: undefined as ((state?: NativeAuthFlowState) => void) | undefined,
  module: {} as unknown,
  moduleAddListener: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('../../utils/native-module', () => ({
  get ClerkExpoModule() {
    return mocks.module;
  },
}));

describe('useAuthFlow', () => {
  beforeEach(() => {
    mocks.auth = { isLoaded: true, isSignedIn: true };
    mocks.listener = undefined;
    mocks.remove.mockReset();
    mocks.getAuthFlowState.mockReset();
    mocks.getAuthFlowState.mockResolvedValue({ isLoaded: true, isAuthFlowComplete: false });
    mocks.moduleAddListener.mockReset();
    mocks.moduleAddListener.mockImplementation((_eventName, listener) => {
      mocks.listener = listener;
      return { remove: mocks.remove };
    });
    mocks.module = {
      addListener: mocks.moduleAddListener,
      getAuthFlowState: mocks.getAuthFlowState,
    };
  });

  afterEach(() => {
    cleanup();
  });

  test('loads and observes native auth-flow completion state', async () => {
    const { result, unmount } = renderHook(() => useAuthFlow());

    expect(mocks.moduleAddListener).toHaveBeenCalledWith('clerkNativeAuthFlowChanged', expect.any(Function));

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: false });
    });

    act(() => {
      mocks.listener?.({ isLoaded: true, isAuthFlowComplete: true });
    });

    expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });

    unmount();
    expect(mocks.remove).toHaveBeenCalledTimes(1);
  });

  test('waits for the JS session after the native auth flow completes', async () => {
    mocks.auth = { isLoaded: true, isSignedIn: false };
    mocks.getAuthFlowState.mockResolvedValue({ isLoaded: true, isAuthFlowComplete: true });

    const { result, rerender } = renderHook(() => useAuthFlow());

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: false });
    });

    mocks.auth = { isLoaded: true, isSignedIn: true };
    rerender();

    expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
  });

  test('falls back to JS session state when native auth-flow state is unavailable', () => {
    mocks.module = null;

    const { result } = renderHook(() => useAuthFlow());

    expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
    expect(mocks.moduleAddListener).not.toHaveBeenCalled();
  });

  test('falls back to JS session state when the native auth-flow state is invalid', async () => {
    mocks.getAuthFlowState.mockResolvedValue({ isLoaded: true });

    const { result } = renderHook(() => useAuthFlow());

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
    });
  });
});
