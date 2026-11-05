import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('ConnectApi', () => {
  const apiClient = createBackendApiClient({ apiUrl: 'https://api.clerk.test', secretKey: 'deadbeef' });

  it('keeps provider parameter names when it converts a connector', async () => {
    let body: unknown;
    server.use(
      http.post(
        'https://api.clerk.test/v1/connectors',
        validateHeaders(async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({
            object: 'connector',
            id: 'cnr_1',
            key: 'acme',
            display_name: 'Acme',
            configuration: { type: 'oauth', authorization_params: { tenantId: 'acme', access_type: 'offline' } },
          });
        }),
      ),
    );

    const connector = await apiClient.connect.connectors.create({
      key: 'acme',
      provider: { type: 'custom' },
      displayName: 'Acme',
      configuration: {
        type: 'oauth',
        client: { type: 'customer_managed', clientId: 'id', clientSecret: 'secret' },
        tokenEndpointAuthMethod: 'client_secret_basic',
        authorizationParams: { tenantId: 'acme', access_type: 'offline' },
      },
    });

    expect(body).toEqual({
      key: 'acme',
      provider: { type: 'custom' },
      display_name: 'Acme',
      configuration: {
        type: 'oauth',
        client: { type: 'customer_managed', client_id: 'id', client_secret: 'secret' },
        token_endpoint_auth_method: 'client_secret_basic',
        authorization_params: { tenantId: 'acme', access_type: 'offline' },
      },
    });
    expect(connector.displayName).toBe('Acme');
    expect(connector.configuration).toEqual({
      type: 'oauth',
      authorizationParams: { tenantId: 'acme', access_type: 'offline' },
    });
  });

  it('reads a credential response', async () => {
    let body: unknown;
    server.use(
      http.post(
        'https://api.clerk.test/v1/users/user_1/connection_credentials',
        validateHeaders(async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({
            object: 'connection_credential',
            connection_id: 'con_1',
            type: 'oauth',
            access_token: 'token',
            token_type: 'Bearer',
            expires_at: 1,
            granted_scopes: ['read'],
          });
        }),
      ),
    );

    const credential = await apiClient.connect.connections.getCredential({
      userId: 'user_1',
      key: 'acme',
      scopes: ['read'],
    });
    expect(body).toMatchObject({ key: 'acme', scopes: ['read'] });
    expect(credential).toMatchObject({ connectionId: 'con_1', accessToken: 'token', grantedScopes: ['read'] });
  });
});
