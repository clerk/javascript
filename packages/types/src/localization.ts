import type { FieldId } from './appearance';
import type { CamelToSnake, DeepPartial } from './utils';

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
  locale: string;
  socialButtonsBlockButton: LocalizationValue;
  dividerText: LocalizationValue;
  formFieldLabel__emailAddress: LocalizationValue;
  formFieldLabel__emailAddresses: LocalizationValue;
  formFieldLabel__phoneNumber: LocalizationValue;
  formFieldLabel__username: LocalizationValue;
  /**
   * @deprecated
   */
  formFieldLabel__emailAddress_phoneNumber: LocalizationValue;
  formFieldLabel__emailAddress_username: LocalizationValue;
  /**
   * @deprecated
   */
  formFieldLabel__phoneNumber_username: LocalizationValue;
  /**
   * @deprecated
   */
  formFieldLabel__emailAddress_phoneNumber_username: LocalizationValue;
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
  formFieldInputPlaceholder__emailAddress: LocalizationValue;
  formFieldInputPlaceholder__emailAddresses: LocalizationValue;
  formFieldInputPlaceholder__phoneNumber: LocalizationValue;
  formFieldInputPlaceholder__username: LocalizationValue;
  /**
   * @deprecated
   */
  formFieldInputPlaceholder__emailAddress_phoneNumber: LocalizationValue;
  formFieldInputPlaceholder__emailAddress_username: LocalizationValue;
  /**
   * @deprecated
   */
  formFieldInputPlaceholder__phoneNumber_username: LocalizationValue;
  /**
   * @deprecated
   */
  formFieldInputPlaceholder__emailAddress_phoneNumber_username: LocalizationValue;
  formFieldInputPlaceholder__password: LocalizationValue;
  formFieldInputPlaceholder__firstName: LocalizationValue;
  formFieldInputPlaceholder__lastName: LocalizationValue;
  formFieldInputPlaceholder__backupCode: LocalizationValue;
  formFieldInputPlaceholder__organizationName: LocalizationValue;
  formFieldInputPlaceholder__organizationSlug: LocalizationValue;
  formFieldInputPlaceholder__organizationDomain: LocalizationValue;
  formFieldInputPlaceholder__organizationDomainEmailAddress: LocalizationValue;
  formFieldError__notMatchingPasswords: LocalizationValue;
  formFieldError__matchingPasswords: LocalizationValue;
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
      actionLink__use_email: LocalizationValue;
      actionLink__use_phone: LocalizationValue;
      actionLink__use_username: LocalizationValue;
      actionLink__use_email_username: LocalizationValue;
    };
    password: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
    };
    forgotPasswordAlternativeMethods: {
      title: LocalizationValue;
      label__alternativeMethods: LocalizationValue;
      blockButton__resetPassword: LocalizationValue;
    };
    forgotPassword: {
      title_email: LocalizationValue;
      title_phone: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle_email: LocalizationValue;
      formSubtitle_phone: LocalizationValue;
      resendButton: LocalizationValue;
    };
    resetPassword: {
      title: LocalizationValue;
      formButtonPrimary: LocalizationValue;
      successMessage: LocalizationValue;
    };
    resetPasswordMfa: {
      detailsLabel: LocalizationValue;
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
    };
    phoneCode: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    phoneCodeMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    totpMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
    };
    backupCodeMfa: {
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
    noAvailableMethods: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      message: LocalizationValue;
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
        /**
         * @deprecated Use `title__connectionFailed` instead.
         */
        title__conectionFailed: LocalizationValue;
        title__connectionFailed: LocalizationValue;
        title__reauthorize: LocalizationValue;
        subtitle__reauthorize: LocalizationValue;
        /**
         * @deprecated Use `actionLabel__connectionFailed` instead.
         */
        actionLabel__conectionFailed: LocalizationValue;
        actionLabel__connectionFailed: LocalizationValue;
        actionLabel__reauthorize: LocalizationValue;
        destructiveActionTitle: LocalizationValue;
        destructiveActionSubtitle: LocalizationValue;
        destructiveActionAccordionSubtitle: LocalizationValue;
      };
      enterpriseAccountsSection: {
        title: LocalizationValue;
      };
      passwordSection: {
        title: LocalizationValue;
        primaryButton__changePassword: LocalizationValue;
        primaryButton__setPassword: LocalizationValue;
      };
      mfaSection: {
        title: LocalizationValue;
        primaryButton: LocalizationValue;
        phoneCode: {
          destructiveActionTitle: LocalizationValue;
          destructiveActionSubtitle: LocalizationValue;
          destructiveActionLabel: LocalizationValue;
          title__default: LocalizationValue;
          title__setDefault: LocalizationValue;
          subtitle__default: LocalizationValue;
          subtitle__setDefault: LocalizationValue;
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
          title: LocalizationValue;
          subtitle: LocalizationValue;
          destructiveActionTitle: LocalizationValue;
          destructiveActionSubtitle: LocalizationValue;
          destructiveActionLabel: LocalizationValue;
        };
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
      dangerSection: {
        title: LocalizationValue;
        deleteAccountButton: LocalizationValue;
        deleteAccountTitle: LocalizationValue;
        deleteAccountDescription: LocalizationValue;
      };
    };
    profilePage: {
      title: LocalizationValue;
      imageFormTitle: LocalizationValue;
      imageFormSubtitle: LocalizationValue;
      imageFormDestructiveActionSubtitle: LocalizationValue;
      fileDropAreaTitle: LocalizationValue;
      fileDropAreaAction: LocalizationValue;
      fileDropAreaHint: LocalizationValue;
      readonly: LocalizationValue;
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
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    phoneNumberPage: {
      title: LocalizationValue;
      successMessage: LocalizationValue;
      infoText: LocalizationValue;
      infoText__secondary: LocalizationValue;
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
      successMessage: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue;
      };
    };
    passwordPage: {
      title: LocalizationValue;
      readonly: LocalizationValue;
      successMessage: LocalizationValue;
      changePasswordTitle: LocalizationValue;
      changePasswordSuccessMessage: LocalizationValue;
      sessionsSignedOutSuccessMessage: LocalizationValue;
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
      subtitle__availablePhoneNumbers: LocalizationValue;
      subtitle__unavailablePhoneNumbers: LocalizationValue;
      successMessage: LocalizationValue;
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
    invitationCountLabel_single: LocalizationValue;
    invitationCountLabel_many: LocalizationValue;
    action__invitationAccept: LocalizationValue;
    suggestionCountLabel_single: LocalizationValue;
    suggestionCountLabel_many: LocalizationValue;
    action__suggestionsAccept: LocalizationValue;
    suggestionsAcceptedLabel: LocalizationValue;
  };
  impersonationFab: {
    title: LocalizationValue;
    action__signOut: LocalizationValue;
  };
  organizationProfile: {
    badge__unverified: LocalizationValue;
    badge__automaticInvitation: LocalizationValue;
    badge__automaticSuggestion: LocalizationValue;
    badge__manualInvitation: LocalizationValue;
    start: {
      headerTitle__members: LocalizationValue;
      headerTitle__settings: LocalizationValue;
      headerSubtitle__members: LocalizationValue;
      headerSubtitle__settings: LocalizationValue;
    };
    profilePage: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      successMessage: LocalizationValue;
      dangerSection: {
        title: LocalizationValue;
        leaveOrganization: {
          title: LocalizationValue;
          messageLine1: LocalizationValue;
          messageLine2: LocalizationValue;
          actionDescription: LocalizationValue;
          successMessage: LocalizationValue;
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
        unverifiedDomain_menuAction__verify: LocalizationValue;
        unverifiedDomain_menuAction__remove: LocalizationValue;
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
        formButton__save: LocalizationValue;
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
    removeDomainPage: {
      title: LocalizationValue;
      messageLine1: LocalizationValue;
      messageLine2: LocalizationValue;
      successMessage: LocalizationValue;
    };
    invitePage: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      successMessage: LocalizationValue;
      detailsTitle__inviteFailed: LocalizationValue;
      formButtonPrimary__continue: LocalizationValue;
    };
    membersPage: {
      detailsTitle__emptyRow: LocalizationValue;
      action__invite: LocalizationValue;
      start: {
        /**
         * @deprecated use `headerTitle__members` instead
         */
        headerTitle__active: LocalizationValue;
        headerTitle__members: LocalizationValue;
        /**
         * @deprecated use `headerTitle__invitations` instead
         */
        headerTitle__invited: LocalizationValue;
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
        manualInvitations: {
          headerTitle: LocalizationValue;
          headerSubtitle: LocalizationValue;
        };
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
        requests: {
          headerTitle: LocalizationValue;
          headerSubtitle: LocalizationValue;
        };
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
    /**
     * @deprecated This key is no longer used and will be removed in the next major version
     */
    subtitle: LocalizationValue;
    invitePage: {
      formButtonReset: LocalizationValue;
    };
  };
  organizationList: {
    createOrganization: LocalizationValue;
    title: LocalizationValue;
    titleWithoutPersonal: LocalizationValue;
    subtitle: LocalizationValue;
    action__createOrganization: LocalizationValue;
    action__invitationAccept: LocalizationValue;
    action__suggestionsAccept: LocalizationValue;
    suggestionsAcceptedLabel: LocalizationValue;
    invitationAcceptedLabel: LocalizationValue;
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
};

type WithParamName<T> = T &
  Partial<Record<`${keyof T & string}__${CamelToSnake<Exclude<FieldId, 'role'>>}`, LocalizationValue>>;
type UnstableErrors = WithParamName<{
  identification_deletion_failed: LocalizationValue;
  phone_number_exists: LocalizationValue;
  form_identifier_not_found: LocalizationValue;
  captcha_invalid: LocalizationValue;
  form_password_pwned: LocalizationValue;
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
  form_password_not_strong_enough: LocalizationValue;
  form_password_size_in_bytes_exceeded: LocalizationValue;
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
}>;
