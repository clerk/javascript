/**
 * Every string the surface renders. Shaped the way `@clerk/i18n` takes a base definition, so
 * localizing this component is a matter of registering the namespace and swapping the reads for
 * `useMessages('userProfile', userProfileBase)`, not of hunting the literals down first.
 */
export const userProfileBase = {
  /** Names the surface: its navigation landmark, and the dialog it opens in. */
  label: 'User profile',
  pages: {
    account: 'Account',
    security: 'Security',
    billing: 'Billing',
    apiKeys: 'API Keys',
  },
};
