import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const NativeClerkAuthView = vi.fn();
  return {
    NativeClerkAuthView,
    isNativeSupported: true,
    ClerkExpoModule: {
      getClientToken: vi.fn(),
    } as Record<string, any> | null,
    saveToken: vi.fn(),
    getClerkInstance: vi.fn(),
  };
});

// Render react-native primitives as plain HTML so jsdom can render them.
vi.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: { OS: 'ios' },
    View: ({ children, style: _style, ...props }: any) =>
      React.createElement('div', { 'data-testid': props.testID, ...props }, children),
    Text: ({ children, style: _style, ...props }: any) =>
      React.createElement('span', { 'data-testid': props.testID, ...props }, children),
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

import { AuthView, syncNativeSession } from '../AuthView';

let recordedProps: Record<string, any> = {};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = {
    getClientToken: vi.fn().mockResolvedValue(null),
  };
  mocks.saveToken.mockResolvedValue(undefined);
  recordedProps = {};

  // The "native" view records props passed to it and exposes them via a callable
  mocks.NativeClerkAuthView.mockImplementation((props: any) => {
    recordedProps = props;
    return React.createElement('div', { 'data-testid': 'native-clerk-auth-view' });
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AuthView rendering', () => {
  test('renders NativeClerkAuthView with default mode and isDismissable=false', () => {
    render(React.createElement(AuthView));
    expect(mocks.NativeClerkAuthView).toHaveBeenCalled();
    expect(recordedProps.mode).toBe('signInOrUp');
    expect(recordedProps.isDismissable).toBe(false);
  });

  test('forwards mode="signIn"', () => {
    render(React.createElement(AuthView, { mode: 'signIn' }));
    expect(recordedProps.mode).toBe('signIn');
  });

  test('forwards mode="signUp"', () => {
    render(React.createElement(AuthView, { mode: 'signUp' }));
    expect(recordedProps.mode).toBe('signUp');
  });

  test('forwards isDismissable=true', () => {
    render(React.createElement(AuthView, { isDismissable: true }));
    expect(recordedProps.isDismissable).toBe(true);
  });

  test('renders fallback Text when isNativeSupported is false', () => {
    mocks.isNativeSupported = false;
    render(React.createElement(AuthView));
    expect(mocks.NativeClerkAuthView).not.toHaveBeenCalled();
    expect(screen.getByText(/only available on iOS and Android/i)).toBeTruthy();
  });

  test('renders fallback Text when NativeClerkAuthView is null (plugin not installed)', async () => {
    vi.resetModules();
    vi.doMock('../../specs/NativeClerkAuthView', () => ({ default: null }));
    const { AuthView: AuthViewReloaded } = await import('../AuthView');
    render(React.createElement(AuthViewReloaded));
    expect(screen.getByText(/requires the @clerk\/expo plugin/i)).toBeTruthy();
    vi.doUnmock('../../specs/NativeClerkAuthView');
  });

  test('the unsupported and missing-plugin fallback messages are different', async () => {
    mocks.isNativeSupported = false;
    const first = render(React.createElement(AuthView));
    const unsupportedText = first.container.textContent;
    first.unmount();

    mocks.isNativeSupported = true;
    vi.resetModules();
    vi.doMock('../../specs/NativeClerkAuthView', () => ({ default: null }));
    const { AuthView: AuthViewReloaded } = await import('../AuthView');
    const second = render(React.createElement(AuthViewReloaded));
    const missingText = second.container.textContent;
    vi.doUnmock('../../specs/NativeClerkAuthView');

    expect(unsupportedText).not.toBe(missingText);
  });
});

describe('AuthView event handling', () => {
  test('handleAuthEvent parses string data and calls syncSession with sessionId', async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    const reload = vi.fn().mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReturnValue({
      setActive,
      __internal_reloadInitialResources: reload,
    });

    render(React.createElement(AuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({ sessionId: 'sess_x' }) },
      });
    });

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_x' });
  });

  test('handleAuthEvent parses object data and calls syncSession with sessionId', async () => {
    const setActive = vi.fn().mockResolvedValue(undefined);
    mocks.getClerkInstance.mockReturnValue({ setActive });

    render(React.createElement(AuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signUpCompleted', data: { sessionId: 'sess_y' } as any },
      });
    });

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_y' });
  });

  test('handleAuthEvent ignores events without sessionId', async () => {
    const setActive = vi.fn();
    mocks.getClerkInstance.mockReturnValue({ setActive });

    render(React.createElement(AuthView));

    await act(async () => {
      await recordedProps.onAuthEvent({
        nativeEvent: { type: 'signInCompleted', data: JSON.stringify({}) },
      });
    });

    expect(setActive).not.toHaveBeenCalled();
  });
});

describe('syncNativeSession (exported helper)', () => {
  test('writes the native client token to the token cache', async () => {
    mocks.ClerkExpoModule!.getClientToken = vi.fn().mockResolvedValue('native_token');
    mocks.getClerkInstance.mockReturnValue({ setActive: vi.fn() });

    await syncNativeSession('sess_x');

    expect(mocks.saveToken).toHaveBeenCalledWith('__clerk_client_jwt', 'native_token');
  });

  test('skips token cache write when getClientToken returns null', async () => {
    mocks.ClerkExpoModule!.getClientToken = vi.fn().mockResolvedValue(null);
    mocks.getClerkInstance.mockReturnValue({ setActive: vi.fn() });

    await syncNativeSession('sess_x');

    expect(mocks.saveToken).not.toHaveBeenCalled();
  });

  test('throws ClerkRuntimeError when no clerk instance is available', async () => {
    mocks.getClerkInstance.mockReturnValue(null);
    await expect(syncNativeSession('sess_x')).rejects.toThrow(/Clerk instance is not available/);
  });

  test('calls __internal_reloadInitialResources before setActive', async () => {
    const calls: string[] = [];
    const setActive = vi.fn().mockImplementation(() => {
      calls.push('setActive');
      return Promise.resolve();
    });
    const reload = vi.fn().mockImplementation(() => {
      calls.push('reload');
      return Promise.resolve();
    });
    mocks.getClerkInstance.mockReturnValue({
      setActive,
      __internal_reloadInitialResources: reload,
    });

    await syncNativeSession('sess_x');

    expect(calls).toEqual(['reload', 'setActive']);
  });
});
