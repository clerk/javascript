'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { cookies, headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { errorThrower } from '../server/errorThrower';
import { detectClerkMiddleware } from '../server/headers-utils';
import { getKeylessCookieName } from '../server/keyless';
import { canUseKeyless } from '../utils/feature-flags';

export async function syncKeylessConfigAction(args: AccountlessApplication & { returnUrl: string }): Promise<void> {
  const { claimUrl, publishableKey, secretKey, returnUrl } = args;
  const cookieStore = await cookies();
  cookieStore.set(getKeylessCookieName(), JSON.stringify({ claimUrl, publishableKey, secretKey }), {
    secure: true,
    httpOnly: true,
  });

  const request = new Request('https://placeholder.com', { headers: await headers() });

  // We cannot import `NextRequest` due to a bundling issue with server actions in Next.js 13.
  // @ts-expect-error Request will work as well
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
  if (!canUseKeyless) {
    return null;
  }

  const result = await import('../server/keyless-node.js').then(m => m.createOrReadKeyless()).catch(() => null);

  if (!result) {
    errorThrower.throwMissingPublishableKeyError();
    return null;
  }

  const { clerkDevelopmentCache, createKeylessModeMessage } = await import('../server/keyless-log-cache.js');

  /**
   * Notify developers.
   */
  clerkDevelopmentCache?.log({
    cacheKey: result.publishableKey,
    msg: createKeylessModeMessage(result),
  });

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

export async function deleteKeylessAction() {
  if (!canUseKeyless) {
    return;
  }

  await import('../server/keyless-node.js').then(m => m.removeKeyless()).catch(() => {});
  return;
}
