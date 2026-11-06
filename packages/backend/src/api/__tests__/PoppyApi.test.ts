import { buildPublishableKey } from '@clerk/shared/keys';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createPoppyBrowserSessionHandler } from '../../poppyBrowserSession';
import { createBackendApiClient } from '../factory';

describe('PoppyAPI', () => {
  const endpoint = 'https://company.example/poppy/browser-session';
  const frontendApi = 'https://clerk.company.example';
  const publishableKey = buildPublishableKey('clerk.company.example');
  const identity = { session_id: 'protocol-session', client_id: 'https://agent.example', user_id: 'pseudonym' };

  it('gets discovery from the authenticated Backend API artifact without changing the document', async () => {
    const metadata = {
      protocol_version: '0.4',
      organization: { name: 'Company', domain: 'company.example' },
      auth: { issuer: frontendApi, scopes: { 'poppy:browser-sign-in': 'Full website access' } },
      extension: { unchanged: true },
    };
    server.use(
      http.get('https://api.clerk.test/v1/artifacts/well-known-poppy', ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer sk_live_example');
        expect(new URL(request.url).search).toBe('');
        return HttpResponse.json({ object: 'artifact', data: metadata });
      }),
    );
    const { __experimental_poppy: poppy } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      publishableKey,
      secretKey: 'sk_live_example',
    });
    await expect(poppy.getMetadata()).resolves.toEqual(metadata);
  });

  it.each([401, 404, 503])('propagates Backend API artifact status %s', async status => {
    server.use(
      http.get('https://api.clerk.test/v1/artifacts/well-known-poppy', () =>
        HttpResponse.json(
          {
            errors: [
              { code: 'artifact_unavailable', message: 'Artifact unavailable', long_message: 'Artifact unavailable' },
            ],
          },
          { status },
        ),
      ),
    );
    const { __experimental_poppy: poppy } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      publishableKey,
      secretKey: 'sk_live_example',
    });
    await expect(poppy.getMetadata()).rejects.toMatchObject({ status });
  });

  it.each([
    { method: 'GET', suffix: '', body: undefined, status: 200, responseBody: '<form>Connect</form>' },
    { method: 'POST', suffix: '', body: 'code=browser-code', status: 303, responseBody: '' },
    {
      method: 'POST',
      suffix: '/authorize',
      body: '{"code":"browser-code"}',
      status: 400,
      responseBody: '{"error":"invalid_session"}',
    },
    {
      method: 'POST',
      suffix: '/authorize',
      body: '{"code":"browser-code"}',
      status: 429,
      responseBody: '{"error":"rate_limited"}',
    },
    { method: 'POST', suffix: '/authorize', body: 'malformed-json', status: 503, responseBody: 'Service unavailable' },
  ])(
    'forwards $method $suffix and preserves status $status, headers and body',
    async ({ method, suffix, body, status, responseBody }) => {
      server.use(
        http.all(frontendApi + '/v1/poppy/browser_sessions' + suffix, async ({ request }) => {
          expect(request.method).toBe(method);
          expect(await request.text()).toBe(body ?? '');
          expect(request.headers.get('Clerk-Poppy-Endpoint')).toBe(endpoint);
          expect(request.headers.get('Clerk-Poppy-Redirect')).toBe('https://company.example/cart');
          expect(Object.fromEntries(request.headers)).toMatchObject({ 'poppy-version': '0.4' });
          expect(request.headers.get('Poppy-Session')).toBe('proof');
          expect(request.headers.get('Cookie')).toContain('__Host-poppy_join=browser-secret');
          expect(request.headers.get('Authorization')).toBe('Bearer account-token');
          expect(request.headers.has('Clerk-Secret-Key')).toBe(false);
          return new HttpResponse(responseBody, {
            status,
            headers: {
              Location: endpoint + '/callback',
              'Set-Cookie': '__Host-poppy_ticket=ticket; Secure; HttpOnly; Path=/',
              'Retry-After': '30',
              'WWW-Authenticate': 'Bearer error="invalid_token"',
              'Cache-Control': 'no-store',
            },
          });
        }),
      );
      const handler = createPoppyBrowserSessionHandler({
        clerkClient: createBackendApiClient({ publishableKey, secretKey: 'sk_live_example' }),
        browserSessionEndpoint: endpoint,
        redirectTo: '/cart',
      });
      const incoming = new Request(endpoint + suffix, {
        method,
        headers: {
          'Poppy-Version': '0.4',
          'Poppy-Session': 'proof',
          Cookie: '__Host-poppy_join=browser-secret',
          Authorization: 'Bearer account-token',
          'Clerk-Poppy-Endpoint': 'https://untrusted.example/join',
        },
        body,
      });
      expect(incoming.headers.get('Poppy-Version')).toBe('0.4');
      const response = await handler(incoming);
      expect(response.status).toBe(status);
      expect(await response.text()).toBe(responseBody);
      expect(response.headers.get('location')).toBe(endpoint + '/callback');
      expect(response.headers.getSetCookie()).toEqual(['__Host-poppy_ticket=ticket; Secure; HttpOnly; Path=/']);
      expect(response.headers.get('retry-after')).toBe('30');
      expect(response.headers.get('www-authenticate')).toBe('Bearer error="invalid_token"');
    },
  );

  it.each([
    { type: 'browser' as const, endpoint, token: 'browser-token' },
    { type: 'session' as const, token: 'native-session-jwt' },
  ])('uses the unified resolver for $type credentials', async credential => {
    server.use(
      http.post(frontendApi + '/v1/poppy/browser_sessions/resolve', async ({ request }) => {
        expect(request.headers.has('authorization')).toBe(false);
        expect(await request.json()).toEqual({ credential });
        return HttpResponse.json(identity);
      }),
    );
    const { __experimental_poppy: poppy } = createBackendApiClient({ publishableKey });
    await expect(poppy.resolveSession(credential)).resolves.toEqual(identity);
  });

  it('requires a publishable key', async () => {
    const { __experimental_poppy: poppy } = createBackendApiClient({ secretKey: 'sk_live_example' });
    await expect(poppy.resolveSession({ type: 'session', token: 'jwt' })).rejects.toThrow('publishable key');
  });

  it.each(['http://company.example/join', endpoint + '/', endpoint + '?query=true'])(
    'rejects noncanonical endpoint %s',
    value => {
      expect(() =>
        createPoppyBrowserSessionHandler({
          clerkClient: createBackendApiClient({ publishableKey }),
          browserSessionEndpoint: value,
        }),
      ).toThrow('canonical HTTPS');
    },
  );

  it('rejects an external callback destination', () => {
    expect(() =>
      createPoppyBrowserSessionHandler({
        clerkClient: createBackendApiClient({ publishableKey }),
        browserSessionEndpoint: endpoint,
        redirectTo: 'https://other.example/',
      }),
    ).toThrow('Company origin');
  });
});
