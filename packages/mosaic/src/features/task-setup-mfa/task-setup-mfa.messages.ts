export const taskSetupMfaMessages = {
  start: {
    title: 'Set up two-step verification',
    description: 'Choose how you want to protect your account with an extra layer of security',
    methods: {
      authenticator: 'Authenticator app',
      sms: 'SMS code',
    },
    methodDescriptions: {
      authenticator: 'Get codes from an authenticator app',
      sms: 'Get a code by text message',
    },
  },
  success: {
    authenticator: {
      title: 'Authenticator app verification enabled',
      description:
        'When signing in, you will need to enter a verification code from this authenticator as an additional step.',
    },
    sms: {
      title: 'SMS code verification enabled',
      description:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
    },
    backupCodesDescription:
      'Save these backup codes somewhere safe. If you lose access to your authentication device, you can use them to sign in.',
    codesLabel: 'Backup codes',
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',
    print: 'Print',
    continue: 'Continue',
    pending: 'Continuing',
    fileName: '{applicationName}_backup_codes.txt',
    fileIntro: 'These are your backup codes for {applicationName} account {identifier}.',
    fileInstructions: 'Store them securely and keep them secret. Each code can only be used once.',
    printTitle: 'Your backup codes for {applicationName} account {identifier}',
  },
  signOut: {
    text: 'Signed in as {identifier}',
    action: 'Sign out',
  },
} as const;
