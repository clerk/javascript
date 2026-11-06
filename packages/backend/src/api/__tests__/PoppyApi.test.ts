import { buildPublishableKey } from '@clerk/shared/keys';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createPoppyBrowserSessionHandler } from '../../poppyBrowserSession';
import { createBackendApiClient } from '../factory';

describe('PoppyAPI', () => {
  const endpoint = 'https://company.example/poppy/browser-session';
  const apiUrl = 'https://api.clerk.test';
  const frontendApi = 'https://clerk.company.example';
  const secretKey = 'sk_live_example';
  const publishableKey = buildPublishableKey('clerk.company.example');

  it('uses the Frontend API for browser operations without sending the secret key', async () => {
    const requests: { path: string; body: unknown }[] = [];
    const issued = { code: 'code', browser_join_secret: 'join-secret', expires_in: 60 };
    server.use(
      http.post(frontendApi + '/v1/poppy/browser_sessions*', async ({ request }) => {
        expect(request.headers.has('authorization')).toBe(false);
        const path = new URL(request.url).pathname;
        requests.push({ path, body: await request.json() });
        return HttpResponse.json(path === '/v1/poppy/browser_sessions' ? issued : { ok: true });
      }),
    );
    const { poppy } = createBackendApiClient({ apiUrl, secretKey, publishableKey });

    await expect(poppy.issueBrowserCode(endpoint)).resolves.toEqual(issued);
    await poppy.authorizeBrowserCode(endpoint, 'code', '0.4', 'session-jwt', 'access-token');
    await poppy.redeemBrowserCode(endpoint, 'code', 'join-secret', 'previous-browser-token');
    await poppy.readBrowserSession(endpoint, 'browser-token');
    await poppy.signOutBrowserSession(endpoint, 'browser-token');

    expect(requests).toEqual([
      { path: '/v1/poppy/browser_sessions', body: { endpoint } },
      {
        path: '/v1/poppy/browser_sessions/authorize',
        body: {
          endpoint,
          code: 'code',
          version: '0.4',
          poppy_session_jwt: 'session-jwt',
          access_token: 'access-token',
        },
      },
      {
        path: '/v1/poppy/browser_sessions/redeem',
        body: { endpoint, code: 'code', browser_join_secret: 'join-secret', browser_token: 'previous-browser-token' },
      },
      { path: '/v1/poppy/browser_sessions/read', body: { endpoint, browser_token: 'browser-token' } },
      { path: '/v1/poppy/browser_sessions/sign_out', body: { endpoint, browser_token: 'browser-token' } },
    ]);
  });

  it('returns the Frontend API retry delay from the company browser endpoints', async () => {
    server.use(
      http.post(frontendApi + '/v1/poppy/browser_sessions*', () => {
        return HttpResponse.json({ errors: [] }, { status: 429, headers: { 'Retry-After': '60' } });
      }),
    );
    const handler = createPoppyBrowserSessionHandler({
      clerkClient: createBackendApiClient({ publishableKey }),
      browserSessionEndpoint: endpoint,
    });

    const responses = await Promise.all([
      handler.get(new Request(endpoint)),
      handler.authorize(
        new Request(endpoint + '/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Poppy-Version': '0.4', 'Poppy-Session': 'proof' },
          body: JSON.stringify({ code: 'code' }),
        }),
      ),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(429);
      expect(response.headers.get('retry-after')).toBe('60');
    }
  });

  it('requires a publishable key for browser operations', async () => {
    const { poppy } = createBackendApiClient({ secretKey });
    await expect(poppy.issueBrowserCode(endpoint)).rejects.toThrow('publishable key');
  });
});
