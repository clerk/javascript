import type { AccountlessApplication } from '@clerk/backend';
import hex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';

import { canUseKeyless } from '../utils/feature-flags';

const keylessCookiePrefix = `__clerk_keys_`;

const keylessRedirectCountCookieName = `${keylessCookiePrefix}redirect_count`;

const getKeylessCookieName = (): string => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const PATH = process.env.PWD;

  // Handle gracefully missing PWD
  if (!PATH) {
    return `${keylessCookiePrefix}${0}`;
  }

  const lastThreeDirs = PATH.split('/').filter(Boolean).slice(-3).reverse().join('/');

  // Hash the resulting string
  const hash = hashString(lastThreeDirs);

  return `${keylessCookiePrefix}${hash}`;
};

function hashString(str: string) {
  return sha256(str).toString(hex).slice(0, 16); // Take only the first 16 characters
}

function getKeylessCookieValue(getter: (cookieName: string) => string | undefined): AccountlessApplication | undefined {
  if (!canUseKeyless) {
    return undefined;
  }

  const keylessCookieName = getKeylessCookieName();
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

export { getKeylessCookieValue, getKeylessCookieName, keylessRedirectCountCookieName };
