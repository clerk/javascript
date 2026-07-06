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
    createRouteMatcher(['/dashboard(.*)']);

    expect(mockDeprecated).toHaveBeenCalledWith(
      'createRouteMatcher',
      "Use Nuxt's built-in route middleware to protect pages instead: create a named middleware that checks the user's authentication status and opt pages into it with `definePageMeta({ middleware: 'auth' })`.",
    );
  });
});
