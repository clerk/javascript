import type { PublishableKey } from '@clerk/types';

import { DEV_OR_STAGING_SUFFIXES } from './constants';
import { isomorphicAtob } from './isomorphicAtob';
import { isomorphicBtoa } from './isomorphicBtoa';

const PUBLISHABLE_KEY_LIVE_PREFIX = 'pk_live_';
const PUBLISHABLE_KEY_TEST_PREFIX = 'pk_test_';

// This regex matches the publishable like frontend API keys (e.g. foo-bar-13.clerk.accounts.dev)
const PUBLISHABLE_FRONTEND_API_DEV_REGEX = /^(([a-z]+)-){2}([0-9]{1,2})\.clerk\.accounts([a-z.]*)(dev|com)$/i;

export function buildPublishableKey(frontendApi: string): string {
  const keyPrefix = PUBLISHABLE_FRONTEND_API_DEV_REGEX.test(frontendApi)
    ? PUBLISHABLE_KEY_TEST_PREFIX
    : PUBLISHABLE_KEY_LIVE_PREFIX;
  return `${keyPrefix}${isomorphicBtoa(`${frontendApi}$`)}`;
}

export function parsePublishableOptions({
  publishableKey,
  domain,
  proxyUrl,
}: {
  publishableKey: string;
  domain?: string;
  proxyUrl?: string;
}) {
  if (!isPublishableKey(publishableKey)) {
    throw new Error('Publishable key not valid.');
  }
  const environmentType = publishableKey.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? 'production' : 'development';

  let frontendApi;
  if (proxyUrl) {
    frontendApi = proxyUrl;
  } else if (environmentType !== 'development' && domain) {
    frontendApi = `https://clerk.${domain}`;
  } else {
    frontendApi = isomorphicAtob(publishableKey.split('_')[2]);

    if (!frontendApi.endsWith('$')) {
      throw new Error('Publishable key not valid.');
    }

    frontendApi = `https://${frontendApi.slice(0, -1)}`;
  }

  return {
    frontendApi,
    environmentType,
  };
}

export function parsePublishableKey(key: string | undefined): PublishableKey | null {
  key = key || '';

  if (!isPublishableKey(key)) {
    return null;
  }

  const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? 'production' : 'development';

  let frontendApi = isomorphicAtob(key.split('_')[2]);

  if (!frontendApi.endsWith('$')) {
    return null;
  }
  // TODO(@dimkl): validate packages/clerk-js/src/utils/instance.ts
  frontendApi = frontendApi.slice(0, -1);

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

export function isDevelopmentFromSecretKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

export function isProductionFromSecretKey(apiKey: string): boolean {
  return apiKey.startsWith('live_') || apiKey.startsWith('sk_live_');
}
