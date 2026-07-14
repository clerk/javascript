import { http, HttpResponse } from 'msw';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import type { CreateEnterpriseConnectionParams } from '../endpoints/EnterpriseConnectionApi';
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
    saml_connection: {
      id: 'samlc_1',
      name: 'Acme SAML',
      idp_entity_id: 'https://idp.example.com',
      idp_sso_url: 'https://idp.example.com/sso',
      idp_certificate: '-----BEGIN CERTIFICATE-----',
      idp_certificate_issued_at: 1672531200000,
      idp_certificate_expires_at: 1704067200000,
      idp_metadata_url: 'https://idp.example.com/metadata',
      idp_metadata: '<xml/>',
      acs_url: 'https://clerk.example.com/v1/saml/acs',
      sp_entity_id: 'https://clerk.example.com',
      sp_metadata_url: 'https://clerk.example.com/v1/saml/metadata',
      sync_user_attributes: true,
      allow_subdomains: true,
      allow_idp_initiated: false,
    },
    oauth_config: {
      id: 'eaoc_1',
      name: 'Acme OIDC',
      client_id: 'client_abc',
      discovery_url: 'https://oauth.example.com/.well-known/openid-configuration',
      logo_public_url: 'https://img.example.com/logo.png',
      created_at: 1672531200000,
      updated_at: 1672531200000,
    },
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
            expect(body.provider).toBe('saml_custom');
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
        provider: 'saml_custom',
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

            expect(body.provider).toBe('oidc_custom');
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
        provider: 'oidc_custom',
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

    it('requires provider and rejects unsupported values at the type level', () => {
      expectTypeOf<{ name: string; domains: string[] }>().not.toExtend<CreateEnterpriseConnectionParams>();
      expectTypeOf<'saml_bogus'>().not.toExtend<CreateEnterpriseConnectionParams['provider']>();
      expectTypeOf<'saml_okta'>().toExtend<CreateEnterpriseConnectionParams['provider']>();
    });

    it('sends provisioning, custom attribute, and login hint params in snake_case', async () => {
      server.use(
        http.post(
          'https://api.clerk.test/v1/enterprise_connections',
          validateHeaders(async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;

            expect(body.allow_organization_account_linking).toBe(true);
            expect(body.authenticatable).toBe(false);
            expect(body.disable_jit_provisioning).toBe(true);
            expect(body.custom_attributes).toEqual([
              {
                name: 'Employee Number',
                key: 'employee_number',
                sso_path: 'user.employeeNumber',
                multi_valued: false,
              },
            ]);
            expect((body.saml as Record<string, unknown>).login_hint).toEqual({
              mode: 'custom_attribute',
              source: 'employee_number',
            });

            return HttpResponse.json(mockEnterpriseConnectionResponse);
          }),
        ),
      );

      await apiClient.enterpriseConnections.createEnterpriseConnection({
        name: 'Clerk',
        domains: ['clerk.dev'],
        provider: 'saml_custom',
        allowOrganizationAccountLinking: true,
        authenticatable: false,
        disableJitProvisioning: true,
        customAttributes: [
          {
            name: 'Employee Number',
            key: 'employee_number',
            ssoPath: 'user.employeeNumber',
            multiValued: false,
          },
        ],
        saml: {
          idpEntityId: 'xxx',
          loginHint: {
            mode: 'custom_attribute',
            source: 'employee_number',
          },
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

    it('sends provisioning and custom attribute params in snake_case', async () => {
      server.use(
        http.patch(
          'https://api.clerk.test/v1/enterprise_connections/entconn_123',
          validateHeaders(async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;

            expect(body.sync_user_attributes).toBe(true);
            expect(body.disable_additional_identifications).toBe(true);
            expect(body.allow_organization_account_linking).toBe(false);
            expect(body.authenticatable).toBe(true);
            expect(body.disable_jit_provisioning).toBe(false);
            expect(body.custom_attributes).toEqual([
              {
                name: 'Department',
                key: 'department',
                scim_path: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department',
              },
            ]);

            return HttpResponse.json(mockEnterpriseConnectionResponse);
          }),
        ),
      );

      await apiClient.enterpriseConnections.updateEnterpriseConnection('entconn_123', {
        syncUserAttributes: true,
        disableAdditionalIdentifications: true,
        allowOrganizationAccountLinking: false,
        authenticatable: true,
        disableJitProvisioning: false,
        customAttributes: [
          {
            name: 'Department',
            key: 'department',
            scimPath: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department',
          },
        ],
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
      expect(response.samlConnection).not.toBeNull();
      expect(response.samlConnection?.id).toBe('samlc_1');
      expect(response.samlConnection?.idpEntityId).toBe('https://idp.example.com');
      expect(response.samlConnection?.idpCertificateIssuedAt).toBe(1672531200000);
      expect(response.samlConnection?.idpCertificateExpiresAt).toBe(1704067200000);
      expect(response.oauthConfig).not.toBeNull();
      expect(response.oauthConfig?.clientId).toBe('client_abc');
      expect(response.oauthConfig?.discoveryUrl).toBe('https://oauth.example.com/.well-known/openid-configuration');
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
