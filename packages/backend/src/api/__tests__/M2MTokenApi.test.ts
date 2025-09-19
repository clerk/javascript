import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('M2MToken', () => {
  const m2mId = 'mt_xxxxx';
  const m2mSecret = 'mt_secret_xxxxx';

  const mockM2MToken = {
    object: 'machine_to_machine_token',
    id: m2mId,
    subject: 'mch_xxxxx',
    scopes: ['mch_1xxxxx', 'mch_2xxxxx'],
    claims: { foo: 'bar' },
    token: m2mSecret,
    revoked: false,
    revocation_reason: null,
    expired: false,
    expiration: 1753746916590,
    created_at: 1753743316590,
    updated_at: 1753743316590,
  };

  describe('create', () => {
    it('creates a m2m token using machine secret key in backend client', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        machineSecretKey: 'ak_xxxxx',
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
            return HttpResponse.json(mockM2MToken);
          }),
        ),
      );

      const response = await apiClient.m2m.createToken({
        secondsUntilExpiration: 3600,
      });

      expect(response.id).toBe(m2mId);
      expect(response.token).toBe(m2mSecret);
      expect(response.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });

    it('creates a m2m token using machine secret key option', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
            return HttpResponse.json(mockM2MToken);
          }),
        ),
      );

      const response = await apiClient.m2m.createToken({
        machineSecretKey: 'ak_xxxxx',
        secondsUntilExpiration: 3600,
      });

      expect(response.id).toBe(m2mId);
      expect(response.token).toBe(m2mSecret);
      expect(response.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });

    it('does not accept an instance secret as authorization header', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens',
          validateHeaders(() => {
            return HttpResponse.json(
              {
                errors: [
                  {
                    message:
                      'The provided Machine Secret Key is invalid. Make sure that your Machine Secret Key is correct.',
                    code: 'machine_secret_key_invalid',
                  },
                ],
              },
              { status: 401 },
            );
          }),
        ),
      );

      const errResponse = await apiClient.m2m.createToken().catch(err => err);

      expect(errResponse.status).toBe(401);
      expect(errResponse.errors[0].code).toBe('machine_secret_key_invalid');
      expect(errResponse.errors[0].message).toBe(
        'The provided Machine Secret Key is invalid. Make sure that your Machine Secret Key is correct.',
      );
    });
  });

  describe('revoke', () => {
    const mockRevokedM2MToken = {
      object: 'machine_to_machine_token',
      id: m2mId,
      subject: 'mch_xxxxx',
      scopes: ['mch_1xxxxx', 'mch_2xxxxx'],
      claims: { foo: 'bar' },
      revoked: true,
      revocation_reason: 'revoked by test',
      expired: false,
      expiration: 1753746916590,
      created_at: 1753743316590,
      updated_at: 1753743316590,
    };

    it('revokes a m2m token using machine secret', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        machineSecretKey: 'ak_xxxxx',
      });

      server.use(
        http.post(
          `https://api.clerk.test/m2m_tokens/${m2mId}/revoke`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
            return HttpResponse.json(mockRevokedM2MToken);
          }),
        ),
      );

      const response = await apiClient.m2m.revokeToken({
        m2mTokenId: m2mId,
        revocationReason: 'revoked by test',
      });

      expect(response.revoked).toBe(true);
      expect(response.token).toBeUndefined();
      expect(response.revocationReason).toBe('revoked by test');
      expect(response.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });

    it('revokes a m2m token using instance secret', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          `https://api.clerk.test/m2m_tokens/${m2mId}/revoke`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            return HttpResponse.json(mockRevokedM2MToken);
          }),
        ),
      );

      const response = await apiClient.m2m.revokeToken({
        m2mTokenId: m2mId,
        revocationReason: 'revoked by test',
      });

      expect(response.revoked).toBe(true);
      expect(response.token).toBeUndefined();
      expect(response.revocationReason).toBe('revoked by test');
    });

    it('requires a machine secret or instance secret to revoke a m2m token', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
      });

      server.use(
        http.post(
          `https://api.clerk.test/m2m_tokens/${m2mId}/revoke`,
          validateHeaders(() => {
            return HttpResponse.json(mockRevokedM2MToken);
          }),
        ),
      );

      const errResponse = await apiClient.m2m
        .revokeToken({
          m2mTokenId: m2mId,
          revocationReason: 'revoked by test',
        })
        .catch(err => err);

      expect(errResponse.status).toBe(401);
    });
  });

  describe('verifyToken', () => {
    it('verifies a m2m token using machine secret', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        machineSecretKey: 'ak_xxxxx',
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens/verify',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
            return HttpResponse.json(mockM2MToken);
          }),
        ),
      );

      const response = await apiClient.m2m.verifyToken({
        token: m2mSecret,
      });

      expect(response.id).toBe(m2mId);
      expect(response.token).toBe(m2mSecret);
      expect(response.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });

    it('verifies a m2m token using instance secret', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens/verify',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            return HttpResponse.json(mockM2MToken);
          }),
        ),
      );

      const response = await apiClient.m2m.verifyToken({
        token: m2mSecret,
      });

      expect(response.id).toBe(m2mId);
      expect(response.token).toBe(m2mSecret);
      expect(response.scopes).toEqual(['mch_1xxxxx', 'mch_2xxxxx']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });

    it('requires a machine secret or instance secret to verify a m2m token', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens/verify',
          validateHeaders(() => {
            return HttpResponse.json(mockM2MToken);
          }),
        ),
      );

      const errResponse = await apiClient.m2m
        .verifyToken({
          token: m2mSecret,
        })
        .catch(err => err);

      expect(errResponse.status).toBe(401);
    });
  });
});
