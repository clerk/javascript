import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { NativeAuthFlowState } from '../../specs/NativeClerkModule.types';
import { useAuthViewState } from '../useAuthViewState';

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

describe('useAuthViewState', () => {
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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('loads and observes native auth-flow completion state', async () => {
    const { result, unmount } = renderHook(() => useAuthViewState());

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

    const { result, rerender } = renderHook(() => useAuthViewState());

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: false });
    });

    mocks.auth = { isLoaded: true, isSignedIn: true };
    rerender();

    expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
  });

  test('falls back to JS session state when native auth-flow state is unavailable', () => {
    mocks.module = null;

    const { result } = renderHook(() => useAuthViewState());

    expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
    expect(mocks.moduleAddListener).not.toHaveBeenCalled();
  });

  test('falls back to JS session state when the native auth-flow state is invalid', async () => {
    mocks.getAuthFlowState.mockResolvedValue({ isLoaded: true });

    const { result } = renderHook(() => useAuthViewState());

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
    });
  });

  test('falls back to JS session state when the native auth-flow state rejects', async () => {
    const error = new Error('native failure');
    vi.stubGlobal('__DEV__', true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.getAuthFlowState.mockRejectedValue(error);

    const { result } = renderHook(() => useAuthViewState());

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
    });
    expect(consoleError).toHaveBeenCalledWith('[useAuthViewState] Failed to get native auth-flow state:', error);
  });

  test('falls back to JS session state when the native listener cannot be installed', async () => {
    const error = new Error('listener failure');
    vi.stubGlobal('__DEV__', true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.moduleAddListener.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useAuthViewState());

    await waitFor(() => {
      expect(result.current).toEqual({ isLoaded: true, isAuthFlowComplete: true });
    });
    expect(consoleError).toHaveBeenCalledWith('[useAuthViewState] Failed to observe native auth-flow state:', error);
  });
});
