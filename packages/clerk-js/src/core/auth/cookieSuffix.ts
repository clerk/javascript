import { getCookieSuffix as getSharedCookieSuffix } from '@clerk/shared/keys';
import { logger } from '@clerk/shared/logger';

export async function getCookieSuffix(publishableKey: string) {
  let cookieSuffix;
  try {
    cookieSuffix = await getSharedCookieSuffix(publishableKey);
  } catch (err) {
    // Most common case of getCookieSuffix failing is for in-secure context
    logger.logOnce(
      `Suffixed cookie failed due to ${err.message} (secure-context: ${window.isSecureContext}, url: ${window.location.href})`,
    );

    // lazy load the crypto-js deps to avoid increasing the default clerk-js browser bundle size
    // Since this change AuthCookieService is only used in browser (clerk.browser.js) and not in the happy path
    // i would expect no change in the clerk-js bundle size
    // @ts-ignore
    const { default: hashSha1 } = await import(/* webpackChunkName: "cookieSuffix" */ 'crypto-js/sha1');
    // @ts-ignore
    const { default: base64 } = await import(/* webpackChunkName: "cookieSuffix" */ 'crypto-js/enc-base64');
    const hash = hashSha1(publishableKey);
    cookieSuffix = base64.stringify(hash).replace(/\+/gi, '-').replace(/\//gi, '_').substring(0, 8);
  }

  return cookieSuffix;
}
