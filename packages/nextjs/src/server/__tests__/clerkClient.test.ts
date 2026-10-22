import { createClerkClient } from '@clerk/backend';
import { buildPublishableKey } from '@clerk/shared/keys';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import { clerkClient, getClerkClientAndRouting } from '../clerkClient';
import { clerkMiddlewareRequestDataStorage } from '../middleware-storage';

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

  it('keeps resolved dynamic keys and browser routing within each request', async () => {
    const firstKey = buildPublishableKey('first.clerk.test');
    const secondKey = buildPublishableKey('second.clerk.test');
    const read = (publishableKey: string, proxyUrl: string, domain: string) =>
      clerkMiddlewareRequestDataStorage.run(
        new Map([['requestData', { publishableKey, secretKey: `sk_${domain}`, proxyUrl, domain }]]),
        async () => getClerkClientAndRouting(),
      );
    const [first, second] = await Promise.all([
      read(firstKey, 'https://first.example/proxy', 'first.example'),
      read(secondKey, 'https://second.example/proxy', 'second.example'),
    ]);
    expect(first.routing).toEqual({
      publishableKey: firstKey,
      frontendApi: 'first.clerk.test',
      proxyUrl: 'https://first.example/proxy',
      domain: 'clerk.first.example',
    });
    expect(second.routing).toEqual({
      publishableKey: secondKey,
      frontendApi: 'second.clerk.test',
      proxyUrl: 'https://second.example/proxy',
      domain: 'clerk.second.example',
    });
    expect(vi.mocked(createClerkClient).mock.calls).toEqual(
      expect.arrayContaining([
        [expect.objectContaining({ publishableKey: firstKey, secretKey: 'sk_first.example' })],
        [expect.objectContaining({ publishableKey: secondKey, secretKey: 'sk_second.example' })],
      ]),
    );
  });
});
