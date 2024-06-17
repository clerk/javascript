import { logger } from '@clerk/shared/logger';

export function assertNoLegacyProp(props: Record<string, any>) {
  const legacyProps = ['redirectUrl', 'afterSignInUrl', 'afterSignUpUrl', 'after_sign_in_url', 'after_sign_up_url'];
  const legacyProp = Object.keys(props).find(key => legacyProps.includes(key));

  if (legacyProp && props[legacyProp]) {
    // TODO: @nikos update with the docs link
    logger.warnOnce(
      `Clerk: The prop "${legacyProp}" is deprecated and should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead.`,
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
    // TODO: @nikos update with the docs link
    logger.warnOnce(
      `Clerk: The "${newKey}" prop ("${newValue}") has priority over the legacy "${legacyKey}" (or "redirectUrl") ("${legacyValue}"), which will be completely ignored in this case. "${legacyKey}" (or "redirectUrl" prop) should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead.`,
    );
  }
}
