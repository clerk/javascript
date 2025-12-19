'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { cookies, headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { errorThrower } from '../server/errorThrower';
import { detectClerkMiddleware } from '../server/headers-utils';
import { getKeylessCookieName, getKeylessCookieValue } from '../server/keyless';
import { canUseKeyless } from '../utils/feature-flags';

type SetCookieOptions = Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2];

const keylessCookieConfig = {
  secure: false,
  httpOnly: false,
  sameSite: 'lax',
} satisfies SetCookieOptions;

export async function syncKeylessConfigAction(args: AccountlessApplication & { returnUrl: string }): Promise<void> {
  const { claimUrl, publishableKey, secretKey, returnUrl } = args;
  const cookieStore = await cookies();
  const request = new Request('https://placeholder.com', { headers: await headers() });

  const keyless = await getKeylessCookieValue(name => cookieStore.get(name)?.value);
  const pksMatch = keyless?.publishableKey === publishableKey;
  const sksMatch = keyless?.secretKey === secretKey;
  if (pksMatch && sksMatch) {
    // Return early, syncing in not needed.
    return;
  }

  // Set the new keys in the cookie.
  cookieStore.set(
    await getKeylessCookieName(),
    JSON.stringify({ claimUrl, publishableKey, secretKey }),
    keylessCookieConfig,
  );

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

  const result = await import('../server/keyless-node.js').then(m => m.keyless().getOrCreateKeys()).catch(() => null);

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
  void (await cookies()).set(
    await getKeylessCookieName(),
    JSON.stringify({ claimUrl, publishableKey, secretKey }),
    keylessCookieConfig,
  );

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

  await import('../server/keyless-node.js').then(m => m.keyless().removeKeys()).catch(() => {});
  return;
}
