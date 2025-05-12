import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('ClientAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  describe('getHandshakePayload', () => {
    it('successfully fetches the handshake payload with a valid nonce', async () => {
      const mockHandshakePayload = {
        directives: ['directive1', 'directive2'],
      };

      server.use(
        http.get(
          'https://api.clerk.test/v1/clients/handshake_payload',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('nonce')).toBe('test-nonce-123');
            return HttpResponse.json(mockHandshakePayload);
          }),
        ),
      );

      const response = await apiClient.clients.getHandshakePayload({
        nonce: 'test-nonce-123',
      });

      expect(response.directives).toEqual(['directive1', 'directive2']);
      expect(response.directives.length).toBe(2);
    });

    it('handles error responses correctly', async () => {
      const mockErrorPayload = {
        code: 'invalid_nonce',
        message: 'Invalid nonce provided',
        long_message: 'The nonce provided is invalid or has expired',
        meta: { param_name: 'nonce' },
      };
      const traceId = 'trace_id_handshake';

      server.use(
        http.get(
          'https://api.clerk.test/v1/clients/handshake_payload',
          validateHeaders(() => {
            return HttpResponse.json(
              { errors: [mockErrorPayload], clerk_trace_id: traceId },
              { status: 400, headers: { 'cf-ray': traceId } },
            );
          }),
        ),
      );

      const errResponse = await apiClient.clients.getHandshakePayload({ nonce: 'invalid-nonce' }).catch(err => err);

      expect(errResponse.clerkTraceId).toBe(traceId);
      expect(errResponse.status).toBe(400);
      expect(errResponse.errors[0].code).toBe('invalid_nonce');
      expect(errResponse.errors[0].message).toBe('Invalid nonce provided');
      expect(errResponse.errors[0].longMessage).toBe('The nonce provided is invalid or has expired');
      expect(errResponse.errors[0].meta.paramName).toBe('nonce');
    });

    it('requires a nonce parameter', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/clients/handshake_payload',
          validateHeaders(() => {
            return HttpResponse.json(
              {
                errors: [
                  {
                    code: 'missing_parameter',
                    message: 'Missing required parameter',
                    long_message: 'The nonce parameter is required',
                    meta: { param_name: 'nonce' },
                  },
                ],
              },
              { status: 400 },
            );
          }),
        ),
      );

      // @ts-expect-error Testing invalid input
      const errResponse = await apiClient.clients.getHandshakePayload({}).catch(err => err);

      expect(errResponse.status).toBe(400);
      expect(errResponse.errors[0].code).toBe('missing_parameter');
    });
  });
});
