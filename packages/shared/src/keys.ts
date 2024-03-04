import type { PublishableKey } from '@clerk/types';

import { DEV_OR_STAGING_SUFFIXES, LEGACY_DEV_INSTANCE_SUFFIXES } from './constants';
import { isomorphicAtob } from './isomorphicAtob';
import { isomorphicBtoa } from './isomorphicBtoa';

type ParsePublishableKeyOptions = {
  fatal?: boolean;
  domain?: string;
  proxyUrl?: string;
};

const PUBLISHABLE_KEY_LIVE_PREFIX = 'pk_live_';
const PUBLISHABLE_KEY_TEST_PREFIX = 'pk_test_';

// This regex matches the publishable like frontend API keys (e.g. foo-bar-13.clerk.accounts.dev)
const PUBLISHABLE_FRONTEND_API_DEV_REGEX = /^(([a-z]+)-){2}([0-9]{1,2})\.clerk\.accounts([a-z.]*)(dev|com)$/i;

export function buildPublishableKey(frontendApi: string): string {
  const isDevKey =
    PUBLISHABLE_FRONTEND_API_DEV_REGEX.test(frontendApi) ||
    (frontendApi.startsWith('clerk.') && LEGACY_DEV_INSTANCE_SUFFIXES.some(s => frontendApi.endsWith(s)));
  const keyPrefix = isDevKey ? PUBLISHABLE_KEY_TEST_PREFIX : PUBLISHABLE_KEY_LIVE_PREFIX;
  return `${keyPrefix}${isomorphicBtoa(`${frontendApi}$`)}`;
}

export function parsePublishableKey(
  key: string | undefined,
  options: ParsePublishableKeyOptions & { fatal: true },
): PublishableKey;
export function parsePublishableKey(
  key: string | undefined,
  options?: ParsePublishableKeyOptions,
): PublishableKey | null;
export function parsePublishableKey(
  key: string | undefined,
  options: { fatal?: boolean; domain?: string; proxyUrl?: string } = {},
): PublishableKey | null {
  key = key || '';

  if (!key || !isPublishableKey(key)) {
    if (options.fatal) {
      throw new Error('Publishable key not valid.');
    }
    return null;
  }

  const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? 'production' : 'development';

  let frontendApi = isomorphicAtob(key.split('_')[2]);

  // TODO(@dimkl): validate packages/clerk-js/src/utils/instance.ts
  frontendApi = frontendApi.slice(0, -1);

  if (options.proxyUrl) {
    frontendApi = options.proxyUrl;
  } else if (instanceType !== 'development' && options.domain) {
    frontendApi = `clerk.${options.domain}`;
  }

  return {
    instanceType,
    frontendApi,
  };
}

export function isPublishableKey(key: string) {
  key = key || '';

  const hasValidPrefix = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX);

  const hasValidFrontendApiPostfix = isomorphicAtob(key.split('_')[2] || '').endsWith('$');

  return hasValidPrefix && hasValidFrontendApiPostfix;
}

export function createDevOrStagingUrlCache() {
  const devOrStagingUrlCache = new Map<string, boolean>();

  return {
    isDevOrStagingUrl: (url: string | URL): boolean => {
      if (!url) {
        return false;
      }

      const hostname = typeof url === 'string' ? url : url.hostname;
      let res = devOrStagingUrlCache.get(hostname);
      if (res === undefined) {
        res = DEV_OR_STAGING_SUFFIXES.some(s => hostname.endsWith(s));
        devOrStagingUrlCache.set(hostname, res);
      }
      return res;
    },
  };
}

export function isDevelopmentFromPublishableKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('pk_test_');
}

export function isProductionFromPublishableKey(apiKey: string): boolean {
  return apiKey.startsWith('live_') || apiKey.startsWith('pk_live_');
}

export function isDevelopmentFromSecretKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

export function isProductionFromSecretKey(apiKey: string): boolean {
  return apiKey.startsWith('live_') || apiKey.startsWith('sk_live_');
}
