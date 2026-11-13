import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('ArtifactsAPI', () => {
  const frontendApi = 'https://clerk.company.example';

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
    const { artifacts } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_live_example',
    });
    await expect(artifacts.__experimental_getPoppyJson()).resolves.toEqual(metadata);
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
    const { artifacts } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_live_example',
    });
    await expect(artifacts.__experimental_getPoppyJson()).rejects.toMatchObject({ status });
  });
});
