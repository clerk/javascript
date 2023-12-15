import { getDevBrowserJWTFromURL, setDevBrowserJWTInURL } from '../devBrowser';

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
  const replaceStateMock = jest.fn();

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

  it('does not replaceState if the url does not contain a dev browser JWT', () => {
    expect(getDevBrowserJWTFromURL(new URL('/foo', DUMMY_URL_BASE))).toEqual('');
    expect(replaceStateMock).not.toHaveBeenCalled();
  });

  const testCases: Array<[string, string, null | string]> = [
    ['', '', null],
    ['foo', '', null],
    ['?__clerk_db_jwt=deadbeef', 'deadbeef', ''],
    ['foo?__clerk_db_jwt=deadbeef', 'deadbeef', 'foo'],
    ['/foo?__clerk_db_jwt=deadbeef', 'deadbeef', '/foo'],
    ['?__clerk_db_jwt=deadbeef#foo', 'deadbeef', '#foo'],
    [
      '/foo?bar=42&__clerk_db_jwt=deadbeef#qux__clerk_db_jwt[deadbeef2]',
      'deadbeef',
      '/foo?bar=42#qux__clerk_db_jwt[deadbeef2]',
    ],
  ];

  test.each(testCases)(
    'returns the dev browser JWT from a url. Params: url=(%s), jwt=(%s)',
    (input, jwt, calledWith) => {
      expect(getDevBrowserJWTFromURL(new URL(input, DUMMY_URL_BASE))).toEqual(jwt);

      if (calledWith === null) {
        expect(replaceStateMock).not.toHaveBeenCalled();
      } else {
        expect(replaceStateMock).toHaveBeenCalledWith(null, '', new URL(calledWith, DUMMY_URL_BASE).href);
      }
    },
  );
});
