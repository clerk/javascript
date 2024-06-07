import {
  buildPublishableKey,
  createDevOrStagingUrlCache,
  getCookieSuffix,
  isDevelopmentFromPublishableKey,
  isDevelopmentFromSecretKey,
  isProductionFromPublishableKey,
  isProductionFromSecretKey,
  isPublishableKey,
  parsePublishableKey,
} from '../keys';

describe('buildPublishableKey(frontendApi)', () => {
  const cases = [
    ['example.clerk.accounts.dev', 'pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk'],
    ['foo-bar-13.clerk.accounts.dev', 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk'],
    ['clerk.boring.sawfly-91.lcl.dev', 'pk_test_Y2xlcmsuYm9yaW5nLnNhd2ZseS05MS5sY2wuZGV2JA=='],
    ['clerk.boring.sawfly-91.lclclerk.com', 'pk_test_Y2xlcmsuYm9yaW5nLnNhd2ZseS05MS5sY2xjbGVyay5jb20k'],
  ];

  test.each(cases)(
    'given %p as a frontend api, returns publishable key %p',
    (frontendApi, expectedPublishableKeyStr) => {
      const result = buildPublishableKey(frontendApi);
      expect(result).toEqual(expectedPublishableKeyStr);
    },
  );
});

describe('parsePublishableKey(key)', () => {
  const cases = [
    [null, null],
    [undefined, null],
    ['', null],
    ['whatever', null],
    [
      'pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk',
      { instanceType: 'production', frontendApi: 'example.clerk.accounts.dev' },
    ],
    [
      'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk',
      { instanceType: 'development', frontendApi: 'foo-bar-13.clerk.accounts.dev' },
    ],
    [
      'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk',
      { instanceType: 'development', frontendApi: 'foo-bar-13.clerk.accounts.dev' },
    ],
  ];

  // @ts-ignore
  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expectedPublishableKey) => {
    // @ts-ignore
    const result = parsePublishableKey(publishableKeyStr);
    expect(result).toEqual(expectedPublishableKey);
  });

  it('throws an error if the key is not a valid publishable key, when fatal: true', () => {
    expect(() => parsePublishableKey('fake_pk', { fatal: true })).toThrowError('Publishable key not valid.');
  });

  it('applies the proxyUrl if provided', () => {
    expect(parsePublishableKey('pk_live_Y2xlcmsuY2xlcmsuZGV2JA==', { proxyUrl: 'example.com/__clerk' })).toEqual({
      frontendApi: 'example.com/__clerk',
      instanceType: 'production',
    });
  });

  it('applies the domain if provided for production keys', () => {
    expect(parsePublishableKey('pk_live_Y2xlcmsuY2xlcmsuZGV2JA==', { domain: 'example.com' })).toEqual({
      frontendApi: 'clerk.example.com',
      instanceType: 'production',
    });
  });
});

describe('isPublishableKey(key)', () => {
  it('returns true if the key is a valid publishable key', () => {
    expect(isPublishableKey('pk_live_Y2xlcmsuY2xlcmsuZGV2JA==')).toBe(true);
  });

  it('returns false if the key is not a valid publishable key', () => {
    expect(isPublishableKey('clerk.clerk.com')).toBe(false);
  });
});

describe('isDevOrStagingUrl(url)', () => {
  const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

  const goodUrls: Array<[string | URL, boolean]> = [
    ['https://www.google.com', false],
    ['https://www.clerk.com', false],
    ['https://www.lclclerk.com', false],
    ['clerk.prod.lclclerk.com', false],
    ['something.dev.lclclerk.com', true],
    ['something.lcl.dev', true],
    ['https://www.something.stg.lclclerk.com', true],
    [new URL('https://www.lclclerk.com'), false],
    [new URL('https://www.something.stg.lclclerk.com'), true],
    [new URL('https://www.something.stg.lclclerk.com:4000'), true],
  ];

  const badUrls: Array<[string | null, boolean]> = [
    ['', false],
    [null, false],
  ];

  test.each([...goodUrls, ...badUrls])('.isDevOrStagingUrl(%s)', (a, expected) => {
    // @ts-ignore
    expect(isDevOrStagingUrl(a)).toBe(expected);
  });
});

describe('isDevelopmentFromPublishableKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk', false],
    ['pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', true],
    ['live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk', false],
    ['test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', true],
  ];

  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expected) => {
    const result = isDevelopmentFromPublishableKey(publishableKeyStr);
    expect(result).toEqual(expected);
  });
});

describe('isProductionFromPublishableKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk', true],
    ['pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', false],
    ['live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk', true],
    ['test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', false],
  ];

  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expected) => {
    const result = isProductionFromPublishableKey(publishableKeyStr);
    expect(result).toEqual(expected);
  });
});

describe('isDevelopmentFromSecretKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['sk_live_Y2xlcmsuY2xlcmsuZGV2JA==', false],
    ['sk_test_Y2xlcmsuY2xlcmsuZGV2JA==', true],
    ['live_Y2xlcmsuY2xlcmsuZGV2JA==', false],
    ['test_Y2xlcmsuY2xlcmsuZGV2JA==', true],
  ];

  test.each(cases)('given %p as a secret key string, returns %p', (secretKeyStr, expected) => {
    const result = isDevelopmentFromSecretKey(secretKeyStr);
    expect(result).toEqual(expected);
  });
});

describe('isProductionFromSecretKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['sk_live_Y2xlcmsuY2xlcmsuZGV2JA==', true],
    ['sk_test_Y2xlcmsuY2xlcmsuZGV2JA==', false],
    ['live_Y2xlcmsuY2xlcmsuZGV2JA==', true],
    ['test_Y2xlcmsuY2xlcmsuZGV2JA==', false],
  ];

  test.each(cases)('given %p as a secret key string, returns %p', (secretKeyStr, expected) => {
    const result = isProductionFromSecretKey(secretKeyStr);
    expect(result).toEqual(expected);
  });
});

describe('getCookieSuffix(publishableKey)', () => {
  const cases: Array<[string, string]> = [
    ['pk_live_Y2xlcmsuY2xlcmsuZGV2JA', '1Z8AzTQD'],
    ['pk_test_Y2xlcmsuY2xlcmsuZGV2JA', 'QvfNY2dr'],
  ];

  test.each(cases)('given %p pk, returns %p cookie suffix', async (pk, expected) => {
    expect(await getCookieSuffix(pk)).toEqual(expected);
  });

  test('omits special characters from the cookie suffix', async () => {
    const pk = 'pk_test_ZW5vdWdoLWFscGFjYS04Mi5jbGVyay5hY2NvdW50cy5sY2xjbGVyay5jb20k';
    expect(await getCookieSuffix(pk)).toEqual('jtYvyt_H');

    const pk2 = 'pk_test_eHh4eHh4LXhhYWFhYS1hYS5jbGVyay5hY2NvdW50cy5sY2xjbGVyay5jb20k';
    expect(await getCookieSuffix(pk2)).toEqual('tZJdb-5s');
  });
});
