import type { AccountlessApplication } from '@clerk/backend';
import hex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';

const accountlessCookiePrefix = `__clerk_acc_`;

const getAccountlessCookieName = (): string => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const PATH = process.env.PWD;

  if (!PATH) {
    return `${accountlessCookiePrefix}${0}`;
  }

  const lastThreeDirs = PATH.split('/').filter(Boolean).slice(-3).reverse().join('/');

  // Hash the resulting string
  const hash = hashString(lastThreeDirs);

  return `${accountlessCookiePrefix}${hash}`;
};

function hashString(str: string) {
  return sha256(str).toString(hex).slice(0, 16); // Take only the first 32 characters
}

function getAccountlessCookieValue(
  getter: (cookieName: string) => string | undefined,
): AccountlessApplication | undefined {
  if (process.env.NODE_ENV !== 'development') {
    return undefined;
  }

  const accountlessCookieName = getAccountlessCookieName();
  let accountless;

  try {
    if (accountlessCookieName) {
      accountless = JSON.parse(getter(accountlessCookieName) || '{}');
    }
  } catch {
    accountless = undefined;
  }

  return accountless;
}

export { getAccountlessCookieValue, getAccountlessCookieName };
