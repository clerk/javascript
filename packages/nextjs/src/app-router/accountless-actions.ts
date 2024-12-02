'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { getCookies } from 'ezheaders';
import { redirect, RedirectType } from 'next/navigation';

import { getAccountlessCookieName } from '../server/accountless';
import { canUseAccountless__server } from '../utils/feature-flags';

export async function syncAccountlessKeysAction(args: AccountlessApplication & { returnUrl: string }): Promise<void> {
  const { claimUrl, publishableKey, secretKey, returnUrl } = args;
  void (await getCookies()).set(getAccountlessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  // TODO-ACCOUNTLESS: Do we even need this ? I think setting the cookie will reset the router cache.
  redirect(`/clerk-sync-accountless?returnUrl=${returnUrl}`, RedirectType.replace);
}

export async function createAccountlessKeysAction(): Promise<null | Omit<AccountlessApplication, 'secretKey'>> {
  if (!canUseAccountless__server) {
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

  return {
    claimUrl,
    publishableKey,
  };
}
