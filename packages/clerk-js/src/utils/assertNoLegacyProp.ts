export function assertNoLegacyProp(props: Record<string, any>) {
  const legacyProps = ['redirectUrl', 'afterSignInUrl', 'afterSignUpUrl'];
  const legacyProp = Object.keys(props).find(key => legacyProps.includes(key));
  if (legacyProp) {
    // TODO: @nikos update with the docs link
    console.warn(
      `Clerk: The prop "${legacyProp}" is deprecated and should be removed as it no longer works. Use the new "fallbackRedirectUrl" and "forceRedirectUrl" props instead.`,
    );
  }
}
