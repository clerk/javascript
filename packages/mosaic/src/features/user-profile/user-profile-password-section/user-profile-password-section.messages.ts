export const userProfilePasswordSectionMessages = {
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
  },
} as const;
