import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('IdPOAuthAccessToken', () => {
  const accessToken = 'oat_xxxxx';
  const audience = 'https://resource.example.com';
  const tokenResponse = {
    object: 'clerk_idp_oauth_access_token',
    id: accessToken,
    client_id: 'client_xxxxx',
    type: 'oauth:access_token',
    subject: 'user_xxxxx',
    scopes: ['read:foo'],
    revoked: false,
    revocation_reason: null,
    expired: false,
    expiration: null,
    created_at: 1753743316590,
    updated_at: 1753743316590,
  };

  it('verifies an opaque OAuth token with a matching audience', async () => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_xxxxx',
    });

    server.use(
      http.post(
        'https://api.clerk.test/oauth_applications/access_tokens/verify',
        validateHeaders(async ({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.access_token).toBe(accessToken);
          return HttpResponse.json({ ...tokenResponse, aud: [audience] });
        }),
      ),
    );

    const response = await apiClient.idPOAuthAccessToken.verify(accessToken, { audience });

    expect(response.id).toBe(accessToken);
    expect(response.aud).toEqual([audience]);
  });

  it('rejects an opaque OAuth token with a mismatched audience', async () => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_xxxxx',
    });

    server.use(
      http.post('https://api.clerk.test/oauth_applications/access_tokens/verify', () =>
        HttpResponse.json({ ...tokenResponse, aud: ['https://other.example.com'] }),
      ),
    );

    await expect(apiClient.idPOAuthAccessToken.verify(accessToken, { audience })).rejects.toThrow(
      'OAuth audience mismatch. Verification expected audience ["https://resource.example.com"], but incoming token has aud ["https://other.example.com"].',
    );
  });
});
