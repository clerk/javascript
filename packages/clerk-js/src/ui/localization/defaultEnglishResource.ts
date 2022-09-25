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
  formFieldAction__forgotPassword: 'Forgot password',
  formFieldHintText__optional: 'Optional',
  formButtonPrimary: 'Continue',
  signInEnterPasswordTitle: 'Enter your password',
  backButton: 'Back',
  footerActionLink__useAnotherMethod: 'Use another method',
  badge__primary: 'Primary',
  badge__thisDevice: 'This device',
  badge__default: 'Default',
  badge__unverified: 'Unverified',
  badge__requiresAction: 'Requires action',
  footerPageLink__help: 'Help',
  footerPageLink__privacy: 'Privacy',
  footerPageLink__terms: 'Terms',
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
    phoneCode2Fa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totp2Fa: {
      title: 'Two-step authentication',
      subtitle: '',
      formTitle: 'Verification code',
      formSubtitle: 'Enter the verification code generated by your authenticator app',
    },
    alternativeMethods: {
      title: 'Use another method',
      actionLink: 'Get help',
      blockButton__emailLink: 'Send link to {{identifier}}',
      blockButton__emailCode: 'Send code to {{identifier}}',
      blockButton__phoneCode: 'Send code to {{identifier}}',
      blockButton__password: 'Sign in with your password',
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
      },
      passwordSection: {
        title: 'Password',
        primaryButton__changePassword: 'Change password',
        primaryButton__setPassword: 'Set password',
      },
      mfaSection: {
        title: 'Two-step verification',
        primaryButton: 'Add two-step verification',
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
    },
    connectedAccountPage: {
      title: 'Add connected account',
      formHint: 'Select a provider to connect your account.',
      formHint__noAccounts: 'There are no available external account providers.',
      socialButtonsBlockButton: 'Connect {{provider|titleize}} account',
      successMessage: 'The provider has been added to your account',
    },
    passwordPage: {
      title: 'Set password',
      successMessage: 'Your password has been set.',
    },
    mfaPage: {
      title: 'Add two-step verification',
      formHint: 'Select a method to add.',
      successMessage: 'Your password has been set.',
    },
  },
  userButton: {
    action__manageAccount: 'Manage account',
    action__signOut: 'Sign out',
    action__signOutAll: 'Sign out of all accounts',
    action__addAccount: 'Add account',
  },
  unstable__errors: {
    form_identifier_not_found: '',
    form_password_pwned: '',
    form_username_invalid_length: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
  },
} as const;
