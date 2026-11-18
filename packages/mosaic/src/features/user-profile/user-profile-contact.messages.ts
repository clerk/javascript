/**
 * Copy that names the contact kind lives in the email and phone section messages rather than in one
 * templated string here: a locale that inflects around the noun cannot build either from the other.
 */
export const userProfileContactMessages = {
  primary: 'Primary',
  unverified: 'Unverified',
  add: 'Add',
  setPrimary: 'Set as primary',
  completeVerification: 'Complete verification',
  manageValue: 'Manage {value}',
} as const;
