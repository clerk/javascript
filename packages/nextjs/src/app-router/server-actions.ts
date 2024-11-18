'use server';

import type { AccountlessApplication } from '@clerk/backend';
import { getCookies } from 'ezheaders';
import { RedirectType } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';

import { getAccountlessCookieName } from '../server/accountless';
import { createAccountlessKeys } from '../server/accountless-node';

// This function needs to be async as we'd like to support next versions in the range of [14.1.2,14.2.0)
// These versions required 'use server' files to export async methods only. This check was later relaxed
// and the async is no longer required in newer next versions.
// ref: https://github.com/vercel/next.js/pull/62821
export async function invalidateCacheAction(): Promise<void> {
  void (await getCookies()).delete(`__clerk_invalidate_cache_cookie_${Date.now()}`);
}

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
  const result = await createAccountlessKeys();

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
