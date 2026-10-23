import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { ClerkAPIResponseError } from '../errors';
import { createClerkClient } from '../index';
import { server } from '../mock-server';
import { runtime } from '../runtime';

const metadata = {
  protocol_version: '0.2',
  organization: { name: 'C1', domain: 'c1.example' },
};
const publishableKey = (host: string, mode = 'test') => `pk_${mode}_${btoa(`${host}$`)}`;
const endpoint = 'https://example.clerk.accounts.dev/.well-known/poppy.json';

afterEach(() => vi.restoreAllMocks());

describe('clerkClient.__experimental_getPoppyMetadata', () => {
  it('returns an unknown response type', () => {
    const client = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });

    expectTypeOf(client.__experimental_getPoppyMetadata).returns.toEqualTypeOf<Promise<unknown>>();
  });

  it.each([
    { name: 'development', host: 'example.clerk.accounts.dev', mode: 'test' },
    { name: 'production', host: 'clerk.c1.example', mode: 'live' },
  ])('fetches the $name instance without a secret key', async ({ host, mode }) => {
    server.use(http.get(`https://${host}/.well-known/poppy.json`, () => HttpResponse.json(metadata)));

    const client = createClerkClient({ publishableKey: publishableKey(host, mode) });

    await expect(client.__experimental_getPoppyMetadata()).resolves.toEqual(metadata);
  });

  it('uses only the publishable key host and sends no credentials', async () => {
    const fetchSpy = vi.spyOn(runtime, 'fetch');
    server.use(
      http.get(endpoint, ({ request }) => {
        expect(request.headers.get('accept')).toBe('application/json');
        expect(request.headers.get('authorization')).toBeNull();
        expect(request.headers.get('cookie')).toBeNull();
        expect(request.credentials).toBe('omit');
        expect(request.redirect).toBe('error');
        expect(request.cache).toBe('no-store');
        return HttpResponse.json(metadata);
      }),
    );
    const client = createClerkClient({
      publishableKey: publishableKey('example.clerk.accounts.dev'),
      secretKey: 'sk_test_example',
      apiUrl: 'https://backend.example',
      proxyUrl: 'https://proxy.example',
      domain: 'satellite.example',
      isSatellite: true,
    });

    await expect(client.__experimental_getPoppyMetadata()).resolves.toEqual(metadata);
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(new URL(endpoint), {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
    });
  });

  it('preserves future fields and fetches each document without a cache', async () => {
    const futureMetadata = {
      ...metadata,
      protocol_version: '0.3',
      organization: { ...metadata.organization, future_field: 'value' },
      future_capability: { nested_field: ['one', 'two'] },
    };
    let requests = 0;
    server.use(
      http.get(endpoint, () => {
        requests++;
        return HttpResponse.json(futureMetadata);
      }),
    );
    const client = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });

    await expect(client.__experimental_getPoppyMetadata()).resolves.toEqual(futureMetadata);
    await expect(client.__experimental_getPoppyMetadata()).resolves.toEqual(futureMetadata);
    expect(requests).toBe(2);
  });

  it('keeps independently configured clients separate', async () => {
    server.use(
      http.get(endpoint, () => HttpResponse.json(metadata)),
      http.get('https://clerk.other.example/.well-known/poppy.json', () =>
        HttpResponse.json({ ...metadata, organization: { name: 'Other', domain: 'other.example' } }),
      ),
    );
    const first = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });
    const second = createClerkClient({ publishableKey: publishableKey('clerk.other.example', 'live') });

    await expect(first.__experimental_getPoppyMetadata()).resolves.toEqual(metadata);
    await expect(second.__experimental_getPoppyMetadata()).resolves.toMatchObject({
      organization: { domain: 'other.example' },
    });
  });

  it.each([
    { name: 'missing key', key: undefined },
    { name: 'invalid key', key: 'invalid' },
    ...[
      'user@example.com',
      'example.com/path',
      'example.com?query',
      'example.com#fragment',
      'example.com:443',
      'https://example.com',
      'example.com\\path',
      'example.com\n',
    ].map(host => ({ name: host, key: publishableKey(host) })),
  ])('rejects $name before fetching', async ({ key }) => {
    const fetchSpy = vi.spyOn(runtime, 'fetch');
    const client = createClerkClient({ publishableKey: key });

    await expect(client.__experimental_getPoppyMetadata()).rejects.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([404, 500])('preserves HTTP %s and standard Clerk errors without retrying', async status => {
    let requests = 0;
    server.use(
      http.get(endpoint, () => {
        requests++;
        return HttpResponse.json(
          {
            errors: [{ code: 'not_available', message: 'Not available', long_message: 'Try later' }],
            clerk_trace_id: 'trace',
          },
          { status },
        );
      }),
    );
    const client = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });

    const error = await client.__experimental_getPoppyMetadata().catch(error => error);
    expect(error).toBeInstanceOf(ClerkAPIResponseError);
    expect(error).toMatchObject({
      status,
      clerkTraceId: 'trace',
      errors: [{ code: 'not_available', message: 'Not available', longMessage: 'Try later' }],
    });
    expect(requests).toBe(1);
  });

  it.each([
    { name: 'HTML', response: () => new HttpResponse('<html>Error</html>', { status: 500 }) },
    {
      name: 'malformed error data',
      response: () => HttpResponse.json({ errors: [null, {}, 'error'] }, { status: 500 }),
    },
  ])('preserves status for $name error responses', async ({ response }) => {
    server.use(http.get(endpoint, response));
    const client = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });

    await expect(client.__experimental_getPoppyMetadata()).rejects.toMatchObject({ status: 500, errors: [] });
  });

  it.each([
    null,
    [],
    {},
    'metadata',
    42,
    true,
    { ...metadata, protocol_version: 2 },
    { ...metadata, organization: null },
    { ...metadata, organization: { name: 'C1' } },
    { ...metadata, organization: { name: 1, domain: 'c1.example' } },
  ])('returns JSON %j unchanged', async body => {
    server.use(http.get(endpoint, () => HttpResponse.json(body)));
    const client = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });

    await expect(client.__experimental_getPoppyMetadata()).resolves.toEqual(body);
  });

  it.each([
    { name: 'invalid JSON', response: () => new HttpResponse('not json') },
    { name: 'network failure', response: () => HttpResponse.error() },
    { name: 'redirect', response: () => HttpResponse.redirect('https://other.example/poppy.json') },
  ])('rejects $name', async ({ response }) => {
    server.use(http.get(endpoint, response));
    const client = createClerkClient({ publishableKey: publishableKey('example.clerk.accounts.dev') });

    await expect(client.__experimental_getPoppyMetadata()).rejects.toThrow();
  });
});
