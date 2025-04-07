import type { AccountlessApplication } from '@clerk/backend';

import { canUseKeyless } from '../utils/feature-flags';

const keylessCookiePrefix = `__clerk_keys_`;

async function hashString(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16); // Take only the first 16 characters
}

async function getKeylessCookieName(): Promise<string> {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const PATH = process.env.PWD;

  // Handle gracefully missing PWD
  if (!PATH) {
    return `${keylessCookiePrefix}${0}`;
  }

  const lastThreeDirs = PATH.split('/').filter(Boolean).slice(-3).reverse().join('/');

  // Hash the resulting string
  const hash = await hashString(lastThreeDirs);

  return `${keylessCookiePrefix}${hash}`;
}

async function getKeylessCookieValue(
  getter: (cookieName: string) => string | undefined,
): Promise<AccountlessApplication | undefined> {
  if (!canUseKeyless) {
    return undefined;
  }

  const keylessCookieName = await getKeylessCookieName();
  let keyless;

  try {
    if (keylessCookieName) {
      keyless = JSON.parse(getter(keylessCookieName) || '{}');
    }
  } catch {
    keyless = undefined;
  }

  return keyless;
}

export { getKeylessCookieValue, getKeylessCookieName };
