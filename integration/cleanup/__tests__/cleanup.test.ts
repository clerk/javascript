import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getE2EApplicationRunMarker } from '../../testUtils/e2eRun';

const { registerCleanup } = vi.hoisted(() => ({
  registerCleanup: vi.fn<(_name: string, cleanup: () => Promise<void>) => void>(),
}));

vi.mock('@playwright/test', () => ({ test: registerCleanup }));

describe('OAuth application cleanup', () => {
  beforeEach(() => {
    vi.resetModules();
    registerCleanup.mockClear();
    vi.stubEnv('INTEGRATION_TEST_RUN_KEY', 'cleanup-regression');
    vi.stubEnv(
      'INTEGRATION_INSTANCE_KEYS',
      JSON.stringify({
        'oauth-provider': {
          pk: `pk_test_${Buffer.from('cleanup.clerk.accounts.dev$').toString('base64')}`,
          sk: 'sk_test_cleanup',
        },
      }),
    );
    vi.stubEnv('INTEGRATION_STAGING_INSTANCE_KEYS', '{}');
    vi.stubEnv('CLERK_PLATFORM_API_KEY', '');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([false, true])('filters every page and preserves other runs (rate limited: %s)', async rateLimited => {
    const marker = getE2EApplicationRunMarker('cleanup-regression');
    const listQueries: Record<string, string>[] = [];
    const deletedIds: string[] = [];
    let shouldRateLimit = rateLimited;

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>((input, init) => {
        const request = new Request(input, init);
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/v1/users') {
          return Promise.resolve(Response.json([]));
        }
        if (request.method === 'GET' && url.pathname === '/v1/users/count') {
          return Promise.resolve(Response.json({ total_count: 0 }));
        }
        if (request.method === 'GET' && url.pathname === '/v1/oauth_applications') {
          listQueries.push(Object.fromEntries(url.searchParams));
          if (shouldRateLimit) {
            shouldRateLimit = false;
            return Promise.resolve(
              Response.json(
                { errors: [{ code: 'too_many_requests', message: 'Too many requests' }] },
                {
                  status: 429,
                  headers: { 'Retry-After': '0' },
                },
              ),
            );
          }

          const data =
            Number(url.searchParams.get('offset') || 0) === 0
              ? [
                  { object: 'oauth_application', id: 'oauthapp_first', name: `e2e-email-${marker}` },
                  ...Array.from({ length: 99 }, (_, index) => ({
                    object: 'oauth_application',
                    id: `oauthapp_other_${index}`,
                    name: `e2e-email-${marker}-other-run`,
                  })),
                ]
              : [{ object: 'oauth_application', id: 'oauthapp_second', name: `e2e-other-config-${marker}` }];
          return Promise.resolve(Response.json({ data, total_count: 101 }));
        }
        if (request.method === 'DELETE' && url.pathname.startsWith('/v1/oauth_applications/')) {
          const id = url.pathname.split('/').pop();
          if (id) {
            deletedIds.push(id);
          }
          return Promise.resolve(Response.json({ object: 'oauth_application', id, deleted: true }));
        }

        throw new Error(`Unexpected request: ${request.method} ${url}`);
      }),
    );

    await import('../cleanup.setup');
    const cleanup = registerCleanup.mock.calls[0]?.[1];
    expect(cleanup).toBeTypeOf('function');
    if (!cleanup) {
      throw new Error('Cleanup was not registered');
    }
    await cleanup();

    expect(listQueries).toEqual([
      { name_query: marker, limit: '100' },
      ...(rateLimited ? [{ name_query: marker, limit: '100' }] : []),
      { name_query: marker, limit: '100', offset: '100' },
    ]);
    expect(deletedIds).toEqual(['oauthapp_first', 'oauthapp_second']);
  });
});
