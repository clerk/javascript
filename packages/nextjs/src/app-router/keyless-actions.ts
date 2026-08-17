'use server';
import type { AccountlessApplication } from '@clerk/backend';
import { cookies, headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { keylessMissingEnvVars } from '../server/errors';
import { detectClerkMiddleware } from '../server/headers-utils';
import { getKeylessCookieName, getKeylessCookieValue } from '../server/keyless';
import { keyless } from '../server/keyless-node';
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

  const keylessCookie = await getKeylessCookieValue(name => cookieStore.get(name)?.value);
  const pksMatch = keylessCookie?.publishableKey === publishableKey;
  const sksMatch = keylessCookie?.secretKey === secretKey;
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

  // Request works at runtime since detectClerkMiddleware checks for Request via isRequestWebAPI
  if (detectClerkMiddleware(request as Parameters<typeof detectClerkMiddleware>[0])) {
    /**
     * Force middleware to execute to read the new keys from the cookies and populate the authentication state correctly.
     */
    redirect(`/clerk-sync-keyless?returnUrl=${returnUrl}`, RedirectType.replace);
  }

  return;
}

export async function createOrReadKeylessAction(): Promise<null | Omit<AccountlessApplication, 'secretKey'>> {
  if (!canUseKeyless) {
    return null;
  }

  throw new Error(keylessMissingEnvVars);
}

export async function deleteKeylessAction() {
  if (!canUseKeyless) {
    return;
  }

  try {
    await keyless().removeKeys();
  } catch {
    // Ignore errors during key removal
  }
}
