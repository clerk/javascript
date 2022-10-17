import { DeepRequired, LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'Check your phone',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: 'Verification code',
      formSubtitle: 'Enter the verification code sent to your phone number',
      resendButton: 'Resend code',
    },
  },
} as const;

export const defaultResource: DeepRequired<LocalizationResource> = {
  socialButtonsBlockButton: 'Continue with {{provider|titleize}}',
  dividerText: 'or',
  formFieldLabel__emailAddress: 'Email address',
  formFieldLabel__phoneNumber: 'Phone number',
  formFieldLabel__username: 'Username',
  formFieldLabel__emailAddress_phoneNumber: 'Email address or phone number',
  formFieldLabel__emailAddress_username: 'Email address or username',
  formFieldLabel__phoneNumber_username: 'phone number or username',
  formFieldLabel__emailAddress_phoneNumber_username: 'Email address, phone number or username',
  formFieldLabel__password: 'Password',
  formFieldLabel__newPassword: 'New password',
  formFieldLabel__confirmPassword: 'Confirm password',
  formFieldLabel__firstName: 'First name',
  formFieldLabel__lastName: 'Last name',
  formFieldLabel__backupCode: 'Backup code',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldInputPlaceholder__emailAddress_phoneNumber: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__phoneNumber_username: '',
  formFieldInputPlaceholder__emailAddress_phoneNumber_username: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__backupCode: '',
  formFieldAction__forgotPassword: 'Forgot password',
  formFieldHintText__optional: 'Optional',
  formButtonPrimary: 'Continue',
  signInEnterPasswordTitle: 'Enter your password',
  backButton: 'Back',
  footerActionLink__useAnotherMethod: 'Use another method',
  badge__primary: 'Primary',
  badge__thisDevice: 'This device',
  badge__userDevice: 'User device',
  badge__otherImpersonatorDevice: 'Other impersonator device',
  badge__default: 'Default',
  badge__unverified: 'Unverified',
  badge__requiresAction: 'Requires action',
  footerPageLink__help: 'Help',
  footerPageLink__privacy: 'Privacy',
  footerPageLink__terms: 'Terms',
  paginationButton__previous: 'Previous',
  paginationButton__next: 'Next',
  paginationRowText__displaying: 'Displaying',
  paginationRowText__of: 'of',
  signUp: {
    start: {
      title: 'Create your account',
      subtitle: 'to continue to {{applicationName}}',
      actionText: 'Have an account?',
      actionLink: 'Sign in',
    },
    emailLink: {
      title: 'Verify your email',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: 'Verification link',
      formSubtitle: 'Use the verification link sent to your email address',
      resendButton: 'Resend link',
    },
    emailCode: {
      title: 'Verify your email',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: 'Verification code',
      formSubtitle: 'Enter the verification code sent to your email address',
      resendButton: 'Resend code',
    },
    phoneCode: {
      title: 'Verify your phone',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: 'Verification code',
      formSubtitle: 'Enter the verification code sent to your phone number',
      resendButton: 'Resend code',
    },
    continue: {
      title: 'Fill in missing fields',
      subtitle: 'to continue to {{applicationName}}',
      actionText: 'Have an account?',
      actionLink: 'Sign in',
    },
  },
  signIn: {
    start: {
      title: 'Sign in',
      subtitle: 'to continue to {{applicationName}}',
      actionText: 'No account?',
      actionLink: 'Sign up',
    },
    password: {
      title: 'Enter your password',
      subtitle: 'to continue to {{applicationName}}',
      actionLink: 'Use another method',
    },
    emailCode: {
      title: 'Check your email',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: 'Verification code',
      formSubtitle: 'Enter the verification code sent to your email address',
      resendButton: 'Resend code',
    },
    emailLink: {
      title: 'Check your email',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: 'Verification link',
      formSubtitle: 'Use the verification link sent your email',
      resendButton: 'Resend link',
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'Two-step verification',
      subtitle: '',
      formTitle: 'Verification code',
      formSubtitle: 'Enter the verification code generated by your authenticator app',
    },
    backupCodeMfa: {
      title: 'Enter a backup code',
      subtitle: 'to continue to {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'Use another method',
      actionLink: 'Get help',
      blockButton__emailLink: 'Send link to {{identifier}}',
      blockButton__emailCode: 'Send code to {{identifier}}',
      blockButton__phoneCode: 'Send code to {{identifier}}',
      blockButton__password: 'Sign in with your password',
      blockButton__totp: 'Use your authenticator app',
      blockButton__backupCode: 'Use a backup code',
      getHelp: {
        title: 'Get help',
        content: `If you’re experiencing difficulty signing into your account, email us and we will work with you to restore access as soon as possible.`,
        blockButton__emailSupport: 'Email support',
      },
    },
  },
  userProfile: {
    mobileButton__menu: 'Menu',
    formButtonPrimary__continue: 'Continue',
    formButtonPrimary__finish: 'Finish',
    formButtonReset: 'Cancel',
    start: {
      headerTitle__account: 'Account',
      headerTitle__security: 'Security',
      headerSubtitle__account: 'Manage your account information',
      headerSubtitle__security: 'Manage your security preferences',
      profileSection: {
        title: 'Profile',
      },
      usernameSection: {
        title: 'Username',
        primaryButton__changeUsername: 'Change username',
        primaryButton__setUsername: 'Set username',
      },
      emailAddressesSection: {
        title: 'Email addresses',
        primaryButton: 'Add an email address',
        detailsTitle__primary: 'Primary email address',
        detailsSubtitle__primary: 'This email address is the primary email address',
        detailsAction__primary: 'Complete verification',
        detailsTitle__nonPrimary: 'Set as primary email address',
        detailsSubtitle__nonPrimary:
          'Set this email address as the primary to receive communications regarding your account.',
        detailsAction__nonPrimary: 'Set as primary',
        detailsTitle__unverified: 'Unverified email address',
        detailsSubtitle__unverified: 'This email address has not been verified and may be limited in functionality',
        detailsAction__unverified: 'Complete verification',
        destructiveActionTitle: 'Remove',
        destructiveActionSubtitle: 'Delete this email address and remove it from your account',
        destructiveAction: 'Remove email address',
      },
      phoneNumbersSection: {
        title: 'Phone numbers',
        primaryButton: 'Add a phone number',
        detailsTitle__primary: 'Primary phone number',
        detailsSubtitle__primary: 'This phone number is the primary phone number',
        detailsAction__primary: 'Complete verification',
        detailsTitle__nonPrimary: 'Set as primary phone number',
        detailsSubtitle__nonPrimary:
          'Set this phone number as the primary to receive communications regarding your account.',
        detailsAction__nonPrimary: 'Set as primary',
        detailsTitle__unverified: 'Unverified phone number',
        detailsSubtitle__unverified: 'This phone number has not been verified and may be limited in functionality',
        detailsAction__unverified: 'Complete verification',
        destructiveActionTitle: 'Remove',
        destructiveActionSubtitle: 'Delete this phone number and remove it from your account',
        destructiveAction: 'Remove phone number',
      },
      connectedAccountsSection: {
        title: 'Connected accounts',
        primaryButton: 'Connect account',
        title__conectionFailed: 'Retry failed connection',
        actionLabel__conectionFailed: 'Try again',
        destructiveActionTitle: 'Remove',
        destructiveActionSubtitle: 'Remove this connected account from your account',
        destructiveActionAccordionSubtitle: 'Remove connected account',
      },
      passwordSection: {
        title: 'Password',
        primaryButton__changePassword: 'Change password',
        primaryButton__setPassword: 'Set password',
      },
      mfaSection: {
        title: 'Two-step verification',
        primaryButton: 'Add two-step verification',
        phoneCode: {
          destructiveActionTitle: 'Remove',
          destructiveActionSubtitle: 'Remove this phone number from the two-step verification methods',
          destructiveActionLabel: 'Remove phone number',
          title__default: 'Default factor',
          title__setDefault: 'Set as Default factor',
          subtitle__default: 'This factor will be used as the default two-step verification method when signing in.',
          subtitle__setDefault:
            'Set this factor as the default factor to use it as the default two-step verification method when signing in.',
          actionLabel__setDefault: 'Set as default',
        },
        backupCodes: {
          title__regenerate: 'Regenerate backup codes',
          subtitle__regenerate:
            'Get a fresh set of secure backup codes. Prior backup codes will be deleted and cannot be used.',
          actionLabel__regenerate: 'Regenerate codes',
        },
        totp: {
          headerTitle: 'Authenticator application',
          title: 'Default factor',
          subtitle: 'This factor will be used as the default two-step verification method when signing in.',
          destructiveActionTitle: 'Remove',
          destructiveActionSubtitle: 'Remove authenticator application from the two-step verification methods',
          destructiveActionLabel: 'Remove authenticator application',
        },
      },
      activeDevicesSection: {
        title: 'Active devices',
        primaryButton: 'Active devices',
        detailsTitle: 'Current device',
        detailsSubtitle: 'This is the device you are currently using',
        destructiveActionTitle: 'Sign out',
        destructiveActionSubtitle: 'Sign out from your account on this device',
        destructiveAction: 'Sign out of device',
      },
      web3WalletsSection: {
        title: 'Web3 wallets',
        primaryButton: 'Web3 wallets',
        destructiveActionTitle: 'Remove',
        destructiveActionSubtitle: 'Remove this web3 wallet from your account',
        destructiveAction: 'Remove wallet',
      },
    },
    profilePage: {
      title: 'Update profile',
      imageFormTitle: 'Profile image',
      imageFormSubtitle: 'Upload image',
      fileDropAreaTitle: 'Drag file here, or...',
      fileDropAreaAction: 'Select file',
      fileDropAreaHint: 'Upload a JPG, PNG, GIF, or WEBP image smaller than 10 MB',
      successMessage: 'Your profile has been updated.',
    },
    usernamePage: {
      title: 'Update username',
      successMessage: 'Your username has been updated.',
    },
    emailAddressPage: {
      title: 'Add email address',
      emailCode: {
        formHint: 'An email containing a verification code will be sent to this email address.',
        formTitle: 'Verification code',
        formSubtitle: 'Enter the verification code send to {{identifier}}',
        resendButton: 'Resend link',
        successMessage: 'The email {{identifier}} has been added to your account.',
      },
      emailLink: {
        formHint: 'An email containing a verification link will be sent to this email address.',
        formTitle: 'Verification link',
        formSubtitle: 'Click on the verification link in the email sent to {{identifier}}',
        resendButton: 'Resend link',
        successMessage: 'The email {{identifier}} has been added to your account.',
      },
      removeResource: {
        title: 'Remove email address',
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2: 'You will no longer be able to sign in using this email address.',
        successMessage: '{{emailAddress}} has been removed from your account.',
      },
    },
    phoneNumberPage: {
      title: 'Add phone number',
      successMessage: '{{identifier}} has been added to your account.',
      infoText: 'A text message containing a verification link will be sent to this phone number.',
      infoText__secondary: 'Message and data rates may apply.',
      removeResource: {
        title: 'Remove phone number',
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2: 'You will no longer be able to sign in using this phone number.',
        successMessage: '{{phoneNumber}} has been removed from your account.',
      },
    },
    connectedAccountPage: {
      title: 'Add connected account',
      formHint: 'Select a provider to connect your account.',
      formHint__noAccounts: 'There are no available external account providers.',
      socialButtonsBlockButton: 'Connect {{provider|titleize}} account',
      successMessage: 'The provider has been added to your account',
      removeResource: {
        title: 'Remove connected account',
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2: 'You will no longer be able to sign in using this connected account.',
        successMessage: '{{connectedAccount}} has been removed from your account.',
      },
    },
    web3WalletPage: {
      title: 'Add web3 wallet',
      subtitle__availableWallets: 'Select a web3 wallet to connect to your account.',
      subtitle__unavailableWallets: 'There are no available web3 wallets.',
      successMessage: 'The wallet has been added to your account.',
      removeResource: {
        title: 'Remove web3 wallet',
        messageLine1: '{{identifier}} will be removed from this account.',
        messageLine2: 'You will no longer be able to sign in using this web3 wallet.',
        successMessage: '{{web3Wallet}} has been removed from your account.',
      },
    },
    passwordPage: {
      title: 'Set password',
      successMessage: 'Your password has been set.',
    },
    mfaPage: {
      title: 'Add two-step verification',
      formHint: 'Select a method to add.',
    },
    mfaTOTPPage: {
      title: 'Add authenticator application',
      verifyTitle: 'Verification code',
      verifySubtitle: 'Enter verification code generated by your authenticator',
      successMessage:
        'Two-step verification is now enabled. When signing in, you will need to enter a verification code from this authenticator as an additional step.',
      authenticatorApp: {
        infoText__ableToScan:
          'Set up a new sign-in method in your authenticator app and scan the following QR code to link it to your account.',
        infoText__unableToScan: 'Set up a new sign-in method in your authenticator and enter the Key provided below.',
        inputLabel__unableToScan1:
          'Make sure Time-based or One-time passwords is enabled, then finish linking your account.',
        inputLabel__unableToScan2:
          'Alternatively, if your authenticator supports TOTP URIs, you can also copy the full URI.',
        buttonAbleToScan__nonPrimary: 'Scan QR code instead',
        buttonUnableToScan__nonPrimary: 'Can’t scan QR code?',
      },
      removeResource: {
        title: 'Remove two-step verification',
        messageLine1: 'Verification codes from this authenticator will no longer be required when signing in.',
        messageLine2: 'Your account may not be as secure. Are you sure you want to continue?',
        successMessage: 'Two-step verification via authenticator application has been removed.',
      },
    },
    mfaPhoneCodePage: {
      title: 'Add SMS code verification',
      primaryButton__addPhoneNumber: 'Add a phone number',
      subtitle__availablePhoneNumbers: 'Select a phone number to register for SMS code two-step verification.',
      subtitle__unavailablePhoneNumbers:
        'There are no available phone numbers to register for SMS code two-step verification.',
      successMessage:
        'SMS code two-step verification is now enabled for this phone number. When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      removeResource: {
        title: 'Remove two-step verification',
        messageLine1: '{{identifier}} will be no longer receiving verification codes when signing in.',
        messageLine2: 'Your account may not be as secure. Are you sure you want to continue?',
        successMessage: 'SMS code two-step verification has been removed for {{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'Add backup code verification',
      subtitle__codelist: 'Store them securely and keep them secret.',
      infoText1: 'Backup codes will be enabled for this account.',
      infoText2:
        'Keep the backup codes secret and store them securely. You may regenerate backup codes if you suspect they have been compromised.',
      successSubtitle:
        'You can use one of these to sign in to your account, if you lose access to your authentication device.',
      successMessage:
        'Backup codes are now enabled. You can use one of these to sign in to your account, if you lose access to your authentication device. Each code can only be used once.',
    },
  },
  userButton: {
    action__manageAccount: 'Manage account',
    action__signOut: 'Sign out',
    action__signOutAll: 'Sign out of all accounts',
    action__addAccount: 'Add account',
  },
  organizationSwitcher: {
    title: 'Organizations',
    personalWorkspace: 'Personal Workspace',
    notSelected: 'No organization selected',
    action__createOrganization: 'Create Organization',
    action__manageOrganization: 'Manage Organization',
  },
  impersonationFab: {
    title: 'Signed in as {{identifier}}',
    action__signOut: 'Sign out',
  },
  organizationProfile: {
    start: {
      headerTitle__members: 'Members',
      headerTitle__settings: 'Settings',
    },
  },
  unstable__errors: {
    form_identifier_not_found: '',
    form_password_pwned: '',
    form_username_invalid_length: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
  },
} as const;
