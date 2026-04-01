import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('APIKeys', () => {
  const apiKeyId = 'ak_xxxxx';
  const subject = 'user_xxxxx';
  const apiKeySecret = 'ak_secret_xxxxx';

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

  describe('list', () => {
    it('retrieves a list of API keys with query parameters', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      const mockPaginatedResponse = {
        data: [mockAPIKey],
        total_count: 1,
      };

      server.use(
        http.get(
          'https://api.clerk.test/api_keys',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            return HttpResponse.json(mockPaginatedResponse);
          }),
        ),
      );

      const response = await apiClient.apiKeys.list({
        subject,
        includeInvalid: true,
        limit: 10,
        offset: 0,
      });

      expect(response.data).toHaveLength(1);
      expect(response.data[0].id).toBe(apiKeyId);
      expect(response.data[0].name).toBe('Test API Key');
      expect(response.totalCount).toBe(1);
    });
  });

  describe('create', () => {
    it('creates an API key with all parameters', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      const mockCreatedAPIKey = {
        ...mockAPIKey,
        secret: apiKeySecret,
      };

      server.use(
        http.post(
          'https://api.clerk.test/api_keys',
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.name).toBe('New API Key');
            expect(body.subject).toBe(subject);
            expect(body.description).toBe('New description');
            expect(body.scopes).toEqual(['scope1', 'scope2']);
            expect(body.claims).toEqual({ foo: 'bar' });
            expect(body.seconds_until_expiration).toBe(3600);
            return HttpResponse.json(mockCreatedAPIKey);
          }),
        ),
      );

      const response = await apiClient.apiKeys.create({
        name: 'New API Key',
        subject,
        description: 'New description',
        scopes: ['scope1', 'scope2'],
        claims: { foo: 'bar' },
        secondsUntilExpiration: 3600,
      });

      expect(response.id).toBe(apiKeyId);
      expect(response.name).toBe('Test API Key');
      expect(response.subject).toBe(subject);
      expect(response.scopes).toEqual(['scope1', 'scope2']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });

    it('creates an API key with minimal parameters', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      const mockCreatedAPIKey = {
        ...mockAPIKey,
        name: 'Minimal API Key',
        secret: apiKeySecret,
      };

      server.use(
        http.post(
          'https://api.clerk.test/api_keys',
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.name).toBe('Minimal API Key');
            expect(body.subject).toBe(subject);
            return HttpResponse.json(mockCreatedAPIKey);
          }),
        ),
      );

      const response = await apiClient.apiKeys.create({
        name: 'Minimal API Key',
        subject,
      });

      expect(response.id).toBe(apiKeyId);
      expect(response.name).toBe('Minimal API Key');
    });
  });

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

  describe('revoke', () => {
    const mockRevokedAPIKey = {
      ...mockAPIKey,
      revoked: true,
      revocation_reason: 'revoked by test',
    };

    it('revokes an API key with revocation reason', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          `https://api.clerk.test/api_keys/${apiKeyId}/revoke`,
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.revocation_reason).toBe('revoked by test');
            return HttpResponse.json(mockRevokedAPIKey);
          }),
        ),
      );

      const response = await apiClient.apiKeys.revoke({
        apiKeyId,
        revocationReason: 'revoked by test',
      });

      expect(response.revoked).toBe(true);
      expect(response.revocationReason).toBe('revoked by test');
      expect(response.id).toBe(apiKeyId);
    });

    it('revokes an API key without revocation reason', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      const mockRevokedAPIKeyNoReason = {
        ...mockAPIKey,
        revoked: true,
        revocation_reason: null,
      };

      server.use(
        http.post(
          `https://api.clerk.test/api_keys/${apiKeyId}/revoke`,
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.revocation_reason).toBeNull();
            return HttpResponse.json(mockRevokedAPIKeyNoReason);
          }),
        ),
      );

      const response = await apiClient.apiKeys.revoke({
        apiKeyId,
      });

      expect(response.revoked).toBe(true);
      expect(response.revocationReason).toBeNull();
    });

    it('throws error when API key ID is missing', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      await expect(
        apiClient.apiKeys.revoke({
          apiKeyId: '',
        }),
      ).rejects.toThrow('A valid resource ID is required.');
    });
  });

  describe('verify', () => {
    it('verifies an API key secret', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          'https://api.clerk.test/api_keys/verify',
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.secret).toBe(apiKeySecret);
            return HttpResponse.json(mockAPIKey);
          }),
        ),
      );

      const response = await apiClient.apiKeys.verify(apiKeySecret);

      expect(response.id).toBe(apiKeyId);
      expect(response.name).toBe('Test API Key');
      expect(response.subject).toBe(subject);
      expect(response.scopes).toEqual(['scope1', 'scope2']);
      expect(response.claims).toEqual({ foo: 'bar' });
    });
  });
});
