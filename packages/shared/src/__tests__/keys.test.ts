import {
  buildPublishableKey,
  createDevOrStagingUrlCache,
  isDevelopmentFromApiKey,
  isLegacyFrontendApiKey,
  isProductionFromApiKey,
  isPublishableKey,
  parsePublishableKey,
} from '../keys';

describe('buildPublishableKey(key)', () => {
  const cases = [
    ['example.clerk.accounts.dev', 'pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk'],
    ['foo-bar-13.clerk.accounts.dev', 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk'],
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
  ];

  // @ts-ignore
  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expectedPublishableKey) => {
    // @ts-ignore
    const result = parsePublishableKey(publishableKeyStr);
    expect(result).toEqual(expectedPublishableKey);
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

describe('isLegacyFrontendApiKey(key)', () => {
  it('returns true if the key is a valid legacy frontend Api key', () => {
    expect(isLegacyFrontendApiKey('clerk.clerk.com')).toBe(true);
  });
  it('returns true if the key is not a valid legacy frontend Api key', () => {
    expect(isLegacyFrontendApiKey('pk_live_Y2xlcmsuY2xlcmsuZGV2JA==')).toBe(false);
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

describe('isDevelopmentFromApiKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['sk_live_Y2xlcmsuY2xlcmsuZGV2JA==', false],
    ['sk_test_Y2xlcmsuY2xlcmsuZGV2JA==', true],
    ['live_Y2xlcmsuY2xlcmsuZGV2JA==', false],
    ['test_Y2xlcmsuY2xlcmsuZGV2JA==', true],
  ];

  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expected) => {
    const result = isDevelopmentFromApiKey(publishableKeyStr);
    expect(result).toEqual(expected);
  });
});

describe('isProductionFromApiKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['sk_live_Y2xlcmsuY2xlcmsuZGV2JA==', true],
    ['sk_test_Y2xlcmsuY2xlcmsuZGV2JA==', false],
    ['live_Y2xlcmsuY2xlcmsuZGV2JA==', true],
    ['test_Y2xlcmsuY2xlcmsuZGV2JA==', false],
  ];

  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expected) => {
    const result = isProductionFromApiKey(publishableKeyStr);
    expect(result).toEqual(expected);
  });
});
