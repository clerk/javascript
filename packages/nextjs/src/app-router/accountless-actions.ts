'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { getCookies } from 'ezheaders';
import { redirect, RedirectType } from 'next/navigation';

import { getKeylessCookieName } from '../server/accountless';
import { canUseKeyless__server } from '../utils/feature-flags';

export async function syncKeylessConfigAction(args: AccountlessApplication & { returnUrl: string }): Promise<void> {
  const { claimUrl, publishableKey, secretKey, returnUrl } = args;
  void (await getCookies()).set(getKeylessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  // TODO-ACCOUNTLESS: Do we even need this ? I think setting the cookie will reset the router cache.
  redirect(`/clerk-sync-keyless?returnUrl=${returnUrl}`, RedirectType.replace);
}

export async function createKeylessApplicationAction(): Promise<null | Omit<AccountlessApplication, 'secretKey'>> {
  if (!canUseKeyless__server) {
    return null;
  }

  const result = await import('../server/accountless-node.js').then(m => m.createOrReadKeyless());

  if (!result) {
    return null;
  }

  const { claimUrl, publishableKey, secretKey } = result;

  void (await getCookies()).set(getKeylessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: false,
    httpOnly: false,
  });

  return {
    claimUrl,
    publishableKey,
  };
}
