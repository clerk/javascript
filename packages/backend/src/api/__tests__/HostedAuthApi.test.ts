import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('HostedAuthApi', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  it('exchanges a hosted auth code for a session and its tokens', async () => {
    server.use(
      http.post('https://api.clerk.test/v1/hosted_auth/token', async ({ request }) => {
        expect(await request.json()).toEqual({
          grant_type: 'authorization_code',
          code: 'code_123',
          code_verifier: 'verifier_123',
          redirect_uri: 'https://app.example.com/api/auth/callback',
        });
        return HttpResponse.json({
          object: 'hosted_auth_token',
          session_id: 'sess_123',
          user_id: 'user_123',
          session_token: 'jwt',
          refresh_token: 'refresh_123',
        });
      }),
    );

    const token = await apiClient.hostedAuth.exchangeCode({
      code: 'code_123',
      codeVerifier: 'verifier_123',
      redirectUri: 'https://app.example.com/api/auth/callback',
    });

    expect(token).toEqual({
      sessionId: 'sess_123',
      userId: 'user_123',
      sessionToken: 'jwt',
      refreshToken: 'refresh_123',
    });
  });

  it('refreshes a hosted auth session', async () => {
    server.use(
      http.post('https://api.clerk.test/v1/hosted_auth/token', async ({ request }) => {
        expect(await request.json()).toEqual({
          grant_type: 'refresh_token',
          session_id: 'sess_123',
          refresh_token: 'refresh_123',
          origin: 'https://app.example.com',
        });
        return HttpResponse.json({
          object: 'hosted_auth_token',
          session_id: 'sess_123',
          user_id: 'user_123',
          session_token: 'jwt-2',
        });
      }),
    );

    const token = await apiClient.hostedAuth.refreshSession({
      sessionId: 'sess_123',
      refreshToken: 'refresh_123',
      origin: 'https://app.example.com',
    });

    expect(token.sessionToken).toBe('jwt-2');
    expect(token.refreshToken).toBeNull();
  });
});
