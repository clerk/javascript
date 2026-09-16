/**
 * A parameterized message is its template, the way `params()` takes it. `fill` below resolves them
 * until that layer lands.
 *
 * Email and phone keep separate keys rather than sharing one templated string: a locale that
 * inflects around the noun cannot build either from the other.
 */
export const userProfileAccountSectionBase = {
  sectionLabel: 'Account',
  sectionTitle: 'Profile',
  picture: {
    label: 'Profile picture',
    description: 'Recommend size 1:1, up to 10MB.',
    upload: 'Upload',
    manage: 'Manage profile picture',
    change: 'Change avatar',
    remove: 'Remove avatar',

    errors: {
      accept: 'File type not supported. Please upload a JPG, PNG, GIF, or WEBP image.',
      size: 'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
      overflow: 'Only one file can be uploaded at a time.',
    },
  },
  name: {
    label: 'Name',
    edit: 'Edit name',

    dialogTitle: 'Edit name',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    cancel: 'Cancel',
    save: 'Save changes',
  },
  username: {
    label: 'Username',
    edit: 'Edit username',

    dialogTitle: 'Edit username',
    fieldLabel: 'Username',
    cancel: 'Cancel',
    save: 'Save changes',
  },
  primary: 'Primary',
  add: 'Add',
  manage: 'Manage',
  setPrimary: 'Set as primary',
  completeVerification: 'Complete verification',

  manageValue: 'Manage {value}',
  email: {
    label: 'Email',
    empty: 'No email addresses added',
    update: 'Update email',
    add: 'Add email',
    verify: 'Verify',
    remove: 'Remove email',
    primaryError: 'Unable to set the primary email address. Try again.',
    removeDialog: {
      title: 'Remove email address?',
      description: '{emailAddress} will be removed from your account. You won’t be able to use it to sign in.',
      confirm: 'Remove',
      cancel: 'Cancel',
    },
  },
  phone: {
    label: 'Phone',
    empty: 'No phone numbers added',
    update: 'Update phone number',
    add: 'Add phone number',
    verify: 'Verify phone number',
    remove: 'Remove phone number',
    primaryError: 'Unable to set the primary phone number. Try again.',
    removeDialog: {
      title: 'Remove phone number?',
      description: '{phoneNumber} will be removed from your account. You won’t be able to use it to sign in.',
      confirm: 'Remove',
      cancel: 'Cancel',
    },
  },
};

/** Substitutes `{name}`-style placeholders. Replaced by the localization layer's own formatter. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
