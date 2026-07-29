import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('SignInTokenAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  it('sends the organization ID as org_id', async () => {
    server.use(
      http.post(
        'https://api.clerk.test/v1/sign_in_tokens',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            user_id: 'user_123',
            org_id: 'org_123',
            expires_in_seconds: 3600,
          });

          return HttpResponse.json({
            id: 'sign_in_token_123',
            user_id: 'user_123',
            token: 'token_123',
            status: 'pending',
            url: 'https://accounts.example.com/tickets/token_123',
            created_at: 1,
            updated_at: 1,
          });
        }),
      ),
    );

    const response = await apiClient.signInTokens.createSignInToken({
      userId: 'user_123',
      orgId: 'org_123',
      expiresInSeconds: 3600,
    });

    expect(response.id).toBe('sign_in_token_123');
  });
});
