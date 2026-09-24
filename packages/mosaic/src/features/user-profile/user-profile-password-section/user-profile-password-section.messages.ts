export const userProfilePasswordSectionMessages = {
  sectionTitle: 'Authentication',
  label: 'Password',
  masked: '••••••••••••••••••',
  noPasswordSet: 'No password set',
  managedBy: 'Managed by {name}',
  readonly: 'Your organization manages your password.',
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
  back: 'Back',
  save: 'Save changes',
  rules: {
    minLength: 'Use at least {length} characters.',
    maxLength: 'Use fewer than {length} characters.',
    lowercase: 'Add a lowercase letter.',
    uppercase: 'Add an uppercase letter.',
    number: 'Add a number.',
    special: 'Add a special character.',
    weak: 'Choose a stronger password.',
    stronger: 'Your password could be stronger.',
    strong: 'Strong password.',
  },

  errors: {
    verificationIncomplete: 'Your password was not saved. Please try verifying again.',
    mismatch: "Passwords don't match.",
  },
} as const;
