import { inBrowser } from '@clerk/shared/browser';
import { logger } from '@clerk/shared/logger';

export function assertNoLegacyProp(props: Record<string, any>) {
  const legacyProps = ['redirectUrl', 'afterSignInUrl', 'afterSignUpUrl', 'after_sign_in_url', 'after_sign_up_url'];
  const legacyProp = Object.keys(props).find(key => legacyProps.includes(key));

  console.log('[DEBUG assertNoLegacyProp] legacyProp', legacyProp);

  if (legacyProp && props[legacyProp]) {
    // Don't warn about redirectUrl if it's auto-set by Clerk for preservation
    // (i.e., it equals the current window.location.href, which is what buildSignInUrl sets automatically)
    const isRedirectUrl = legacyProp === 'redirectUrl';
    const browserCheck = inBrowser();
    const isString = typeof props[legacyProp] === 'string';
    const windowHref = typeof window !== 'undefined' ? window.location.href : 'N/A';
    const propValue = props[legacyProp];
    const valuesMatch = isString && propValue === windowHref;

    // #region agent log
    console.log('[DEBUG assertNoLegacyProp]', {
      legacyProp,
      isRedirectUrl,
      browserCheck,
      isString,
      propValue: typeof propValue === 'string' ? propValue.substring(0, 200) : propValue,
      windowHref: typeof windowHref === 'string' ? windowHref.substring(0, 200) : windowHref,
      valuesMatch,
      propValueLength: typeof propValue === 'string' ? propValue.length : 0,
      windowHrefLength: typeof windowHref === 'string' ? windowHref.length : 0,
      allPropsKeys: Object.keys(props),
    });
    // #endregion

    if (isRedirectUrl && browserCheck && isString && valuesMatch) {
      // #region agent log
      console.log('[DEBUG assertNoLegacyProp] Returning early - no warning');
      // #endregion
      return;
    }

    // #region agent log
    console.log('[DEBUG assertNoLegacyProp] Warning will be logged', {
      reasonNotSkipped: { isRedirectUrl, browserCheck, isString, valuesMatch },
    });
    // #endregion

    logger.warnOnce(
      `Clerk: The prop "${legacyProp}" is deprecated and should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead. Learn more: https://clerk.com/docs/guides/custom-redirects#redirect-url-props`,
    );
  }
}

export function warnForNewPropShadowingLegacyProp(
  newKey: string | undefined,
  newValue: string | undefined | null,
  legacyKey: string | undefined,
  legacyValue: string | undefined | null,
) {
  if (newValue && legacyValue) {
    logger.warnOnce(
      `Clerk: The "${newKey}" prop ("${newValue}") has priority over the legacy "${legacyKey}" (or "redirectUrl") ("${legacyValue}"), which will be completely ignored in this case. "${legacyKey}" (or "redirectUrl" prop) should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead. Learn more: https://clerk.com/docs/guides/custom-redirects#redirect-url-props`,
    );
  }
}
