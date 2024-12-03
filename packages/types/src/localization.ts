import type { FieldId } from './elementIds';
import type { CamelToSnake, DeepPartial } from './utils';

export type LocalizationValue = string;

/**
 * A type containing all the possible localization keys the prebuilt Clerk components support.
 * Users aiming to customise a few strings can also peak at the `data-localization-key` attribute by inspecting
 * the DOM and updating the corresponding key.
 * Users aiming to completely localize the components by providing a complete translation can use
 * the default english resource object from {@link https://github.com/clerk/javascript Clerk's open source repo}
 * as a starting point.
 */
export type LocalizationResource = DeepPartial<_LocalizationResource>;

type _LocalizationResource = {
  locale: string;
  maintenanceMode: LocalizationValue;
  /**
   * @experimental
   * Add role keys and their localized value
   * e.g. roles:{ 'org:teacher': 'Teacher'}
   */
  roles: {
    [r: string]: LocalizationValue;
  };
  socialButtonsBlockButton: LocalizationValue;
  socialButtonsBlockButtonManyInView: LocalizationValue;
  dividerText: LocalizationValue;
  formFieldLabel__emailAddress: LocalizationValue;
  formFieldLabel__emailAddresses: LocalizationValue;
  formFieldLabel__phoneNumber: LocalizationValue;
  formFieldLabel__username: LocalizationValue;
  formFieldLabel__emailAddress_username: LocalizationValue;
  formFieldLabel__password: LocalizationValue;
  formFieldLabel__currentPassword: LocalizationValue;
  formFieldLabel__newPassword: LocalizationValue;
  formFieldLabel__confirmPassword: LocalizationValue;
  formFieldLabel__signOutOfOtherSessions: LocalizationValue;
  formFieldLabel__automaticInvitations: LocalizationValue;
  formFieldLabel__firstName: LocalizationValue;
  formFieldLabel__lastName: LocalizationValue;
  formFieldLabel__backupCode: LocalizationValue;
  formFieldLabel__organizationName: LocalizationValue;
  formFieldLabel__organizationSlug: LocalizationValue;
  formFieldLabel__organizationDomain: LocalizationValue;
  formFieldLabel__organizationDomainEmailAddress: LocalizationValue;
  formFieldLabel__organizationDomainEmailAddressDescription: LocalizationValue;
  formFieldLabel__organizationDomainDeletePending: LocalizationValue;
  formFieldLabel__confirmDeletion: LocalizationValue;
  formFieldLabel__role: LocalizationValue;
  formFieldLabel__passkeyName: LocalizationValue;
  formFieldInputPlaceholder__emailAddress: LocalizationValue;
  formFieldInputPlaceholder__emailAddresses: LocalizationValue;
  formFieldInputPlaceholder__phoneNumber: LocalizationValue;
  formFieldInputPlaceholder__username: LocalizationValue;
  formFieldInputPlaceholder__emailAddress_username: LocalizationValue;
  formFieldInputPlaceholder__password: LocalizationValue;
  formFieldInputPlaceholder__firstName: LocalizationValue;
  formFieldInputPlaceholder__lastName: LocalizationValue;
  formFieldInputPlaceholder__backupCode: LocalizationValue;
  formFieldInputPlaceholder__organizationName: LocalizationValue;
  formFieldInputPlaceholder__organizationSlug: LocalizationValue;
  formFieldInputPlaceholder__organizationDomain: LocalizationValue;
  formFieldInputPlaceholder__organizationDomainEmailAddress: LocalizationValue;
  formFieldInputPlaceholder__confirmDeletionUserAccount: LocalizationValue;
  formFieldError__notMatchingPasswords: LocalizationValue;
  formFieldError__matchingPasswords: LocalizationValue;
  formFieldError__verificationLinkExpired: LocalizationValue;
  formFieldAction__forgotPassword: LocalizationValue;
  formFieldHintText__optional: LocalizationValue;
  formFieldHintText__slug: LocalizationValue;
  formButtonPrimary: LocalizationValue;
  formButtonPrimary__verify: LocalizationValue;
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
  badge__you: LocalizationValue;
  footerPageLink__help: LocalizationValue;
  footerPageLink__privacy: LocalizationValue;
  footerPageLink__terms: LocalizationValue;
  paginationButton__previous: LocalizationValue;
  paginationButton__next: LocalizationValue;
  paginationRowText__displaying: LocalizationValue;
  paginationRowText__of: LocalizationValue;
  membershipRole__admin: LocalizationValue;
  membershipRole__basicMember: LocalizationValue;
  membershipRole__guestMember: LocalizationValue;
  signUp: {
    start: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
      actionLink__use_phone: LocalizationValue;
      actionLink__use_email: LocalizationValue;
    };
    emailLink: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
      verified: {
        title: LocalizationValue;
      };
      loading: {
        title: LocalizationValue;
      };
      verifiedSwitchTab: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
        subtitleNewTab: LocalizationValue;
      };
      clientMismatch: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
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
    restrictedAccess: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      subtitleWaitlist: LocalizationValue;
      actionLink: LocalizationValue;
      actionText: LocalizationValue;
      blockButton__emailSupport: LocalizationValue;
      blockButton__joinWaitlist: LocalizationValue;
    };
    legalConsent: {
      continue: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
      checkbox: {
        label__termsOfServiceAndPrivacyPolicy: LocalizationValue;
        label__onlyPrivacyPolicy: LocalizationValue;
        label__onlyTermsOfService: LocalizationValue;
      };
    };
  };
  signIn: {
    start: {
      title: LocalizationValue;
      __experimental_titleCombined: LocalizationValue;
      subtitle: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
      actionLink__use_email: LocalizationValue;
      actionLink__use_phone: LocalizationValue;
      actionLink__use_username: LocalizationValue;
      actionLink__use_email_username: LocalizationValue;
      actionLink__use_passkey: LocalizationValue;
      actionText__join_waitlist: LocalizationValue;
      actionLink__join_waitlist: LocalizationValue;
    };
    password: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
    };
    passwordPwned: {
      title: LocalizationValue;
    };
    passkey: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
    };
    forgotPasswordAlternativeMethods: {
      title: LocalizationValue;
      label__alternativeMethods: LocalizationValue;
      blockButton__resetPassword: LocalizationValue;
    };
    forgotPassword: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      subtitle_email: LocalizationValue;
      subtitle_phone: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    resetPassword: {
      title: LocalizationValue;
      formButtonPrimary: LocalizationValue;
      successMessage: LocalizationValue;
      requiredMessage: LocalizationValue;
    };
    resetPasswordMfa: {
      detailsLabel: LocalizationValue;
    };
    emailCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    emailLink: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
      unusedTab: {
        title: LocalizationValue;
      };
      verified: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
      verifiedSwitchTab: {
        subtitle: LocalizationValue;
        titleNewTab: LocalizationValue;
        subtitleNewTab: LocalizationValue;
      };
      loading: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
      failed: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
      expired: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
      clientMismatch: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
    };
    phoneCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCodeMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    totpMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
    };
    backupCodeMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
    };
    alternativeMethods: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
      actionText: LocalizationValue;
      blockButton__emailLink: LocalizationValue;
      blockButton__emailCode: LocalizationValue;
      blockButton__phoneCode: LocalizationValue;
      blockButton__password: LocalizationValue;
      blockButton__passkey: LocalizationValue;
      blockButton__totp: LocalizationValue;
      blockButton__backupCode: LocalizationValue;
      getHelp: {
        title: LocalizationValue;
        content: LocalizationValue;
        blockButton__emailSupport: LocalizationValue;
      };
    };
    noAvailableMethods: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      message: LocalizationValue;
    };
    accountSwitcher: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      action__addAccount: LocalizationValue;
      action__signOutAll: LocalizationValue;
    };
  };
  reverification: {
    password: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
    };
    emailCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCodeMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    totpMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
    };
    backupCodeMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
    };
    alternativeMethods: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
      actionText: LocalizationValue;
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
    noAvailableMethods: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      message: LocalizationValue;
    };
  };
  userProfile: {
    mobileButton__menu: LocalizationValue;
    formButtonPrimary__continue: LocalizationValue;
    formButtonPrimary__save: LocalizationValue;
    formButtonPrimary__finish: LocalizationValue;
    formButtonPrimary__remove: LocalizationValue;
    formButtonPrimary__add: LocalizationValue;
    formButtonReset: LocalizationValue;
    navbar: {
      title: LocalizationValue;
      description: LocalizationValue;
      account: LocalizationValue;
      security: LocalizationValue;
    };
    start: {
      headerTitle__account: LocalizationValue;
      headerTitle__security: LocalizationValue;
      profileSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
      };
      usernameSection: {
        title: LocalizationValue;
        primaryButton__updateUsername: LocalizationValue;
        primaryButton__setUsername: LocalizationValue;
      };
      emailAddressesSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        detailsAction__primary: LocalizationValue;
        detailsAction__nonPrimary: LocalizationValue;
        detailsAction__unverified: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      phoneNumbersSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        detailsAction__primary: LocalizationValue;
        detailsAction__nonPrimary: LocalizationValue;
        detailsAction__unverified: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      connectedAccountsSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        actionLabel__connectionFailed: LocalizationValue;
        /**
         * @deprecated UserProfile now only uses `actionLabel__connectionFailed`.
         */
        actionLabel__reauthorize: LocalizationValue;
        /**
         * @deprecated UserProfile now uses `subtitle__disconnected`.
         */
        subtitle__reauthorize: LocalizationValue;
        subtitle__disconnected: LocalizationValue;
        destructiveActionTitle: LocalizationValue;
      };
      enterpriseAccountsSection: {
        title: LocalizationValue;
      };
      passwordSection: {
        title: LocalizationValue;
        primaryButton__updatePassword: LocalizationValue;
        primaryButton__setPassword: LocalizationValue;
      };
      passkeysSection: {
        title: LocalizationValue;
        menuAction__rename: LocalizationValue;
        menuAction__destructive: LocalizationValue;
      };
      mfaSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        phoneCode: {
          destructiveActionLabel: LocalizationValue;
          actionLabel__setDefault: LocalizationValue;
        };
        backupCodes: {
          headerTitle: LocalizationValue;
          title__regenerate: LocalizationValue;
          subtitle__regenerate: LocalizationValue;
          actionLabel__regenerate: LocalizationValue;
        };
        totp: {
          headerTitle: LocalizationValue;
          destructiveActionTitle: LocalizationValue;
        };
      };
      activeDevicesSection: {
        title: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      web3WalletsSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        destructiveAction: LocalizationValue;
      };
      dangerSection: {
        title: LocalizationValue;
        deleteAccountButton: LocalizationValue;
      };
    };
    profilePage: {
      title: LocalizationValue;
      imageFormTitle: LocalizationValue;
      imageFormSubtitle: LocalizationValue;
      imageFormDestructiveActionSubtitle: LocalizationValue;
      fileDropAreaHint: LocalizationValue;
      readonly: LocalizationValue;
      successMessage: LocalizationValue;
    };
    usernamePage: {
      successMessage: LocalizationValue;
      title__set: LocalizationValue;
      title__update: LocalizationValue;
    };
    emailAddressPage: {
      title: LocalizationValue;
      verifyTitle: LocalizationValue;
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
      enterpriseSsoLink: {
        formHint: LocalizationValue;
        formSubtitle: LocalizationValue;
        resendButton: LocalizationValue;
        successMessage: LocalizationValue;
      };
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    passkeyScreen: {
      title__rename: LocalizationValue;
      subtitle__rename: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
      };
    };
    phoneNumberPage: {
      title: LocalizationValue;
      verifyTitle: LocalizationValue;
      verifySubtitle: LocalizationValue;
      successMessage: LocalizationValue;
      infoText: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    connectedAccountPage: {
      title: LocalizationValue;
      formHint: LocalizationValue;
      formHint__noAccounts: LocalizationValue;
      socialButtonsBlockButton: LocalizationValue;
      successMessage: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    web3WalletPage: {
      title: LocalizationValue;
      subtitle__availableWallets: LocalizationValue;
      subtitle__unavailableWallets: LocalizationValue;
      web3WalletButtonsBlockButton: LocalizationValue;
      successMessage: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    passwordPage: {
      successMessage__set: LocalizationValue;
      successMessage__update: LocalizationValue;
      successMessage__signOutOfOtherSessions: LocalizationValue;
      checkboxInfoText__signOutOfOtherSessions: LocalizationValue;
      readonly: LocalizationValue;
      title__set: LocalizationValue;
      title__update: LocalizationValue;
    };
    mfaPage: {
      title: LocalizationValue;
      formHint: LocalizationValue;
    };
    mfaTOTPPage: {
      title: LocalizationValue;
      verifyTitle: LocalizationValue;
      verifySubtitle: LocalizationValue;
      successMessage: LocalizationValue;
      authenticatorApp: {
        infoText__ableToScan: LocalizationValue;
        infoText__unableToScan: LocalizationValue;
        inputLabel__unableToScan1: LocalizationValue;
        inputLabel__unableToScan2: LocalizationValue;
        buttonAbleToScan__nonPrimary: LocalizationValue;
        buttonUnableToScan__nonPrimary: LocalizationValue;
      };
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    mfaPhoneCodePage: {
      title: LocalizationValue;
      primaryButton__addPhoneNumber: LocalizationValue;
      backButton: LocalizationValue;
      subtitle__availablePhoneNumbers: LocalizationValue;
      subtitle__unavailablePhoneNumbers: LocalizationValue;
      successTitle: LocalizationValue;
      successMessage1: LocalizationValue;
      successMessage2: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    backupCodePage: {
      title: LocalizationValue;
      title__codelist: LocalizationValue;
      subtitle__codelist: LocalizationValue;
      infoText1: LocalizationValue;
      infoText2: LocalizationValue;
      successSubtitle: LocalizationValue;
      successMessage: LocalizationValue;
      actionLabel__copy: LocalizationValue;
      actionLabel__copied: LocalizationValue;
      actionLabel__download: LocalizationValue;
      actionLabel__print: LocalizationValue;
    };
    deletePage: {
      title: LocalizationValue;
      messageLine1: LocalizationValue;
      messageLine2: LocalizationValue;
      actionDescription: LocalizationValue;
      confirm: LocalizationValue;
    };
  };
  userButton: {
    action__manageAccount: LocalizationValue;
    action__signOut: LocalizationValue;
    action__signOutAll: LocalizationValue;
    action__addAccount: LocalizationValue;
  };
  organizationSwitcher: {
    personalWorkspace: LocalizationValue;
    notSelected: LocalizationValue;
    action__createOrganization: LocalizationValue;
    action__manageOrganization: LocalizationValue;
    action__invitationAccept: LocalizationValue;
    action__suggestionsAccept: LocalizationValue;
    suggestionsAcceptedLabel: LocalizationValue;
  };
  impersonationFab: {
    title: LocalizationValue;
    action__signOut: LocalizationValue;
  };
  organizationProfile: {
    navbar: {
      title: LocalizationValue;
      description: LocalizationValue;
      general: LocalizationValue;
      members: LocalizationValue;
    };
    badge__unverified: LocalizationValue;
    badge__automaticInvitation: LocalizationValue;
    badge__automaticSuggestion: LocalizationValue;
    badge__manualInvitation: LocalizationValue;
    start: {
      headerTitle__members: LocalizationValue;
      headerTitle__general: LocalizationValue;
      profileSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        uploadAction__title: LocalizationValue;
      };
    };
    profilePage: {
      title: LocalizationValue;
      successMessage: LocalizationValue;
      dangerSection: {
        title: LocalizationValue;
        leaveOrganization: {
          title: LocalizationValue;
          messageLine1: LocalizationValue;
          messageLine2: LocalizationValue;
          successMessage: LocalizationValue;
          actionDescription: LocalizationValue;
        };
        deleteOrganization: {
          title: LocalizationValue;
          messageLine1: LocalizationValue;
          messageLine2: LocalizationValue;
          actionDescription: LocalizationValue;
          successMessage: LocalizationValue;
        };
      };
      domainSection: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
        primaryButton: LocalizationValue;
        menuAction__verify: LocalizationValue;
        menuAction__remove: LocalizationValue;
        menuAction__manage: LocalizationValue;
      };
    };
    createDomainPage: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
    };
    verifyDomainPage: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      subtitleVerificationCodeScreen: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    verifiedDomainPage: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      start: {
        headerTitle__enrollment: LocalizationValue;
        headerTitle__danger: LocalizationValue;
      };
      enrollmentTab: {
        subtitle: LocalizationValue;
        manualInvitationOption__label: LocalizationValue;
        manualInvitationOption__description: LocalizationValue;
        automaticInvitationOption__label: LocalizationValue;
        automaticInvitationOption__description: LocalizationValue;
        automaticSuggestionOption__label: LocalizationValue;
        automaticSuggestionOption__description: LocalizationValue;
        calloutInfoLabel: LocalizationValue;
        calloutInvitationCountLabel: LocalizationValue;
        calloutSuggestionCountLabel: LocalizationValue;
      };
      dangerTab: {
        removeDomainTitle: LocalizationValue;
        removeDomainSubtitle: LocalizationValue;
        removeDomainActionLabel__remove: LocalizationValue;
        calloutInfoLabel: LocalizationValue;
      };
    };
    invitePage: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      successMessage: LocalizationValue;
      detailsTitle__inviteFailed: LocalizationValue;
      formButtonPrimary__continue: LocalizationValue;
      selectDropdown__role: LocalizationValue;
    };
    removeDomainPage: {
      title: LocalizationValue;
      messageLine1: LocalizationValue;
      messageLine2: LocalizationValue;
      successMessage: LocalizationValue;
    };
    membersPage: {
      detailsTitle__emptyRow: LocalizationValue;
      action__invite: LocalizationValue;
      start: {
        headerTitle__members: LocalizationValue;
        headerTitle__invitations: LocalizationValue;
        headerTitle__requests: LocalizationValue;
      };
      activeMembersTab: {
        tableHeader__user: LocalizationValue;
        tableHeader__joined: LocalizationValue;
        tableHeader__role: LocalizationValue;
        tableHeader__actions: LocalizationValue;
        menuAction__remove: LocalizationValue;
      };
      invitedMembersTab: {
        tableHeader__invited: LocalizationValue;
        menuAction__revoke: LocalizationValue;
      };
      invitationsTab: {
        table__emptyRow: LocalizationValue;
        autoInvitations: {
          headerTitle: LocalizationValue;
          headerSubtitle: LocalizationValue;
          primaryButton: LocalizationValue;
        };
      };
      requestsTab: {
        tableHeader__requested: LocalizationValue;
        menuAction__approve: LocalizationValue;
        menuAction__reject: LocalizationValue;
        table__emptyRow: LocalizationValue;
        autoSuggestions: {
          headerTitle: LocalizationValue;
          headerSubtitle: LocalizationValue;
          primaryButton: LocalizationValue;
        };
      };
    };
  };
  createOrganization: {
    title: LocalizationValue;
    formButtonSubmit: LocalizationValue;
    invitePage: {
      formButtonReset: LocalizationValue;
    };
  };
  organizationList: {
    createOrganization: LocalizationValue;
    title: LocalizationValue;
    titleWithoutPersonal: LocalizationValue;
    subtitle: LocalizationValue;
    action__invitationAccept: LocalizationValue;
    invitationAcceptedLabel: LocalizationValue;
    action__suggestionsAccept: LocalizationValue;
    suggestionsAcceptedLabel: LocalizationValue;
    action__createOrganization: LocalizationValue;
  };
  unstable__errors: UnstableErrors;
  dates: {
    previous6Days: LocalizationValue;
    lastDay: LocalizationValue;
    sameDay: LocalizationValue;
    nextDay: LocalizationValue;
    next6Days: LocalizationValue;
    numeric: LocalizationValue;
  };
  waitlist: {
    start: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formButton: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
    };
    success: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      message: LocalizationValue;
    };
  };
};

type WithParamName<T> = T &
  Partial<Record<`${keyof T & string}__${CamelToSnake<Exclude<FieldId, 'role'>>}`, LocalizationValue>>;
type UnstableErrors = WithParamName<{
  external_account_not_found: LocalizationValue;
  identification_deletion_failed: LocalizationValue;
  phone_number_exists: LocalizationValue;
  form_identifier_not_found: LocalizationValue;
  captcha_unavailable: LocalizationValue;
  captcha_invalid: LocalizationValue;
  passkey_not_supported: LocalizationValue;
  passkey_pa_not_supported: LocalizationValue;
  passkey_retrieval_cancelled: LocalizationValue;
  passkey_registration_cancelled: LocalizationValue;
  passkey_already_exists: LocalizationValue;
  form_password_pwned: LocalizationValue;
  form_password_pwned__sign_in: LocalizationValue;
  form_username_invalid_length: LocalizationValue;
  form_username_invalid_character: LocalizationValue;
  form_param_format_invalid: LocalizationValue;
  form_param_format_invalid__email_address: LocalizationValue;
  form_password_length_too_short: LocalizationValue;
  form_param_nil: LocalizationValue;
  form_code_incorrect: LocalizationValue;
  form_password_incorrect: LocalizationValue;
  form_password_validation_failed: LocalizationValue;
  not_allowed_access: LocalizationValue;
  form_identifier_exists: LocalizationValue;
  form_identifier_exists__email_address: LocalizationValue;
  form_identifier_exists__username: LocalizationValue;
  form_identifier_exists__phone_number: LocalizationValue;
  form_password_not_strong_enough: LocalizationValue;
  form_password_size_in_bytes_exceeded: LocalizationValue;
  form_param_value_invalid: LocalizationValue;
  passwordComplexity: {
    sentencePrefix: LocalizationValue;
    minimumLength: LocalizationValue;
    maximumLength: LocalizationValue;
    requireNumbers: LocalizationValue;
    requireLowercase: LocalizationValue;
    requireUppercase: LocalizationValue;
    requireSpecialCharacter: LocalizationValue;
  };
  zxcvbn: {
    notEnough: LocalizationValue;
    couldBeStronger: LocalizationValue;
    goodPassword: LocalizationValue;
    warnings: {
      straightRow: LocalizationValue;
      keyPattern: LocalizationValue;
      simpleRepeat: LocalizationValue;
      extendedRepeat: LocalizationValue;
      sequences: LocalizationValue;
      recentYears: LocalizationValue;
      dates: LocalizationValue;
      topTen: LocalizationValue;
      topHundred: LocalizationValue;
      common: LocalizationValue;
      similarToCommon: LocalizationValue;
      wordByItself: LocalizationValue;
      namesByThemselves: LocalizationValue;
      commonNames: LocalizationValue;
      userInputs: LocalizationValue;
      pwned: LocalizationValue;
    };
    suggestions: {
      l33t: LocalizationValue;
      reverseWords: LocalizationValue;
      allUppercase: LocalizationValue;
      capitalization: LocalizationValue;
      dates: LocalizationValue;
      recentYears: LocalizationValue;
      associatedYears: LocalizationValue;
      sequences: LocalizationValue;
      repeated: LocalizationValue;
      longerKeyboardPattern: LocalizationValue;
      anotherWord: LocalizationValue;
      useWords: LocalizationValue;
      noNeed: LocalizationValue;
      pwned: LocalizationValue;
    };
  };
  form_param_max_length_exceeded: LocalizationValue;
  organization_minimum_permissions_needed: LocalizationValue;
  already_a_member_in_organization: LocalizationValue;
  organization_domain_common: LocalizationValue;
  organization_domain_blocked: LocalizationValue;
  organization_domain_exists_for_enterprise_connection: LocalizationValue;
  organization_membership_quota_exceeded: LocalizationValue;
}>;
