import { getRequestURL } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouteMatcher } from '../routeMatcher';

const { mockDeprecated } = vi.hoisted(() => ({
  mockDeprecated: vi.fn(),
}));

vi.mock('@clerk/shared/deprecated', () => ({
  deprecated: mockDeprecated,
}));

vi.mock('#imports', () => ({
  getRequestURL,
}));

describe('createRouteMatcher', () => {
  beforeEach(() => {
    mockDeprecated.mockClear();
  });

  it('should emit a deprecation warning when called', () => {
    createRouteMatcher(['/api/admin(.*)']);

    expect(mockDeprecated).toHaveBeenCalledWith(
      'createRouteMatcher',
      "Match API route paths natively inside `clerkMiddleware()` instead, for example: `getRequestURL(event).pathname.startsWith('/api/admin')`. To protect pages, use Nuxt's built-in route middleware.",
    );
  });
});
