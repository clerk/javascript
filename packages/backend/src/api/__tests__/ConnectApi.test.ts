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
            slug: 'acme',
            display_name: 'Acme',
            configuration: { type: 'oauth', authorization_params: { tenantId: 'acme', access_type: 'offline' } },
          });
        }),
      ),
    );

    const connector = await apiClient.connect.connectors.create({
      slug: 'acme',
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
      slug: 'acme',
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
      slug: 'acme',
      scopes: ['read'],
    });
    expect(body).toMatchObject({ slug: 'acme', scopes: ['read'] });
    expect(credential).toMatchObject({ connectionId: 'con_1', accessToken: 'token', grantedScopes: ['read'] });
  });

  it('reauthorizes a connection', async () => {
    let body: unknown;
    server.use(
      http.post(
        'https://api.clerk.test/v1/connections/con_1/reauthorize',
        validateHeaders(async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({
            status: 'requires_action',
            action: { type: 'redirect', url: 'https://clerk.test/v1/connect/authorize', expires_at: 1 },
          });
        }),
      ),
    );

    const result = await apiClient.connect.connections.reauthorize('con_1', {
      scopes: ['read', 'write'],
      returnUrl: 'https://app.test/settings',
    });
    expect(body).toEqual({ scopes: ['read', 'write'], return_url: 'https://app.test/settings' });
    expect(result).toEqual({
      status: 'requires_action',
      action: { type: 'redirect', url: 'https://clerk.test/v1/connect/authorize', expiresAt: 1 },
    });
  });

  it('connects with an API key and reads an API key credential without scopes', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(
        'https://api.clerk.test/v1/users/user_1/connections',
        validateHeaders(async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json({
            status: 'complete',
            connection: { object: 'connection', id: 'cnn_1', slug: 'openai', api_key_hint: '••••abcd' },
          });
        }),
      ),
      http.post(
        'https://api.clerk.test/v1/users/user_1/connection_credentials',
        validateHeaders(async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json({
            object: 'connection_credential',
            connection_id: 'cnn_1',
            type: 'api_key',
            api_key: 'sk-test-abcd',
            expires_at: null,
            granted_scopes: [],
          });
        }),
      ),
    );

    const result = await apiClient.connect.connections.create({
      userId: 'user_1',
      connector: 'openai',
      apiKey: 'sk-test-abcd',
    });
    const credential = await apiClient.connect.connections.getCredential({ userId: 'user_1', slug: 'openai' });

    expect(bodies).toEqual([{ connector: 'openai', api_key: 'sk-test-abcd' }, { slug: 'openai' }]);
    expect(result.status === 'complete' && result.connection.apiKeyHint).toBe('••••abcd');
    expect(credential.type === 'api_key' && credential.apiKey).toBe('sk-test-abcd');
  });

  it('puts the Clerk message and meta on a Connect error', async () => {
    server.use(
      http.post(
        'https://api.clerk.test/v1/users/user_1/connection_credentials',
        validateHeaders(() =>
          HttpResponse.json(
            {
              errors: [
                {
                  code: 'connection_disconnected',
                  message: 'Connection is disconnected',
                  long_message: 'The user disconnected this connection. Ask them to reconnect it.',
                  meta: { connection_id: 'con_1', connection_status: 'disconnected' },
                },
              ],
              clerk_trace_id: 'trace_1',
            },
            { status: 409, statusText: 'Conflict' },
          ),
        ),
      ),
    );

    const error = await apiClient.connect.connections
      .getCredential({ userId: 'user_1', slug: 'acme' })
      .catch((err: unknown) => err);

    expect(error).toMatchObject({
      message: 'The user disconnected this connection. Ask them to reconnect it.',
      status: 409,
      clerkTraceId: 'trace_1',
    });
    expect((error as { errors: unknown[] }).errors[0]).toMatchObject({
      code: 'connection_disconnected',
      meta: { connectionId: 'con_1', connectionStatus: 'disconnected' },
    });
  });

  it('falls back to the short message and keeps scope meta', async () => {
    server.use(
      http.post(
        'https://api.clerk.test/v1/users/user_1/connection_credentials',
        validateHeaders(() =>
          HttpResponse.json(
            {
              errors: [
                { code: 'connection_scope_missing', message: 'Missing scopes', meta: { missing_scopes: ['repo'] } },
              ],
            },
            { status: 403, statusText: 'Forbidden' },
          ),
        ),
      ),
    );

    const error = await apiClient.connect.connections
      .getCredential({ userId: 'user_1', slug: 'acme', scopes: ['repo'] })
      .catch((err: unknown) => err);

    expect(error).toMatchObject({ message: 'Missing scopes', status: 403 });
    expect((error as { errors: Array<{ meta: unknown }> }).errors[0].meta).toMatchObject({ missingScopes: ['repo'] });
  });

  it('reads the connector status and display name of a connection', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/connections/con_1',
        validateHeaders(() =>
          HttpResponse.json({
            object: 'connection',
            id: 'con_1',
            connector: 'acme',
            connector_display_name: 'Acme',
            connector_status: 'disabled',
          }),
        ),
      ),
    );

    const connection = await apiClient.connect.connections.get('con_1');

    expect(connection).toMatchObject({ connectorDisplayName: 'Acme', connectorStatus: 'disabled' });
  });
});
