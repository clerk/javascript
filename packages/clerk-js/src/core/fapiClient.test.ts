import type { Clerk } from '@clerk/types';

import { createFapiClient } from './fapiClient';

const mockedClerkInstance = {
  frontendApi: 'clerk.example.com',
  version: '42.0.0',
  session: {
    id: 'deadbeef',
  },
} as Clerk;

const fapiClient = createFapiClient(mockedClerkInstance);

const proxyUrl = 'https://clerk.com/api/__clerk';

const fapiClientWithProxy = createFapiClient({
  ...mockedClerkInstance,
  proxyUrl,
});

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// @ts-ignore
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
  // @ts-ignore
  delete window?.location;

  // @ts-ignore
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
  );

  window.Clerk = {
    // @ts-ignore
    session: {
      id: 'sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX',
    },
  };
});

beforeEach(() => {
  // @ts-ignore
  global.fetch.mockClear();
});

afterAll(() => {
  window.location = oldWindowLocation;
  delete window.Clerk;
});

describe('buildUrl(options)', () => {
  it('returns the full frontend API URL', () => {
    expect(fapiClient.buildUrl({ path: '/foo' }).href).toBe(
      'https://clerk.example.com/v1/foo?_clerk_js_version=42.0.0',
    );
  });

  it('returns the full frontend API URL using proxy url', () => {
    expect(fapiClientWithProxy.buildUrl({ path: '/foo' }).href).toBe(`${proxyUrl}/v1/foo?_clerk_js_version=42.0.0`);
  });

  it('adds _clerk_session_id as a query parameter if provided and path does not start with client', () => {
    expect(fapiClient.buildUrl({ path: '/foo', sessionId: 'sess_42' }).href).toBe(
      'https://clerk.example.com/v1/foo?_clerk_js_version=42.0.0&_clerk_session_id=sess_42',
    );
    expect(fapiClient.buildUrl({ path: '/client/foo', sessionId: 'sess_42' }).href).toBe(
      'https://clerk.example.com/v1/client/foo?_clerk_js_version=42.0.0',
    );
  });

  it('correctly parses search params', () => {
    expect(fapiClient.buildUrl({ path: '/foo', search: { test: '1' } }).href).toBe(
      'https://clerk.example.com/v1/foo?test=1&_clerk_js_version=42.0.0',
    );

    expect(fapiClient.buildUrl({ path: '/foo', search: 'test=2' }).href).toBe(
      'https://clerk.example.com/v1/foo?test=2&_clerk_js_version=42.0.0',
    );

    expect(
      fapiClient.buildUrl({
        path: '/foo',
        search: {
          array: ['item1', 'item2'],
        },
      }).href,
    ).toBe('https://clerk.example.com/v1/foo?array=item1&array=item2&_clerk_js_version=42.0.0');
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
      'https://clerk.example.com/v1/foo?_clerk_js_version=42.0.0&_clerk_session_id=deadbeef',
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
      `${proxyUrl}/v1/foo?_clerk_js_version=42.0.0&_clerk_session_id=deadbeef`,
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
        path: '/foo',
      }),
    );
  });

  it('returns array response as array', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce(
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
