import type { PublishableKey } from '@clerk/types';

import { isomorphicAtob } from './isomorphicAtob';

const PUBLISHABLE_KEY_LIVE_PREFIX = 'pk_live_';
const PUBLISHABLE_KEY_TEST_PREFIX = 'pk_test_';

// This regex matches the publishable like frontend API keys (e.g. foo-bar-13.clerk.accounts.dev)
const PUBLISHABLE_FRONTEND_API_DEV_REGEX = /^(([a-z]+)-){2}([0-9]{1,2})\.clerk\.accounts([a-z.]*)(dev|com)$/i;

export function buildPublishableKey(frontendApi: string): string {
  const keyPrefix = PUBLISHABLE_FRONTEND_API_DEV_REGEX.test(frontendApi)
    ? PUBLISHABLE_KEY_TEST_PREFIX
    : PUBLISHABLE_KEY_LIVE_PREFIX;
  return `${keyPrefix}${btoa(`${frontendApi}$`)}`;
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

export function isLegacyFrontendApiKey(key: string) {
  key = key || '';

  return key.startsWith('clerk.');
}

export function createDevOrStagingUrlCache() {
  const DEV_OR_STAGING_SUFFIXES = [
    '.lcl.dev',
    '.stg.dev',
    '.lclstage.dev',
    '.stgstage.dev',
    '.dev.lclclerk.com',
    '.stg.lclclerk.com',
    '.accounts.lclclerk.com',
    'accountsstage.dev',
    'accounts.dev',
  ];

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
