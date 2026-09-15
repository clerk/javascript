/**
 * Every string the surface renders. Shaped the way `@clerk/i18n` takes a base definition, so
 * localizing this component is a matter of registering the namespace and swapping the reads for
 * `useMessages('userProfilePasswordSection', userProfilePasswordSectionBase)`, not of hunting the
 * literals down first.
 */
export const userProfilePasswordSectionBase = {
  sectionTitle: 'Authentication',
  label: 'Password',
  masked: '••••••••••••••••••',
  noPasswordSet: 'No password set',
  managedBy: 'Managed by {name}',
  change: 'Change password',
  set: 'Set password',

  dialogTitle: {
    change: 'Change password',
    set: 'Set password',
  },
  enterpriseAccount:
    'Your password can currently not be edited because you can sign in only via the enterprise connection.',
  currentPasswordLabel: 'Current password',
  newPasswordLabel: 'New password',
  confirmPasswordLabel: 'Confirm password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  signOutOfOtherSessionsLabel: 'Sign out of all other devices',
  signOutOfOtherSessionsDescription:
    'It is recommended to sign out of all other devices which may have used your old password.',
  cancel: 'Cancel',
  save: 'Save changes',

  errors: {
    mismatch: "Passwords don't match.",
    generic: 'Something went wrong. Please try again.',
  },
};
