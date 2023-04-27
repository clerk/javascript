import { getDevBrowserJWTFromURL, setDevBrowserJWTInURL } from '../devBrowser';

describe('setDevBrowserJWTInURL(url, jwt)', () => {
  const testCases: Array<[string, string, boolean, string]> = [
    ['', 'deadbeef', false, '#__clerk_db_jwt[deadbeef]'],
    ['foo', 'deadbeef', false, 'foo#__clerk_db_jwt[deadbeef]'],
    ['/foo', 'deadbeef', false, '/foo#__clerk_db_jwt[deadbeef]'],
    ['#foo', 'deadbeef', false, '#foo__clerk_db_jwt[deadbeef]'],
    ['/foo?bar=42#qux', 'deadbeef', false, '/foo?bar=42#qux__clerk_db_jwt[deadbeef]'],
    ['/foo#__clerk_db_jwt[deadbeef]', 'deadbeef', false, '/foo#__clerk_db_jwt[deadbeef]'],
    ['/foo?bar=42#qux__clerk_db_jwt[deadbeef]', 'deadbeef', false, '/foo?bar=42#qux__clerk_db_jwt[deadbeef]'],
    ['/foo', 'deadbeef', true, '/foo?__dev_session=deadbeef'],
    ['/foo?bar=42', 'deadbeef', true, '/foo?bar=42&__dev_session=deadbeef'],
  ];

  test.each(testCases)(
    'sets the dev browser JWT at the end of the provided url. Params: url=(%s), jwt=(%s), expected url=(%s)',
    (hash, paramName, asQueryParam, expectedUrl) => {
      expect(setDevBrowserJWTInURL(hash, paramName, asQueryParam)).toEqual(expectedUrl);
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

  it('does not replaceState if the url does not contain a dev browser JWT', () => {
    expect(getDevBrowserJWTFromURL('/foo')).toEqual('');
    expect(replaceStateMock).not.toHaveBeenCalled();
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
    if (calledWith === null) {
      expect(replaceStateMock).not.toHaveBeenCalled();
    } else {
      expect(replaceStateMock).toHaveBeenCalledWith(null, '', calledWith);
    }
  });
});
