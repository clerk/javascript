import { buildPublishableKey } from '@clerk/shared/keys';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('PoppyAPI', () => {
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

  it.each([{ type: 'session' as const, token: 'native-session-jwt' }])(
    'uses the unified resolver for $type credentials',
    async credential => {
      server.use(
        http.post(frontendApi + '/v1/poppy/browser_sessions/resolve', async ({ request }) => {
          expect(request.headers.has('authorization')).toBe(false);
          expect(await request.json()).toEqual({ credential });
          return HttpResponse.json(identity);
        }),
      );
      const { __experimental_poppy: poppy } = createBackendApiClient({ publishableKey });
      await expect(poppy.resolveSession(credential)).resolves.toEqual(identity);
    },
  );

  it('requires a publishable key', async () => {
    const { __experimental_poppy: poppy } = createBackendApiClient({ secretKey: 'sk_live_example' });
    await expect(poppy.resolveSession({ type: 'session', token: 'jwt' })).rejects.toThrow('publishable key');
  });
});
