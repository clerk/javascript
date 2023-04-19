import { getDevBrowserJWTFromURL, setDevBrowserJWTInURL } from '../devBrowser';

describe('setDevBrowserJWTInURL(url, jwt)', () => {
  const testCases: Array<[string, string, string]> = [
    ['', 'deadbeef', '#__clerk_db_jwt[deadbeef]'],
    ['foo', 'deadbeef', 'foo#__clerk_db_jwt[deadbeef]'],
    ['/foo', 'deadbeef', '/foo#__clerk_db_jwt[deadbeef]'],
    ['#foo', 'deadbeef', '#foo__clerk_db_jwt[deadbeef]'],
    ['/foo?bar=42#qux', 'deadbeef', '/foo?bar=42#qux__clerk_db_jwt[deadbeef]'],
    ['/foo#__clerk_db_jwt[deadbeef]', 'deadbeef', '/foo#__clerk_db_jwt[deadbeef]'],
    ['/foo?bar=42#qux__clerk_db_jwt[deadbeef]', 'deadbeef', '/foo?bar=42#qux__clerk_db_jwt[deadbeef]'],
  ];

  test.each(testCases)(
    'sets the dev browser JWT at the end of the provided url. Params: url=(%s), jwt=(%s), expected url=(%s)',
    (hash, paramName, expectedUrl) => {
      expect(setDevBrowserJWTInURL(hash, paramName)).toEqual(expectedUrl);
    },
  );
});

const oldHistory = globalThis.history;

describe('getDevBrowserJWTFromURL(url,)', () => {
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

  const testCases: Array<[string, string, null | string]> = [
    ['', '', null],
    ['foo', '', null],
    ['#__clerk_db_jwt[deadbeef]', 'deadbeef', ''],
    ['foo#__clerk_db_jwt[deadbeef]', 'deadbeef', 'foo'],
    ['/foo#__clerk_db_jwt[deadbeef]', 'deadbeef', '/foo'],
    ['#foo__clerk_db_jwt[deadbeef]', 'deadbeef', '#foo'],
    ['/foo?bar=42#qux__clerk_db_jwt[deadbeef]', 'deadbeef', '/foo?bar=42#qux'],
  ];
  test.each(testCases)('returns the dev browser JWT from a url. Params: url=(%s), jwt=(%s)', (url, jwt, calledWith) => {
    expect(getDevBrowserJWTFromURL(url)).toEqual(jwt);
    calledWith && expect(replaceStateMock).toHaveBeenCalledWith(null, '', calledWith);
  });
});
