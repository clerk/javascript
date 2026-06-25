import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { inBrowser, isValidBrowser, isValidBrowserOnline, userAgentIsRobot } from '../browser';

/**
 * Simulates a Web/Service Worker global scope (e.g. an MV3 background service worker):
 * no `window`, but a `WorkerGlobalScope` exposing a `WorkerNavigator` as `self.navigator`.
 * Reuses the existing jsdom navigator (with its property spies) as the worker navigator so
 * userAgent/onLine/webdriver getters keep applying.
 */
function mockServiceWorkerScope() {
  const workerNavigator = window.navigator;
  class WorkerGlobalScope {}
  const workerSelf = Object.create(WorkerGlobalScope.prototype);
  workerSelf.navigator = workerNavigator;
  vi.stubGlobal('WorkerGlobalScope', WorkerGlobalScope);
  vi.stubGlobal('self', workerSelf);
  const windowSpy = vi.spyOn(global, 'window', 'get');
  // @ts-ignore - Test
  windowSpy.mockReturnValue(undefined);
}

describe('inBrowser()', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true if window is defined', () => {
    expect(inBrowser()).toBe(true);
  });
  it('returns false if window is undefined', () => {
    const windowSpy = vi.spyOn(global, 'window', 'get');
    // @ts-ignore - Test
    windowSpy.mockReturnValue(undefined);
    expect(inBrowser()).toBe(false);
  });
});

describe('isValidBrowser', () => {
  let userAgentGetter: any;
  let webdriverGetter: any;

  beforeEach(() => {
    userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get');
    // Define webdriver property if it doesn't exist
    if (!('webdriver' in window.navigator)) {
      Object.defineProperty(window.navigator, 'webdriver', {
        configurable: true,
        get: () => false,
      });
    }
    webdriverGetter = vi.spyOn(window.navigator, 'webdriver', 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns false when there is no window and no WorkerGlobalScope (e.g. Node SSR)', () => {
    // Modern Node exposes `globalThis.navigator`, so the bare global navigator stays
    // defined here. Without a `WorkerGlobalScope`, SSR must still be treated as non-browser.
    const windowSpy = vi.spyOn(global, 'window', 'get');
    // @ts-ignore - Test
    windowSpy.mockReturnValue(undefined);

    expect(isValidBrowser()).toBe(false);
  });

  it('returns true in a service worker (no window) when a valid WorkerNavigator is present', () => {
    mockServiceWorkerScope();
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    webdriverGetter.mockReturnValue(false);

    expect(isValidBrowser()).toBe(true);
  });

  it('returns false in a worker scope whose navigator identifies a server runtime (e.g. Cloudflare Workers)', () => {
    // Today workerd's `self` fails the `instanceof WorkerGlobalScope` gate, but that is a
    // quirk of its prototype chain. This simulates a spec-compliant workerd: full worker
    // scope, navigator present, but the user agent self-identifies as a server runtime.
    mockServiceWorkerScope();
    userAgentGetter.mockReturnValue('Cloudflare-Workers');
    webdriverGetter.mockReturnValue(false);

    expect(isValidBrowser()).toBe(false);
  });

  it.each(['Node.js/24', 'Deno/2.5.0', 'Bun/1.3.9'])(
    'returns false in a worker scope whose navigator identifies the %s server runtime',
    userAgent => {
      mockServiceWorkerScope();
      userAgentGetter.mockReturnValue(userAgent);
      webdriverGetter.mockReturnValue(false);

      expect(isValidBrowser()).toBe(false);
    },
  );

  it('returns false when WorkerGlobalScope exists but self is not an instance of it (e.g. workerd today)', () => {
    // workerd exposes the WorkerGlobalScope constructor without linking `self` to its
    // prototype chain, so the instanceof gate must reject it even with a browser-like UA.
    vi.stubGlobal('WorkerGlobalScope', class {});
    vi.stubGlobal('self', {
      navigator: { userAgent: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36', onLine: true, webdriver: false },
    });
    const windowSpy = vi.spyOn(global, 'window', 'get');
    // @ts-ignore - Test
    windowSpy.mockReturnValue(undefined);

    expect(isValidBrowser()).toBe(false);
  });

  it('returns true if in browser, navigator is not a bot, and webdriver is not enabled', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(false);

    expect(isValidBrowser()).toBe(true);
  });

  it('returns false if navigator is a bot', () => {
    userAgentGetter.mockReturnValue('msnbot-NewsBlogs/2.0b (+http://search.msn.com/msnbot.htm)');
    webdriverGetter.mockReturnValue(false);

    expect(isValidBrowser()).toBe(false);
  });

  it('returns false if webdriver is enabled', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(true);

    expect(isValidBrowser()).toBe(false);
  });
});

describe('detectUserAgentRobot', () => {
  const botAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'DoCoMo/2.0 N905i(c100;TB;W24H16) (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; adidxbot/2.0;  http://www.bing.com/bingbot.htm)',
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Jakarta Commons-HttpClient/3.1 +http://www.linkedin.com)',
    'msnbot-NewsBlogs/2.0b (+http://search.msn.com/msnbot.htm)',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36 (compatible; YandexScreenshotBot/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; spbot/1.0; +http://www.seoprofiler.com/bot/ )',
  ];

  it.each(botAgents)('returns true if User Agent name includes keyword that suggests automation/bot', agent => {
    expect(userAgentIsRobot(agent)).toBe(true);
  });

  const realAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  ];

  it.each(realAgents)(
    'returns false if User Agent name does not include keyword that suggests automation/bot',
    agent => {
      expect(userAgentIsRobot(agent)).toBe(false);
    },
  );
});

describe('isValidBrowserOnline', () => {
  let userAgentGetter: any;
  let webdriverGetter: any;
  let onLineGetter: any;
  let connectionGetter: any;

  beforeEach(() => {
    userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get');
    // Define webdriver property if it doesn't exist
    if (!('webdriver' in window.navigator)) {
      Object.defineProperty(window.navigator, 'webdriver', {
        configurable: true,
        get: () => false,
      });
    }
    webdriverGetter = vi.spyOn(window.navigator, 'webdriver', 'get');
    onLineGetter = vi.spyOn(window.navigator, 'onLine', 'get');
    // Define connection property if it doesn't exist
    // @ts-ignore
    if (!('connection' in window.navigator)) {
      // @ts-ignore
      Object.defineProperty(window.navigator, 'connection', {
        configurable: true,
        get: () => ({ downlink: 10, rtt: 100 }),
      });
    }
    // @ts-ignore
    connectionGetter = vi.spyOn(window.navigator, 'connection', 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns TRUE if connection is online, navigator is online, has disabled webdriver, and not a bot', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(true);
    connectionGetter.mockReturnValue({ downlink: 10, rtt: 100 });

    expect(isValidBrowserOnline()).toBe(true);
  });

  it('returns FALSE if connection is online, navigator is online, has disabled webdriver, and is a bot', () => {
    userAgentGetter.mockReturnValue('msnbot-NewsBlogs/2.0b (+http://search.msn.com/msnbot.htm)');
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(true);
    connectionGetter.mockReturnValue({ downlink: 10, rtt: 100 });

    expect(isValidBrowserOnline()).toBe(false);
  });

  it('returns FALSE if connection is online, navigator is online, has ENABLED the webdriver flag, and is not a bot', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(true);
    onLineGetter.mockReturnValue(true);
    connectionGetter.mockReturnValue({ downlink: 10, rtt: 100 });

    expect(isValidBrowserOnline()).toBe(false);
  });

  it('returns TRUE if connection reports zero values but navigator is online (headless browser)', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(true);
    connectionGetter.mockReturnValue({ downlink: 0, rtt: 0 });

    expect(isValidBrowserOnline()).toBe(true);
  });

  it('returns FALSE if connection is online, navigator is NOT online, has disabled the webdriver flag, and is not a bot', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(false);
    connectionGetter.mockReturnValue({ downlink: 10, rtt: 100 });

    expect(isValidBrowserOnline()).toBe(false);
  });

  it('fallbacks to TRUE if the experimental connection property is not defined', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(true);
    connectionGetter.mockReturnValue(undefined);

    expect(isValidBrowserOnline()).toBe(true);
  });

  it('returns TRUE in React Native when navigator.onLine is not implemented', () => {
    userAgentGetter.mockReturnValue(undefined);
    webdriverGetter.mockReturnValue(undefined);
    onLineGetter.mockReturnValue(undefined);
    connectionGetter.mockReturnValue(undefined);
    Object.defineProperty(window.navigator, 'product', {
      configurable: true,
      get: () => 'ReactNative',
    });

    expect(isValidBrowserOnline()).toBe(true);
  });

  it('returns TRUE in a service worker (no window) when the WorkerNavigator reports online', () => {
    mockServiceWorkerScope();
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(true);

    expect(isValidBrowserOnline()).toBe(true);
  });

  it('returns FALSE in a service worker (no window) when the WorkerNavigator reports offline', () => {
    mockServiceWorkerScope();
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(false);

    expect(isValidBrowserOnline()).toBe(false);
  });

  it('returns FALSE when there is no window and no WorkerGlobalScope (e.g. Node SSR)', () => {
    // Modern Node exposes `globalThis.navigator`, so the bare global navigator stays
    // defined here. Without a `WorkerGlobalScope`, SSR must still be treated as non-browser.
    const windowSpy = vi.spyOn(global, 'window', 'get');
    // @ts-ignore - Test
    windowSpy.mockReturnValue(undefined);

    expect(isValidBrowserOnline()).toBe(false);
  });

  it('returns FALSE in a worker scope whose navigator identifies a server runtime (e.g. Cloudflare Workers)', () => {
    // Cloudflare Workers do not implement `navigator.onLine`, so without the server-runtime
    // exclusion this would fall into the "onLine is not a boolean -> assume online" branch.
    mockServiceWorkerScope();
    userAgentGetter.mockReturnValue('Cloudflare-Workers');
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(undefined);

    expect(isValidBrowserOnline()).toBe(false);
  });
});
