'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { getCookies } from 'ezheaders';
import { redirect, RedirectType } from 'next/navigation';

import { getKeylessCookieName } from '../server/keyless';
import { canUseKeyless__server } from '../utils/feature-flags';

export async function syncKeylessConfigAction(args: AccountlessApplication & { returnUrl: string }): Promise<void> {
  const { claimUrl, publishableKey, secretKey, returnUrl } = args;
  void (await getCookies()).set(getKeylessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  // Sync cookies with middleware
  redirect(`/clerk-sync-keyless?returnUrl=${returnUrl}`, RedirectType.replace);
}

export async function createOrReadKeylessAction(): Promise<null | Omit<AccountlessApplication, 'secretKey'>> {
  if (!canUseKeyless__server) {
    return null;
  }

  const result = await import('../server/keyless-node.js').then(m => m.createOrReadKeyless());

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
