import { setDevBrowserJWTInURL } from '../devBrowser';

const DUMMY_URL_BASE = 'http://clerk-dummy';

describe('setDevBrowserJWTInURL(url, jwt)', () => {
  const testCases: Array<[string, string, boolean, string]> = [
    ['', 'deadbeef', false, '#__clerk_db_jwt[deadbeef]'],
    ['foo', 'deadbeef', false, 'foo#__clerk_db_jwt[deadbeef]'],
    ['/foo', 'deadbeef', false, '/foo#__clerk_db_jwt[deadbeef]'],
    ['#foo', 'deadbeef', false, '#foo__clerk_db_jwt[deadbeef]'],
    ['/foo?bar=42#qux', 'deadbeef', false, '/foo?bar=42#qux__clerk_db_jwt[deadbeef]'],
    ['/foo#__clerk_db_jwt[deadbeef]', 'deadbeef', false, '/foo#__clerk_db_jwt[deadbeef]'],
    ['/foo?bar=42#qux__clerk_db_jwt[deadbeef]', 'deadbeef', false, '/foo?bar=42#qux__clerk_db_jwt[deadbeef]'],
    ['/foo', 'deadbeef', true, '/foo?__dev_session=deadbeef&__clerk_db_jwt=deadbeef'],
    ['/foo?bar=42', 'deadbeef', true, '/foo?bar=42&__dev_session=deadbeef&__clerk_db_jwt=deadbeef'],
    [
      '/foo?bar=42&__clerk_db_jwt=deadbeef',
      'deadbeef',
      true,
      '/foo?bar=42&__dev_session=deadbeef&__clerk_db_jwt=deadbeef',
    ],
    [
      '/foo?bar=42&__dev_session=deadbeef',
      'deadbeef',
      true,
      '/foo?bar=42&__dev_session=deadbeef&__clerk_db_jwt=deadbeef',
    ],
  ];

  test.each(testCases)(
    'sets the dev browser JWT at the end of the provided url. Params: url=(%s), jwt=(%s), expected url=(%s)',
    (input, paramName, asQueryParam, expected) => {
      expect(setDevBrowserJWTInURL(new URL(input, DUMMY_URL_BASE), paramName, asQueryParam).href).toEqual(
        new URL(expected, DUMMY_URL_BASE).href,
      );
    },
  );
});
