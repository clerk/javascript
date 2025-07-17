import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('SamlConnectionAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  describe('getSamlConnectionList', () => {
    it('successfully fetches SAML connections with all parameters', async () => {
      const mockSamlConnectionsResponse = {
        data: [
          {
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
          },
        ],
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
});
