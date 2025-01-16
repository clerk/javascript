import {
  buildClerkJsScriptAttributes,
  clerkJsScriptUrl,
  loadClerkJsScript,
  setClerkJsLoadingErrorPackageName,
} from '../loadClerkJsScript';
import { loadScript } from '../loadScript';
import { getMajorVersion } from '../versionSelector';

jest.mock('../loadScript');

setClerkJsLoadingErrorPackageName('@clerk/clerk-react');
const jsPackageMajorVersion = getMajorVersion(JS_PACKAGE_VERSION);

const fakeNonce = 'fakeNonce123';
const fakeSRIHash = 'fakeSRIHash456';

describe('loadClerkJsScript(options)', () => {
  const mockPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

  beforeEach(() => {
    jest.clearAllMocks();
    (loadScript as jest.Mock).mockResolvedValue(undefined);
    document.querySelector = jest.fn().mockReturnValue(null);
  });

  test('throws error when publishableKey is missing', () => {
    expect(() => loadClerkJsScript({} as any)).rejects.toThrow(
      '@clerk/clerk-react: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
    );
  });

  test('loads script when no existing script is found', async () => {
    await loadClerkJsScript({ publishableKey: mockPublishableKey });

    expect(loadScript).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://foo-bar-13.clerk.accounts.dev/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.browser.js`,
      ),
      expect.objectContaining({
        async: true,
        crossOrigin: 'anonymous',
        beforeLoad: expect.any(Function),
      }),
    );
  });

  test('uses existing script when found', async () => {
    const mockExistingScript = document.createElement('script');
    document.querySelector = jest.fn().mockReturnValue(mockExistingScript);

    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });
    mockExistingScript.dispatchEvent(new Event('load'));

    await expect(loadPromise).resolves.toBe(mockExistingScript);
    expect(loadScript).not.toHaveBeenCalled();
  });

  test('rejects when existing script fails to load', async () => {
    const mockExistingScript = document.createElement('script');
    document.querySelector = jest.fn().mockReturnValue(mockExistingScript);

    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });
    mockExistingScript.dispatchEvent(new Event('error'));

    await expect(loadPromise).rejects.toBe('Clerk: Failed to load Clerk');
    expect(loadScript).not.toHaveBeenCalled();
  });

  test('throws error when loadScript fails', async () => {
    (loadScript as jest.Mock).mockRejectedValue(new Error('Script load failed'));

    await expect(loadClerkJsScript({ publishableKey: mockPublishableKey })).rejects.toThrow(
      'Clerk: Failed to load Clerk',
    );
  });

  test('loads script with nonce and integrity attributes', async () => {
    await loadClerkJsScript({
      publishableKey: mockPublishableKey,
      nonce: fakeNonce,
      integrity: fakeSRIHash,
    });

    expect(loadScript).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://foo-bar-13.clerk.accounts.dev/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.browser.js`,
      ),
      expect.objectContaining({
        async: true,
        crossOrigin: 'anonymous',
        nonce: fakeNonce,
        integrity: fakeSRIHash,
        beforeLoad: expect.any(Function),
      }),
    );
  });
});

describe('clerkJsScriptUrl()', () => {
  const mockDevPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';
  const mockProdPublishableKey = 'pk_live_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk';

  test('returns clerkJSUrl when provided', () => {
    const customUrl = 'https://custom.clerk.com/clerk.js';
    const result = clerkJsScriptUrl({ clerkJSUrl: customUrl, publishableKey: mockDevPublishableKey });
    expect(result).toBe(customUrl);
  });

  test('constructs URL correctly for development key', () => {
    const result = clerkJsScriptUrl({ publishableKey: mockDevPublishableKey });
    expect(result).toBe(
      `https://foo-bar-13.clerk.accounts.dev/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.browser.js`,
    );
  });

  test('constructs URL correctly for production key', () => {
    const result = clerkJsScriptUrl({ publishableKey: mockProdPublishableKey });
    expect(result).toBe(
      `https://example.clerk.accounts.dev/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.browser.js`,
    );
  });

  test('includes clerkJSVariant in URL when provided', () => {
    const result = clerkJsScriptUrl({ publishableKey: mockProdPublishableKey, clerkJSVariant: 'headless' });
    expect(result).toBe(
      `https://example.clerk.accounts.dev/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.headless.browser.js`,
    );
  });

  test('uses provided clerkJSVersion', () => {
    const result = clerkJsScriptUrl({ publishableKey: mockDevPublishableKey, clerkJSVersion: '6' });
    expect(result).toContain('/npm/@clerk/clerk-js@6/');
  });
});

describe('buildClerkJsScriptAttributes()', () => {
  const mockPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';
  const mockProxyUrl = 'https://proxy.clerk.com';
  const mockDomain = 'custom.com';

  test.each([
    [
      'all options',
      { publishableKey: mockPublishableKey, proxyUrl: mockProxyUrl, domain: mockDomain },
      {
        'data-clerk-publishable-key': mockPublishableKey,
        'data-clerk-proxy-url': mockProxyUrl,
        'data-clerk-domain': mockDomain,
      },
    ],
    [
      'only publishableKey',
      { publishableKey: mockPublishableKey },
      { 'data-clerk-publishable-key': mockPublishableKey },
    ],
    [
      'publishableKey and proxyUrl',
      { publishableKey: mockPublishableKey, proxyUrl: mockProxyUrl },
      { 'data-clerk-publishable-key': mockPublishableKey, 'data-clerk-proxy-url': mockProxyUrl },
    ],
    ['no options', {}, {}],
    [
      'with nonce and integrity',
      { publishableKey: mockPublishableKey, nonce: fakeNonce, integrity: fakeSRIHash },
      {
        'data-clerk-publishable-key': mockPublishableKey,
        nonce: fakeNonce,
        integrity: fakeSRIHash,
      },
    ],
  ])('returns correct attributes with %s', (_, input, expected) => {
    // @ts-ignore input loses correct type because of empty object
    expect(buildClerkJsScriptAttributes(input)).toEqual(expected);
  });
});
