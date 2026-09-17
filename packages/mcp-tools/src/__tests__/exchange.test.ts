import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClerkMcpError } from '../errors';
import { createTokenExchange } from '../exchange';

const accessTokenType = 'urn:ietf:params:oauth:token-type:access_token';
const tokenEndpoint = 'https://clerk.example.com/oauth/token';
const subjectToken = 'at1-mcp-resource';
const resource = 'https://api.example.com/resource';

function oauthResponse(overrides: Record<string, unknown> = {}) {
  return Response.json({
    access_token: 'at2-api-resource',
    token_type: 'Bearer',
    issued_token_type: accessTokenType,
    expires_in: 300,
    scope: 'data:read',
    ...overrides,
  });
}

function createExchange(request: typeof fetch, options: Partial<Parameters<typeof createTokenExchange>[0]> = {}) {
  return createTokenExchange({
    tokenEndpoint,
    clientId: 'client-id',
    clientSecret: 'client-secret',
    fetch: request,
    ...options,
  });
}

function formBody(request: ReturnType<typeof vi.fn<typeof fetch>>, call = 0) {
  return request.mock.calls[call][1]?.body as URLSearchParams;
}

describe('createTokenExchange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends the RFC 8693 form with Basic client credentials', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(oauthResponse());

    await expect(createExchange(request)({ subjectToken, resource, scopes: ['data:read'] })).resolves.toMatchObject({
      accessToken: 'at2-api-resource',
      expiresIn: 300,
      scope: 'data:read',
    });

    const [url, init] = request.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(url).toBe(tokenEndpoint);
    expect(init?.method).toBe('POST');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(headers.get('content-type')).toBe('application/x-www-form-urlencoded');
    expect(headers.get('authorization')).toBe(`Basic ${btoa('client-id:client-secret')}`);
    expect([...formBody(request).entries()]).toEqual([
      ['grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange'],
      ['subject_token', subjectToken],
      ['subject_token_type', accessTokenType],
      ['requested_token_type', accessTokenType],
      ['resource', resource],
      ['scope', 'data:read'],
    ]);
  });

  it('form-encodes client credentials before Basic authentication', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(oauthResponse());

    await createExchange(request, { clientId: 'client id', clientSecret: 'secret:word' })({ subjectToken, resource });

    expect(new Headers(request.mock.calls[0][1]?.headers).get('authorization')).toBe(
      `Basic ${btoa('client+id:secret%3Aword')}`,
    );
  });

  it('omits an absent or blank scope and deduplicates requested scopes', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockImplementation(() => Promise.resolve(oauthResponse({ scope: undefined })));
    const exchange = createExchange(request, { cache: false });

    await exchange({ subjectToken, resource });
    await exchange({ subjectToken, resource, scopes: ['  '] });
    await exchange({ subjectToken, resource, scopes: ['data:read', 'data:read'] });

    expect(formBody(request, 0).has('scope')).toBe(false);
    expect(formBody(request, 1).has('scope')).toBe(false);
    expect(formBody(request, 2).get('scope')).toBe('data:read');
  });

  it('caches exchanged tokens per subject, resource and scope set until they near expiry', async () => {
    vi.useFakeTimers();
    const request = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(oauthResponse()));
    const exchange = createExchange(request);

    await exchange({ subjectToken, resource, scopes: ['data:read'] });
    await exchange({ subjectToken, resource, scopes: ['data:read'] });
    expect(request).toHaveBeenCalledTimes(1);

    await exchange({ subjectToken, resource, scopes: ['data:read', 'data:write'] });
    await exchange({ subjectToken: 'other-subject', resource, scopes: ['data:read'] });
    await exchange({ subjectToken, resource: 'https://api.example.com/other', scopes: ['data:read'] });
    expect(request).toHaveBeenCalledTimes(4);

    vi.advanceTimersByTime(271_000);
    await exchange({ subjectToken, resource, scopes: ['data:read'] });
    expect(request).toHaveBeenCalledTimes(5);
  });

  it('can run without a cache', async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(() => Promise.resolve(oauthResponse()));
    const exchange = createExchange(request, { cache: false });

    await exchange({ subjectToken, resource, scopes: ['data:read'] });
    await exchange({ subjectToken, resource, scopes: ['data:read'] });

    expect(request).toHaveBeenCalledTimes(2);
  });

  it('accepts a reordered or narrowed scope grant and a lowercase token type', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(oauthResponse({ scope: 'data:write data:read' }))
      .mockResolvedValueOnce(oauthResponse({ scope: 'data:read' }))
      .mockResolvedValueOnce(oauthResponse({ token_type: 'bearer', scope: undefined }));
    const exchange = createExchange(request, { cache: false });

    await expect(exchange({ subjectToken, resource, scopes: ['data:read', 'data:write'] })).resolves.toMatchObject({
      scope: 'data:write data:read',
    });
    await expect(exchange({ subjectToken, resource, scopes: ['data:read', 'data:write'] })).resolves.toMatchObject({
      scope: 'data:read',
    });
    await expect(exchange({ subjectToken, resource, scopes: ['data:read'] })).resolves.not.toHaveProperty('scope');
  });

  it('rejects a broader grant, a malformed response and a failed request as unavailable', async () => {
    const telemetry = vi.fn();
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(oauthResponse({ scope: 'data:read data:write' }))
      .mockResolvedValueOnce(oauthResponse({ access_token: '' }))
      .mockResolvedValueOnce(new Response('not json'))
      .mockRejectedValueOnce(new TypeError('network unavailable'));
    const exchange = createExchange(request, { cache: false, telemetry });

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await expect(exchange({ subjectToken, resource, scopes: ['data:read'] })).rejects.toMatchObject({
        code: 'unavailable',
      });
    }
    expect(telemetry).toHaveBeenCalledTimes(4);
    expect(telemetry.mock.calls.every(([event]) => event.success === false && event.code === 'unavailable')).toBe(true);
    expect(JSON.stringify(telemetry.mock.calls)).not.toContain(subjectToken);
  });

  it.each([
    [400, 'rejected'],
    [401, 'unavailable'],
    [403, 'forbidden'],
    [404, 'unavailable'],
    [429, 'rate_limited'],
    [500, 'unavailable'],
  ] as const)('maps an HTTP %i response to %s', async (status, code) => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('{}', { status }));

    await expect(createExchange(request)({ subjectToken, resource })).rejects.toMatchObject({ code });
  });

  it('reports the token endpoint status to telemetry without the subject token', async () => {
    const telemetry = vi.fn();
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response('{}', { status: 429 }));

    await expect(createExchange(request, { telemetry })({ subjectToken, resource })).rejects.toMatchObject({
      code: 'rate_limited',
    });

    expect(telemetry).toHaveBeenCalledExactlyOnceWith({
      type: 'token_exchange',
      resource,
      durationMs: expect.any(Number),
      success: false,
      code: 'rate_limited',
      status: 429,
    });
  });

  it('rejects a relative resource or a resource with a fragment before any request', async () => {
    const request = vi.fn<typeof fetch>();
    const exchange = createExchange(request);

    await expect(exchange({ subjectToken, resource: '/relative' })).rejects.toMatchObject({ code: 'configuration' });
    await expect(exchange({ subjectToken, resource: `${resource}#fragment` })).rejects.toMatchObject({
      code: 'configuration',
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('fails loudly without client credentials', () => {
    expect(() => createTokenExchange({ tokenEndpoint, clientId: '', clientSecret: 'x' })).toThrow(ClerkMcpError);
  });
});
