---
title: 'New localization keys added'
matcher: "<ClerkProvider[\\s\\S]*?localization=[\\s\\S]*?>"
matcherFlags: 'm'
category: 'localization'
warning: true
---

As part of the redesign of Clerk's components, a number of new localization keys have been added and can be seen along with their default english values in the code block below. If you do not supply translated values for these keys in your custom localization, they will fall back to the default english values specified below.

```js
const newValues = {
  formButtonPrimary__verify: 'Verify',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  organizationProfile: {
    invitePage: {
      selectDropdown__role: 'Select role',
    },
    navbar: {
      description: 'Manage your organization.',
      general: 'General',
      members: 'Members',
      title: 'Organization',
    },
    profilePage: {
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
      },
    },
    start: {
      headerTitle__general: 'General',
      profileSection: {
        primaryButton: 'Update profile',
        title: 'Organization Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      title: 'Update {{domain}}',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionText: 'Don’t have any of these?',
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
    },
    forgotPassword: {
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
  },
  unstable__errors: {
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
  },
  userProfile: {
    emailAddressPage: {
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
    },
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      successMessage__set: 'Your password has been set.',
      successMessage__signOutOfOtherSessions: 'All other devices have been signed out.',
      successMessage__update: 'Your password has been updated.',
      title__set: 'Set password',
      title__update: 'Update password',
    },
    phoneNumberPage: {
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    start: {
      passwordSection: {
        primaryButton__updatePassword: 'Update password',
      },
      profileSection: {
        primaryButton: 'Update profile',
      },
      usernameSection: {
        primaryButton__updateUsername: 'Update username',
      },
    },
    usernamePage: {
      title__set: 'Set username',
      title__update: 'Update username',
    },
  },
};
```
