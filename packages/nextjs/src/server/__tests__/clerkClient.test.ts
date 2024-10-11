import { createClerkClient } from '@clerk/backend';
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
  it('should pass version package to userAgent', async () => {
    await clerkClient().users.getUser('user_test');

    expect(createClerkClient).toHaveBeenCalledWith({
      apiUrl: 'https://api.clerk.com',
      apiVersion: 'v1',
      domain: '',
      isSatellite: false,
      proxyUrl: '',
      publishableKey: '',
      sdkMetadata: {
        environment: 'test',
        name: '@clerk/nextjs',
        version: '0.0.0-test',
      },
      secretKey: 'TEST_SECRET_KEY',
      telemetry: {
        debug: false,
        disabled: false,
      },
      userAgent: '@clerk/nextjs@0.0.0-test',
    });
  });
});
