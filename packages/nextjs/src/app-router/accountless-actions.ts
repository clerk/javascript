'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { getCookies } from 'ezheaders';
import { redirect, RedirectType } from 'next/navigation';

import { getAccountlessCookieName } from '../server/accountless';
import { isNextWithUnstableServerActions } from '../utils/sdk-versions';

export async function syncAccountlessKeysAction(args: AccountlessApplication): Promise<void> {
  const { claimUrl, publishableKey, secretKey } = args;
  void (await getCookies()).set(getAccountlessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  // TODO-ACCOUNTLESS: Do we even need this ? I think setting the cookie will reset the router cache.
  redirect('/clerk-sync-accountless', RedirectType.replace);
}

export async function createAccountlessKeysAction(): Promise<null | AccountlessApplication> {
  if (process.env.NODE_ENV !== 'development' || isNextWithUnstableServerActions) {
    return null;
  }

  const result = await import('../server/accountless-node.js').then(m => m.createAccountlessKeys());

  if (!result) {
    return null;
  }

  const { claimUrl, publishableKey, secretKey } = result;

  void (await getCookies()).set(getAccountlessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: false,
    httpOnly: false,
  });

  return result;
}
