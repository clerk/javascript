import { inBrowser, isValidBrowser, isValidBrowserOnline, userAgentIsRobot } from '../browser';

describe('inBrowser()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true if window is defined', () => {
    expect(inBrowser()).toBe(true);
  });
  it('returns false if window is undefined', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    // @ts-ignore - Test
    windowSpy.mockReturnValue(undefined);
    expect(inBrowser()).toBe(false);
  });
});

describe('isValidBrowser', () => {
  let userAgentGetter: any;
  let webdriverGetter: any;

  beforeEach(() => {
    userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get');
    webdriverGetter = jest.spyOn(window.navigator, 'webdriver', 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false if not in browser', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
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
    userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get');
    webdriverGetter = jest.spyOn(window.navigator, 'webdriver', 'get');
    onLineGetter = jest.spyOn(window.navigator, 'onLine', 'get');
    // @ts-ignore
    connectionGetter = jest.spyOn(window.navigator, 'connection', 'get');
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

  it('returns FALSE if connection is NOT online, navigator is online, has disabled the webdriver flag, and is not a bot', () => {
    userAgentGetter.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    webdriverGetter.mockReturnValue(false);
    onLineGetter.mockReturnValue(true);
    connectionGetter.mockReturnValue({ downlink: 0, rtt: 0 });

    expect(isValidBrowserOnline()).toBe(false);
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
});
