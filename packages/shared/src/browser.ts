export interface BrowserGlobals {
  document: Document;
  window: Window;
}

/**
 * Checks if the window object is defined. You can also use this to check if something is happening on the client side.
 * @returns {boolean}
 */
export function inBrowser(): boolean {
  return typeof window !== 'undefined';
}

const rawBrowserGlobals: BrowserGlobals = {
  document: window?.document,
  window: window,
};

/**
 *
 * Returns the browser globals if the current environment is a browser. Else, it will throw an error upon access.
 * @returns {BrowserGlobals}
 * @throws {Error} - If the current environment is not a browser.
 */
export const browser = inBrowser()
  ? rawBrowserGlobals
  : new Proxy(rawBrowserGlobals, {
      get(_target, prop) {
        throw new Error(
          `Clerk is not running in a browser environment. Trying to access \`${prop.toString()}\` will not work.`,
        );
      },
    });

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
  const navigator = browser.window.navigator;
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
  const navigator = browser.window.navigator;

  if (!navigator) {
    return false;
  }

  const isNavigatorOnline = navigator.onLine;

  // @ts-expect-error - Being extra safe with the experimental `connection` property, as it is not defined in all browsers
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection#browser_compatibility
  const isExperimentalConnectionOnline = navigator.connection?.rtt !== 0 && navigator.connection?.downlink !== 0;
  return isExperimentalConnectionOnline && isNavigatorOnline;
}

/**
 * Runs `isBrowserOnline` and `isValidBrowser` to check if the current environment is a valid browser and if the navigator is online.
 * @returns {boolean}
 */
export function isValidBrowserOnline(): boolean {
  return isBrowserOnline() && isValidBrowser();
}
