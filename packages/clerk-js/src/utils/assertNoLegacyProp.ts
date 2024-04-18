export function assertNoLegacyProp(props: Record<string, any>) {
  const legacyProps = ['redirectUrl', 'afterSignInUrl', 'afterSignUpUrl'];
  const legacyProp = Object.keys(props).find(key => legacyProps.includes(key));
  if (legacyProp) {
    throw new Error(
      `Clerk: The prop "${legacyProp}" is deprecated and should be removed. Use the "afterSignInUrl" and "afterSignUpUrl" props instead.`,
    );
  }
}
