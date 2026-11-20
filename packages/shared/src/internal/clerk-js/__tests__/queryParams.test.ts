import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CLERK_SYNCED } from '../constants';
import {
  forwardClerkQueryParams,
  getClerkQueryParam,
  getUserProfileEmailAddressLinkStatus,
  removeClerkQueryParam,
} from '../queryParams';

describe('getClerkQueryParam', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost',
        search: '',
      },
      writable: true,
    });
  });

  it('returns null when parameter is not present', () => {
    expect(getClerkQueryParam('__clerk_status')).toBeNull();
  });

  it('returns the value when parameter is present', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost?__clerk_status=verified',
        search: '?__clerk_status=verified',
      },
      writable: true,
    });

    expect(getClerkQueryParam('__clerk_status')).toBe('verified');
  });

  it('handles multiple query parameters', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost?__clerk_status=verified&__clerk_ticket=test_ticket',
        search: '?__clerk_status=verified&__clerk_ticket=test_ticket',
      },
      writable: true,
    });

    expect(getClerkQueryParam('__clerk_status')).toBe('verified');
    expect(getClerkQueryParam('__clerk_ticket')).toBe('test_ticket');
  });
});

describe('removeClerkQueryParam', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost',
        search: '',
      },
      writable: true,
    });
  });

  it('removes the parameter from the URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost?__clerk_status=verified',
        search: '?__clerk_status=verified',
      },
      writable: true,
    });

    const mockReplaceState = vi.fn();
    Object.defineProperty(window.history, 'replaceState', {
      value: mockReplaceState,
      writable: true,
    });

    removeClerkQueryParam('__clerk_status');

    expect(mockReplaceState).toHaveBeenCalledTimes(1);
    const [state, title, url] = mockReplaceState.mock.calls[0];
    expect(state).toBe(window.history.state);
    expect(title).toBe('');
    expect(url.href).toEqual('http://localhost/');
  });

  it('does nothing when parameter is not present', () => {
    const mockReplaceState = vi.fn();
    Object.defineProperty(window.history, 'replaceState', {
      value: mockReplaceState,
      writable: true,
    });

    removeClerkQueryParam('__clerk_status');

    expect(mockReplaceState).not.toHaveBeenCalled();
  });
});

describe('forwardClerkQueryParams', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost',
        search: '',
      },
      writable: true,
    });
  });

  it('forwards all Clerk query parameters from current URL', () => {
    const testParams = {
      __clerk_status: 'verified',
      __clerk_ticket: 'test_ticket',
      __clerk_handshake: 'test_handshake',
      [CLERK_SYNCED]: 'true',
    };

    const searchParams = new URLSearchParams(testParams);
    Object.defineProperty(window, 'location', {
      value: {
        href: `http://localhost?${searchParams.toString()}`,
        search: searchParams.toString(),
      },
      writable: true,
    });

    const result = forwardClerkQueryParams();

    Object.entries(testParams).forEach(([key, value]) => {
      expect(result.get(key)).toBe(value);
    });
  });

  it('preserves existing parameters when provided with URLSearchParams', () => {
    const existingParams = new URLSearchParams({
      custom_param: 'value',
      other_param: 'other_value',
    });

    const testParams = {
      __clerk_status: 'verified',
      __clerk_ticket: 'test_ticket',
    };

    const searchParams = new URLSearchParams(testParams);
    Object.defineProperty(window, 'location', {
      value: {
        href: `http://localhost?${searchParams.toString()}`,
        search: searchParams.toString(),
      },
      writable: true,
    });

    const result = forwardClerkQueryParams(existingParams);

    Object.entries(testParams).forEach(([key, value]) => {
      expect(result.get(key)).toBe(value);
    });

    expect(result.get('custom_param')).toBe('value');
    expect(result.get('other_param')).toBe('other_value');
  });

  it('handles empty URL search params', () => {
    const result = forwardClerkQueryParams();
    expect(result.toString()).toBe('');
  });

  it('ignores non-Clerk query parameters', () => {
    const testParams = {
      __clerk_status: 'verified',
      custom_param: 'value',
      other_param: 'other_value',
    };

    const searchParams = new URLSearchParams(testParams);
    Object.defineProperty(window, 'location', {
      value: {
        href: `http://localhost?${searchParams.toString()}`,
        search: searchParams.toString(),
      },
      writable: true,
    });

    const result = forwardClerkQueryParams();

    expect(result.get('__clerk_status')).toBe('verified');
    expect(result.get('custom_param')).toBeNull();
    expect(result.get('other_param')).toBeNull();
  });

  it('handles URL with no search parameters', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost',
        search: '',
      },
      writable: true,
    });

    const result = forwardClerkQueryParams();
    expect(result.toString()).toBe('');
  });
});

describe('getUserProfileEmailAddressLinkStatus', () => {
  const statusAt = (url: string, routing: { routing?: 'path' | 'hash' | 'virtual'; path?: string }) =>
    getUserProfileEmailAddressLinkStatus(routing, new URL(url, 'https://example.com'));

  it.each([
    ['/user/verify?__clerk_status=verified', { routing: 'path', path: '/user' }, 'verified'],
    ['/user/verify?__clerk_status=expired', { path: '/user' }, 'expired'],
    ['/user/verify/?__clerk_status=failed', { routing: 'path', path: '/user' }, 'failed'],
    ['/user/verify?__clerk_status=client_mismatch', { routing: 'path', path: '/user/' }, 'client_mismatch'],
    ['/settings/account/verify?__clerk_status=expired', { routing: 'path', path: '/settings/account' }, 'expired'],
    ['/verify?__clerk_status=verified', { routing: 'path', path: '/' }, 'verified'],
    ['/user?__clerk_status=expired#/verify', { routing: 'path', path: '/user' }, 'expired'],
    ['/account?__clerk_status=expired#/verify', {}, 'expired'],
    ['/account?__clerk_status=verified#/verify/', { routing: 'hash' }, 'verified'],
    ['/account?a=b&__clerk_status=failed#/verify?redirect_url=%2F', { routing: 'hash' }, 'failed'],
  ] as const)('returns the status at %s with %o', (url, routing, status) => {
    expect(statusAt(url, routing)).toBe(status);
  });

  it.each([
    ['/user/verify', { routing: 'path', path: '/user' }],
    ['/user/verify?__clerk_status=transferable', { routing: 'path', path: '/user' }],
    ['/user/verify?__clerk_status=unknown', { routing: 'path', path: '/user' }],
    ['/user/security?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user/verify/extra?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user?__clerk_status=verified#/security', { routing: 'path', path: '/user' }],
    ['/other/verify?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user/verify?__clerk_status=verified', { routing: 'path', path: '/settings/user' }],
    ['/account?__clerk_status=verified', {}],
    ['/account?__clerk_status=verified#/security', {}],
    ['/account?__clerk_status=verified#/verify/extra', { routing: 'hash' }],
    ['/account/verify?__clerk_status=verified', { routing: 'hash' }],
  ] as const)('returns null at %s with %o', (url, routing) => {
    expect(statusAt(url, routing)).toBeNull();
  });
});
