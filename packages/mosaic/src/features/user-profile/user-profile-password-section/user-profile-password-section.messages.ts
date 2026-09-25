export const userProfilePasswordSectionMessages = {
  sectionTitle: 'Authentication',
  label: 'Password',
  masked: '••••••••••••••••••',
  noPasswordSet: 'No password set',
  managedBy: 'Managed by {name}',
  readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
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
    weak: 'Your password is not strong enough.',
    stronger: 'Your password works, but could be stronger. Try adding more characters.',
    strong: 'Your password meets all the necessary requirements.',
  },

  complexity: {
    sentence: 'Your password must contain {requirements}.',
    minimumLength: '{length} or more characters',
    maximumLength: 'less than {length} characters',
    lowercase: 'a lowercase letter',
    uppercase: 'an uppercase letter',
    number: 'a number',
    special: 'a special character',
  },
  passwordErrors: {
    form_password_pwned:
      'This password has been found as part of a breach and can not be used, please try another password instead.',
    form_password_matches_identifier:
      'Password cannot match your email address, phone number or username. For account safety, please use a different password.',
    form_password_size_in_bytes_exceeded: '',
    form_new_password_matches_current: 'New password cannot be the same as the current password.',
  },
  suggestions: {
    allUppercase: 'Capitalize some, but not all letters.',
    anotherWord: 'Add more words that are less common.',
    associatedYears: 'Avoid years that are associated with you.',
    capitalization: 'Capitalize more than the first letter.',
    dates: 'Avoid dates and years that are associated with you.',
    l33t: "Avoid predictable letter substitutions like '@' for 'a'.",
    longerKeyboardPattern: 'Use longer keyboard patterns and change typing direction multiple times.',
    noNeed: 'You can create strong passwords without using symbols, numbers, or uppercase letters.',
    pwned: 'If you use this password elsewhere, you should change it.',
    recentYears: 'Avoid recent years.',
    repeated: 'Avoid repeated words and characters.',
    reverseWords: 'Avoid reversed spellings of common words.',
    sequences: 'Avoid common character sequences.',
    useWords: 'Use multiple words, but avoid common phrases.',
  },

  errors: {
    verificationIncomplete: 'Your password was not saved. Please try verifying again.',
    unavailable: 'Password update is no longer available.',
    currentPasswordRequired: 'Current password is required.',
    mismatch: "Passwords don't match.",
  },
} as const;
