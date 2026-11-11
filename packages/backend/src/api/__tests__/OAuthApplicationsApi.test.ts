import { ClerkError } from '@clerk/shared/error';
import { buildPublishableKey } from '@clerk/shared/keys';
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

    const publishableKey = buildPublishableKey('clerk.example.test');

    const createClient = () => createBackendApiClient({ apiUrl: 'https://api.clerk.test' });

    const tokenResponse = () =>
      HttpResponse.json({
        access_token: 'exchanged_token',
        issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        token_type: 'Bearer',
      });

    it('exchanges a subject token at the application token endpoint', async () => {
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
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
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
      expect(body?.getAll('resource')).toEqual(['https://r.example.test']);
      expect(body?.get('scope')).toBe('invoices:read invoices:write');
      expect(body?.has('client_id')).toBe(false);
    });

    it('authenticates with form-urlencoded client credentials over HTTP Basic', async () => {
      let authorization: string | null = null;
      server.use(
        http.post(tokenFetchUrl, ({ request }) => {
          authorization = request.headers.get('Authorization');
          return tokenResponse();
        }),
      );

      await createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      expect(authorization).toBe(`Basic ${btoa('client+id%3Awith%2Breserved:secret+value%3A%2B%2F%3D')}`);
    });

    it('omits optional parameters that are not provided', async () => {
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
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      expect([...(body?.keys() ?? [])]).toEqual(['grant_type', 'subject_token', 'subject_token_type', 'resource']);
      expect(result.scope).toBeUndefined();
      expect(result.refreshToken).toBe('refresh');
    });

    it('ignores empty entries in a returned scope', async () => {
      server.use(
        http.post(tokenFetchUrl, () =>
          HttpResponse.json({
            access_token: 'exchanged_token',
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            token_type: 'Bearer',
            scope: ' invoices:read  invoices:write ',
          }),
        ),
      );

      const result = await createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      expect(result.scope).toEqual(['invoices:read', 'invoices:write']);
    });

    it.each([
      ['unsupported_grant_type', 'The authorization grant type is not supported.'],
      ['invalid_grant', undefined],
      ['invalid_target', 'Unknown audience.'],
    ])('throws OAuthTokenExchangeError for a %s error response', async (error, errorDescription) => {
      server.use(
        http.post(tokenFetchUrl, () =>
          HttpResponse.json(
            { error, ...(errorDescription && { error_description: errorDescription }) },
            { status: 400 },
          ),
        ),
      );

      const promise = createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      await expect(promise).rejects.toBeInstanceOf(OAuthTokenExchangeError);
      await expect(promise).rejects.toBeInstanceOf(ClerkError);
      await expect(promise).rejects.toMatchObject({
        code: error,
        error,
        errorDescription,
        status: 400,
        clerkError: true,
        name: 'OAuthTokenExchangeError',
        message: errorDescription ? `${error}: ${errorDescription}` : error,
      });
    });

    it('throws an invalid_response error when the error body is not JSON', async () => {
      server.use(http.post(tokenFetchUrl, () => new HttpResponse('Bad Gateway', { status: 502 })));

      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          publishableKey,
          clientId,
          clientSecret,
          subjectToken: 'subject_token',
          resource: 'https://r.example.test',
        }),
      ).rejects.toMatchObject({ error: 'invalid_response', errorDescription: undefined, status: 502 });
    });

    it('throws an invalid_response error when a successful response is malformed', async () => {
      server.use(http.post(tokenFetchUrl, () => HttpResponse.json({ token_type: 'Bearer' })));

      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          publishableKey,
          clientId,
          clientSecret,
          subjectToken: 'subject_token',
          resource: 'https://r.example.test',
        }),
      ).rejects.toMatchObject({ error: 'invalid_response', status: 200 });
    });

    it.each([201, 202, 204])('throws an invalid_response error for a %i response', async status => {
      server.use(
        http.post(tokenFetchUrl, () =>
          status === 204
            ? new HttpResponse(null, { status })
            : HttpResponse.json(
                {
                  access_token: 'exchanged_token',
                  issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
                  token_type: 'Bearer',
                },
                { status },
              ),
        ),
      );

      const promise = createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      await expect(promise).rejects.toBeInstanceOf(OAuthTokenExchangeError);
      await expect(promise).rejects.toMatchObject({ error: 'invalid_response', status });
    });

    it.each([
      ['a numeric scope', { scope: 42 }],
      ['a null scope', { scope: null }],
      ['a string expires_in', { expires_in: '3600' }],
      ['a negative expires_in', { expires_in: -1 }],
      ['a fractional expires_in', { expires_in: 1.5 }],
      ['a null expires_in', { expires_in: null }],
      ['a numeric refresh_token', { refresh_token: 7 }],
      ['a null refresh_token', { refresh_token: null }],
    ])('throws an invalid_response error for a successful response with %s', async (_, member) => {
      server.use(
        http.post(tokenFetchUrl, () =>
          HttpResponse.json({
            access_token: 'exchanged_token',
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            token_type: 'Bearer',
            ...member,
          }),
        ),
      );

      const promise = createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      await expect(promise).rejects.toBeInstanceOf(OAuthTokenExchangeError);
      await expect(promise).rejects.toMatchObject({ error: 'invalid_response', status: 200 });
    });

    it('ignores unrecognized members in a successful response', async () => {
      server.use(
        http.post(tokenFetchUrl, () =>
          HttpResponse.json({
            access_token: 'exchanged_token',
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            token_type: 'Bearer',
            expires_in: 0,
            refresh_token: 'refresh',
            custom_member: { nested: true },
          }),
        ),
      );

      const result = await createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      expect(result).toEqual({
        accessToken: 'exchanged_token',
        issuedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        tokenType: 'Bearer',
        expiresIn: 0,
        scope: undefined,
        refreshToken: 'refresh',
      });
    });

    it('sends the exchange to the proxy URL when one is configured', async () => {
      let requested = false;
      server.use(
        http.post('https://example.test/__clerk/oauth/token', () => {
          requested = true;
          return tokenResponse();
        }),
      );

      await createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        proxyUrl: 'https://example.test/__clerk/',
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
      });

      expect(requested).toBe(true);
    });

    it.each([
      ['the publishable key is missing', { publishableKey: '' }, 'Publishable key is missing.'],
      ['the publishable key is invalid', { publishableKey: 'pk_invalid' }, 'Publishable key not valid'],
      ['the proxy URL is relative', { publishableKey, proxyUrl: '/__clerk' }, '`proxyUrl` must be an absolute URL'],
    ])('throws before making any request when %s', async (_, endpointParams, message) => {
      let requested = false;
      server.use(
        http.all('*', () => {
          requested = true;
          return tokenResponse();
        }),
      );

      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          ...endpointParams,
          clientId,
          clientSecret,
          subjectToken: 'subject_token',
          resource: 'https://r.example.test',
        }),
      ).rejects.toThrow(message);
      expect(requested).toBe(false);
    });

    it.each([
      ['has a fragment', 'https://r.example.test/api#section'],
      ['has a bare trailing fragment delimiter', 'https://r.example.test/api#'],
      ['is relative', '/api'],
      ['is unparsable', 'https://'],
      ['is empty', ''],
      ['uses plain http for a non-loopback host', 'http://r.example.test/api'],
      ['uses plain http for a loopback-looking host name', 'http://localhost.example.test'],
      ['uses a non-http scheme', 'urn:example:resource'],
      ['uses a websocket scheme', 'wss://r.example.test/api'],
    ])('rejects a resource that %s before making any request', async (_, resource) => {
      const requested: string[] = [];
      server.use(
        http.all('*', ({ request }) => {
          requested.push(`${request.method} ${request.url}`);
          return tokenResponse();
        }),
      );

      const promise = createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource,
      });

      await expect(promise).rejects.toBeInstanceOf(OAuthTokenExchangeError);
      await expect(promise).rejects.toMatchObject({
        code: 'invalid_request',
        error: 'invalid_request',
        errorDescription: expect.stringContaining('resource'),
        status: undefined,
      });
      expect(requested).toEqual([]);
    });

    it.each([
      ['an https resource with a query', 'https://r.example.test/api?tenant=a&b=1'],
      ['an https resource as written, without normalization', 'HTTPS://R.Example.test'],
      ['an http resource on localhost', 'http://localhost:3000'],
      ['an http resource on 127.0.0.1', 'http://127.0.0.1:8080/api'],
      ['an http resource on [::1]', 'http://[::1]:8080'],
    ])('sends %s', async (_, resource) => {
      let sent: string[] | undefined;
      server.use(
        http.post(tokenFetchUrl, async ({ request }) => {
          sent = new URLSearchParams(await request.text()).getAll('resource');
          return tokenResponse();
        }),
      );

      await createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource,
      });

      expect(sent).toEqual([resource]);
    });

    it.each([
      ['an empty element', ['read', '']],
      ['an element with a space', ['a b']],
      ['an element with a double quote', ['a"b']],
      ['an element with a backslash', ['a\\b']],
      ['an element with a non-ASCII character', ['café']],
      ['an element with a control character', ['a\tb']],
      ['an element with DEL', ['a\u007fb']],
    ])('rejects a scope with %s before making any request', async (_, scope) => {
      const requested: string[] = [];
      server.use(
        http.all('*', ({ request }) => {
          requested.push(`${request.method} ${request.url}`);
          return tokenResponse();
        }),
      );

      const promise = createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
        scope,
      });

      await expect(promise).rejects.toBeInstanceOf(OAuthTokenExchangeError);
      await expect(promise).rejects.toMatchObject({
        code: 'invalid_request',
        error: 'invalid_request',
        errorDescription: expect.stringContaining('scope'),
        status: undefined,
      });
      expect(requested).toEqual([]);
    });

    it.each([
      ['no scope parameter for an empty scope list', [], null],
      ['scope tokens at the edges of the allowed character ranges', ['!', '#', '[', ']', '~'], '! # [ ] ~'],
    ])('sends %s', async (_, scope, expected) => {
      let body: URLSearchParams | undefined;
      server.use(
        http.post(tokenFetchUrl, async ({ request }) => {
          body = new URLSearchParams(await request.text());
          return tokenResponse();
        }),
      );

      await createClient().oauthApplications.__experimental_exchangeToken({
        publishableKey,
        clientId,
        clientSecret,
        subjectToken: 'subject_token',
        resource: 'https://r.example.test',
        scope,
      });

      expect(body?.get('scope')).toBe(expected);
    });

    it('throws when the client ID is missing', async () => {
      await expect(
        createClient().oauthApplications.__experimental_exchangeToken({
          publishableKey,
          clientId: '',
          clientSecret,
          subjectToken: 'subject_token',
          resource: 'https://r.example.test',
        }),
      ).rejects.toThrow('A valid client ID is required.');
    });
  });
});
