import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  NativeClerkAuthView: vi.fn(),
  isNativeSupported: true,
  ClerkExpoModule: {
    getClientToken: vi.fn(),
  } as Record<string, any> | null,
  saveToken: vi.fn(),
  getClerkInstance: vi.fn(),
}));

vi.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: { OS: 'ios' },
    View: ({ children, style: _s, ...p }: any) =>
      React.createElement('div', { 'data-testid': p.testID, ...p }, children),
    Text: ({ children, style: _s, ...p }: any) =>
      React.createElement('span', { 'data-testid': p.testID, ...p }, children),
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  };
});

vi.mock('../../specs/NativeClerkAuthView', () => ({
  default: mocks.NativeClerkAuthView,
}));

vi.mock('../../utils/native-module', () => ({
  get isNativeSupported() {
    return mocks.isNativeSupported;
  },
  get ClerkExpoModule() {
    return mocks.ClerkExpoModule;
  },
}));

vi.mock('../../token-cache', () => ({
  tokenCache: {
    saveToken: mocks.saveToken,
    getToken: vi.fn(),
  },
}));

vi.mock('../../provider/singleton', () => ({
  getClerkInstance: mocks.getClerkInstance,
}));

import { InlineAuthView } from '../InlineAuthView';

let recordedProps: Record<string, any> = {};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = {
    getClientToken: vi.fn().mockResolvedValue('native_token'),
  };
  mocks.saveToken.mockResolvedValue(undefined);
  recordedProps = {};

  mocks.NativeClerkAuthView.mockImplementation((props: any) => {
    recordedProps = props;
    return React.createElement('div', { 'data-testid': 'native-clerk-auth-view' });
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('InlineAuthView rendering', () => {
  test('renders NativeClerkAuthView with default mode and isDismissable=false', () => {
    render(React.createElement(InlineAuthView));
    expect(mocks.NativeClerkAuthView).toHaveBeenCalled();
    expect(recordedProps.mode).toBe('signInOrUp');
    expect(recordedProps.isDismissable).toBe(false);
  });

  test('forwards mode and isDismissable', () => {
    render(React.createElement(InlineAuthView, { mode: 'signUp', isDismissable: true }));
    expect(recordedProps.mode).toBe('signUp');
    expect(recordedProps.isDismissable).toBe(true);
  });

  test('renders fallback when isNativeSupported is false', () => {
    mocks.isNativeSupported = false;
    const { container } = render(React.createElement(InlineAuthView));
    expect(container.textContent).toMatch(/only available on iOS and Android/i);
  });

  test('renders fallback when NativeClerkAuthView is null', async () => {
    vi.resetModules();
    vi.doMock('../../specs/NativeClerkAuthView', () => ({ default: null }));
    const { InlineAuthView: Reloaded } = await import('../InlineAuthView');
    const { container } = render(React.createElement(Reloaded));
    expect(container.textContent).toMatch(/requires the @clerk\/expo plugin/i);
    vi.doUnmock('../../specs/NativeClerkAuthView');
  });
});

describe('InlineAuthView event handling', () => {
  test('signInCompleted with sessionId triggers token cache write and setActive', async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    const reload = vi.fn().mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReturnValue({
      setActive,
      __internal_reloadInitialResources: reload,
    });

    render(React.createElement(InlineAuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({ sessionId: 'sess_x' }) },
      });
    });

    expect(mocks.saveToken).toHaveBeenCalledWith('__clerk_client_jwt', 'native_token');
    expect(reload).toHaveBeenCalledTimes(1);
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_x' });
  });

  test('signUpCompleted with sessionId behaves the same as signInCompleted', async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReturnValue({ setActive });

    render(React.createElement(InlineAuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signUpCompleted', data: { sessionId: 'sess_y' } as any },
      });
    });

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_y' });
  });

  test('event without sessionId is ignored', async () => {
    const setActive = vi.fn();
    mocks.getClerkInstance.mockReturnValue({ setActive });

    render(React.createElement(InlineAuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({}) },
      });
    });

    expect(setActive).not.toHaveBeenCalled();
  });

  test('authCompletedRef prevents the same render from syncing twice', async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReturnValue({ setActive });

    render(React.createElement(InlineAuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({ sessionId: 'sess_x' }) },
      });
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({ sessionId: 'sess_x' }) },
      });
    });

    expect(setActive).toHaveBeenCalledTimes(1);
  });
});

describe('InlineAuthView regression: re-mount re-sign-in cycle', () => {
  // Reproduces: the bug where the second sign-in after a sign-out cycle was
  // ignored because authCompletedRef leaked across mounts. The fix uses
  // useRef per-instance so a fresh mount gets a fresh ref.
  test('a fresh mount can sync a new session even if the previous mount already synced one', async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReturnValue({ setActive });

    const first = render(React.createElement(InlineAuthView));
    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({ sessionId: 'sess_1' }) },
      });
    });
    expect(setActive).toHaveBeenCalledWith({ session: 'sess_1' });

    first.unmount();

    // Re-mount and sign in again
    render(React.createElement(InlineAuthView));
    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({ sessionId: 'sess_2' }) },
      });
    });

    expect(setActive).toHaveBeenCalledTimes(2);
    expect(setActive).toHaveBeenLastCalledWith({ session: 'sess_2' });
  });
});
