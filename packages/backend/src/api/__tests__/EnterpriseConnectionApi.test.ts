import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('EnterpriseConnectionAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockEnterpriseConnectionResponse = {
    object: 'enterprise_connection',
    id: 'entconn_123',
    name: 'Clerk',
    domains: ['clerk.dev'],
    organization_id: null,
    created_at: 1672531200000,
    updated_at: 1672531200000,
    active: true,
    sync_user_attributes: false,
    allow_subdomains: false,
    disable_additional_identifications: false,
  };

  describe('createEnterpriseConnection', () => {
    it('sends nested saml params in snake_case', async () => {
      server.use(
        http.post(
          'https://api.clerk.test/v1/enterprise_connections',
          validateHeaders(async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;

            expect(body.name).toBe('Clerk');
            expect(body.domains).toEqual(['clerk.dev']);
            expect(body.saml).toEqual({
              idp_entity_id: 'xxx',
              idp_metadata_url: 'https://oauth.devsuccess.app/metadata',
              idp_sso_url: 'https://oauth.devsuccess.app/sso',
            });

            return HttpResponse.json(mockEnterpriseConnectionResponse);
          }),
        ),
      );

      await apiClient.enterpriseConnections.createEnterpriseConnection({
        name: 'Clerk',
        domains: ['clerk.dev'],
        saml: {
          idpEntityId: 'xxx',
          idpMetadataUrl: 'https://oauth.devsuccess.app/metadata',
          idpSsoUrl: 'https://oauth.devsuccess.app/sso',
        },
      });
    });

    it('sends nested oidc params', async () => {
      server.use(
        http.post(
          'https://api.clerk.test/v1/enterprise_connections',
          validateHeaders(async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;

            expect(body.oidc).toEqual({
              discovery_url: 'https://oidc.example.com/.well-known/openid-configuration',
              client_id: 'client_123',
              client_secret: 'secret_456',
              auth_url: 'https://oidc.example.com/authorize',
              token_url: 'https://oidc.example.com/token',
              user_info_url: 'https://oidc.example.com/userinfo',
              requires_pkce: true,
            });

            return HttpResponse.json(mockEnterpriseConnectionResponse);
          }),
        ),
      );

      await apiClient.enterpriseConnections.createEnterpriseConnection({
        name: 'OIDC Connection',
        domains: ['example.com'],
        oidc: {
          discoveryUrl: 'https://oidc.example.com/.well-known/openid-configuration',
          clientId: 'client_123',
          clientSecret: 'secret_456',
          authUrl: 'https://oidc.example.com/authorize',
          tokenUrl: 'https://oidc.example.com/token',
          userInfoUrl: 'https://oidc.example.com/userinfo',
          requiresPkce: true,
        },
      });
    });
  });

  describe('updateEnterpriseConnection', () => {
    it('sends nested saml params', async () => {
      server.use(
        http.patch(
          'https://api.clerk.test/v1/enterprise_connections/entconn_123',
          validateHeaders(async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;

            expect(body).toHaveProperty('saml');
            expect((body.saml as Record<string, unknown>).idp_entity_id).toBe('updated_entity');
            expect((body.saml as Record<string, unknown>).idp_metadata_url).toBe(
              'https://updated.example.com/metadata',
            );

            return HttpResponse.json(mockEnterpriseConnectionResponse);
          }),
        ),
      );

      await apiClient.enterpriseConnections.updateEnterpriseConnection('entconn_123', {
        saml: {
          idpEntityId: 'updated_entity',
          idpMetadataUrl: 'https://updated.example.com/metadata',
        },
      });
    });
  });

  describe('getEnterpriseConnectionList', () => {
    it('successfully fetches enterprise connections with query params in snake_case', async () => {
      const mockListResponse = {
        data: [mockEnterpriseConnectionResponse],
        total_count: 1,
      };

      let capturedRequestUrl: string | null = null;
      server.use(
        http.get(
          'https://api.clerk.test/v1/enterprise_connections',
          validateHeaders(({ request }) => {
            capturedRequestUrl = request.url;
            return HttpResponse.json(mockListResponse);
          }),
        ),
      );

      const response = await apiClient.enterpriseConnections.getEnterpriseConnectionList({
        organizationId: 'org_123',
        active: true,
        limit: 10,
        offset: 5,
      });

      expect(capturedRequestUrl).toBeTruthy();
      const url = new URL(capturedRequestUrl!);
      expect(url.searchParams.get('organization_id')).toBe('org_123');
      expect(url.searchParams.get('active')).toBe('true');
      expect(url.searchParams.get('limit')).toBe('10');
      expect(url.searchParams.get('offset')).toBe('5');

      expect(response.data).toHaveLength(1);
      expect(response.data[0].id).toBe('entconn_123');
      expect(response.data[0].name).toBe('Clerk');
      expect(response.data[0].domains).toEqual(['clerk.dev']);
      expect(response.totalCount).toBe(1);
    });
  });

  describe('getEnterpriseConnection', () => {
    it('successfully fetches a single enterprise connection', async () => {
      server.use(
        http.get(
          'https://api.clerk.test/v1/enterprise_connections/entconn_123',
          validateHeaders(() => HttpResponse.json(mockEnterpriseConnectionResponse)),
        ),
      );

      const response = await apiClient.enterpriseConnections.getEnterpriseConnection('entconn_123');

      expect(response.id).toBe('entconn_123');
      expect(response.name).toBe('Clerk');
      expect(response.domains).toEqual(['clerk.dev']);
      expect(response.active).toBe(true);
      expect(response.organizationId).toBeNull();
    });
  });

  describe('deleteEnterpriseConnection', () => {
    it('successfully deletes an enterprise connection', async () => {
      server.use(
        http.delete(
          'https://api.clerk.test/v1/enterprise_connections/entconn_123',
          validateHeaders(() => HttpResponse.json(mockEnterpriseConnectionResponse)),
        ),
      );

      const response = await apiClient.enterpriseConnections.deleteEnterpriseConnection('entconn_123');

      expect(response.id).toBe('entconn_123');
      expect(response.name).toBe('Clerk');
    });
  });
});
