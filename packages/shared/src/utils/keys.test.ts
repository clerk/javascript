import { buildPublishableKey, isLegacyFrontendApiKey, isPublishableKey, parsePublishableKey } from './keys';

describe.concurrent('buildPublishableKey(key)', () => {
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

describe.concurrent('parsePublishableKey(key)', () => {
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

  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expectedPublishableKey) => {
    const result = parsePublishableKey(publishableKeyStr);
    expect(result).toEqual(expectedPublishableKey);
  });
});

describe.concurrent('isPublishableKey(key)', () => {
  it('returns true if the key is a valid publishable key', () => {
    expect(isPublishableKey('pk_live_Y2xlcmsuY2xlcmsuZGV2JA==')).toBe(true);
  });

  it('returns false if the key is not a valid publishable key', () => {
    expect(isPublishableKey('clerk.clerk.dev')).toBe(false);
  });
});

describe.concurrent('isLegacyFrontendApiKey(key)', () => {
  it('returns true if the key is a valid legacy frontend Api key', () => {
    expect(isLegacyFrontendApiKey('clerk.clerk.dev')).toBe(true);
  });
  it('returns true if the key is not a valid legacy frontend Api key', () => {
    expect(isLegacyFrontendApiKey('pk_live_Y2xlcmsuY2xlcmsuZGV2JA==')).toBe(false);
  });
});
