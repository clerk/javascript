import { setDevBrowserJWTInURL } from '../devBrowser';

const DUMMY_URL_BASE = 'https://www.clerk.com';

describe('setDevBrowserJWTInURL(url, jwt)', () => {
  const testCases: Array<[string, string]> = [
    ['', '/?__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    ['/foo', 'foo?__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    ['/foo', '/foo?__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    ['#foo', '?__dev_session=token&__clerk_db_jwt=token#foo__clerk_db_jwt[token]'],
    ['/foo?bar=42#qux', '/foo?bar=42&__dev_session=token&__clerk_db_jwt=token#qux__clerk_db_jwt[token]'],
    ['/foo#__clerk_db_jwt[token]', '/foo?__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    [
      '/foo?bar=42#qux__clerk_db_jwt[token]',
      '/foo?bar=42&__dev_session=token&__clerk_db_jwt=token#qux__clerk_db_jwt[token]',
    ],
    ['/foo', '/foo?__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    ['/foo?bar=42', '/foo?bar=42&__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    ['/foo?bar=42&__clerk_db_jwt=token', '/foo?bar=42&__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
    ['/foo?bar=42&__dev_session=token', '/foo?bar=42&__dev_session=token&__clerk_db_jwt=token#__clerk_db_jwt[token]'],
  ];

  test.each(testCases)(
    'sets the dev browser JWT at the end of the provided url. Params: url=(%s), jwt=(%s), expected url=(%s)',
    (input, expected) => {
      expect(setDevBrowserJWTInURL(new URL(input, DUMMY_URL_BASE), 'token').href).toEqual(
        new URL(expected, DUMMY_URL_BASE).href,
      );
    },
  );
});
