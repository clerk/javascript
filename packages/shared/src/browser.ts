/**
 * Checks if the window object is defined. You can also use this to check if something is happening on the client side.
 *
 * @returns
 */
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

/**
 * Checks if the user agent is a bot.
 *
 * @param userAgent - Any user agent string
 * @returns
 */
export function userAgentIsRobot(userAgent: string): boolean {
  return !userAgent ? false : botAgentRegex.test(userAgent);
}

/**
 * Checks if the current environment is a browser and the user agent is not a bot.
 *
 * @returns
 */
export function isValidBrowser(): boolean {
  const navigator = inBrowser() ? window?.navigator : null;
  if (!navigator) {
    return false;
  }
  return !userAgentIsRobot(navigator?.userAgent) && !navigator?.webdriver;
}

/**
 * Checks if the current environment is a browser and if the navigator is online.
 *
 * @returns
 */
export function isBrowserOnline(): boolean {
  const navigator = inBrowser() ? window?.navigator : null;
  if (!navigator) {
    return false;
  }

  const isNavigatorOnline = navigator?.onLine;

  // Being extra safe with the experimental `connection` property, as it is not defined in all browsers
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection#browser_compatibility
  // @ts-ignore
  const isExperimentalConnectionOnline = navigator?.connection?.rtt !== 0 && navigator?.connection?.downlink !== 0;
  return isExperimentalConnectionOnline && isNavigatorOnline;
}

/**
 * Runs `isBrowserOnline` and `isValidBrowser` to check if the current environment is a valid browser and if the navigator is online.
 *
 * @returns
 */
export function isValidBrowserOnline(): boolean {
  return isBrowserOnline() && isValidBrowser();
}
