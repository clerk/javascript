import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

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

  describe('getActiveDevices', () => {
    it('uses the authenticated SDK transport without forwarding user credentials', async () => {
      const controller = new AbortController();
      const payload = {
        object: 'active_device_sessions',
        subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: sessionId },
        sessions: [],
      };
      server.use(
        http.get(`https://api.clerk.test/v1/sessions/${sessionId}/active_devices`, ({ request }) => {
          expect(request.headers.get('authorization')).toBe('Bearer deadbeef');
          expect(request.headers.get('cache-control')).toBe('no-store');
          expect(request.url).not.toContain('token');
          expect(request.body).toBeNull();
          return HttpResponse.json(payload);
        }),
      );
      await expect(apiClient.sessions.getActiveDevices(sessionId, { signal: controller.signal })).resolves.toEqual(
        payload,
      );
    });

    it('propagates service errors', async () => {
      server.use(
        http.get(`https://api.clerk.test/v1/sessions/${sessionId}/active_devices`, () =>
          HttpResponse.json({ errors: [{ code: 'not_found', message: 'Not found' }] }, { status: 404 }),
        ),
      );
      await expect(apiClient.sessions.getActiveDevices(sessionId)).rejects.toMatchObject({ status: 404 });
    });

    it('refuses redirects and shared fetch caches for this read only', async () => {
      const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          object: 'active_device_sessions',
          subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: sessionId },
          sessions: [],
        }),
      );
      const controller = new AbortController();
      try {
        await apiClient.sessions.getActiveDevices(sessionId, { signal: controller.signal });
        expect(fetch).toHaveBeenCalledWith(
          `https://api.clerk.test/v1/sessions/${sessionId}/active_devices`,
          expect.objectContaining({
            method: 'GET',
            cache: 'no-store',
            redirect: 'error',
            signal: controller.signal,
          }),
        );
      } finally {
        fetch.mockRestore();
      }
    });

    it('passes cancellation to the underlying fetch', async () => {
      const controller = new AbortController();
      const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
        expect(init?.signal).toBe(controller.signal);
        controller.abort();
        throw new DOMException('Aborted', 'AbortError');
      });
      try {
        await expect(
          apiClient.sessions.getActiveDevices(sessionId, { signal: controller.signal }),
        ).rejects.toMatchObject({
          errors: [expect.objectContaining({ code: 'unexpected_error' })],
        });
        expect(controller.signal.aborted).toBe(true);
      } finally {
        fetch.mockRestore();
      }
    });
  });

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
