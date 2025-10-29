export function assertNoLegacyProp(props: Record<string, any>) {
  const legacyProps = ['redirectUrl', 'afterSignInUrl', 'afterSignUpUrl', 'after_sign_in_url', 'after_sign_up_url'];
  const legacyProp = Object.keys(props).find(key => legacyProps.includes(key));

  if (legacyProp && props[legacyProp]) {
    throw new Error(
      `Clerk: The prop "${legacyProp}" has been removed. Please use "fallbackRedirectUrl" or "forceRedirectUrl" instead. Learn more: https://clerk.com/docs/guides/custom-redirects#redirect-url-props`,
    );
  }
}
