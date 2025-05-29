import {
  buildClerkJsScriptAttributes,
  clerkJsScriptUrl,
  loadClerkJsScript,
  setClerkJsLoadingErrorPackageName,
} from '../loadClerkJsScript';
import { getMajorVersion } from '../versionSelector';

setClerkJsLoadingErrorPackageName('@clerk/clerk-react');
const jsPackageMajorVersion = getMajorVersion(JS_PACKAGE_VERSION);

describe('loadClerkJsScript(options)', () => {
  const mockPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

  beforeEach(() => {
    jest.clearAllMocks();
    document.querySelector = jest.fn().mockReturnValue(null);
    // Mock document.body for script creation
    Object.defineProperty(document, 'body', {
      value: document.createElement('body'),
      writable: true,
    });
  });

  test('throws error when publishableKey is missing', async () => {
    await expect(() => loadClerkJsScript({} as any)).rejects.toThrow(
      '@clerk/clerk-react: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
    );
  });

  test('loads script when no existing script is found', async () => {
    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });

    // Find the script that was added to the DOM
    const addedScript = document.body.querySelector('script[data-clerk-js-script]') as HTMLScriptElement;
    expect(addedScript).toBeTruthy();
    expect(addedScript.src).toContain(
      `https://foo-bar-13.clerk.accounts.dev/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.browser.js`,
    );
    expect(addedScript.async).toBe(true);
    expect(addedScript.getAttribute('crossorigin')).toBe('anonymous');

    // Simulate successful load
    addedScript.dispatchEvent(new Event('load'));

    const result = await loadPromise;
    expect(result).toBe(addedScript);
    expect(addedScript.getAttribute('data-clerk-loaded')).toBe('true');
  });

  test('resolves immediately when script is already loaded', async () => {
    const mockExistingScript = document.createElement('script');
    mockExistingScript.setAttribute('data-clerk-loaded', 'true');
    document.querySelector = jest.fn().mockReturnValue(mockExistingScript);

    const result = await loadClerkJsScript({ publishableKey: mockPublishableKey });

    expect(result).toBe(mockExistingScript);
    // Should not create a new script
    expect(document.body.querySelector('script[data-clerk-js-script]')).toBeNull();
  });

  test('waits for existing loading script to complete', async () => {
    const mockExistingScript = document.createElement('script');
    // Script exists but is not marked as loaded yet
    document.querySelector = jest.fn().mockReturnValue(mockExistingScript);

    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });

    // Simulate the existing script finishing loading
    setTimeout(() => {
      mockExistingScript.dispatchEvent(new Event('load'));
    }, 10);

    const result = await loadPromise;
    expect(result).toBe(mockExistingScript);
    expect(mockExistingScript.getAttribute('data-clerk-loaded')).toBe('true');
  });

  test('removes failed script and rejects when existing script fails to load', async () => {
    const mockExistingScript = document.createElement('script');
    document.querySelector = jest.fn().mockReturnValue(mockExistingScript);
    const removeSpy = jest.spyOn(mockExistingScript, 'remove');

    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });
    mockExistingScript.dispatchEvent(new Event('error'));

    await expect(loadPromise).rejects.toThrow('Clerk: Failed to load Clerk');
    expect(removeSpy).toHaveBeenCalled();
  });

  test('handles race condition when script loads while setting up listeners', async () => {
    const mockExistingScript = document.createElement('script');
    document.querySelector = jest.fn().mockReturnValue(mockExistingScript);

    // Simulate script loading between the initial check and listener setup
    setTimeout(() => {
      mockExistingScript.setAttribute('data-clerk-loaded', 'true');
    }, 1);

    const result = await loadClerkJsScript({ publishableKey: mockPublishableKey });
    expect(result).toBe(mockExistingScript);
  });

  test('creates script with correct attributes', async () => {
    const options = {
      publishableKey: mockPublishableKey,
      proxyUrl: 'https://proxy.clerk.com',
      domain: 'custom.com',
      nonce: 'test-nonce',
    };

    const loadPromise = loadClerkJsScript(options);

    const addedScript = document.body.querySelector('script[data-clerk-js-script]') as HTMLScriptElement;
    expect(addedScript.getAttribute('data-clerk-publishable-key')).toBe(mockPublishableKey);
    expect(addedScript.getAttribute('data-clerk-proxy-url')).toBe('https://proxy.clerk.com');
    expect(addedScript.getAttribute('data-clerk-domain')).toBe('custom.com');
    expect(addedScript.nonce).toBe('test-nonce');

    // Complete the load
    addedScript.dispatchEvent(new Event('load'));
    await loadPromise;
  });

  test('rejects and removes script when new script fails to load', async () => {
    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });

    const addedScript = document.body.querySelector('script[data-clerk-js-script]') as HTMLScriptElement;
    const removeSpy = jest.spyOn(addedScript, 'remove');

    // Simulate script load failure
    addedScript.dispatchEvent(new Event('error'));

    await expect(loadPromise).rejects.toThrow('Clerk: Failed to load Clerk');
    expect(removeSpy).toHaveBeenCalled();
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
        'data-clerk-js-script': '',
        'data-clerk-publishable-key': mockPublishableKey,
        'data-clerk-proxy-url': mockProxyUrl,
        'data-clerk-domain': mockDomain,
      },
    ],
    [
      'only publishableKey',
      { publishableKey: mockPublishableKey },
      {
        'data-clerk-js-script': '',
        'data-clerk-publishable-key': mockPublishableKey,
      },
    ],
    [
      'publishableKey and proxyUrl',
      { publishableKey: mockPublishableKey, proxyUrl: mockProxyUrl },
      {
        'data-clerk-js-script': '',
        'data-clerk-publishable-key': mockPublishableKey,
        'data-clerk-proxy-url': mockProxyUrl,
      },
    ],
    ['no options', {}, { 'data-clerk-js-script': '' }],
  ])('returns correct attributes with %s', (_, input, expected) => {
    // @ts-ignore input loses correct type because of empty object
    expect(buildClerkJsScriptAttributes(input)).toEqual(expected);
  });
});
