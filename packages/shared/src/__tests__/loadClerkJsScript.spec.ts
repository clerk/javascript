import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ClerkRuntimeError } from '../error';
import {
  buildClerkJsScriptAttributes,
  buildClerkUiScriptAttributes,
  buildScriptHost,
  clerkJsScriptUrl,
  clerkUiScriptUrl,
  loadClerkJsScript,
  loadClerkUiScript,
  setClerkJsLoadingErrorPackageName,
} from '../loadClerkJsScript';
import { loadScript } from '../loadScript';
import { getMajorVersion } from '../versionSelector';

vi.mock('../loadScript');

setClerkJsLoadingErrorPackageName('@clerk/react');
const jsPackageMajorVersion = getMajorVersion(JS_PACKAGE_VERSION);
const uiPackageMajorVersion = getMajorVersion(UI_PACKAGE_VERSION);

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
    (window as any).Clerk = mockClerk;

    const result = await loadClerkJsScript({ publishableKey: mockPublishableKey });

    expect(result).toBeNull();
    expect((window as any).Clerk).toBe(mockClerk);
  });
});

describe('clerkJsScriptUrl()', () => {
  const mockDevPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';
  const mockProdPublishableKey = 'pk_live_ZXhhbXBsZS5jbGVyay5jb20k'; // example.clerk.com

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
    expect(result).toBe(`https://example.clerk.com/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.browser.js`);
  });

  test('includes clerkJSVariant in URL when provided', () => {
    const result = clerkJsScriptUrl({ publishableKey: mockProdPublishableKey, clerkJSVariant: 'headless' });
    expect(result).toBe(
      `https://example.clerk.com/npm/@clerk/clerk-js@${jsPackageMajorVersion}/dist/clerk.headless.browser.js`,
    );
  });

  test('uses provided clerkJSVersion', () => {
    const result = clerkJsScriptUrl({ publishableKey: mockDevPublishableKey, clerkJSVersion: '6' });
    expect(result).toContain('/npm/@clerk/clerk-js@6/');
  });
});

describe('buildScriptHost()', () => {
  const mockDevPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';
  const mockProdPublishableKey = 'pk_live_ZXhhbXBsZS5jbGVyay5jb20k'; // example.clerk.com
  const mockProxyUrl = 'https://proxy.clerk.com';
  const mockDomain = 'custom.com';

  test('returns frontendApi from publishableKey when no proxyUrl or domain', () => {
    const result = buildScriptHost({ publishableKey: mockDevPublishableKey });
    expect(result).toBe('foo-bar-13.clerk.accounts.dev');
  });

  test('returns proxyUrl host when proxyUrl is provided and valid', () => {
    const result = buildScriptHost({ publishableKey: mockDevPublishableKey, proxyUrl: mockProxyUrl });
    expect(result).toBe('proxy.clerk.com');
  });

  test('returns domain with clerk prefix when domain is provided for production key', () => {
    const result = buildScriptHost({ publishableKey: mockProdPublishableKey, domain: mockDomain });
    expect(result).toBe('clerk.custom.com');
  });

  test('returns frontendApi when domain is provided for development key', () => {
    const result = buildScriptHost({ publishableKey: mockDevPublishableKey, domain: mockDomain });
    expect(result).toBe('foo-bar-13.clerk.accounts.dev');
  });

  test('prioritizes proxyUrl over domain', () => {
    const result = buildScriptHost({
      publishableKey: mockProdPublishableKey,
      proxyUrl: mockProxyUrl,
      domain: mockDomain,
    });
    expect(result).toBe('proxy.clerk.com');
  });

  test('handles relative proxyUrl', () => {
    // Mock window.location for relative URL conversion
    const originalLocation = global.window.location;
    Object.defineProperty(global.window, 'location', {
      get() {
        return {
          origin: 'https://example.com',
        };
      },
      configurable: true,
    });

    const result = buildScriptHost({ publishableKey: mockDevPublishableKey, proxyUrl: '/__clerk' });
    // Relative URLs are converted to absolute, then protocol is stripped
    expect(result).toBe('example.com/__clerk');

    // Restore original location
    Object.defineProperty(global.window, 'location', {
      value: originalLocation,
      writable: true,
    });
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

describe('loadClerkUiScript(options)', () => {
  const mockPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

  const mockClerkUi = {
    render: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (loadScript as Mock).mockResolvedValue(undefined);
    document.querySelector = vi.fn().mockReturnValue(null);

    (window as any).__internal_ClerkUICtor = undefined;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('throws error when publishableKey is missing', async () => {
    await expect(loadClerkUiScript({} as any)).rejects.toThrow(
      '@clerk/react: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
    );
  });

  test('returns null immediately when ClerkUI is already loaded', async () => {
    (window as any).__internal_ClerkUICtor = mockClerkUi;

    const result = await loadClerkUiScript({ publishableKey: mockPublishableKey });
    expect(result).toBeNull();
    expect(loadScript).not.toHaveBeenCalled();
  });

  test('loads script and waits for ClerkUI to be available', async () => {
    const loadPromise = loadClerkUiScript({ publishableKey: mockPublishableKey });

    // Simulate ClerkUI becoming available after 250ms
    setTimeout(() => {
      (window as any).__internal_ClerkUICtor = mockClerkUi;
    }, 250);

    // Advance timers to allow polling to detect ClerkUI
    vi.advanceTimersByTime(300);

    const result = await loadPromise;
    expect(result).toBeNull();
    expect(loadScript).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://foo-bar-13.clerk.accounts.dev/npm/@clerk/ui@${uiPackageMajorVersion}/dist/ui.browser.js`,
      ),
      expect.objectContaining({
        async: true,
        crossOrigin: 'anonymous',
        beforeLoad: expect.any(Function),
      }),
    );
  });

  test('times out and rejects when ClerkUI does not load', async () => {
    let rejectedWith: any;

    const loadPromise = loadClerkUiScript({ publishableKey: mockPublishableKey, scriptLoadTimeout: 1000 });

    try {
      vi.advanceTimersByTime(1000);
      await loadPromise;
    } catch (error) {
      rejectedWith = error;
    }

    expect(rejectedWith).toBeInstanceOf(ClerkRuntimeError);
    expect(rejectedWith.message).toContain('Failed to load Clerk UI');
    expect((window as any).__internal_ClerkUICtor).toBeUndefined();
  });

  test('waits for existing script with timeout', async () => {
    const mockExistingScript = document.createElement('script');
    document.querySelector = vi.fn().mockReturnValue(mockExistingScript);

    const loadPromise = loadClerkUiScript({ publishableKey: mockPublishableKey });

    // Simulate ClerkUI becoming available after 250ms
    setTimeout(() => {
      (window as any).__internal_ClerkUICtor = mockClerkUi;
    }, 250);

    // Advance timers to allow polling to detect ClerkUI
    vi.advanceTimersByTime(300);

    const result = await loadPromise;
    expect(result).toBeNull();
    expect(loadScript).not.toHaveBeenCalled();
  });

  test('handles race condition when ClerkUI loads just as timeout fires', async () => {
    const loadPromise = loadClerkUiScript({ publishableKey: mockPublishableKey, scriptLoadTimeout: 1000 });

    setTimeout(() => {
      (window as any).__internal_ClerkUICtor = mockClerkUi;
    }, 999);

    vi.advanceTimersByTime(1000);

    const result = await loadPromise;
    expect(result).toBeNull();
    expect((window as any).__internal_ClerkUICtor).toBe(mockClerkUi);
  });

  test('validates ClerkUI is properly loaded', async () => {
    (window as any).__internal_ClerkUICtor = mockClerkUi;

    const result = await loadClerkUiScript({ publishableKey: mockPublishableKey });

    expect(result).toBeNull();
    expect((window as any).__internal_ClerkUICtor).toBe(mockClerkUi);
  });
});

describe('clerkUiScriptUrl()', () => {
  const mockDevPublishableKey = 'pk_test_Zm9vLWJhci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';
  const mockProdPublishableKey = 'pk_live_ZXhhbXBsZS5jbGVyay5jb20k'; // example.clerk.com

  test('returns clerkUIUrl when provided', () => {
    const customUrl = 'https://custom.clerk.com/ui.js';
    const result = clerkUiScriptUrl({ clerkUIUrl: customUrl, publishableKey: mockDevPublishableKey });
    expect(result).toBe(customUrl);
  });

  test('constructs URL correctly for development key', () => {
    const result = clerkUiScriptUrl({ publishableKey: mockDevPublishableKey });
    expect(result).toBe(
      `https://foo-bar-13.clerk.accounts.dev/npm/@clerk/ui@${uiPackageMajorVersion}/dist/ui.browser.js`,
    );
  });

  test('constructs URL correctly for production key', () => {
    const result = clerkUiScriptUrl({ publishableKey: mockProdPublishableKey });
    expect(result).toBe(`https://example.clerk.com/npm/@clerk/ui@${uiPackageMajorVersion}/dist/ui.browser.js`);
  });

  test('uses provided clerkUIVersion', () => {
    const result = clerkUiScriptUrl({ publishableKey: mockDevPublishableKey, clerkUIVersion: '1' });
    expect(result).toContain('/npm/@clerk/ui@1/');
  });

  test('uses latest as default version when not specified', () => {
    const result = clerkUiScriptUrl({ publishableKey: mockDevPublishableKey });
    // When no version is specified, versionSelector should return the major version
    expect(result).toContain(`/npm/@clerk/ui@${uiPackageMajorVersion}/`);
  });

  test('uses UI_PACKAGE_VERSION independently from JS_PACKAGE_VERSION', () => {
    // Verify that clerkUiScriptUrl uses UI_PACKAGE_VERSION, not JS_PACKAGE_VERSION
    const uiResult = clerkUiScriptUrl({ publishableKey: mockDevPublishableKey });
    const jsResult = clerkJsScriptUrl({ publishableKey: mockDevPublishableKey });

    // UI script should use UI package version
    expect(uiResult).toContain(`/npm/@clerk/ui@${uiPackageMajorVersion}/`);
    // JS script should use JS package version
    expect(jsResult).toContain(`/npm/@clerk/clerk-js@${jsPackageMajorVersion}/`);

    // They should be using their respective versions (which may differ)
    // This test ensures we don't accidentally use JS version for UI
    expect(uiResult).not.toContain('@clerk/clerk-js');
    expect(jsResult).not.toContain('@clerk/ui');
  });
});

describe('buildClerkUiScriptAttributes()', () => {
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
    expect(buildClerkUiScriptAttributes(input)).toEqual(expected);
  });
});
