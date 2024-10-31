import { createClerkClient } from '@clerk/backend';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';

vi.mock('@clerk/backend', async importOriginal => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    // replace some exports
    createClerkClient: vi.fn().mockReturnValue({ users: { getUser: vi.fn() } }),
  };
});

describe('clerkClient', () => {
  it('should pass package-specific userAgent', async () => {
    await clerkClient();

    expect((createClerkClient as Mock).mock.lastCall?.[0]).toMatchObject({
      userAgent: '@clerk/nextjs@0.0.0-test',
    });
  });
});
