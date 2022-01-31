export enum TwoStepMethod {
  SMS = 0,
  Authenticator,
  SecurityKey,
  BackupCode,
}

export interface TwoStepMethodsDisplayData {
  title: string;
  note: string;
  buttonTitle: string;
  linkPath: string;
}

export const TwoStepMethodsToDisplayDataMap: Readonly<
  Record<TwoStepMethod, TwoStepMethodsDisplayData>
> = Object.freeze({
  [TwoStepMethod.SMS]: {
    title: 'SMS code',
    note: 'Receive a verification code via SMS when signing in',
    buttonTitle: 'Add SMS code verification',
    linkPath: 'add-phone',
  },
  [TwoStepMethod.Authenticator]: {
    title: 'Authenticator',
    note:
      'Receive verification codes when you sign in on your authenticator app, even without an internet connection',
    buttonTitle: 'Add authenticator',
    linkPath: 'add-authenticator',
  },
  [TwoStepMethod.SecurityKey]: {
    title: 'Security Key',
    note:
      'Use a physical security key when signing in. These can be built in to your phone, use Bluetooth, or plug directly into your computer’s USB port',
    buttonTitle: 'Add security key',
    linkPath: 'add-security-key',
  },
  [TwoStepMethod.BackupCode]: {
    title: 'Backup Code',
    note:
      'Generate a new backup code in case you lose it or suspect it has been compromised',
    buttonTitle: 'Add backup code',
    linkPath: 'add-backup-code',
  },
});
