import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('OAuthApplications', () => {
  const oauthApplicationId = 'oauthapp_xxxxx';

  describe('revokeToken', () => {
    it('revokes an OAuth application token', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          `https://api.clerk.test/v1/oauth_applications/${oauthApplicationId}/revoke_token`,
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.token).toBe('oat_xxxxx');
            return new HttpResponse(null, { status: 204 });
          }),
        ),
      );

      const response = await apiClient.oauthApplications.revokeToken({
        oauthApplicationId,
        token: 'oat_xxxxx',
      });

      expect(response).toBeUndefined();
    });

    it('throws error when OAuth application ID is missing', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      await expect(
        apiClient.oauthApplications.revokeToken({
          oauthApplicationId: '',
          token: 'oat_xxxxx',
        }),
      ).rejects.toThrow('A valid resource ID is required.');
    });
  });
});
