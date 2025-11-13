import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createClerkRouter } from '../router';

describe('createClerkRouter', () => {
  const mockRouter = {
    name: 'mockRouter',
    mode: 'path' as const,
    pathname: vi.fn(),
    searchParams: vi.fn(),
    push: vi.fn(),
    shallowPush: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a ClerkRouter instance with the correct base path', () => {
    const oneBasePath = '/app';
    const twoBasePath = 'app';
    const threeBasePath = 'app/';
    const one = createClerkRouter(mockRouter, oneBasePath);
    const two = createClerkRouter(mockRouter, twoBasePath);
    const three = createClerkRouter(mockRouter, threeBasePath);

    expect(one.basePath).toBe(oneBasePath);
    expect(two.basePath).toBe('/app');
    expect(three.basePath).toBe('/app');
  });

  it('matches the path correctly', () => {
    const path = '/dashboard';
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.pathname.mockReturnValue('/app/dashboard');

    expect(clerkRouter.match(path)).toBe(true);
  });

  it('normalizes path arguments internally', () => {
    const path = 'dashboard/';
    const clerkRouter = createClerkRouter(mockRouter, 'app/');

    mockRouter.pathname.mockReturnValue('/app/dashboard');

    expect(clerkRouter.match(path)).toBe(true);
  });

  it('throws an error when no path is provided', () => {
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    expect(() => {
      clerkRouter.match();
    }).toThrow('[clerk] router.match() requires either a path to match, or the index flag must be set to true.');
  });

  it('creates a child router with the correct base path', () => {
    const clerkRouter = createClerkRouter(mockRouter, '/app');
    const childRouter = clerkRouter.child('dashboard');

    expect(childRouter.basePath).toBe('/app/dashboard');
  });

  it('pushes the correct destination URL ', () => {
    const path = '/app/dashboard';
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.searchParams.mockImplementation(() => new URLSearchParams(''));
    clerkRouter.push(path);

    expect(mockRouter.push).toHaveBeenCalledWith('/app/dashboard');
  });

  it('replaces the correct destination URL', () => {
    const path = '/app/dashboard';
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.searchParams.mockImplementation(() => new URLSearchParams(''));
    clerkRouter.replace(path);

    expect(mockRouter.replace).toHaveBeenCalledWith('/app/dashboard');
  });

  it('pushes the correct destination URL with preserved query parameters', () => {
    const path = '/app/dashboard';
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.searchParams.mockImplementation(() => new URLSearchParams('after_sign_in_url=foobar&foo=bar'));
    clerkRouter.push(path);

    expect(mockRouter.push).toHaveBeenCalledWith('/app/dashboard?after_sign_in_url=foobar');
  });

  it('replaces the correct destination URL with preserved query parameters', () => {
    const path = '/app/dashboard';
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.searchParams.mockImplementation(() => new URLSearchParams('after_sign_in_url=foobar&foo=bar'));
    clerkRouter.replace(path);

    expect(mockRouter.replace).toHaveBeenCalledWith('/app/dashboard?after_sign_in_url=foobar');
  });

  it('pushes absolute URLs unmodified', () => {
    const path = 'https://example.com';
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.searchParams.mockImplementation(() => new URLSearchParams('after_sign_in_url=foobar&foo=bar'));
    clerkRouter.push(path);

    expect(mockRouter.push).toHaveBeenCalledWith('https://example.com');
  });

  it('returns the correct pathname', () => {
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.pathname.mockReturnValue('/app/dashboard');

    expect(clerkRouter.pathname()).toBe('/app/dashboard');
  });

  it('returns the correct searchParams', () => {
    const clerkRouter = createClerkRouter(mockRouter, '/app');

    mockRouter.searchParams.mockImplementation(() => new URLSearchParams('foo=bar'));

    expect(clerkRouter.searchParams().get('foo')).toEqual('bar');
  });
});
