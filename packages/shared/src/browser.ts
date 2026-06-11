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
 * Resolves the `Navigator` object from either the DOM `window` (standard browsers)
 * or the global scope. Web/Service Workers — e.g. an MV3 extension background service
 * worker — have no `window`, but do expose a `WorkerNavigator` as `globalThis.navigator`
 * with the `onLine`/`userAgent` properties our heuristics rely on.
 *
 * Returns `null` only when no navigator is available anywhere. We intentionally do NOT
 * treat the absence of a navigator as a valid environment — only a real navigator object
 * enables the browser/online heuristics below.
 *
 * @returns
 */
function getNavigator(): Navigator | null {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator;
  }
  if (typeof navigator !== 'undefined') {
    return navigator;
  }
  return null;
}

/**
 * Checks if the current environment is a browser and the user agent is not a bot.
 *
 * @returns
 */
export function isValidBrowser(): boolean {
  const navigator = getNavigator();
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
  const navigator = getNavigator();
  if (!navigator) {
    return false;
  }

  // Some environments (e.g. React Native) define a Navigator object but do not
  // implement navigator.onLine as a boolean. Default to online in those cases.
  if (typeof navigator.onLine !== 'boolean') {
    return true;
  }

  // navigator.onLine is the standard API and is reliable for detecting
  // complete disconnection (airplane mode, WiFi off, etc.).
  // The experimental navigator.connection API (rtt/downlink) was previously
  // used as a secondary signal, but it reports zero values in headless browsers
  // and CI environments even when connected, causing false offline detection.
  return !!navigator.onLine;
}

/**
 * Runs `isBrowserOnline` and `isValidBrowser` to check if the current environment is a valid browser and if the navigator is online.
 *
 * @returns
 */
export function isValidBrowserOnline(): boolean {
  return isBrowserOnline() && isValidBrowser();
}
