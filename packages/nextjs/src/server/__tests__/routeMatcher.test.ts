import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouteMatcher } from '../routeMatcher';

const { mockDeprecated } = vi.hoisted(() => ({
  mockDeprecated: vi.fn(),
}));

vi.mock('@clerk/shared/deprecated', () => ({
  deprecated: mockDeprecated,
}));

describe('createRouteMatcher', () => {
  beforeEach(() => {
    mockDeprecated.mockClear();
  });

  it('should emit a deprecation warning when called', () => {
    createRouteMatcher(['/foo(.*)']);

    expect(mockDeprecated).toHaveBeenCalledWith(
      'createRouteMatcher',
      'Use resource-based auth checks instead. Move auth checks into each page, layout, API route, or Server Function that accesses protected data. Middleware-based auth checks rely on path matching, which can diverge from how Next.js routes requests and leave protected resources reachable. For a migration guide, see: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrating-from-create-route-matcher',
    );
  });
});
