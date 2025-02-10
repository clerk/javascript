import type { InstanceType } from '@clerk/types';

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

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// @ts-ignore -- We don't need to fully satisfy the fetch types for the sake of this mock
global.fetch = jest.fn(() =>
  Promise.resolve<RecursivePartial<Response>>({
    headers: {
      get: jest.fn(() => 'sess_43'),
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
  ) as Location;
});

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
});

afterAll(() => {
  window.location = oldWindowLocation;
  delete window.Clerk;
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
        },
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
        },
      }).href,
    ).toBe('https://clerk.example.com/v1/foo?array=item1&array=item2&_clerk_js_version=test');
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

    expect(fetch).toHaveBeenCalledWith(
      `https://clerk.example.com/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test&_clerk_session_id=sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX`,
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
        path: '/foo',
      }),
    );
  });

  it('invokes global.fetch with proxy', async () => {
    await fapiClientWithProxy.request({
      path: '/foo',
    });

    expect(fetch).toHaveBeenCalledWith(
      `${proxyUrl}/v1/foo?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test&_clerk_session_id=sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX`,
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
        path: '/foo',
      }),
    );
  });

  it('returns array response as array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      Promise.resolve<RecursivePartial<Response>>({
        headers: {
          get: jest.fn(() => 'sess_43'),
        },
        json: () => Promise.resolve([{ foo: 42 }]),
      }),
    );

    const resp = await fapiClientWithProxy.request({
      path: '/foo',
    });

    expect(Array.isArray(resp.payload)).toEqual(true);
  });

  describe('for production instances', () => {
    it.todo('does not append the __clerk_db_jwt cookie value to the query string');
    it.todo('does not set the __clerk_db_jwt cookie from the response Clerk-Cookie header');
  });

  describe('for staging or development instances', () => {
    it.todo('appends the __clerk_db_jwt cookie value to the query string');
    it.todo('sets the __clerk_db_jwt cookie from the response Clerk-Cookie header');
  });
});
