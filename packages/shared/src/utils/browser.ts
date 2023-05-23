export function inBrowser(): boolean {
  return typeof window !== 'undefined';
}

const botAgents = [
  'bot',
  'spider',
  'crawl',
  'APIs-Google',
  'AdsBot',
  'Googlebot',
  'mediapartners',
  'Google Favicon',
  'FeedFetcher',
  'Google-Read-Aloud',
  'DuplexWeb-Google',
  'googleweblight',
  'bing',
  'yandex',
  'baidu',
  'duckduck',
  'yahoo',
  'ecosia',
  'ia_archiver',
  'facebook',
  'instagram',
  'pinterest',
  'reddit',
  'slack',
  'twitter',
  'whatsapp',
  'youtube',
  'semrush',
];
const botAgentRegex = new RegExp(botAgents.join('|'), 'i');

export function userAgentIsRobot(userAgent: string): boolean {
  return !userAgent ? false : botAgentRegex.test(userAgent);
}

export function isValidBrowser(): boolean {
  const navigator = window?.navigator;
  if (!inBrowser() || !navigator) {
    return false;
  }
  return !userAgentIsRobot(navigator?.userAgent) && !navigator?.webdriver;
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

export function isValidBrowserOnline(): boolean {
  return isBrowserOnline() && isValidBrowser();
}
