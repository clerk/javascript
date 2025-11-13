import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { extractDevBrowserJWTFromURL, setDevBrowserJWTInURL } from '../devBrowser';

const DUMMY_URL_BASE = 'http://clerk-dummy';

describe('setDevBrowserJWTInURL(url, jwt)', () => {
  const testCases: Array<[string, string, string]> = [
    ['', 'deadbeef', '?__clerk_db_jwt=deadbeef'],
    ['foo', 'deadbeef', 'foo?__clerk_db_jwt=deadbeef'],
    ['/foo', 'deadbeef', '/foo?__clerk_db_jwt=deadbeef'],
    ['#foo', 'deadbeef', '?__clerk_db_jwt=deadbeef#foo'],
    ['/foo?bar=42#qux', 'deadbeef', '/foo?bar=42&__clerk_db_jwt=deadbeef#qux'],
    ['/foo#__clerk_db_jwt[deadbeef2]', 'deadbeef', '/foo?__clerk_db_jwt=deadbeef#__clerk_db_jwt[deadbeef2]'],
    [
      '/foo?bar=42#qux__clerk_db_jwt[deadbeef2]',
      'deadbeef',
      '/foo?bar=42&__clerk_db_jwt=deadbeef#qux__clerk_db_jwt[deadbeef2]',
    ],
    ['/foo', 'deadbeef', '/foo?__clerk_db_jwt=deadbeef'],
    ['/foo?bar=42', 'deadbeef', '/foo?bar=42&__clerk_db_jwt=deadbeef'],
  ];

  test.each(testCases)(
    'sets the dev browser JWT at the end of the provided url. Params: url=(%s), jwt=(%s), expected url=(%s)',
    (input, paramName, expected) => {
      expect(setDevBrowserJWTInURL(new URL(input, DUMMY_URL_BASE), paramName).href).toEqual(
        new URL(expected, DUMMY_URL_BASE).href,
      );
    },
  );
});

const oldHistory = globalThis.history;

describe('getDevBrowserJWTFromURL(url)', () => {
  const replaceStateMock = vi.fn();

  beforeEach(() => {
    const mockHistory = {
      replaceState: replaceStateMock,
    } as any;

    Object.defineProperty(globalThis, 'history', { value: mockHistory });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'history', {
      value: oldHistory,
    });
    replaceStateMock.mockReset();
  });

  it('it calls replaceState and clears the url if it contains any devBrowser related token', () => {
    expect(extractDevBrowserJWTFromURL(new URL('/foo?__clerk_db_jwt=token', DUMMY_URL_BASE))).toEqual('token');
    expect(replaceStateMock).toHaveBeenCalled();
  });

  it('it does not call replaceState if the clean url is the same as the current url', () => {
    expect(extractDevBrowserJWTFromURL(new URL('/foo?__otherParam=hello', DUMMY_URL_BASE))).toEqual('');
    expect(replaceStateMock).not.toHaveBeenCalled();
  });

  const testCases: Array<[string, string]> = [
    ['', ''],
    ['foo', ''],
    ['?__clerk_db_jwt=token', 'token'],
    ['foo?__clerk_db_jwt=token', 'token'],
    ['/foo?__clerk_db_jwt=token', 'token'],
    ['?__clerk_db_jwt=token#foo', 'token'],
    ['/foo?bar=42&__clerk_db_jwt=token#qux__clerk_db_jwt[token2]', 'token'],
  ];

  test.each(testCases)(
    'returns the dev browser JWT from a url and cleans all dev . Params: url=(%s), jwt=(%s)',
    (input, jwt) => {
      expect(extractDevBrowserJWTFromURL(new URL(input, DUMMY_URL_BASE))).toEqual(jwt);
    },
  );
});
