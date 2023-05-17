export function inBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function detectUserAgentRobot(userAgent: string): boolean {
  const robots = new RegExp(
    (
      [
        /bot/,
        /spider/,
        /crawl/,
        /APIs-Google/,
        /AdsBot/,
        /Googlebot/,
        /mediapartners/,
        /Google Favicon/,
        /FeedFetcher/,
        /Google-Read-Aloud/,
        /DuplexWeb-Google/,
        /googleweblight/,
        /bing/,
        /yandex/,
        /baidu/,
        /duckduck/,
        /yahoo/,
        /ecosia/,
        /ia_archiver/,
        /facebook/,
        /instagram/,
        /pinterest/,
        /reddit/,
        /slack/,
        /twitter/,
        /whatsapp/,
        /youtube/,
        /semrush/,
      ] as RegExp[]
    )
      .map(r => r.source)
      .join('|'),
    'i',
  );

  return robots.test(userAgent);
}

export function isValidBrowserOnline(): boolean {
  const navigator = window?.navigator;
  if (!inBrowser() || !navigator) {
    return false;
  }

  const isUserAgentRobot = detectUserAgentRobot(navigator?.userAgent);
  const isWebDriver = navigator?.webdriver;
  const isNavigatorOnline = navigator?.onLine;

  // Being extra safe with the experimental `connection` property, as it is not defined in all browsers
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection#browser_compatibility
  // @ts-ignore
  const isExperimentalConnectionOnline = navigator?.connection?.rtt !== 0 && navigator?.connection?.downlink !== 0;

  return !isUserAgentRobot && !isWebDriver && isExperimentalConnectionOnline && isNavigatorOnline;
}

export function isBrowserOnline(): boolean {
  const navigator = window?.navigator;
  if (!inBrowser() || !navigator) {
    return false;
  }

  const isNavigatorOnline = navigator?.onLine;

  // Being extra safe with the experimental `connection` property, as it is not defined in all browsers
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection#browser_compatibility
  // @ts-ignore
  const isExperimentalConnectionOnline = navigator?.connection?.rtt !== 0 && navigator?.connection?.downlink !== 0;
  return isExperimentalConnectionOnline && isNavigatorOnline;
}
