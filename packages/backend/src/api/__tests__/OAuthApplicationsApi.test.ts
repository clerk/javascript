import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { OAuthTokenExchangeError } from '../../errors';
import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('OAuthApplications', () => {
  const oauthApplicationId = 'oauthapp_xxxxx';

  describe('list', () => {
    it('forwards the name filter alongside pagination', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.get(
          'https://api.clerk.test/v1/oauth_applications',
          validateHeaders(({ request }) => {
            expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({
              name_query: 'run-example',
              limit: '100',
              offset: '100',
            });
            return HttpResponse.json({ data: [], total_count: 100 });
          }),
        ),
      );

      const response = await apiClient.oauthApplications.list({ nameQuery: 'run-example', limit: 100, offset: 100 });

      expect(response).toEqual({ data: [], totalCount: 100 });
    });
  });

  describe('revokeToken', () => {
    it('revokes an OAuth application token', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      server.use(
        http.post(
          `https://api.clerk.test/v1/oauth_applications/${oauthApplicationId}/revoke_token`,
          validateHeaders(async ({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_xxxxx');
            const body = (await request.json()) as Record<string, unknown>;
            expect(body.token).toBe('oat_xxxxx');
            return new HttpResponse(null, { status: 204 });
          }),
        ),
      );

      const response = await apiClient.oauthApplications.revokeToken({
        oauthApplicationId,
        token: 'oat_xxxxx',
      });

      expect(response).toBeUndefined();
    });

    it('throws error when OAuth application ID is missing', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

      await expect(
        apiClient.oauthApplications.revokeToken({
          oauthApplicationId: '',
          token: 'oat_xxxxx',
        }),
      ).rejects.toThrow('A valid resource ID is required.');
    });
  });

  describe('__experimental_exchangeToken', () => {
    const tokenFetchUrl = 'https://clerk.example.test/oauth/token';
    const clientId = 'client id:with+reserved';
    const clientSecret = 'secret value:+/=';

    const mockOAuthApplication = {
      object: 'oauth_application',
      id: oauthApplicationId,
      instance_id: 'ins_xxxxx',
      name: 'Example',
      client_id: clientId,
      client_uri: null,
      client_image_url: null,
      dynamically_registered: false,
      consent_screen_enabled: true,
      pkce_required: false,
      public: false,
      scopes: 'profile email',
      redirect_uris: [],
      authorize_url: 'https://clerk.example.test/oauth/authorize',
      token_fetch_url: tokenFetchUrl,
      user_info_url: 'https://clerk.example.test/oauth/userinfo',
      discovery_url: 'https://clerk.example.test/.well-known/openid-configuration',
      token_introspection_url: 'https://clerk.example.test/oauth/token_info',
      created_at: 1,
      updated_at: 1,
    };

    const createClient = () =>
      createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_xxxxx',
      });

    const useApplication = () =>
      server.use(
        http.get(
          `https://api.clerk.test/v1/oauth_applications/${oauthApplicationId}`,
          validateHeaders(() => HttpResponse.json(mockOAuthApplication)),
        ),
      );

    it('exchanges a subject token at the application token endpoint', async () => {
      useApplication();

      let captured: { headers: Headers; body: URLSearchParams } | undefined;
      server.use(
        http.post(tokenFetchUrl, async ({ request }) => {
          captured = { headers: request.headers, body: new URLSearchParams(await request.text()) };
          return HttpResponse.json({
            access_token: 'exchanged_token',
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'invoices:read invoices:write',
          });
        }),
      );

      const result = await createClient().oauthApplications.__experimental_exchangeToken({
        oauthApplicationId,
        clientSecret,
        subjectToken: 'subject_token',
        subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        actorToken: 'actor_token',
        actorTokenType: 'urn:ietf:params:oauth:token-type:jwt',
        requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        audience: ['https://a.example.test', 'https://b.example.test'],
        resource: 'https://r.example.test',
        scope: ['invoices:read', 'invoices:write'],
      });

      expect(result).toEqual({
        accessToken: 'exchanged_token',
        issuedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        scope: ['invoices:read', 'invoices:write'],
        refreshToken: undefined,
      });

      expect(captured?.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect(captured?.headers.get('Accept')).toBe('application/json');

      const body = captured?.body;
      expect(body?.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:token-exchange');
      expect(body?.get('subject_token')).toBe('subject_token');
      expect(body?.get('subject_token_type')).toBe('urn:ietf:params:oauth:token-type:access_token');
      expect(body?.get('actor_token')).toBe('actor_token');
      expect(body?.get('actor_token_type')).toBe('urn:ietf:params:oauth:token-type:jwt');
      expect(body?.get('requested_token_type')).toBe('urn:ietf:params:oauth:token-type:access_token');
      expect(body?.getAll('audience')).toEqual(['https://a.example.test', 'https://b.example.test']);
      expect(body?.getAll('resource')).toEqual(['https://r.example.test']);
      expect(body?.get('scope')).toBe('invoices:read invoices:write');
      expect(body?.has('client_id')).toBe(false);
    });

    it('authenticates with form-urlencoded client credentials over HTTP Basic', async () => {
      useApplication();

      let authorization: string | null = null;
      server.use(
        http.post(tokenFetchUrl, ({ request }) => {
          authorization = request.headers.get('Authorization');
          return HttpResponse.json({
            access_token: 'exchanged_token',
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            token_type: 'Bearer',
          });
        }),
      );

      await createClient().oauthApplications.__experimental_exchangeToken({
        oauthApplicationId,
        clientSecret,
        subjectToken: 'subject_token',
        subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      });

      expect(authorization).toBe(`Basic ${btoa('client+id%3Awith%2Breserved:secret+value%3A%2B%2F%3D')}`);
    });

    it('omits optional parameters that are not provided', async () => {
      useApplication();

      let body: URLSearchParams | undefined;
      server.use(
        http.post(tokenFetchUrl, async ({ request }) => {
          body = new URLSearchParams(await request.text());
          return HttpResponse.json({
            access_token: 'exchanged_token',
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            token_type: 'N_A',
            refresh_token: 'refresh',
          });
        }),
      );

      const result = await createClient().oauthApplications.__experimental_exchangeToken({
        oauthApplicationId,
        clientSecret,
        subjectToken: 'subject_token',
        subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      });

      expect([...(body?.keys() ?? [])]).toEqual(['grant_type', 'subject_token', 'subject_token_type']);
      expect(result.scope).toBeUndefined();
      expect(result.refreshToken).toBe('refresh');
    });

    it.each([
      ['unsupported_grant_type', 'The authorization grant type is not supported.'],
      ['invalid_grant', undefined],
      ['invalid_target', 'Unknown audience.'],
    ])('throws OAuthTokenExchangeError for a %s error response', async (error, errorDescription) => {
      useApplication();
      server.use(
        http.post(tokenFetchUrl, () =>
          HttpResponse.json(
            { error, ...(errorDescription && { error_description: errorDescription }) },
            { status: 400 },
          ),
        ),
      );

      const promise = createClient().oauthApplications.__experimental_exchangeToken({
        oauthApplicationId,
        clientSecret,
        subjectToken: 'subject_token',
        subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      });

      await expect(promise).rejects.toBeInstanceOf(OAuthTokenExchangeError);
      await expect(promise).rejects.toMatchObject({ error, errorDescription, status: 400 });
    });

    it('throws an invalid_response error when the error body is not JSON', async () => {
      useApplication();
      server.use(http.post(tokenFetchUrl, () => new HttpResponse('Bad Gateway', { status: 502 })));

      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          oauthApplicationId,
          clientSecret,
          subjectToken: 'subject_token',
          subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        }),
      ).rejects.toMatchObject({ error: 'invalid_response', errorDescription: undefined, status: 502 });
    });

    it('throws an invalid_response error when a successful response is malformed', async () => {
      useApplication();
      server.use(http.post(tokenFetchUrl, () => HttpResponse.json({ token_type: 'Bearer' })));

      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          oauthApplicationId,
          clientSecret,
          subjectToken: 'subject_token',
          subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        }),
      ).rejects.toMatchObject({ error: 'invalid_response', status: 200 });
    });

    it('rejects actorTokenType without actorToken before making any request', async () => {
      let requested = false;
      server.use(
        http.all('*', () => {
          requested = true;
          return HttpResponse.json({});
        }),
      );

      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          oauthApplicationId,
          clientSecret,
          subjectToken: 'subject_token',
          subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
          actorTokenType: 'urn:ietf:params:oauth:token-type:jwt',
        }),
      ).rejects.toThrow('`actorTokenType` requires `actorToken`.');
      expect(requested).toBe(false);
    });

    it('throws when the OAuth application ID is missing', async () => {
      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          oauthApplicationId: '',
          clientSecret,
          subjectToken: 'subject_token',
          subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        }),
      ).rejects.toThrow('A valid resource ID is required.');
    });
  });
});
