import { isProductionFromPublishableKey } from './keys';

/**
 *
 */
export function isValidProxyUrl(key: string | undefined) {
  if (!key) {
    return true;
  }

  return isHttpOrHttps(key) || isProxyUrlRelative(key);
}

/**
 *
 */
export function isHttpOrHttps(key: string | undefined) {
  return /^http(s)?:\/\//.test(key || '');
}

/**
 *
 */
export function isProxyUrlRelative(key: string) {
  return key.startsWith('/');
}

/**
 *
 */
export function proxyUrlToAbsoluteURL(url: string | undefined): string {
  if (!url) {
    return '';
  }

  if (!isProxyUrlRelative(url)) {
    return url;
  }

  if (typeof window === 'undefined' || !window.location?.origin) {
    return url;
  }

  return new URL(url, window.location.origin).toString();
}

const AUTO_PROXY_HOST_SUFFIXES = ['.vercel.app'];
const AUTO_PROXY_PATH = '/__clerk';

export function shouldAutoProxy(hostname: string): boolean {
  return AUTO_PROXY_HOST_SUFFIXES.some(hostSuffix => hostname.endsWith(hostSuffix));
}

function normalizeHostname(hostnameOrUrl: string): string {
  if (hostnameOrUrl.startsWith('http://') || hostnameOrUrl.startsWith('https://')) {
    return new URL(hostnameOrUrl).hostname;
  }

  return hostnameOrUrl.split('/')[0] || '';
}

type GetAutoProxyUrlFromEnvironmentOptions = {
  publishableKey: string;
  hasDomain?: boolean;
  hasProxyUrl?: boolean;
  environment?: NodeJS.ProcessEnv;
};

export function getAutoProxyUrlFromEnvironment({
  publishableKey,
  hasDomain = false,
  hasProxyUrl = false,
  environment = process.env,
}: GetAutoProxyUrlFromEnvironmentOptions): string {
  if (hasProxyUrl || hasDomain || !isProductionFromPublishableKey(publishableKey)) {
    return '';
  }

  if (environment.VERCEL_TARGET_ENV !== 'production') {
    return '';
  }

  const vercelProductionHostname = environment.VERCEL_PROJECT_PRODUCTION_URL;

  if (!vercelProductionHostname || !shouldAutoProxy(normalizeHostname(vercelProductionHostname))) {
    return '';
  }

  return AUTO_PROXY_PATH;
}

/**
 * Function that determines whether proxy should be used for a given URL.
 */
export type ShouldProxyFn = (url: URL) => boolean;
