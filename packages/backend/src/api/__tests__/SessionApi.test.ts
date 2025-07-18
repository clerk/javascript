import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('SessionAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const sessionId = 'sess_123';
  const mockTokenResponse = {
    object: 'token',
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
  };

  describe('getToken', () => {
    it('creates a session token without template', async () => {
      server.use(
        http.post(
          `https://api.clerk.test/v1/sessions/${sessionId}/tokens`,
          validateHeaders(async ({ request }) => {
            const body = await request.text();
            expect(body).toBe('');
            return HttpResponse.json(mockTokenResponse);
          }),
        ),
      );

      const response = await apiClient.sessions.getToken(sessionId, '');
      expect(response.jwt).toBe(mockTokenResponse.jwt);
    });

    it('creates a session token with template', async () => {
      const template = 'custom-template';
      server.use(
        http.post(
          `https://api.clerk.test/v1/sessions/${sessionId}/tokens/${template}`,
          validateHeaders(async ({ request }) => {
            const body = await request.text();
            expect(body).toBe('');
            return HttpResponse.json(mockTokenResponse);
          }),
        ),
      );

      const response = await apiClient.sessions.getToken(sessionId, template);
      expect(response.jwt).toBe(mockTokenResponse.jwt);
    });

    it('creates a session token without template and with expiresInSeconds', async () => {
      const expiresInSeconds = 3600;
      server.use(
        http.post(
          `https://api.clerk.test/v1/sessions/${sessionId}/tokens`,
          validateHeaders(async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual({ expires_in_seconds: expiresInSeconds });
            return HttpResponse.json(mockTokenResponse);
          }),
        ),
      );

      const response = await apiClient.sessions.getToken(sessionId, '', expiresInSeconds);
      expect(response.jwt).toBe(mockTokenResponse.jwt);
    });

    it('creates a session token with template and expiresInSeconds', async () => {
      const template = 'custom-template';
      const expiresInSeconds = 3600;
      server.use(
        http.post(
          `https://api.clerk.test/v1/sessions/${sessionId}/tokens/${template}`,
          validateHeaders(async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual({ expires_in_seconds: expiresInSeconds });
            return HttpResponse.json(mockTokenResponse);
          }),
        ),
      );

      const response = await apiClient.sessions.getToken(sessionId, template, expiresInSeconds);
      expect(response.jwt).toBe(mockTokenResponse.jwt);
    });
  });
});
