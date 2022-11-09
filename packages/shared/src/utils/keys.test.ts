import { isLegacyFrontendApiKey, isPublishableKey, parsePublishableKey } from './keys';

describe.concurrent('parsePublishableKey(key)', () => {
  const cases = [
    [null, null],
    [undefined, null],
    ['', null],
    ['whatever', null],
    ['pk_live_Y2xlcmsuY2xlcmsuZGV2JA==', { instanceType: 'production', frontendApi: 'clerk.clerk.dev' }],
    ['pk_test_Y2xlcmsuY2xlcmsuZGV2JA==', { instanceType: 'development', frontendApi: 'clerk.clerk.dev' }],
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
