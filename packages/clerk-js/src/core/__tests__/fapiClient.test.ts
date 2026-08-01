import type { InstanceType } from '@clerk/shared/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { SUPPORTED_FAPI_VERSION } from '../constants';
import { createFapiClient } from '../fapiClient';

const baseFapiClientOptions = {
  frontendApi: 'clerk.example.com',
  getSessionId() {
    return 'sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX';
  },
  instanceType: 'production' as InstanceType,
};

const fapiClient = createFapiClient(baseFapiClientOptions);

const proxyUrl = 'https://clerk.com/api/__clerk';

const fapiClientWithProxy = createFapiClient({
  ...baseFapiClientOptions,
  proxyUrl,
});

const proxyUrlWithTrailingSlash = 'https://clerk.com/api/__clerk/';

const fapiClientWithProxyTrailingSlash = createFapiClient({
  ...baseFapiClientOptions,
  proxyUrl: proxyUrlWithTrailingSlash,
});

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const originalFetch = global.fetch;

// @ts-ignore -- We don't need to fully satisfy the fetch types for the sake of this mock
global.fetch = vi.fn(() =>
  Promise.resolve<RecursivePartial<Response>>({
    headers: {
      get: vi.fn(() => 'sess_43'),
    },
    json: () => Promise.resolve({ foo: 42 }),
  }),
);

const oldWindowLocation = window.location;

beforeAll(() => {
  // @ts-expect-error -- "The operand of a delete operator must be optional"
  delete window?.location;

  window.location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(oldWindowLocation),
      href: {
        configurable: true,
        writable: true,
        value: 'http://test.host',
      },
    },
  ) as any;
});

beforeEach(() => {
  (global.fetch as Mock).mockClear();
});

afterAll(() => {
  window.location = oldWindowLocation as any;
  delete window.Clerk;
  global.fetch = originalFetch;
});

describe('buildUrl(options)', () => {
  it('returns the full frontend API URL', () => {
    expect(fapiClient.buildUrl({ path: '/foo' }).href).toBe(
      `https://clerk.example.com/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('returns the full frontend API URL using proxy url', () => {
    expect(fapiClientWithProxy.buildUrl({ path: '/foo' }).href).toBe(
      `${proxyUrl}/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('returns the correct URL when proxy URL has a trailing slash', () => {
    // The expected URL should NOT have double slashes after __clerk
    expect(fapiClientWithProxyTrailingSlash.buildUrl({ path: '/foo' }).href).toBe(
      `https://clerk.com/api/__clerk/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('handles complex paths correctly with proxy URL with trailing slash', () => {
    const path = '/client/sign_ins/sia_123/prepare_first_factor';
    expect(fapiClientWithProxyTrailingSlash.buildUrl({ path }).href).toBe(
      `https://clerk.com/api/__clerk/v1${path}?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('uses domain from options if production', () => {
    expect(
      createFapiClient({ ...baseFapiClientOptions, domain: 'clerk.other.com', instanceType: 'production' }).buildUrl({
        path: '/foo',
      }).href,
    ).toBe(`https://clerk.other.com/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`);
  });

  it('adds _clerk_session_id as a query parameter if provided and path does not start with client or waitlist', () => {
    expect(fapiClient.buildUrl({ path: '/foo', sessionId: 'sess_42' }).href).toBe(
      `https://clerk.example.com/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test&_clerk_session_id=sess_42`,
    );
    expect(fapiClient.buildUrl({ path: '/client/foo', sessionId: 'sess_42' }).href).toBe(
      `https://clerk.example.com/v1/client/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
    expect(fapiClient.buildUrl({ path: '/waitlist', sessionId: 'sess_42' }).href).toBe(
      `https://clerk.example.com/v1/waitlist?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('parses search params is an object with string values', () => {
    expect(fapiClient.buildUrl({ path: '/foo', search: { test: '1' } }).href).toBe(
      `https://clerk.example.com/v1/foo?test=1&__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('parses string search params ', () => {
    expect(fapiClient.buildUrl({ path: '/foo', search: 'test=2' }).href).toBe(
      `https://clerk.example.com/v1/foo?test=2&__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('parses search params when value contains invalid url symbols', () => {
    expect(fapiClient.buildUrl({ path: '/foo', search: { bar: 'test=2' } }).href).toBe(
      `https://clerk.example.com/v1/foo?bar=test%3D2&__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  it('parses search params when value is an array', () => {
    expect(
      fapiClient.buildUrl({
        path: '/foo',
        search: {
          array: ['item1', 'item2'],
        } as any,
      }).href,
    ).toBe(
      `https://clerk.example.com/v1/foo?array=item1&array=item2&__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  // The return value isn't as expected.
  // The buildUrl function converts an undefined value to the string 'undefined'
  // and includes it in the search parameters.
  it.skip('parses search params when value is undefined', () => {
    expect(
      fapiClient.buildUrl({
        path: '/foo',
        search: {
          array: ['item1', 'item2'],
          test: undefined,
        } as any,
      }).href,
    ).toBe(
      `https://clerk.example.com/v1/foo?array=item1&array=item2&__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
    );
  });

  const cases = [
    ['PUT', '_method=PUT'],
    ['PATCH', '_method=PATCH'],
    ['DELETE', '_method=DELETE'],
  ];

  it.each(cases)('adds _method as a query parameter when request method is %p', (method, result) => {
    expect(fapiClient.buildUrl({ path: '/foo', method }).href).toMatch(result);
  });
});

describe('request', () => {
  it('invokes global.fetch', async () => {
    await fapiClient.request({
      path: '/foo',
    });

    const fetchCall = (fetch as Mock).mock.calls[0];
    expect(fetchCall[0].toString()).toBe(
      `https://clerk.example.com/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test&_clerk_session_id=sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX`,
    );
    expect(fetchCall[1]).toMatchObject({
      credentials: 'include',
      method: 'GET',
    });
  });

  it('invokes global.fetch with proxy', async () => {
    await fapiClientWithProxy.request({
      path: '/foo',
    });

    const fetchCall = (fetch as Mock).mock.calls[0];
    expect(fetchCall[0].toString()).toBe(
      `${proxyUrl}/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test&_clerk_session_id=sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX`,
    );
    expect(fetchCall[1]).toMatchObject({
      credentials: 'include',
      method: 'GET',
    });
  });

  it('returns array response as array', async () => {
    (global.fetch as Mock).mockResolvedValueOnce(
      Promise.resolve<RecursivePartial<Response>>({
        headers: {
          get: vi.fn(() => 'sess_43'),
        },
        json: () => Promise.resolve([{ foo: 42 }]),
      }),
    );

    const resp = await fapiClientWithProxy.request({
      path: '/foo',
    });

    expect(Array.isArray(resp.payload)).toEqual(true);
  });

  it('handles the empty body on 204 response, returning null', async () => {
    (global.fetch as Mock).mockResolvedValueOnce(
      Promise.resolve<RecursivePartial<Response>>({
        status: 204,
        json: () => {
          throw new Error('json should not be called on 204 response');
        },
      }),
    );

    const resp = await fapiClient.request({
      path: '/foo',
    });

    expect(resp.payload).toEqual(null);
  });

  describe('for production instances', () => {
    it.todo('does not append the __clerk_db_jwt cookie value to the query string');
    it.todo('does not set the __clerk_db_jwt cookie from the response Clerk-Cookie header');
  });

  describe('for staging or development instances', () => {
    it.todo('appends the __clerk_db_jwt cookie value to the query string');
    it.todo('sets the __clerk_db_jwt cookie from the response Clerk-Cookie header');
  });

  describe('request body filtering', () => {
    it('filters out undefined values from request body objects', async () => {
      const requestBody = {
        definedValue: 'test',
        undefinedValue: undefined,
        nullValue: null,
        falseValue: false,
        zeroValue: 0,
        emptyString: '',
      } as any;

      await fapiClient.request({
        path: '/foo',
        method: 'POST',
        body: requestBody,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: 'defined_value=test&null_value=&false_value=false&zero_value=0&empty_string=',
        }),
      );
    });

    it('preserves FormData objects without filtering', async () => {
      const formData = new FormData();
      formData.append('key', 'value');
      formData.append('undefinedKey', 'undefined'); // FormData doesn't have undefined values

      await fapiClient.request({
        path: '/foo',
        method: 'POST',
        body: formData,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: formData,
        }),
      );
    });

    it('preserves non-object bodies without filtering', async () => {
      const stringBody = 'raw string body';

      await fapiClient.request({
        path: '/foo',
        method: 'POST',
        body: stringBody,
        headers: {
          'content-type': 'text/plain',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: stringBody,
        }),
      );
    });

    it('handles empty objects', async () => {
      await fapiClient.request({
        path: '/foo',
        method: 'POST',
        body: {} as any,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: '',
        }),
      );
    });

    it('handles objects with only undefined values', async () => {
      const requestBody = {
        undefinedValue1: undefined,
        undefinedValue2: undefined,
      } as any;

      await fapiClient.request({
        path: '/foo',
        method: 'POST',
        body: requestBody,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: '',
        }),
      );
    });

    it('does not perform deep filtering - preserves nested undefined values', async () => {
      const requestBody = {
        topLevel: 'value',
        topLevelUndefined: undefined,
        nested: {
          nestedDefined: 'nested value',
          nestedUndefined: undefined,
        },
      } as any;

      await fapiClient.request({
        path: '/foo',
        method: 'POST',
        body: requestBody,
      });

      // The nested object should be JSON stringified with undefined values preserved
      // Note: JSON.stringify removes undefined values, so we expect only the defined nested value
      const expectedNestedJson = JSON.stringify({
        nestedDefined: 'nested value',
      } as any);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: `top_level=value&nested=${encodeURIComponent(expectedNestedJson).replace(/%20/g, '+')}`,
        }),
      );
    });
  });

  describe('Protect params', () => {
    // A body param rather than a header, because a custom header would trigger a CORS
    // preflight — the same reason `_method` is a query param. These tests pin that the params
    // reach the encoded body, and reach nothing else.
    const protectParams = { __clerk_protect_assertion: 'token-abc' };
    const clientWithProtect = createFapiClient({
      ...baseFapiClientOptions,
      getProtectParams: () => Promise.resolve(protectParams),
    });

    it.each([
      ['/client/sign_ins'],
      ['/client/sign_ins/sia_123/attempt_first_factor'],
      ['/client/sign_ups'],
      ['/client/sign_ups/sua_123/attempt_verification'],
    ])('attaches them to POST %s', async path => {
      await clientWithProtect.request({ path, method: 'POST', body: { identifier: 'user@example.com' } as any });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: 'identifier=user%40example.com&__clerk_protect_assertion=token-abc',
        }),
      );
    });

    it('attaches them when the request has no body of its own', async () => {
      await clientWithProtect.request({ path: '/client/sign_ins', method: 'POST' });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({ body: '__clerk_protect_assertion=token-abc' }),
      );
    });

    // The param name survives the body's camelCase→snake_case key encoder untouched — it is
    // all lower-case, so there is nothing for that encoder to rewrite. If it ever did not
    // survive, the server would see an unknown param and reject the whole request.
    it('does not mangle the param name', async () => {
      await clientWithProtect.request({ path: '/client/sign_ins', method: 'POST' });

      const [, init] = (fetch as Mock).mock.calls.at(-1);
      expect(init.body).toBe('__clerk_protect_assertion=token-abc');
    });

    it.each([
      ['a GET', 'GET', '/client/sign_ins'],
      ['an unrelated path', 'POST', '/client/sessions'],
      ['a path that merely shares a prefix', 'POST', '/client/sign_ins_other'],
    ])('does not attach them to %s', async (_label, method, path) => {
      await clientWithProtect.request({ path, method: method as any, body: { a: 'b' } as any });

      const [, init] = (fetch as Mock).mock.calls.at(-1);
      expect(init.body ?? '').not.toContain('__clerk_protect_assertion');
    });

    // Spreading a FormData would discard the caller's payload rather than add to it, so a body
    // that is not a plain object is left completely alone.
    it('leaves a FormData body untouched', async () => {
      const formData = new FormData();
      formData.append('identifier', 'user@example.com');

      await clientWithProtect.request({ path: '/client/sign_ins', method: 'POST', body: formData });

      expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ body: formData }));
    });

    it('leaves a string body untouched', async () => {
      // text/plain so the form-urlencoded encoder stays out of it; the point here is that the
      // merge does not touch a body it cannot safely spread.
      await clientWithProtect.request({
        path: '/client/sign_ins',
        method: 'POST',
        body: 'raw string body',
        headers: { 'content-type': 'text/plain' },
      });

      expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ body: 'raw string body' }));
    });

    // Protect may influence a sign-in but must never fail one.
    it('sends the request unchanged when resolving the params rejects', async () => {
      const failing = createFapiClient({
        ...baseFapiClientOptions,
        getProtectParams: () => Promise.reject(new Error('boom')),
      });

      await expect(
        failing.request({ path: '/client/sign_ins', method: 'POST', body: { identifier: 'a' } as any }),
      ).resolves.toBeTruthy();

      expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ body: 'identifier=a' }));
    });

    it('sends the request unchanged when there are no params', async () => {
      const none = createFapiClient({
        ...baseFapiClientOptions,
        getProtectParams: () => Promise.resolve(undefined),
      });

      await none.request({ path: '/client/sign_ins', method: 'POST', body: { identifier: 'a' } as any });

      expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ body: 'identifier=a' }));
    });

    // Every client built before this existed passes no hook at all; it must behave exactly as
    // it did.
    it('is inert when no hook is configured', async () => {
      await fapiClient.request({ path: '/client/sign_ins', method: 'POST', body: { identifier: 'a' } as any });

      expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ body: 'identifier=a' }));
    });
  });

  describe('retry logic', () => {
    it('does not send retry query parameter on initial request', async () => {
      await fapiClient.request({
        path: '/foo',
      });

      expect(fetch).toHaveBeenCalledWith(expect.not.stringMatching(/_clerk_retry_attempt=/), expect.any(Object));
    });

    it('sends retry query parameter on retry attempts', async () => {
      let callCount = 0;
      (global.fetch as Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve<RecursivePartial<Response>>({
          headers: {
            get: vi.fn(() => 'sess_43'),
          },
          json: () => Promise.resolve({ foo: 42 }),
        });
      });

      await fapiClient.request({
        path: '/foo',
        method: 'GET',
      });

      const secondCall = (fetch as Mock).mock.calls[1];
      expect(secondCall[0].toString()).toMatch(/_clerk_retry_attempt=1/);
    });

    it('increments retry query parameter on multiple retry attempts', async () => {
      let callCount = 0;
      (global.fetch as Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve<RecursivePartial<Response>>({
          headers: {
            get: vi.fn(() => 'sess_43'),
          },
          json: () => Promise.resolve({ foo: 42 }),
        });
      });

      await fapiClient.request({
        path: '/foo',
        method: 'GET',
      });

      const secondCall = (fetch as Mock).mock.calls[1];
      expect(secondCall[0].toString()).toMatch(/_clerk_retry_attempt=2/);

      const thirdCall = (fetch as Mock).mock.calls[2];
      expect(thirdCall[0].toString()).toMatch(/_clerk_retry_attempt=2/);
    });
  });
});
