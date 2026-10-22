import { createClerkClient } from '@clerk/backend';
import { constants, TokenType } from '@clerk/backend/internal';
import { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient, getClerkClientAndRouting } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';
import { decryptClerkRequestData } from '../utils';

const { publishableKey, routingEnvironment } = vi.hoisted(() => ({
  routingEnvironment: { domain: '', proxyUrl: '' },
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
    get DOMAIN() {
      return routingEnvironment.domain;
    },
    get PROXY_URL() {
      return routingEnvironment.proxyUrl;
    },
    ENCRYPTION_KEY: 'encryption-key',
    PUBLISHABLE_KEY: publishableKey,
    SECRET_KEY: 'sk_test_environment',
  };
});

// The mocked `createClerkClient` exposes the key it was constructed with
const secretKeyOf = async () => ((await clerkClient()) as unknown as { secretKey: string }).secretKey;

const requestForTenant = (tenant: string) =>
  new NextRequest('https://www.clerk.com/', { headers: new Headers({ 'x-tenant': tenant }) });
const eventFor = (request: NextRequest) => new NextFetchEvent({ request, page: '/middleware', context: undefined });

describe('clerkMiddleware request isolation', () => {
  beforeEach(() => {
    vi.mocked(createClerkClient).mockClear();
    routingEnvironment.domain = '';
    routingEnvironment.proxyUrl = '';
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

  it('passes resolved function routing through the encrypted request context', async () => {
    gateAuthenticateRequest = () => Promise.resolve();
    let handlerRouting: Awaited<ReturnType<typeof getClerkClientAndRouting>>['routing'] | undefined;
    const middleware = clerkMiddleware(
      async () => {
        handlerRouting = (await getClerkClientAndRouting()).routing;
      },
      request => ({
        publishableKey,
        secretKey: 'sk_test_dynamic',
        proxyUrl: '/proxy',
        domain: request.headers.get('x-tenant') === 'a' ? 'tenant.example.com' : 'other.example.com',
      }),
    );
    const request = requestForTenant('a');
    const response = await middleware(request, eventFor(request));
    expect(handlerRouting).toMatchObject({
      proxyUrl: 'https://www.clerk.com/proxy',
      domain: 'tenant.example.com',
    });
    const encrypted = response?.headers.get(`x-middleware-request-${constants.Headers.ClerkRequestData}`);
    const requestData = decryptClerkRequestData(encrypted);
    expect(requestData).toMatchObject({
      publishableKey,
      proxyUrl: 'https://www.clerk.com/proxy',
      domain: 'tenant.example.com',
    });
    expect(encrypted).not.toContain('sk_test_dynamic');
  });

  it.each(['static', 'callback'])('preserves explicit empty routing overrides: %s', async mode => {
    gateAuthenticateRequest = () => Promise.resolve();
    routingEnvironment.domain = 'environment.example.com';
    routingEnvironment.proxyUrl = 'https://environment.example.com/proxy';
    let handlerRouting: Awaited<ReturnType<typeof getClerkClientAndRouting>>['routing'] | undefined;
    const options = { publishableKey, secretKey: 'sk_test_dynamic', domain: '', proxyUrl: '' };
    const handler = async () => {
      handlerRouting = (await getClerkClientAndRouting()).routing;
    };
    const middleware =
      mode === 'callback' ? clerkMiddleware(handler, () => options) : clerkMiddleware(handler, options);
    const request = requestForTenant('a');
    const response = await middleware(request, eventFor(request));
    expect(handlerRouting).toMatchObject({ domain: '', proxyUrl: '' });
    const encrypted = response?.headers.get(`x-middleware-request-${constants.Headers.ClerkRequestData}`);
    expect(decryptClerkRequestData(encrypted)).toMatchObject({ domain: '', proxyUrl: '' });
  });

  it('carries frontend API proxy routing selected by middleware', async () => {
    gateAuthenticateRequest = () => Promise.resolve();
    const middleware = clerkMiddleware(() => {}, {
      publishableKey,
      secretKey: 'sk_test_dynamic',
      frontendApiProxy: { enabled: true, path: '/clerk-proxy' },
    });
    const request = requestForTenant('a');
    const response = await middleware(request, eventFor(request));
    const encrypted = response?.headers.get(`x-middleware-request-${constants.Headers.ClerkRequestData}`);
    expect(decryptClerkRequestData(encrypted).proxyUrl).toBe('https://www.clerk.com/clerk-proxy');
  });

  it('allows a disabled frontend API proxy without inventing a proxy scope', async () => {
    gateAuthenticateRequest = () => Promise.resolve();
    const middleware = clerkMiddleware(() => {}, {
      publishableKey,
      secretKey: 'sk_test_dynamic',
      frontendApiProxy: { enabled: false },
    });
    const request = requestForTenant('a');
    const response = await middleware(request, eventFor(request));
    const encrypted = response?.headers.get(`x-middleware-request-${constants.Headers.ClerkRequestData}`);
    expect(decryptClerkRequestData(encrypted).proxyUrl).toBeFalsy();
  });
});
