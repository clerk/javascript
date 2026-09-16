export const userProfileMfaMessages = {
  label: '2-step verification',
  add: 'Add',
  addLabel: 'Add verification method',
  empty: 'No verification methods added',
  methods: {
    sms: 'SMS verification',
    authenticator: 'Authenticator app',
    'backup-codes': 'Backup codes',
  },
  default: 'Default',
  setDefault: 'Set as default',
  remove: 'Remove method',
  regenerate: 'Regenerate',
  manage: 'Manage {label}',
  manageSms: 'Manage {label} {phoneNumber}',
  removeDialog: {
    smsTitle: 'Remove SMS verification',
    smsDescription:
      'You will no longer receive sign-in verification codes at {phoneNumber}. The phone number will remain on your account.',
    smsDescriptionWithoutNumber:
      'This phone number will no longer receive sign-in verification codes. It will remain on your account.',
    authenticatorTitle: 'Remove authenticator app',
    authenticatorDescription:
      'Verification codes from this authenticator will no longer be required when signing in. Your account may not be as secure.',
    confirm: 'Remove',
  },
};
