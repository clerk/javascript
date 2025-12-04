import type { FieldId } from './elementIds';
import type { CamelToSnake, DeepPartial } from './utils';

/**
 * @internal
 *
 * @example
 * type PageTitle = LocalizationValue<'name', 'greeting'>;
 *     // ?^
 *      {
 *        name: string | number | boolean | Date;
 *        greeting: string | number | boolean | Date;
 *      }
 */
type UnionToRecordWithPrimitives<T extends string> = {
  [K in T]: string | number | boolean | Date;
};

export type LocalizationValue<T extends string = never, Constraint extends string = string> = [T] extends [never]
  ? Constraint
  : Constraint & { __params: UnionToRecordWithPrimitives<T> };

/**
 * Recursively transforms a type by replacing all LocalizationValue types with their string representation.
 * This is useful for creating type-safe localization objects where you want to ensure all values are strings.
 *
 * @example
 * ```typescript
 * type MyLocalization = {
 *   a: LocalizationValue;                    // becomes string
 *   b: LocalizationValue<'one'>;             // becomes string
 *   c: {
 *     lala: LocalizationValue<'two' | 'three'>; // becomes string
 *   };
 * };
 *
 * type StringifiedLocalization = DeepLocalizationWithoutObjects<MyLocalization>;
 * // Result:
 * // {
 * //   a: string;
 * //   b: string;
 * //   c: {
 * //     lala: string;
 * //   };
 * // }
 * ```
 */
type DeepLocalizationWithoutObjects<T> = {
  [K in keyof T]: T[K] extends LocalizationValue<any>
    ? T[K]
    : T[K] extends object
      ? DeepLocalizationWithoutObjects<T[K]>
      : T[K];
};

/**
 * A type containing all the possible localization keys the prebuilt Clerk components support.
 * Users aiming to customize a few strings can also peak at the `data-localization-key` attribute by inspecting
 * the DOM and updating the corresponding key.
 * Users aiming to completely localize the components by providing a complete translation can use
 * the default english resource object from {@link https://github.com/clerk/javascript Clerk's open source repo}
 * as a starting point.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Needs to be an interface for typedoc to link correctly
export interface LocalizationResource
  extends DeepPartial<DeepLocalizationWithoutObjects<__internal_LocalizationResource>> {}

export type __internal_LocalizationResource = {
  locale: string;
  maintenanceMode: LocalizationValue;
  /**
   * Add role keys and their localized values, e.g. `roles: { 'org:teacher': 'Teacher'}`.
   *
   * @experimental
   */
  roles: {
    [r: string]: LocalizationValue;
  };
  socialButtonsBlockButton: LocalizationValue<'provider'>;
  /**
   * It should be used to provide a shorter variation of `socialButtonsBlockButton`.
   * It is explicitly typed, in order to avoid contributions that use LLM tools to generate
   * translations that misinterpret the correct usage of this property.
   */
  socialButtonsBlockButtonManyInView: LocalizationValue<'provider', `${string}{{provider|titleize}}${string}`>;
  /** Label for the “Last used” badge on authentication strategies. */
  lastAuthenticationStrategy: LocalizationValue;
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
  formFieldLabel__apiKey: LocalizationValue;
  formFieldLabel__apiKeyName: LocalizationValue;
  formFieldLabel__apiKeyDescription: LocalizationValue;
  formFieldLabel__apiKeyExpiration: LocalizationValue;
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
  formFieldInputPlaceholder__apiKeyName: LocalizationValue;
  formFieldInputPlaceholder__apiKeyDescription: LocalizationValue;
  formFieldInputPlaceholder__apiKeyExpirationDate: LocalizationValue;
  formFieldInput__emailAddress_format: LocalizationValue;
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
  footerActionLink__alternativePhoneCodeProvider: LocalizationValue;
  badge__primary: LocalizationValue;
  badge__thisDevice: LocalizationValue;
  badge__userDevice: LocalizationValue;
  badge__otherImpersonatorDevice: LocalizationValue;
  badge__default: LocalizationValue;
  badge__unverified: LocalizationValue;
  badge__requiresAction: LocalizationValue;
  badge__you: LocalizationValue;
  badge__freeTrial: LocalizationValue;
  badge__currentPlan: LocalizationValue;
  badge__upcomingPlan: LocalizationValue;
  badge__activePlan: LocalizationValue;
  badge__pastDuePlan: LocalizationValue;
  badge__startsAt: LocalizationValue<'date'>;
  badge__pastDueAt: LocalizationValue<'date'>;
  badge__trialEndsAt: LocalizationValue<'date'>;
  badge__endsAt: LocalizationValue;
  badge__expired: LocalizationValue;
  badge__canceledEndsAt: LocalizationValue<'date'>;
  badge__renewsAt: LocalizationValue<'date'>;
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
  billing: {
    month: LocalizationValue;
    year: LocalizationValue;
    free: LocalizationValue;
    getStarted: LocalizationValue;
    manage: LocalizationValue;
    manageSubscription: LocalizationValue;
    cancelSubscription: LocalizationValue;
    keepSubscription: LocalizationValue;
    reSubscribe: LocalizationValue;
    subscribe: LocalizationValue;
    startFreeTrial: LocalizationValue;
    startFreeTrial__days: LocalizationValue<'days'>;
    switchPlan: LocalizationValue;
    switchToMonthly: LocalizationValue;
    switchToAnnual: LocalizationValue;
    switchToMonthlyWithPrice: LocalizationValue<'price' | 'currency'>;
    switchToAnnualWithAnnualPrice: LocalizationValue<'price' | 'currency'>;
    billedAnnually: LocalizationValue;
    billedMonthlyOnly: LocalizationValue;
    cancelFreeTrial: LocalizationValue<'plan'>;
    cancelFreeTrialTitle: LocalizationValue<'plan'>;
    cancelFreeTrialAccessUntil: LocalizationValue<'plan' | 'date'>;
    keepFreeTrial: LocalizationValue;
    alwaysFree: LocalizationValue;
    accountFunds: LocalizationValue;
    defaultFreePlanActive: LocalizationValue;
    viewFeatures: LocalizationValue;
    seeAllFeatures: LocalizationValue;
    viewPayment: LocalizationValue;
    availableFeatures: LocalizationValue;
    subtotal: LocalizationValue;
    credit: LocalizationValue;
    creditRemainder: LocalizationValue;
    totalDue: LocalizationValue;
    totalDueToday: LocalizationValue;
    pastDue: LocalizationValue;
    pay: LocalizationValue<'amount'>;
    cancelSubscriptionTitle: LocalizationValue<'plan'>;
    cancelSubscriptionNoCharge: LocalizationValue;
    cancelSubscriptionAccessUntil: LocalizationValue<'plan' | 'date'>;
    cancelSubscriptionPastDue: LocalizationValue;
    popular: LocalizationValue;
    paymentMethods__label: LocalizationValue;
    addPaymentMethod__label: LocalizationValue;
    paymentMethod: {
      dev: {
        testCardInfo: LocalizationValue;
        developmentMode: LocalizationValue;
        cardNumber: LocalizationValue;
        expirationDate: LocalizationValue;
        cvcZip: LocalizationValue;
        anyNumbers: LocalizationValue;
      };
      applePayDescription: {
        monthly: LocalizationValue;
        annual: LocalizationValue;
      };
    };
    subscriptionDetails: {
      title: LocalizationValue;
      currentBillingCycle: LocalizationValue;
      nextPaymentOn: LocalizationValue;
      nextPaymentAmount: LocalizationValue;
      firstPaymentOn: LocalizationValue;
      firstPaymentAmount: LocalizationValue;
      subscribedOn: LocalizationValue;
      trialStartedOn: LocalizationValue;
      trialEndsOn: LocalizationValue;
      endsOn: LocalizationValue;
      renewsAt: LocalizationValue;
      beginsOn: LocalizationValue;
      pastDueAt: LocalizationValue;
    };
    monthly: LocalizationValue;
    annually: LocalizationValue;
    cannotSubscribeMonthly: LocalizationValue;
    cannotSubscribeUnrecoverable: LocalizationValue;
    pricingTable: {
      billingCycle: LocalizationValue;
      included: LocalizationValue;
    };
    checkout: {
      title: LocalizationValue;
      title__paymentSuccessful: LocalizationValue;
      title__subscriptionSuccessful: LocalizationValue;
      title__trialSuccess: LocalizationValue;
      description__paymentSuccessful: LocalizationValue;
      description__subscriptionSuccessful: LocalizationValue;
      lineItems: {
        title__totalPaid: LocalizationValue;
        title__freeTrialEndsAt: LocalizationValue;
        title__paymentMethod: LocalizationValue;
        title__statementId: LocalizationValue;
        title__subscriptionBegins: LocalizationValue;
      };
      emailForm: {
        title: LocalizationValue;
        subtitle: LocalizationValue;
      };
      downgradeNotice: LocalizationValue;
      pastDueNotice: LocalizationValue;
      totalDueAfterTrial: LocalizationValue<'days'>;
      perMonth: LocalizationValue;
    };
  };
  signUp: {
    start: {
      title: LocalizationValue;
      titleCombined: LocalizationValue;
      subtitle: LocalizationValue;
      subtitleCombined: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
      actionLink__use_phone: LocalizationValue;
      actionLink__use_email: LocalizationValue;
      alternativePhoneCodeProvider: {
        actionLink: LocalizationValue;
        label: LocalizationValue<'provider'>;
        subtitle: LocalizationValue<'provider'>;
        title: LocalizationValue<'provider'>;
      };
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
    alternativePhoneCodeProvider: {
      formSubtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
      subtitle: LocalizationValue<'provider'>;
      title: LocalizationValue<'provider'>;
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
        label__termsOfServiceAndPrivacyPolicy: LocalizationValue<'termsOfServiceLink' | 'privacyPolicyLink'>;
        label__onlyPrivacyPolicy: LocalizationValue<'privacyPolicyLink'>;
        label__onlyTermsOfService: LocalizationValue<'termsOfServiceLink'>;
      };
    };
    enterpriseConnections: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
    };
    web3Solana: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      noAvailableWallets: LocalizationValue;
    };
  };
  signIn: {
    start: {
      title: LocalizationValue;
      titleCombined: LocalizationValue;
      subtitle: LocalizationValue;
      subtitleCombined: LocalizationValue;
      actionText: LocalizationValue;
      actionLink: LocalizationValue;
      actionLink__use_email: LocalizationValue;
      actionLink__use_phone: LocalizationValue;
      actionLink__use_username: LocalizationValue;
      actionLink__use_email_username: LocalizationValue;
      actionLink__use_passkey: LocalizationValue;
      actionText__join_waitlist: LocalizationValue;
      actionLink__join_waitlist: LocalizationValue;
      alternativePhoneCodeProvider: {
        actionLink: LocalizationValue;
        label: LocalizationValue<'provider'>;
        subtitle: LocalizationValue<'provider'>;
        title: LocalizationValue<'provider'>;
      };
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
    alternativePhoneCodeProvider: {
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
      subtitle: LocalizationValue;
      title: LocalizationValue<'provider'>;
    };
    emailCodeMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formTitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    emailLinkMfa: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    newDeviceVerificationNotice: LocalizationValue;
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
      blockButton__emailLink: LocalizationValue<'identifier'>;
      blockButton__emailCode: LocalizationValue<'identifier'>;
      blockButton__phoneCode: LocalizationValue<'identifier'>;
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
    enterpriseConnections: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
    };
    web3Solana: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
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
    passkey: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      blockButton__passkey: LocalizationValue;
    };
    alternativeMethods: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      actionLink: LocalizationValue;
      actionText: LocalizationValue;
      blockButton__emailCode: LocalizationValue<'identifier'>;
      blockButton__phoneCode: LocalizationValue<'identifier'>;
      blockButton__password: LocalizationValue;
      blockButton__totp: LocalizationValue;
      blockButton__passkey: LocalizationValue;
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
      billing: LocalizationValue;
      apiKeys: LocalizationValue;
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
         * @deprecated Use `actionLabel__connectionFailed` instead.
         */
        actionLabel__reauthorize: LocalizationValue;
        /**
         * @deprecated Use `subtitle__disconnected` instead.
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
        primaryButton: LocalizationValue;
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
        detailsAction__nonPrimary: LocalizationValue;
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
      formHint: LocalizationValue;
      emailCode: {
        /**
         * @deprecated Use `emailAddressPage.formHint` instead.
         */
        formHint: LocalizationValue;
        formTitle: LocalizationValue;
        formSubtitle: LocalizationValue<'identifier'>;
        resendButton: LocalizationValue;
        successMessage: LocalizationValue;
      };
      emailLink: {
        /**
         * @deprecated Use `emailAddressPage.formHint` instead.
         */
        formHint: LocalizationValue;
        formTitle: LocalizationValue;
        formSubtitle: LocalizationValue<'identifier'>;
        resendButton: LocalizationValue;
        successMessage: LocalizationValue;
      };
      enterpriseSSOLink: {
        formSubtitle: LocalizationValue<'identifier'>;
        formButton: LocalizationValue;
      };
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue<'identifier'>;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue<'emailAddress'>;
      };
    };
    apiKeysPage: {
      title: LocalizationValue;
      detailsTitle__emptyRow: LocalizationValue;
    };
    passkeyScreen: {
      title__rename: LocalizationValue;
      subtitle__rename: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue<'name'>;
      };
    };
    phoneNumberPage: {
      title: LocalizationValue;
      verifyTitle: LocalizationValue;
      verifySubtitle: LocalizationValue<'identifier'>;
      successMessage: LocalizationValue;
      infoText: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue<'identifier'>;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue<'phoneNumber'>;
      };
    };
    connectedAccountPage: {
      title: LocalizationValue;
      formHint: LocalizationValue;
      formHint__noAccounts: LocalizationValue;
      socialButtonsBlockButton: LocalizationValue<'provider'>;
      successMessage: LocalizationValue;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue<'identifier'>;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue<'connectedAccount'>;
      };
    };
    web3WalletPage: {
      title: LocalizationValue;
      subtitle__availableWallets: LocalizationValue;
      subtitle__unavailableWallets: LocalizationValue;
      web3WalletButtonsBlockButton: LocalizationValue<'provider'>;
      successMessage: LocalizationValue<'web3Wallet'>;
      removeResource: {
        title: LocalizationValue;
        messageLine1: LocalizationValue<'identifier'>;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue<'web3Wallet'>;
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
        messageLine1: LocalizationValue<'identifier'>;
        messageLine2: LocalizationValue;
        successMessage: LocalizationValue<'mfaPhoneCode'>;
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
    billingPage: {
      title: LocalizationValue;
      start: {
        headerTitle__payments: LocalizationValue;
        headerTitle__plans: LocalizationValue;
        headerTitle__subscriptions: LocalizationValue;
        headerTitle__statements: LocalizationValue;
      };
      statementsSection: {
        empty: LocalizationValue;
        itemCaption__paidForPlan: LocalizationValue;
        itemCaption__proratedCredit: LocalizationValue;
        itemCaption__subscribedAndPaidForPlan: LocalizationValue;
        notFound: LocalizationValue;
        tableHeader__date: LocalizationValue;
        tableHeader__amount: LocalizationValue;
        title: LocalizationValue;
        totalPaid: LocalizationValue;
      };
      switchPlansSection: {
        title: LocalizationValue;
      };
      subscriptionsListSection: {
        tableHeader__plan: LocalizationValue;
        tableHeader__startDate: LocalizationValue;
        tableHeader__edit: LocalizationValue;
        title: LocalizationValue;
        actionLabel__newSubscription: LocalizationValue;
        actionLabel__manageSubscription: LocalizationValue;
        actionLabel__switchPlan: LocalizationValue;
      };
      paymentHistorySection: {
        empty: LocalizationValue;
        notFound: LocalizationValue;
        tableHeader__date: LocalizationValue;
        tableHeader__amount: LocalizationValue;
        tableHeader__status: LocalizationValue;
      };
      paymentMethodsSection: {
        title: LocalizationValue;
        add: LocalizationValue;
        addSubtitle: LocalizationValue;
        cancelButton: LocalizationValue;
        actionLabel__default: LocalizationValue;
        actionLabel__remove: LocalizationValue;
        formButtonPrimary__add: LocalizationValue;
        formButtonPrimary__pay: LocalizationValue;
        removeMethod: {
          title: LocalizationValue;
          messageLine1: LocalizationValue<'identifier'>;
          messageLine2: LocalizationValue;
          successMessage: LocalizationValue<'paymentMethod'>;
        };
        payWithTestCardButton: LocalizationValue;
      };
      subscriptionsSection: {
        actionLabel__default: LocalizationValue;
      };
    };
    plansPage: {
      title: LocalizationValue;
      alerts: {
        noPermissionsToManageBilling: LocalizationValue;
      };
    };
  };
  userButton: {
    action__manageAccount: LocalizationValue;
    action__signOut: LocalizationValue;
    action__signOutAll: LocalizationValue;
    action__addAccount: LocalizationValue;
    action__openUserMenu: LocalizationValue;
    action__closeUserMenu: LocalizationValue;
  };
  organizationSwitcher: {
    personalWorkspace: LocalizationValue;
    notSelected: LocalizationValue;
    action__createOrganization: LocalizationValue;
    action__manageOrganization: LocalizationValue;
    action__invitationAccept: LocalizationValue;
    action__suggestionsAccept: LocalizationValue;
    action__openOrganizationSwitcher: LocalizationValue;
    action__closeOrganizationSwitcher: LocalizationValue;
    suggestionsAcceptedLabel: LocalizationValue;
  };
  impersonationFab: {
    title: LocalizationValue<'identifier'>;
    action__signOut: LocalizationValue;
  };
  organizationProfile: {
    navbar: {
      title: LocalizationValue;
      description: LocalizationValue;
      general: LocalizationValue;
      members: LocalizationValue;
      billing: LocalizationValue;
      apiKeys: LocalizationValue;
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
          actionDescription: LocalizationValue<'organizationName'>;
        };
        deleteOrganization: {
          title: LocalizationValue;
          messageLine1: LocalizationValue;
          messageLine2: LocalizationValue;
          actionDescription: LocalizationValue<'organizationName'>;
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
      subtitle: LocalizationValue<'domainName'>;
      subtitleVerificationCodeScreen: LocalizationValue<'emailAddress'>;
      formTitle: LocalizationValue;
      formSubtitle: LocalizationValue;
      resendButton: LocalizationValue;
    };
    verifiedDomainPage: {
      title: LocalizationValue<'domain'>;
      subtitle: LocalizationValue<'domain'>;
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
        calloutInvitationCountLabel: LocalizationValue<'count'>;
        calloutSuggestionCountLabel: LocalizationValue<'count'>;
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
      detailsTitle__inviteFailed: LocalizationValue<'email_addresses'>;
      formButtonPrimary__continue: LocalizationValue;
      selectDropdown__role: LocalizationValue;
    };
    removeDomainPage: {
      title: LocalizationValue;
      messageLine1: LocalizationValue<'domain'>;
      messageLine2: LocalizationValue;
      successMessage: LocalizationValue;
    };
    membersPage: {
      detailsTitle__emptyRow: LocalizationValue;
      action__invite: LocalizationValue;
      action__search: LocalizationValue;
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
    billingPage: {
      title: LocalizationValue;
      start: {
        headerTitle__payments: LocalizationValue;
        headerTitle__plans: LocalizationValue;
        headerTitle__subscriptions: LocalizationValue;
        headerTitle__statements: LocalizationValue;
      };
      statementsSection: {
        empty: LocalizationValue;
        itemCaption__paidForPlan: LocalizationValue<'plan' | 'period'>;
        itemCaption__proratedCredit: LocalizationValue;
        itemCaption__subscribedAndPaidForPlan: LocalizationValue<'plan' | 'period'>;
        notFound: LocalizationValue;
        tableHeader__date: LocalizationValue;
        tableHeader__amount: LocalizationValue;
        title: LocalizationValue;
        totalPaid: LocalizationValue;
      };
      switchPlansSection: {
        title: LocalizationValue;
      };
      subscriptionsListSection: {
        tableHeader__plan: LocalizationValue;
        tableHeader__startDate: LocalizationValue;
        tableHeader__edit: LocalizationValue;
        title: LocalizationValue;
        actionLabel__newSubscription: LocalizationValue;
        actionLabel__manageSubscription: LocalizationValue;
        actionLabel__switchPlan: LocalizationValue;
      };
      paymentHistorySection: {
        empty: LocalizationValue;
        notFound: LocalizationValue;
        tableHeader__date: LocalizationValue;
        tableHeader__amount: LocalizationValue;
        tableHeader__status: LocalizationValue;
      };
      paymentMethodsSection: {
        title: LocalizationValue;
        add: LocalizationValue;
        addSubtitle: LocalizationValue;
        cancelButton: LocalizationValue;
        actionLabel__default: LocalizationValue;
        actionLabel__remove: LocalizationValue;
        formButtonPrimary__add: LocalizationValue;
        formButtonPrimary__pay: LocalizationValue;
        removeMethod: {
          title: LocalizationValue;
          messageLine1: LocalizationValue<'identifier'>;
          messageLine2: LocalizationValue;
          successMessage: LocalizationValue<'paymentMethod'>;
        };
        payWithTestCardButton: LocalizationValue;
      };
      subscriptionsSection: {
        actionLabel__default: LocalizationValue;
      };
    };
    plansPage: {
      title: LocalizationValue;
      alerts: {
        noPermissionsToManageBilling: LocalizationValue;
      };
    };
    apiKeysPage: {
      title: LocalizationValue;
      detailsTitle__emptyRow: LocalizationValue;
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
    title: LocalizationValue<'applicationName'>;
    titleWithoutPersonal: LocalizationValue;
    subtitle: LocalizationValue<'applicationName'>;
    action__invitationAccept: LocalizationValue;
    invitationAcceptedLabel: LocalizationValue;
    action__suggestionsAccept: LocalizationValue;
    suggestionsAcceptedLabel: LocalizationValue;
    action__createOrganization: LocalizationValue;
  };
  unstable__errors: UnstableErrors;
  dates: {
    previous6Days: LocalizationValue<'date'>;
    lastDay: LocalizationValue<'date'>;
    sameDay: LocalizationValue<'date'>;
    nextDay: LocalizationValue<'date'>;
    next6Days: LocalizationValue<'date'>;
    numeric: LocalizationValue<'date'>;
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
  apiKeys: {
    formTitle: LocalizationValue;
    formHint: LocalizationValue;
    formButtonPrimary__add: LocalizationValue;
    menuAction__revoke: LocalizationValue;
    action__search: LocalizationValue;
    action__add: LocalizationValue;
    detailsTitle__emptyRow: LocalizationValue;
    revokeConfirmation: {
      formTitle: LocalizationValue<'apiKeyName'>;
      formHint: LocalizationValue;
      formButtonPrimary__revoke: LocalizationValue;
      confirmationText: LocalizationValue;
    };
    lastUsed__seconds: LocalizationValue<'seconds'>;
    lastUsed__minutes: LocalizationValue<'minutes'>;
    lastUsed__hours: LocalizationValue<'hours'>;
    lastUsed__days: LocalizationValue<'days'>;
    lastUsed__months: LocalizationValue<'months'>;
    lastUsed__years: LocalizationValue<'years'>;
    formFieldOption__expiration__1d: LocalizationValue;
    formFieldOption__expiration__7d: LocalizationValue;
    formFieldOption__expiration__30d: LocalizationValue;
    formFieldOption__expiration__60d: LocalizationValue;
    formFieldOption__expiration__90d: LocalizationValue;
    formFieldOption__expiration__180d: LocalizationValue;
    formFieldOption__expiration__1y: LocalizationValue;
    formFieldOption__expiration__never: LocalizationValue;
    createdAndExpirationStatus__never: LocalizationValue<'createdDate'>;
    createdAndExpirationStatus__expiresOn: LocalizationValue<'createdDate' | 'expiresDate'>;
    formFieldCaption__expiration__never: LocalizationValue;
    formFieldCaption__expiration__expiresOn: LocalizationValue<'date'>;
    copySecret: {
      formTitle: LocalizationValue<'name'>;
      formHint: LocalizationValue;
      formButtonPrimary__copyAndClose: LocalizationValue;
    };
  };
  taskChooseOrganization: {
    title: LocalizationValue;
    subtitle: LocalizationValue;
    signOut: {
      actionText: LocalizationValue<'identifier'>;
      actionLink: LocalizationValue;
    };
    createOrganization: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      formButtonSubmit: LocalizationValue;
      formButtonReset: LocalizationValue;
      formFieldLabel__name: LocalizationValue;
      formFieldLabel__slug: LocalizationValue;
      formFieldInputPlaceholder__name: LocalizationValue;
      formFieldInputPlaceholder__slug: LocalizationValue;
    };
    chooseOrganization: {
      title: LocalizationValue;
      subtitle: LocalizationValue;
      suggestionsAcceptedLabel: LocalizationValue;
      action__suggestionsAccept: LocalizationValue;
      action__createOrganization: LocalizationValue;
      action__invitationAccept: LocalizationValue;
    };
  };
  web3WalletButtons: {
    connect: LocalizationValue<'walletName'>;
    continue: LocalizationValue<'walletName'>;
    noneAvailable: LocalizationValue<'solanaWalletsLink'>;
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
  web3_missing_identifier: LocalizationValue;
  web3_solana_signature_generation_failed: LocalizationValue;
  web3_signature_request_rejected: LocalizationValue;
  form_password_pwned: LocalizationValue;
  form_password_pwned__sign_in: LocalizationValue;
  form_username_invalid_length: LocalizationValue<'min_length' | 'max_length'>;
  form_username_invalid_character: LocalizationValue;
  form_param_format_invalid: LocalizationValue;
  form_param_format_invalid__email_address: LocalizationValue;
  form_param_type_invalid: LocalizationValue;
  form_param_type_invalid__phone_number: LocalizationValue;
  form_param_type_invalid__email_address: LocalizationValue;
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
  session_exists: LocalizationValue;
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
  already_a_member_in_organization: LocalizationValue<'email'>;
  organization_domain_common: LocalizationValue;
  organization_domain_blocked: LocalizationValue;
  organization_domain_exists_for_enterprise_connection: LocalizationValue;
  organization_membership_quota_exceeded: LocalizationValue;
  organization_not_found_or_unauthorized: LocalizationValue;
  organization_not_found_or_unauthorized_with_create_organization_disabled: LocalizationValue;
}>;
