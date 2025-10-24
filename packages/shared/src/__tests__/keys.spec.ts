import { describe, expect, it, test } from 'vitest';

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
    ['fake-clerk-test.clerk.accounts.dev', 'pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ='],
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
      'pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=',
      { instanceType: 'production', frontendApi: 'fake-clerk-test.clerk.accounts.dev' },
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

  it('returns null for keys with extra characters after $', () => {
    expect(parsePublishableKey('pk_live_ZmFrZS1jbGVyay1tYWxmb3JtZWQuY2xlcmsuYWNjb3VudHMuZGV2JGV4dHJh')).toBeNull();
  });

  it('throws an error for keys with extra characters after $ when fatal: true', () => {
    expect(() =>
      parsePublishableKey('pk_live_ZmFrZS1jbGVyay1tYWxmb3JtZWQuY2xlcmsuYWNjb3VudHMuZGV2JGV4dHJh', { fatal: true }),
    ).toThrowError('Publishable key not valid.');
  });

  it('returns null for keys with multiple $ characters', () => {
    expect(parsePublishableKey('pk_live_ZmFrZS1jbGVyay1tdWx0aXBsZS5jbGVyay5hY2NvdW50cy5kZXYkJA==')).toBeNull();
  });

  it('returns null for keys without proper domain format', () => {
    expect(parsePublishableKey('pk_live_aW52YWxpZGtleSQ=')).toBeNull();
  });

  it('throws an error if the key cannot be decoded when fatal: true', () => {
    expect(() => parsePublishableKey('pk_live_invalid!@#$', { fatal: true })).toThrowError(
      'Publishable key not valid.',
    );
  });

  it('throws an error if the key is not a valid publishable key, when fatal: true', () => {
    expect(() => parsePublishableKey('fake_pk', { fatal: true })).toThrowError('Publishable key not valid.');
  });

  it('throws an error if the publishable key is missing, when fatal: true', () => {
    expect(() => parsePublishableKey(undefined, { fatal: true })).toThrowError(
      'Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys',
    );
  });

  it('applies the proxyUrl if provided', () => {
    expect(
      parsePublishableKey('pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', {
        proxyUrl: 'example.com/__clerk',
      }),
    ).toEqual({
      frontendApi: 'example.com/__clerk',
      instanceType: 'production',
    });
  });

  it('applies the domain if provided for production keys and isSatellite is true', () => {
    expect(
      parsePublishableKey('pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', {
        domain: 'example.com',
        isSatellite: true,
      }),
    ).toEqual({
      frontendApi: 'clerk.example.com',
      instanceType: 'production',
    });
  });

  it('ignores domain for production keys when isSatellite is false', () => {
    expect(
      parsePublishableKey('pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', {
        domain: 'example.com',
        isSatellite: false,
      }),
    ).toEqual({
      frontendApi: 'fake-clerk-test.clerk.accounts.dev',
      instanceType: 'production',
    });
  });

  it('ignores domain for development keys even when isSatellite is true', () => {
    expect(
      parsePublishableKey('pk_test_Y2xlcmsuY2xlcmsuZGV2JA==', { domain: 'example.com', isSatellite: true }),
    ).toEqual({
      frontendApi: 'clerk.clerk.dev',
      instanceType: 'development',
    });
  });
});

describe('isPublishableKey(key)', () => {
  it('returns true if the key is a valid publishable key', () => {
    expect(isPublishableKey('pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=')).toBe(true);
    expect(isPublishableKey('pk_test_Y2xlcmsuY2xlcmsuZGV2JA==')).toBe(true);
  });

  it('returns false if the key is not a valid publishable key', () => {
    expect(isPublishableKey('clerk.clerk.com')).toBe(false);
  });

  it('returns false if the key has invalid structure', () => {
    expect(isPublishableKey('pk_live')).toBe(false);
    expect(isPublishableKey('pk_live_')).toBe(false);
    expect(isPublishableKey('pk_live_invalid')).toBe(false);
  });

  it('returns false if the decoded key has extra characters after $', () => {
    expect(isPublishableKey('pk_live_ZmFrZS1jbGVyay1tYWxmb3JtZWQuY2xlcmsuYWNjb3VudHMuZGV2JGV4dHJh')).toBe(false);
    expect(isPublishableKey('pk_test_Y2xlcmsuY2xlcmsuZGV2JGV4dHJh')).toBe(false);
  });

  it('returns false if the decoded key has multiple $ characters', () => {
    expect(isPublishableKey('pk_live_ZmFrZS1jbGVyay1tdWx0aXBsZS5jbGVyay5hY2NvdW50cy5kZXYkJA==')).toBe(false);
    expect(isPublishableKey('pk_live_JGZha2UtY2xlcmstcHJlZml4LmNsZXJrLmFjY291bnRzLmRldiQ=')).toBe(false);
  });

  it('returns false if the decoded key does not look like a domain', () => {
    expect(isPublishableKey('pk_live_aW52YWxpZGtleSQ=')).toBe(false);
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
    ['pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', false],
    ['pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', true],
    ['live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', false],
    ['test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', true],
  ];

  test.each(cases)('given %p as a publishable key string, returns %p', (publishableKeyStr, expected) => {
    const result = isDevelopmentFromPublishableKey(publishableKeyStr);
    expect(result).toEqual(expected);
  });
});

describe('isProductionFromPublishableKey(key)', () => {
  const cases: Array<[string, boolean]> = [
    ['pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', true],
    ['pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk', false],
    ['live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', true],
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

describe('getCookieSuffix(publishableKey, subtle?)', () => {
  const cases: Array<[string, string]> = [
    ['pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ=', 'qReyu04C'],
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
