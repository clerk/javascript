/**
 * Checks if the window object is defined. You can also use this to check if something is happening on the client side.
 * @returns {boolean}
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
 * @param userAgent - Any user agent string
 * @returns {boolean}
 */
export function userAgentIsRobot(userAgent: string): boolean {
  return !userAgent ? false : botAgentRegex.test(userAgent);
}

/**
 * Checks if the current environment is a browser and the user agent is not a bot.
 * @returns {boolean}
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
 * @returns {boolean}
 */
export function isBrowserOnline(): boolean {
  const isNavigatorOnline = inBrowser() ? window?.navigator?.onLine : false;
  if (!isNavigatorOnline) {
    return false;
  }

  // Use experimental properties as additional optional signals. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection#browser_compatibility
  // @ts-ignore connection is not typed
  const connection = navigator?.connection;
  if (!connection) {
    return isNavigatorOnline;
  }

  // If connection info exists, use it as an additional signal but don't require both to be non-zero
  const hasRtt = connection?.rtt !== 0;
  const hasDownlink = connection?.downlink !== 0;

  return isNavigatorOnline && (hasRtt || hasDownlink || !connection);
}

/**
 * Runs `isBrowserOnline` and `isValidBrowser` to check if the current environment is a valid browser and if the navigator is online.
 * @returns {boolean}
 */
export function isValidBrowserOnline(): boolean {
  return isBrowserOnline() && isValidBrowser();
}
