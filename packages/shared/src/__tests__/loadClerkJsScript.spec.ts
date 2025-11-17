import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ClerkRuntimeError } from '../error';
import {
  buildClerkJsScriptAttributes,
  clerkJsScriptUrl,
  loadClerkJsScript,
  setClerkJsLoadingErrorPackageName,
} from '../loadClerkJsScript';
import { loadScript } from '../loadScript';
import { getMajorVersion } from '../versionSelector';

vi.mock('../loadScript');

setClerkJsLoadingErrorPackageName('@clerk/react');
const jsPackageMajorVersion = getMajorVersion(JS_PACKAGE_VERSION);

const mockClerk = {
  status: 'ready',
  loaded: true,
  load: vi.fn(),
};

describe('loadClerkJsScript(options)', () => {
  const mockPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

  beforeEach(() => {
    vi.clearAllMocks();
    (loadScript as Mock).mockResolvedValue(undefined);
    document.querySelector = vi.fn().mockReturnValue(null);

    (window as any).Clerk = undefined;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('throws error when publishableKey is missing', async () => {
    await expect(loadClerkJsScript({} as any)).rejects.toThrow(
      '@clerk/react: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
    );
  });

  test('returns null immediately when Clerk is already loaded', async () => {
    (window as any).Clerk = mockClerk;

    const result = await loadClerkJsScript({ publishableKey: mockPublishableKey });
    expect(result).toBeNull();
    expect(loadScript).not.toHaveBeenCalled();
  });

  test('loads script and waits for Clerk to be available', async () => {
    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });

    // Simulate Clerk becoming available after 250ms
    setTimeout(() => {
      (window as any).Clerk = mockClerk;
    }, 250);

    // Advance timers to allow polling to detect Clerk
    vi.advanceTimersByTime(300);

    const result = await loadPromise;
    expect(result).toBeNull();
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

  test('times out and rejects when Clerk does not load', async () => {
    let rejectedWith: any;

    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey, scriptLoadTimeout: 1000 });

    try {
      vi.advanceTimersByTime(1000);
      await loadPromise;
    } catch (error) {
      rejectedWith = error;
    }

    expect(rejectedWith).toBeInstanceOf(ClerkRuntimeError);
    expect(rejectedWith.message).toContain('Clerk: Failed to load Clerk');
    expect((window as any).Clerk).toBeUndefined();
  });

  test('waits for existing script with timeout', async () => {
    const mockExistingScript = document.createElement('script');
    document.querySelector = vi.fn().mockReturnValue(mockExistingScript);

    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });

    // Simulate Clerk becoming available after 250ms
    setTimeout(() => {
      (window as any).Clerk = mockClerk;
    }, 250);

    // Advance timers to allow polling to detect Clerk
    vi.advanceTimersByTime(300);

    const result = await loadPromise;
    expect(result).toBeNull();
    expect(loadScript).not.toHaveBeenCalled();
  });

  test('handles race condition when Clerk loads just as timeout fires', async () => {
    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey, scriptLoadTimeout: 1000 });

    setTimeout(() => {
      (window as any).Clerk = mockClerk;
    }, 999);

    vi.advanceTimersByTime(1000);

    const result = await loadPromise;
    expect(result).toBeNull();
    expect((window as any).Clerk).toBe(mockClerk);
  });

  test('validates Clerk is properly loaded with required methods', async () => {
    const loadPromise = loadClerkJsScript({ publishableKey: mockPublishableKey });

    setTimeout(() => {
      (window as any).Clerk = { status: 'ready' };
    }, 100);

    vi.advanceTimersByTime(15000);

    try {
      await loadPromise;
      throw new Error('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(ClerkRuntimeError);
      expect((error as Error).message).toContain('Clerk: Failed to load Clerk');
      // The malformed Clerk object should still be there since it was set
      expect((window as any).Clerk).toEqual({ status: 'ready' });
    }
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
  ])('returns correct attributes with %s', (_, input, expected) => {
    // @ts-ignore input loses correct type because of empty object
    expect(buildClerkJsScriptAttributes(input)).toEqual(expected);
  });
});
