import { DeepPartial } from './utils';

export type LocalizationValue = string;

/**
 * A type containing all the possible localization keys the prebuilt Clerk components support.
 * Users aiming to customise a few strings can also peak at the `data-localization-key` attribute by inspecting
 * the DOM and updating the corresponding key.
 * Users aiming to completely localize the components by providing a complete translation can use
 * the default english resource object from {@link https://github.com/clerkinc/javascript our open source repo}
 * as a starting point.
 */
export type LocalizationResource = DeepPartial<_LocalizationResource>;

type _LocalizationResource = {
  socialButtonsBlockButton: LocalizationValue;
  dividerText: LocalizationValue;
  formFieldLabel__emailAddress: LocalizationValue;
  formFieldLabel__phoneNumber: LocalizationValue;
  formFieldLabel__username: LocalizationValue;
  formFieldLabel__emailAddress_phoneNumber: LocalizationValue;
  formFieldLabel__emailAddress_username: LocalizationValue;
  formFieldLabel__phoneNumber_username: LocalizationValue;
  formFieldLabel__emailAddress_phoneNumber_username: LocalizationValue;
  formFieldLabel__password: LocalizationValue;
  formFieldLabel__newPassword: LocalizationValue;
  formFieldLabel__confirmPassword: LocalizationValue;
  formFieldLabel__firstName: LocalizationValue;
  formFieldLabel__lastName: LocalizationValue;
  formFieldLabel__backupCode: LocalizationValue;
  formFieldInputPlaceholder__emailAddress: LocalizationValue;
  formFieldInputPlaceholder__phoneNumber: LocalizationValue;
  formFieldInputPlaceholder__username: LocalizationValue;
  formFieldInputPlaceholder__emailAddress_phoneNumber: LocalizationValue;
  formFieldInputPlaceholder__emailAddress_username: LocalizationValue;
  formFieldInputPlaceholder__phoneNumber_username: LocalizationValue;
  formFieldInputPlaceholder__emailAddress_phoneNumber_username: LocalizationValue;
  formFieldInputPlaceholder__password: LocalizationValue;
  formFieldInputPlaceholder__firstName: LocalizationValue;
  formFieldInputPlaceholder__lastName: LocalizationValue;
  formFieldInputPlaceholder__backupCode: LocalizationValue;
  formFieldAction__forgotPassword: LocalizationValue;
  formFieldHintText__optional: LocalizationValue;
  formButtonPrimary: LocalizationValue;
  signInEnterPasswordTitle: LocalizationValue;
  backButton: LocalizationValue;
  footerActionLink__useAnotherMethod: LocalizationValue;
  badge__primary: LocalizationValue;
  badge__thisDevice: LocalizationValue;
  badge__userDevice: LocalizationValue;
  badge__otherImpersonatorDevice: LocalizationValue;
  badge__default: LocalizationValue;
  badge__unverified: LocalizationValue;
  badge__requiresAction: LocalizationValue;
  footerPageLink__help: LocalizationValue;
  footerPageLink__privacy: LocalizationValue;
  footerPageLink__terms: LocalizationValue;
  signUp: {
    start: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
    };
    emailLink: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    emailCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    continue: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
    };
  };
  signIn: {
    start: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
    };
    password: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
    };
    emailCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    emailLink: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCode2Fa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    totp2Fa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
    };
    backupCode2Fa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
    };
    alternativeMethods: {
      title: LocalizationValue;
      actionLink: LocalizationValue;
      blockButton__emailLink: LocalizationValue;
      blockButton__emailCode: LocalizationValue;
      blockButton__phoneCode: LocalizationValue;
      blockButton__password: LocalizationValue;
      blockButton__totp: LocalizationValue;
      blockButton__backupCode: LocalizationValue;
      getHelp: {
        title: LocalizationValue;
        content: LocalizationValue;
        blockButton__emailSupport: LocalizationValue;
      };
    };
  };
  userProfile: {
    mobileButton__menu: LocalizationValue;
    formButtonPrimary__continue: LocalizationValue;
    formButtonPrimary__finish: LocalizationValue;
    formButtonReset: LocalizationValue;
    start: {
      headerTitle__account: LocalizationValue;
      headerTitle__security: LocalizationValue;
      headerSubtitle__account: LocalizationValue;
      headerSubtitle__security: LocalizationValue;
      profileSection: {
        title: LocalizationValue;
      };
      usernameSection: {
        title: LocalizationValue;
        primaryButton__changeUsername: LocalizationValue;
        primaryButton__setUsername: LocalizationValue;
      };
      emailAddressesSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        detailsTitle__primary: LocalizationValue;
        detailsSubtitle__primary: LocalizationValue;
        detailsAction__primary: LocalizationValue;
        detailsTitle__nonPrimary: LocalizationValue;
        detailsSubtitle__nonPrimary: LocalizationValue;
        detailsAction__nonPrimary: LocalizationValue;
        detailsTitle__unverified: LocalizationValue;
        detailsSubtitle__unverified: LocalizationValue;
        detailsAction__unverified: LocalizationValue;
        destructiveActionTitle: LocalizationValue;
        destructiveActionSubtitle: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      phoneNumbersSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        detailsTitle__primary: LocalizationValue;
        detailsSubtitle__primary: LocalizationValue;
        detailsAction__primary: LocalizationValue;
        detailsTitle__nonPrimary: LocalizationValue;
        detailsSubtitle__nonPrimary: LocalizationValue;
        detailsAction__nonPrimary: LocalizationValue;
        detailsTitle__unverified: LocalizationValue;
        detailsSubtitle__unverified: LocalizationValue;
        detailsAction__unverified: LocalizationValue;
        destructiveActionTitle: LocalizationValue;
        destructiveActionSubtitle: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      connectedAccountsSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
      };
      passwordSection: {
        title: LocalizationValue;
        primaryButton__changePassword: LocalizationValue;
        primaryButton__setPassword: LocalizationValue;
      };
      mfaSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
      };
      activeDevicesSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        detailsTitle: LocalizationValue;
        detailsSubtitle: LocalizationValue;
        destructiveActionTitle: LocalizationValue;
        destructiveActionSubtitle: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      web3WalletsSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        destructiveActionTitle: LocalizationValue;
        destructiveActionSubtitle: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
    };
    profilePage: {
      title: LocalizationValue;
      imageFormTitle: LocalizationValue;
      imageFormSubtitle: LocalizationValue;
      fileDropAreaTitle: LocalizationValue;
      fileDropAreaAction: LocalizationValue;
      fileDropAreaHint: LocalizationValue;
      successMessage: LocalizationValue;
    };
    usernamePage: {
      title: LocalizationValue;
      successMessage: LocalizationValue;
    };
    emailAddressPage: {
      title: LocalizationValue;
      emailCode: {
        formHint: LocalizationValue;
        formTitle: LocalizationValue;
        formSubtitle: LocalizationValue;
        resendButton: LocalizationValue;
        successMessage: LocalizationValue;
      };
      emailLink: {
        formHint: LocalizationValue;
        formTitle: LocalizationValue;
        formSubtitle: LocalizationValue;
        resendButton: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    connectedAccountPage: {
      title: LocalizationValue;
      formHint: LocalizationValue;
      formHint__noAccounts: LocalizationValue;
      socialButtonsBlockButton: LocalizationValue;
      successMessage: LocalizationValue;
    };
    passwordPage: {
      title: LocalizationValue;
      successMessage: LocalizationValue;
    };
    mfaPage: {
      title: LocalizationValue;
      formHint: LocalizationValue;
      successMessage: LocalizationValue;
    };
  };
  userButton: {
    action__manageAccount: LocalizationValue;
    action__signOut: LocalizationValue;
    action__signOutAll: LocalizationValue;
    action__addAccount: LocalizationValue;
  };
  impersonationFab: {
    title: LocalizationValue;
    action__signOut: LocalizationValue;
  };
  unstable__errors: {
    form_identifier_not_found: LocalizationValue;
    form_password_pwned: LocalizationValue;
    form_username_invalid_length: LocalizationValue;
    form_param_format_invalid: LocalizationValue;
    form_password_length_too_short: LocalizationValue;
    form_param_nil: LocalizationValue;
    form_code_incorrect: LocalizationValue;
    form_password_incorrect: LocalizationValue;
  };
};
