/**
 * Every string the surface renders. Shaped the way `@clerk/i18n` takes a base definition, so
 * localizing this component is a matter of registering the namespace and swapping the reads for
 * `useMessages('userProfile', userProfileMessages)`, not of hunting the literals down first.
 */
export const userProfileMessages = {
  /** Names the surface: its navigation landmark, and the dialog it opens in. */
  label: 'User profile',
  pages: {
    account: 'Account',
    security: 'Security',
    billing: 'Billing',
    apiKeys: 'API Keys',
  },
};
