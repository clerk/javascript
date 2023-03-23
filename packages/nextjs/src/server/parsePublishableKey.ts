import type { PublishableKey } from '@clerk/types';

const PUBLISHABLE_KEY_LIVE_PREFIX = 'pk_live_';
const PUBLISHABLE_KEY_TEST_PREFIX = 'pk_test_';

// This regex matches the publishable like frontend API keys (e.g. foo-bar-13.clerk.accounts.dev)
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

const isomorphicAtob = (data: string) => {
  if (typeof atob !== 'undefined' && typeof atob === 'function') {
    return atob(data);
  } else if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
    return new globalThis.Buffer(data, 'base64').toString();
  }
  return data;
};
