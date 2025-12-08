import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('APIKeys', () => {
  const apiKeyId = 'ak_xxxxx';
  const subject = 'user_xxxxx';

  const mockAPIKey = {
    object: 'api_key',
    id: apiKeyId,
    type: 'secret_key',
    name: 'Test API Key',
    subject: subject,
    scopes: ['scope1', 'scope2'],
    claims: { foo: 'bar' },
    revoked: false,
    revocation_reason: null,
    expired: false,
    expiration: null,
    created_by: 'user_xxxxx',
    description: 'Test description',
    last_used_at: null,
    created_at: 1753743316590,
    updated_at: 1753743316590,
  };

  describe('get', () => {
    it('retrieves an API key by ID', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.get(
          `https://api.clerk.test/api_keys/${apiKeyId}`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            return HttpResponse.json(mockAPIKey);
          }),
        ),
      );

      const response = await apiClient.apiKeys.get(apiKeyId);

      expect(response.id).toBe(apiKeyId);
      expect(response.name).toBe('Test API Key');
      expect(response.subject).toBe(subject);
      expect(response.scopes).toEqual(['scope1', 'scope2']);
      expect(response.claims).toEqual({ foo: 'bar' });
      expect(response.revoked).toBe(false);
    });

    it('throws error when API key ID is missing', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      await expect(apiClient.apiKeys.get('')).rejects.toThrow('A valid resource ID is required.');
    });

    it('handles API key not found', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.get(
          `https://api.clerk.test/api_keys/${apiKeyId}`,
          validateHeaders(() => {
            return HttpResponse.json(
              {
                errors: [
                  {
                    message: 'API key not found',
                    code: 'api_key_not_found',
                  },
                ],
              },
              { status: 404 },
            );
          }),
        ),
      );

      const errResponse = await apiClient.apiKeys.get(apiKeyId).catch(err => err);

      expect(errResponse.status).toBe(404);
      expect(errResponse.errors[0].code).toBe('api_key_not_found');
    });
  });

  describe('update', () => {
    it('updates an API key with optional fields', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      const updatedClaims = { foo: 'bar', baz: 'qux' };
      const expirationTimestamp = 1753746916590;
      const updatedMockAPIKey = {
        ...mockAPIKey,
        description: 'Updated description',
        scopes: ['scope1', 'scope2', 'scope3'],
        claims: updatedClaims,
        expiration: expirationTimestamp,
        updated_at: 1753746916590,
      };

      server.use(
        http.patch(
          `https://api.clerk.test/api_keys/${apiKeyId}`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            return HttpResponse.json(updatedMockAPIKey);
          }),
        ),
      );

      const response = await apiClient.apiKeys.update({
        apiKeyId,
        subject,
        description: 'Updated description',
        scopes: ['scope1', 'scope2', 'scope3'],
        claims: updatedClaims,
        secondsUntilExpiration: 3600,
      });

      expect(response.id).toBe(apiKeyId);
      expect(response.description).toBe('Updated description');
      expect(response.scopes).toEqual(['scope1', 'scope2', 'scope3']);
      expect(response.claims).toEqual(updatedClaims);
      expect(response.expiration).toBe(expirationTimestamp);
      expect(response.updatedAt).toBe(1753746916590);
    });

    it('throws error when API key ID is missing', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      await expect(
        apiClient.apiKeys.update({
          apiKeyId: '',
          subject,
        }),
      ).rejects.toThrow('A valid resource ID is required.');
    });
  });

  describe('delete', () => {
    const mockDeletedObject = {
      object: 'api_key',
      id: apiKeyId,
      deleted: true,
    };

    it('deletes an API key by ID', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.delete(
          `https://api.clerk.test/api_keys/${apiKeyId}`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            return HttpResponse.json(mockDeletedObject);
          }),
        ),
      );

      const response = await apiClient.apiKeys.delete(apiKeyId);

      expect(response.id).toBe(apiKeyId);
      expect(response.deleted).toBe(true);
      expect(response.object).toBe('api_key');
    });

    it('throws error when API key ID is missing', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      await expect(apiClient.apiKeys.delete('')).rejects.toThrow('A valid resource ID is required.');
    });
  });
});
