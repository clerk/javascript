import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

// The package's unit tests run against React 18, which has no `React.cache`.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  const cache = <T,>(fn: T) => fn;
  return { ...actual, cache, default: { ...actual, cache } };
});

vi.mock('../keyless-provider', () => ({
  getKeylessStatus: vi.fn().mockResolvedValue({ shouldRunAsKeyless: false, runningWithClaimedKeys: false }),
  KeylessProvider: () => null,
}));

vi.mock('../../client/ClerkProvider', () => ({
  ClientClerkProvider: () => null,
}));

vi.mock('../utils', () => ({
  buildRequestLike: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../../server/buildClerkProps', () => ({
  getDynamicAuthData: vi.fn().mockReturnValue({}),
}));

import { ClerkProvider } from '../ClerkProvider';

describe('ClerkProvider', () => {
  it('keys the dynamic scripts slot it passes to the client provider', async () => {
    const element = (await ClerkProvider({
      publishableKey: 'pk_test_123',
      dynamic: true,
      children: null,
    })) as React.ReactElement<{ __internal_scriptsSlot: React.ReactElement }>;

    expect(element.props.__internal_scriptsSlot.key).toBe('clerk-scripts');
  });
});
