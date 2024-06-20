---
title: 'Localization keys changed'
matcherFlags: 'm'
category: 'localization'
matcher:
  - 'formFieldLabel__organizationName:'
  - 'formFieldLabel__organizationSlug:'
  - 'formFieldInputPlaceholder__emailAddresses:'
  - 'formFieldInputPlaceholder__organizationSlug:'
  - "signUp:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?subtitle:"
  - "signUp:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?actionText:"
  - "signUp:\\s+{[\\s\\S]*?emailCode:\\s+{[\\s\\S]*?subtitle:"
  - "signUp:\\s+{[\\s\\S]*?phoneCode:\\s+{[\\s\\S]*?subtitle:"
  - "signUp:\\s+{[\\s\\S]*?continue:\\s+{[\\s\\S]*?subtitle:"
  - "signUp:\\s+{[\\s\\S]*?continue:\\s+{[\\s\\S]*?actionText:"
  - "signIn:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?title:"
  - "signIn:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?subtitle:"
  - "signIn:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?actionText:"
  - "signIn:\\s+{[\\s\\S]*?password:\\s+{[\\s\\S]*?subtitle:"
  - "signIn:\\s+{[\\s\\S]*?forgotPasswordAlternativeMethods:\\s+{[\\s\\S]*?label__alternativeMethods:"
  - "signIn:\\s+{[\\s\\S]*?resetPassword:\\s+{[\\s\\S]*?title:"
  - "signIn:\\s+{[\\s\\S]*?phoneCodeMfa:\\s+{[\\s\\S]*?subtitle:"
  - "signIn:\\s+{[\\s\\S]*?totpMfa:\\s+{[\\s\\S]*?subtitle:"
  - "signIn:\\s+{[\\s\\S]*?backupCodeMfa:\\s+{[\\s\\S]*?subtitle:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?headerTitle__account:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?emailAddressesSection:\\s+{[\\s\\S]*?primaryButton:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?emailAddressesSection:\\s+{[\\s\\S]*?detailsAction__unverified:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?emailAddressesSection:\\s+{[\\s\\S]*?destructiveAction:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?phoneNumbersSection:\\s+{[\\s\\S]*?primaryButton:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?mfaSection:\\s+{[\\s\\S]*?phoneCode:\\s+{[\\s\\S]*?destructiveActionLabel:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?mfaSection:\\s+{[\\s\\S]*?backupCodes:\\s+{[\\s\\S]*?actionLabel__regenerate:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?dangerSection:\\s+{[\\s\\S]*?title:"
  - "userProfile:\\s+{[\\s\\S]*?start:\\s+{[\\s\\S]*?dangerSection:\\s+{[\\s\\S]*?deleteAccountButton:"
  - "userProfile:\\s+{[\\s\\S]*?profilePage:\\s+{[\\s\\S]*?imageFormSubtitle:"
  - "userProfile:\\s+{[\\s\\S]*?profilePage:\\s+{[\\s\\S]*?imageFormDestructiveActionSubtitle:"
  - "userProfile:\\s+{[\\s\\S]*?profilePage:\\s+{[\\s\\S]*?fileDropAreaHint:"
  - "userProfile:\\s+{[\\s\\S]*?phoneNumberPage:\\s+{[\\s\\S]*?infoText:"
  - "userProfile:\\s+{[\\s\\S]*?connectedAccountPage:\\s+{[\\s\\S]*?socialButtonsBlockButton:"
  - "userProfile:\\s+{[\\s\\S]*?mfaPhoneCodePage:\\s+{[\\s\\S]*?primaryButton__addPhoneNumber:"
  - "userProfile:\\s+{[\\s\\S]*?mfaPhoneCodePage:\\s+{[\\s\\S]*?subtitle__availablePhoneNumbers:"
  - "userProfile:\\s+{[\\s\\S]*?mfaPhoneCodePage:\\s+{[\\s\\S]*?subtitle__unavailablePhoneNumbers:"
  - "userProfile:\\s+{[\\s\\S]*?deletePage:\\s+{[\\s\\S]*?actionDescription:"
  - "organizationSwitcher:\\s+{[\\s\\S]*?action__createOrganization:"
  - "organizationSwitcher:\\s+{[\\s\\S]*?action__manageOrganization:"
  - "organizationProfile:\\s+{[\\s\\S]*?profilePage:\\s+{[\\s\\S]*?title:"
  - "organizationProfile:\\s+{[\\s\\S]*?profilePage:\\s+{[\\s\\S]*?dangerSection:\\s+{[\\s\\S]*?leaveOrganization:\\s+{[\\s\\S]*?actionDescription:"
  - "organizationProfile:\\s+{[\\s\\S]*?profilePage:\\s+{[\\s\\S]*?dangerSection:\\s+{[\\s\\S]*?deleteOrganization:\\s+{[\\s\\S]*?actionDescription:"
  - "organizationProfile:\\s+{[\\s\\S]*?invitePage:\\s+{[\\s\\S]*?title:"
  - "organizationProfile:\\s+{[\\s\\S]*?invitePage:\\s+{[\\s\\S]*?subtitle:"
  - "createOrganization:\\s+{[\\s\\S]*?title:"
  - "organizationList:\\s+{[\\s\\S]*?title:"
  - "organizationList:\\s+{[\\s\\S]*?titleWithoutPersonal:"
---

The values of some keys have been changed on the default [en-US localization object](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts). The list below shows you the new defaults (as of writing this guide) which you can either use or overwrite. If you have overridden these values, make sure to double check so you can be sure that your modifications are appropriate.

```js
const changedValues = {
  formFieldLabel__organizationName: 'Name',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  signUp: {
    start: {
      subtitle: 'Welcome! Please fill in the details to get started.',
      actionText: 'Already have an account?',
    },
    emailCode: {
      subtitle: 'Enter the verification code sent to your email',
    },
    phoneCode: {
      subtitle: 'Enter the verification code sent to your phone',
    },
    continue: {
      subtitle: 'Please fill in the remaining details to continue.',
      actionText: 'Already have an account?',
    },
  },
  signIn: {
    start: {
      title: 'Sign in to {{applicationName}}',
      subtitle: 'Welcome back! Please sign in to continue',
      actionText: 'Don’t have an account?',
    },
    password: {
      subtitle: 'Enter the password associated with your account',
    },
    forgotPasswordAlternativeMethods: {
      label__alternativeMethods: 'Or, sign in with another method',
    },
    resetPassword: {
      title: 'Set new password',
    },
    phoneCodeMfa: {
      subtitle: 'To continue, please enter the verification code sent to your phone',
    },
    totpMfa: {
      subtitle: 'To continue, please enter the verification code generated by your authenticator app',
    },
    backupCodeMfa: {
      subtitle: 'Your backup code is the one you got when setting up two-step authentication.',
    },
  },
  userProfile: {
    start: {
      headerTitle__account: 'Profile details',
      emailAddressesSection: {
        primaryButton: 'Add email address',
        detailsAction__unverified: 'Verify',
        destructiveAction: 'Remove email',
      },
      phoneNumbersSection: {
        primaryButton: 'Add phone number',
      },
      mfaSection: {
        phoneCode: {
          destructiveActionLabel: 'Remove',
        },
        backupCodes: {
          actionLabel__regenerate: 'Regenerate',
        },
      },
      dangerSection: {
        title: 'Delete account',
        deleteAccountButton: 'Delete account',
      },
    },
    profilePage: {
      imageFormSubtitle: 'Upload',
      imageFormDestructiveActionSubtitle: 'Remove',
      fileDropAreaHint: 'Recommended size 1:1, up to 10MB.',
    },
    phoneNumberPage: {
      infoText:
        'A text message containing a verification code will be sent to this phone number. Message and data rates may apply.',
    },
    connectedAccountPage: {
      socialButtonsBlockButton: '{{provider|titleize}}',
    },
    mfaPhoneCodePage: {
      primaryButton__addPhoneNumber: 'Add phone number',
      subtitle__availablePhoneNumbers:
        'Select an existing phone number to register for SMS code two-step verification or add a new one.',
      subtitle__unavailablePhoneNumbers:
        'There are no available phone numbers to register for SMS code two-step verification, please add a new one.',
    },
    deletePage: {
      actionDescription: "Type 'Delete account' below to continue.",
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Create organization',
    action__manageOrganization: 'Manage',
  },
  organizationProfile: {
    profilePage: {
      title: 'Update profile',
      dangerSection: {
        leaveOrganization: {
          actionDescription: "Type '{{organizationName}}' below to continue.",
        },
        deleteOrganization: {
          actionDescription: "Type '{{organizationName}}' below to continue.",
        },
      },
    },
    invitePage: {
      title: 'Invite new members',
      subtitle: 'Enter or paste one or more email addresses, separated by spaces or commas.',
    },
  },
  createOrganization: {
    title: 'Create organization',
  },
  organizationList: {
    title: 'Choose an account',
    titleWithoutPersonal: 'Choose an organization',
  },
};
```
