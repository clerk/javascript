/**
 * Every string the surface renders. Shaped the way `@clerk/i18n` takes a base definition, so
 * localizing this component is a matter of registering the namespace and swapping the reads for
 * `useMessages('userProfileDeleteSection', userProfileDeleteSectionMessages)`, not of hunting the literals down first.
 */
export const userProfileDeleteSectionMessages = {
  sectionTitle: 'Danger zone',
  sectionLabel: 'Delete account',
  sectionDescription: 'Permanently delete this account and all its data. This cannot be undone.',
  dialogTitle: 'Delete account?',
  dialogDescription: 'Are you sure you want to delete your account? All of your data will be permanently deleted.',
  fieldLabel: 'Type “{phrase}” below to continue',
  fieldPlaceholder: 'Delete account',
  actionLabel: 'Delete account',
  cancelLabel: 'Cancel',
};
