import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('SamlConnectionAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockSamlConnectionResponse = {
    object: 'saml_connection',
    id: 'samlc_123',
    name: 'Test Connection',
    provider: 'saml_custom',
    domain: 'test.example.com',
    organization_id: 'org_123',
    created_at: 1672531200000,
    updated_at: 1672531200000,
    active: true,
    sync_user_attributes: false,
    allow_subdomains: false,
    allow_idp_initiated: false,
    idp_entity_id: 'entity_123',
    idp_sso_url: 'https://idp.example.com/sso',
    idp_certificate: 'cert_data',
    idp_metadata_url: null,
    idp_metadata: null,
    attribute_mapping: {
      user_id: 'userId',
      email_address: 'email',
      first_name: 'firstName',
      last_name: 'lastName',
    },
  };

  describe('getSamlConnectionList', () => {
    it('successfully fetches SAML connections with all parameters', async () => {
      const mockSamlConnectionsResponse = {
        data: [mockSamlConnectionResponse],
        total_count: 1,
      };

      server.use(
        http.get(
          'https://api.clerk.test/v1/saml_connections',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('query')).toBe('test');
            expect(url.searchParams.get('order_by')).toBe('+created_at');
            expect(url.searchParams.get('limit')).toBe('5');
            expect(url.searchParams.get('offset')).toBe('10');
            expect(url.searchParams.getAll('organization_id')).toEqual(['+org_123', '-org_456']);
            return HttpResponse.json(mockSamlConnectionsResponse);
          }),
        ),
      );

      const response = await apiClient.samlConnections.getSamlConnectionList({
        query: 'test',
        orderBy: '+created_at',
        organizationId: ['+org_123', '-org_456'],
        limit: 5,
        offset: 10,
      });

      expect(response.data).toHaveLength(1);
      expect(response.data[0].id).toBe('samlc_123');
      expect(response.data[0].name).toBe('Test Connection');
      expect(response.data[0].organizationId).toBe('org_123');
      expect(response.totalCount).toBe(1);
    });
  });

  describe('createSamlConnection', () => {
    it('successfully creates a SAML connection', async () => {
      server.use(
        http.post(
          'https://api.clerk.test/v1/saml_connections',
          validateHeaders(async ({ request }) => {
            const body = await request.json();

            expect(body).toEqual({
              name: 'Test Connection',
              provider: 'saml_custom',
              domain: 'test.example.com',
              attribute_mapping: {
                user_id: 'userId',
                email_address: 'email',
                first_name: 'firstName',
                last_name: 'lastName',
              },
            });

            return HttpResponse.json(mockSamlConnectionResponse);
          }),
        ),
      );

      const response = await apiClient.samlConnections.createSamlConnection({
        name: 'Test Connection',
        provider: 'saml_custom',
        domain: 'test.example.com',
        attributeMapping: {
          userId: 'userId',
          emailAddress: 'email',
          firstName: 'firstName',
          lastName: 'lastName',
        },
      });

      expect(response.id).toBe('samlc_123');
      expect(response.name).toBe('Test Connection');
      expect(response.organizationId).toBe('org_123');
    });
  });

  describe('updateSamlConnection', () => {
    it('successfully updates a SAML connection', async () => {
      server.use(
        http.patch(
          'https://api.clerk.test/v1/saml_connections/samlc_123',
          validateHeaders(async ({ request }) => {
            const body = await request.json();

            expect(body).toEqual({
              name: 'Test Connection',
              provider: 'saml_custom',
              domain: 'test.example.com',
              organization_id: 'org_123',
              idp_entity_id: 'entity_123',
              idp_sso_url: 'https://idp.example.com/sso',
              idp_certificate: 'cert_data',
              attribute_mapping: {
                user_id: 'userId2',
                email_address: 'email2',
                first_name: 'firstName2',
                last_name: 'lastName2',
              },
            });

            return HttpResponse.json({
              ...mockSamlConnectionResponse,
              idp_entity_id: 'entity_123',
              idp_sso_url: 'https://idp.example.com/sso',
              idp_certificate: 'cert_data',
              attribute_mapping: {
                user_id: 'userId2',
                email_address: 'email2',
                first_name: 'firstName2',
                last_name: 'lastName2',
              },
            });
          }),
        ),
      );

      const response = await apiClient.samlConnections.updateSamlConnection('samlc_123', {
        name: 'Test Connection',
        provider: 'saml_custom',
        domain: 'test.example.com',
        organizationId: 'org_123',
        idpEntityId: 'entity_123',
        idpSsoUrl: 'https://idp.example.com/sso',
        idpCertificate: 'cert_data',
        attributeMapping: {
          userId: 'userId2',
          emailAddress: 'email2',
          firstName: 'firstName2',
          lastName: 'lastName2',
        },
      });

      expect(response.id).toBe('samlc_123');
      expect(response.name).toBe('Test Connection');
      expect(response.organizationId).toBe('org_123');
      expect(response.attributeMapping).toEqual({
        userId: 'userId2',
        emailAddress: 'email2',
        firstName: 'firstName2',
        lastName: 'lastName2',
      });
    });
  });
});
