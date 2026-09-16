import { createClerkClient } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import type { NextFetchEvent } from 'next/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';

const { publishableKey } = vi.hoisted(() => ({
  publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
}));

let gateAuthenticateRequest: (secretKey: string) => Promise<void>;

vi.mock('@clerk/backend', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    createClerkClient: vi.fn((options: any) => ({
      secretKey: options.secretKey,
      telemetry: { record: vi.fn() },
      authenticateRequest: async () => {
        await gateAuthenticateRequest(options.secretKey);
        return {
          toAuth: () => ({ tokenType: TokenType.SessionToken, debug: (d: any) => d }),
          headers: new Headers(),
          publishableKey,
        };
      },
    })),
  };
});

vi.mock(import('../constants.js'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    ENCRYPTION_KEY: 'encryption-key',
    PUBLISHABLE_KEY: publishableKey,
    SECRET_KEY: 'sk_test_environment',
  };
});

// The mocked `createClerkClient` exposes the key it was constructed with
const secretKeyOf = async () => ((await clerkClient()) as unknown as { secretKey: string }).secretKey;

const requestForTenant = (tenant: string) =>
  new NextRequest('https://www.clerk.com/', { headers: new Headers({ 'x-tenant': tenant }) });

describe('clerkMiddleware request isolation', () => {
  beforeEach(() => {
    vi.mocked(createClerkClient).mockClear();
  });

  it('does not leak dynamic keys between concurrent requests', async () => {
    let releaseTenantA!: () => void;
    const tenantAGate = new Promise<void>(resolve => {
      releaseTenantA = resolve;
    });
    gateAuthenticateRequest = secretKey => (secretKey === 'sk_test_a' ? tenantAGate : Promise.resolve());

    const secretKeyInHandler: Record<string, string | undefined> = {};
    const middleware = clerkMiddleware(
      async (_auth, request) => {
        const tenant = request.headers.get('x-tenant') as string;
        secretKeyInHandler[tenant] = await secretKeyOf();
      },
      request => ({ publishableKey, secretKey: `sk_test_${request.headers.get('x-tenant')}` }),
    );

    // Tenant A parks inside `authenticateRequest` while tenant B runs to completion.
    const tenantA = middleware(requestForTenant('a'), {} as NextFetchEvent);
    await middleware(requestForTenant('b'), {} as NextFetchEvent);
    releaseTenantA();
    await tenantA;

    expect(secretKeyInHandler).toEqual({ a: 'sk_test_a', b: 'sk_test_b' });
  });

  it('falls back to the environment key outside of a middleware request', async () => {
    gateAuthenticateRequest = () => Promise.resolve();

    expect(await secretKeyOf()).toBe('sk_test_environment');
  });
});
