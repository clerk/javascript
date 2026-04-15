import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  NativeClerkUserProfileView: vi.fn(),
  isNativeSupported: true,
  ClerkExpoModule: {
    signOut: vi.fn(),
  } as Record<string, any> | null,
  useClerk: vi.fn(),
}));

vi.mock('@clerk/react', () => ({ useClerk: mocks.useClerk }));

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

vi.mock('../../specs/NativeClerkUserProfileView', () => ({
  default: mocks.NativeClerkUserProfileView,
}));

vi.mock('../../utils/native-module', () => ({
  get isNativeSupported() {
    return mocks.isNativeSupported;
  },
  get ClerkExpoModule() {
    return mocks.ClerkExpoModule;
  },
}));

import { InlineUserProfileView } from '../InlineUserProfileView';

let recordedProps: Record<string, any> = {};
let mockClerk: { signOut: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = { signOut: vi.fn().mockResolvedValue(undefined) };
  recordedProps = {};
  mockClerk = { signOut: vi.fn().mockResolvedValue(undefined) };
  mocks.useClerk.mockReturnValue(mockClerk);
  mocks.NativeClerkUserProfileView.mockImplementation((props: any) => {
    recordedProps = props;
    return React.createElement('div', { 'data-testid': 'native-inline-profile' });
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('InlineUserProfileView', () => {
  test('renders NativeClerkUserProfileView with default props', () => {
    render(React.createElement(InlineUserProfileView));
    expect(mocks.NativeClerkUserProfileView).toHaveBeenCalled();
    expect(recordedProps.isDismissable).toBe(false);
  });

  test('forwards isDismissable prop', () => {
    render(React.createElement(InlineUserProfileView, { isDismissable: true }));
    expect(recordedProps.isDismissable).toBe(true);
  });

  test('renders fallback when native is unsupported', () => {
    mocks.isNativeSupported = false;
    const { container } = render(React.createElement(InlineUserProfileView));
    expect(container.textContent).toMatch(/only available on iOS and Android/i);
  });

  test('signedOut event triggers full sign-out chain', async () => {
    render(React.createElement(InlineUserProfileView));
    await act(async () => {
      await recordedProps.onProfileEvent({ nativeEvent: { type: 'signedOut', data: '{}' } });
    });
    expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(1);
    expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
  });

  test('regression: re-mount sign-out cycle works (signOutTriggered ref is per-instance)', async () => {
    // First mount: sign out
    const first = render(React.createElement(InlineUserProfileView));
    await act(async () => {
      await recordedProps.onProfileEvent({ nativeEvent: { type: 'signedOut', data: '{}' } });
    });
    expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(1);

    first.unmount();

    // Re-mount and sign out again
    render(React.createElement(InlineUserProfileView));
    await act(async () => {
      await recordedProps.onProfileEvent({ nativeEvent: { type: 'signedOut', data: '{}' } });
    });
    expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(2);
  });

  test('non-signedOut events are ignored', async () => {
    render(React.createElement(InlineUserProfileView));
    await act(async () => {
      await recordedProps.onProfileEvent({ nativeEvent: { type: 'profileUpdated', data: '{}' } });
    });
    expect(mocks.ClerkExpoModule!.signOut).not.toHaveBeenCalled();
    expect(mockClerk.signOut).not.toHaveBeenCalled();
  });
});
