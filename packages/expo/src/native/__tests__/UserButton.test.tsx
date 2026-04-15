import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useClerk: vi.fn(),
  useUser: vi.fn(),
  isNativeSupported: true,
  ClerkExpoModule: {
    getSession: vi.fn(),
    presentUserProfile: vi.fn(),
    configure: vi.fn(),
    signOut: vi.fn(),
  } as Record<string, any> | null,
  tokenCacheGetToken: vi.fn(),
}));

vi.mock('@clerk/react', () => ({
  useClerk: mocks.useClerk,
  useUser: mocks.useUser,
}));

vi.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: { OS: 'ios' },
    View: ({ children, style: _s, ...p }: any) =>
      React.createElement('div', { 'data-testid': p.testID, ...p }, children),
    Text: ({ children, style: _s, ...p }: any) =>
      React.createElement('span', { 'data-testid': p.testID, ...p }, children),
    Image: ({ source, style: _s, ...p }: any) =>
      React.createElement('img', { 'data-testid': p.testID, src: source?.uri, ...p }),
    TouchableOpacity: ({ children, onPress, style: _s, ...p }: any) =>
      React.createElement('button', { 'data-testid': p.testID ?? 'touchable', onClick: onPress, ...p }, children),
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  };
});

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
    getToken: mocks.tokenCacheGetToken,
    saveToken: vi.fn(),
  },
}));

import { UserButton } from '../UserButton';

let mockClerk: { publishableKey: string; signOut: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = {
    getSession: vi.fn().mockResolvedValue(null),
    presentUserProfile: vi.fn().mockResolvedValue(undefined),
    configure: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
  mocks.tokenCacheGetToken.mockResolvedValue(null);
  mockClerk = {
    publishableKey: 'pk_test_x',
    signOut: vi.fn().mockResolvedValue(undefined),
  };
  mocks.useClerk.mockReturnValue(mockClerk);
  mocks.useUser.mockReturnValue({ user: null });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('UserButton initials', () => {
  test('returns initials from clerk-react user when no native session', async () => {
    mocks.useUser.mockReturnValue({
      user: { id: 'usr_a', firstName: 'Ada', lastName: 'Lovelace', primaryEmailAddress: null, imageUrl: null },
    });
    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    expect(container.textContent).toContain('AL');
  });

  test('returns single-letter initial when only first name is present', async () => {
    mocks.useUser.mockReturnValue({
      user: { id: 'usr_a', firstName: 'Ada', lastName: null, primaryEmailAddress: null, imageUrl: null },
    });
    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    expect(container.textContent).toContain('A');
    expect(container.textContent).not.toContain('AL');
  });

  test('returns "U" placeholder for null user', async () => {
    mocks.useUser.mockReturnValue({ user: null });
    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    expect(container.textContent).toContain('U');
  });
});

describe('UserButton avatar source', () => {
  test('renders an Image when imageUrl is present', async () => {
    mocks.useUser.mockReturnValue({
      user: {
        id: 'usr_a',
        firstName: 'Ada',
        lastName: 'L',
        primaryEmailAddress: null,
        imageUrl: 'https://example.com/avatar.png',
      },
    });
    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.png');
  });

  test('renders the initials bubble when imageUrl is missing', async () => {
    mocks.useUser.mockReturnValue({
      user: { id: 'usr_a', firstName: 'Ada', lastName: 'L', primaryEmailAddress: null, imageUrl: null },
    });
    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('AL');
  });
});

describe('UserButton native session fetching', () => {
  test('fetches the native user on mount when supported', async () => {
    mocks.useUser.mockReturnValue({ user: { id: 'usr_x' } });
    render(React.createElement(UserButton));
    await act(async () => {});
    expect(mocks.ClerkExpoModule!.getSession).toHaveBeenCalledTimes(1);
  });

  test('clears nativeUser state when getSession returns no session', async () => {
    mocks.useUser.mockReturnValue({
      user: { id: 'usr_x', firstName: 'Ada', lastName: 'L', imageUrl: null, primaryEmailAddress: null },
    });
    mocks.ClerkExpoModule!.getSession.mockResolvedValueOnce(null);

    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    // Should fall back to clerk-react user (initials = "AL")
    expect(container.textContent).toContain('AL');
  });

  test('renders fallback when native is unsupported', () => {
    mocks.isNativeSupported = false;
    const { container } = render(React.createElement(UserButton));
    expect(container.textContent).toContain('?');
  });
});

describe('UserButton press handling', () => {
  test('tap calls presentUserProfile', async () => {
    mocks.useUser.mockReturnValue({ user: { id: 'usr_x' } });
    mocks.ClerkExpoModule!.getSession.mockResolvedValue({ sessionId: 'sess_x' });

    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    const button = container.querySelector('button')!;
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
  });

  test('reentrancy guard: rapid taps do not open multiple modals', async () => {
    mocks.useUser.mockReturnValue({ user: { id: 'usr_x' } });
    let resolvePresent!: () => void;
    mocks.ClerkExpoModule!.getSession.mockResolvedValue({ sessionId: 'sess_x' });
    mocks.ClerkExpoModule!.presentUserProfile.mockImplementation(() => new Promise<void>(r => (resolvePresent = r)));

    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    const button = container.querySelector('button')!;

    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });

    expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
    resolvePresent();
  });

  test('tap pre-syncs JS bearer token to native when native has no session', async () => {
    mocks.useUser.mockReturnValue({ user: { id: 'usr_x' } });
    // First getSession (mount fetch) returns null. Second (pre-check on tap) returns null.
    // Third (post-configure) returns a session. Fourth (post-modal) returns the session.
    mocks
      .ClerkExpoModule!.getSession.mockResolvedValueOnce(null) // mount
      .mockResolvedValueOnce(null) // tap pre-check
      .mockResolvedValueOnce({ sessionId: 'sess_x' }) // post-configure
      .mockResolvedValueOnce({ sessionId: 'sess_x' }); // post-modal
    mocks.tokenCacheGetToken.mockResolvedValueOnce('token_abc');

    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    const button = container.querySelector('button')!;
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mocks.ClerkExpoModule!.configure).toHaveBeenCalledWith('pk_test_x', 'token_abc');
  });

  test('post-modal: hadNativeSessionBefore=false, no JS signOut (Get Help loop guard)', async () => {
    mocks.useUser.mockReturnValue({ user: { id: 'usr_x' } });
    // Native never has a session. Token cache empty.
    mocks.ClerkExpoModule!.getSession.mockResolvedValue(null);
    mocks.tokenCacheGetToken.mockResolvedValueOnce(null);

    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    const button = container.querySelector('button')!;
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mocks.ClerkExpoModule!.signOut).not.toHaveBeenCalled();
    expect(mockClerk.signOut).not.toHaveBeenCalled();
  });

  test('post-modal: hadNativeSessionBefore=true and native session is gone -> signs out', async () => {
    mocks.useUser.mockReturnValue({ user: { id: 'usr_x' } });
    // mount fetch -> session present
    // tap pre-check -> session present
    // post-modal -> session gone
    mocks
      .ClerkExpoModule!.getSession.mockResolvedValueOnce({ sessionId: 'sess_x', user: null })
      .mockResolvedValueOnce({ sessionId: 'sess_x' })
      .mockResolvedValueOnce(null);

    const { container } = render(React.createElement(UserButton));
    await act(async () => {});
    const button = container.querySelector('button')!;
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(1);
    expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
  });
});
