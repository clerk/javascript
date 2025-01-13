'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { getKeylessCookieName } from '../server/keyless';
import { detectClerkMiddleware } from '../server/utils';
import { canUseKeyless__server } from '../utils/feature-flags';
import { buildRequestLike } from './server/utils';

export async function syncKeylessConfigAction(args: AccountlessApplication & { returnUrl: string }): Promise<void> {
  const { claimUrl, publishableKey, secretKey, returnUrl } = args;
  const cookieStore = await cookies();
  cookieStore.set(getKeylessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  const request = await buildRequestLike();

  if (detectClerkMiddleware(request)) {
    /**
     * Force middleware to execute to read the new keys from the cookies and populate the authentication state correctly.
     */
    redirect(`/clerk-sync-keyless?returnUrl=${returnUrl}`, RedirectType.replace);
    return;
  }

  return;
}

export async function createOrReadKeylessAction(): Promise<null | Omit<AccountlessApplication, 'secretKey'>> {
  if (!canUseKeyless__server) {
    return null;
  }

  const result = await import('../server/keyless-node.js').then(m => m.createOrReadKeyless());

  if (!result) {
    return null;
  }

  const { claimUrl, publishableKey, secretKey, apiKeysUrl } = result;

  void (await cookies()).set(getKeylessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: false,
    httpOnly: false,
  });

  return {
    claimUrl,
    publishableKey,
    apiKeysUrl,
  };
}
