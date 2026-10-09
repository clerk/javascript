/**
 * Email and phone keep separate keys rather than sharing one templated string: a locale that
 * inflects around the noun cannot build either from the other.
 */
export const userProfileContactMessages = {
  primary: 'Primary',
  unverified: 'Unverified',
  add: 'Add',
  setPrimary: 'Set as primary',
  completeVerification: 'Complete verification',

  manageValue: 'Manage {value}',
  email: {
    label: 'Email',
    empty: 'No email addresses added',
    add: 'Add email',
    verify: 'Verify',
    remove: 'Remove email',
    removeDialog: {
      title: 'Remove email address?',
      description: '{emailAddress} will be removed from your account.',
      verifiedDescription: '{emailAddress} will be removed from your account. You won’t be able to use it to sign in.',
      confirm: 'Remove',
      cancel: 'Cancel',
    },
  },
  phone: {
    label: 'Phone',
    empty: 'No phone numbers added',
    add: 'Add phone number',
    verify: 'Verify phone number',
    remove: 'Remove phone number',
    removeDialog: {
      title: 'Remove phone number?',
      description: '{phoneNumber} will be removed from your account.',
      verifiedDescription: '{phoneNumber} will be removed from your account. You won’t be able to use it to sign in.',
      confirm: 'Remove',
      cancel: 'Cancel',
    },
  },
} as const;
