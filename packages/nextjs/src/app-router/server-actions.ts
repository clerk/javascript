'use server';

import type { AccountlessApplication } from '@clerk/backend';
import { getCookies } from 'ezheaders';
import { RedirectType } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';

import { getAccountlessCookie } from '../server/accountless';

// This function needs to be async as we'd like to support next versions in the range of [14.1.2,14.2.0)
// These versions required 'use server' files to export async methods only. This check was later relaxed
// and the async is no longer required in newer next versions.
// ref: https://github.com/vercel/next.js/pull/62821
export async function invalidateCacheAction(): Promise<void> {
  void (await getCookies()).delete(`__clerk_invalidate_cache_cookie_${Date.now()}`);
}

export async function syncAccountlessKeys(args: AccountlessApplication): Promise<void> {
  const { claimUrl, publishableKey, secretKey } = args;
  void (await getCookies()).set(getAccountlessCookie(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  redirect('/clerk-sync-accountless', RedirectType.replace);
}
