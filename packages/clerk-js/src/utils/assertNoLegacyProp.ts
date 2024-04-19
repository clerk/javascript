export function assertNoLegacyProp(props: Record<string, any>) {
  const legacyProps = ['redirectUrl', 'afterSignInUrl', 'afterSignUpUrl', 'after_sign_in_url', 'after_sign_up_url'];
  const legacyProp = Object.keys(props).find(key => legacyProps.includes(key));

  if (legacyProp) {
    // TODO: @nikos update with the docs link
    console.warn(
      `Clerk: The prop "${legacyProp}" is deprecated and should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead.`,
    );
  }
}
