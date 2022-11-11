import { type InstanceType, PublishableKey } from '@clerk/types';

const PUBLISHABLE_KEY_LIVE_PREFIX = 'pk_live_';
const PUBLISHABLE_KEY_TEST_PREFIX = 'pk_test_';

export function parsePublishableKey(key: string): PublishableKey | null {
  key = key || '';

  if (!isPublishableKey(key)) {
    return null;
  }

  const keyParts = key.split('_');

  const instanceType = keyParts[1] as InstanceType;

  let frontendApi = atob(keyParts[2]);

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

  const hasValidFrontendApiPostfix = atob(key.split('_')[2] || '').endsWith('$');

  return hasValidPrefix && hasValidFrontendApiPostfix;
}

export function isLegacyFrontendApiKey(key: string) {
  key = key || '';

  return key.startsWith('clerk.');
}

// TODO:
export type SecretKey = unknown;

// TODO:
export function parseSecretKey(key: string): SecretKey | null {
  console.log('parseSecretKey(key): Not implemented yet.');
  return null;
}
