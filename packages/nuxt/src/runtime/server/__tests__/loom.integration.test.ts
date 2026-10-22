import { createApp, eventHandler, type H3Event, setResponseHeader, toWebHandler } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRuntimeConfig } from '#imports';

import environment from '../../../../../loom/src/__tests__/fixtures/environment.json';
import { prefetchProfileForEvent } from './fixtures/loom';

const configs = vi.hoisted(() => new WeakMap<H3Event, ReturnType<typeof configuration>>());
vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn((event: H3Event) => {
    const config = configs.get(event);
    if (!config) {
      throw new Error('Missing request configuration');
    }
    return config;
  }),
}));

function configuration(name: string) {
  return {
    clerk: { secretKey: `sk_test_${name}`, apiUrl: `https://bapi-${name}.example`, apiVersion: 'v1' },
    public: {
      clerk: {
        publishableKey: `pk_test_${btoa(`${name}.clerk.accounts.dev$`)}`,
        proxyUrl: `https://proxy-${name}.example`,
        domain: `domain-${name}.example`,
        telemetry: { disabled: true },
      },
    },
  };
}

function preview(
  identity: { userId: string | null; sessionId: string | null },
  config: ReturnType<typeof configuration>,
) {
  const app = createApp();
  app.use(
    eventHandler(async event => {
      configs.set(event, config);
      Object.assign(event.context, { auth: () => identity });
      setResponseHeader(event, 'Cache-Control', 'private, no-store');
      return { profile: await prefetchProfileForEvent(event) };
    }),
  );
  return toWebHandler(app);
}

function rawUser(id: string, firstName: string) {
  return {
    object: 'user',
    id,
    first_name: firstName,
    last_name: null,
    username: null,
    image_url: 'https://img.example/avatar',
    has_image: false,
    primary_email_address_id: null,
    email_addresses: [],
    password_enabled: false,
    delete_self_enabled: true,
    external_accounts: [],
    enterprise_accounts: [],
    private_metadata: { token: 'private-metadata-sentinel' },
  };
}

beforeEach(() => {
  vi.stubGlobal('PACKAGE_NAME', '@clerk/nuxt');
  vi.stubGlobal('PACKAGE_VERSION', '0.0.0-test');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('private Nuxt Loom server integration', () => {
  it.each(['different users', 'same user'])(
    'isolates two H3 events with %s through real backend clients',
    async kind => {
      const firstConfig = configuration('first');
      const secondConfig = configuration('second');
      const first = preview({ userId: 'user_a', sessionId: 'sess_a' }, firstConfig);
      const secondId = kind === 'same user' ? 'user_a' : 'user_b';
      const second = preview({ userId: secondId, sessionId: 'sess_b' }, secondConfig);
      const firstReply = createDeferredPromise();
      const secondReply = createDeferredPromise();
      const requests: Request[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn<typeof fetch>((input, init) => {
          const request = new Request(input, init);
          requests.push(request);
          const url = new URL(request.url);
          if (url.hostname === 'bapi-first.example') {
            return firstReply.promise.then(() => Response.json(rawUser('user_a', 'First')));
          }
          if (url.hostname === 'bapi-second.example') {
            return secondReply.promise.then(() => Response.json(rawUser(secondId, 'Second')));
          }
          if (url.pathname === '/v1/environment') {
            return Promise.resolve(Response.json(environment));
          }
          throw new Error('Unexpected request');
        }),
      );
      const incoming = () =>
        new Request('https://app.example/profile', {
          headers: { Cookie: 'private-cookie-sentinel', Authorization: 'private-incoming-token' },
        });
      const pendingFirst = first(incoming());
      const pendingSecond = second(incoming());
      await vi.waitFor(() => expect(requests).toHaveLength(4));
      secondReply.resolve();
      const secondResponse = await pendingSecond;
      firstReply.resolve();
      const firstResponse = await pendingFirst;
      const firstBody: unknown = await firstResponse.json();
      const secondBody: unknown = await secondResponse.json();
      for (const [body, name, userId, sessionId, config, hostname] of [
        [firstBody, 'First', 'user_a', 'sess_a', firstConfig, 'first.clerk.accounts.dev'],
        [secondBody, 'Second', secondId, 'sess_b', secondConfig, 'second.clerk.accounts.dev'],
      ] as const) {
        const instanceKey = JSON.stringify([
          config.public.clerk.publishableKey,
          hostname,
          config.public.clerk.proxyUrl,
          config.public.clerk.domain,
        ]);
        expect(body).toMatchObject({
          profile: {
            hydration: { scope: { instanceKey, userId, sessionId }, user: { data: { id: userId, firstName: name } } },
            settings: {
              kind: 'ready',
              hydration: {
                scope: { instanceKey, userId, sessionId },
                profileSettings: { data: { passwordEnabled: true } },
              },
            },
          },
        });
        const serialized = JSON.stringify(body);
        expect(serialized).not.toMatch(
          /sk_test_|private-metadata-sentinel|private-cookie-sentinel|private-incoming-token/,
        );
      }
      expect(firstResponse.headers.get('cache-control')).toBe('private, no-store');
      expect(secondResponse.headers.get('cache-control')).toBe('private, no-store');
      const backend = requests.filter(request => new URL(request.url).hostname.startsWith('bapi-'));
      expect(backend.map(request => [request.url, request.headers.get('authorization')])).toEqual([
        ['https://bapi-first.example/v1/users/user_a', 'Bearer sk_test_first'],
        [`https://bapi-second.example/v1/users/${secondId}`, 'Bearer sk_test_second'],
      ]);
      const settings = requests.filter(request => new URL(request.url).pathname === '/v1/environment');
      expect(settings.map(request => request.url)).toEqual([
        'https://first.clerk.accounts.dev/v1/environment',
        'https://second.clerk.accounts.dev/v1/environment',
      ]);
      for (const request of settings) {
        expect(request.headers.get('authorization')).toBeNull();
        expect(request.headers.get('cookie')).toBeNull();
        expect(request.cache).toBe('no-store');
        expect(request.redirect).toBe('error');
      }
    },
  );

  it('does not resolve configuration or fetch data when signed out', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const handler = preview({ userId: null, sessionId: null }, configuration('signedout'));
    const response = await handler(new Request('https://app.example/profile'));
    expect(await response.json()).toEqual({});
    expect(useRuntimeConfig).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses a backend user that differs from the authenticated event', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>((input, init) => {
        const request = new Request(input, init);
        return Promise.resolve(
          Response.json(
            new URL(request.url).pathname === '/v1/environment' ? environment : rawUser('user_other', 'Wrong'),
          ),
        );
      }),
    );
    const handler = preview({ userId: 'user_a', sessionId: 'sess_a' }, configuration('first'));
    const response = await handler(new Request('https://app.example/profile'));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('Wrong');
  });

  it('serializes optional settings unavailability alongside the authenticated user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>((input, init) => {
        const request = new Request(input, init);
        return Promise.resolve(
          new URL(request.url).pathname === '/v1/environment'
            ? new Response(null, { status: 503 })
            : Response.json(rawUser('user_a', 'Ada')),
        );
      }),
    );
    const handler = preview({ userId: 'user_a', sessionId: 'sess_a' }, configuration('first'));
    const response = await handler(new Request('https://app.example/profile'));
    expect(await response.json()).toMatchObject({
      profile: { hydration: { user: { data: { firstName: 'Ada' } } }, settings: { kind: 'unavailable' } },
    });
  });
});
import { createDeferredPromise } from '@clerk/shared/utils';
