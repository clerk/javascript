/*
 * =====================================================================================
 * DISCLAIMER:
 * =====================================================================================
 * This localization file is a community contribution and is not officially maintained
 * by Clerk. It has been provided by the community and may not be fully aligned
 * with the current or future states of the main application. Clerk does not guarantee
 * the accuracy, completeness, or timeliness of the translations in this file.
 * Use of this file is at your own risk and discretion.
 * =====================================================================================
 */

import type { LocalizationResource } from '@clerk/types';

export const daDK: LocalizationResource = {
  locale: 'da-DK',
  __experimental_formFieldLabel__passkeyName: undefined,
  backButton: 'Tilbage',
  badge__default: 'Standard',
  badge__otherImpersonatorDevice: '',
  badge__primary: 'Primær',
  badge__requiresAction: 'Kræver handling',
  badge__thisDevice: 'Denne enhed',
  badge__unverified: 'Ikke verificeret',
  badge__userDevice: 'Bruger enhed',
  badge__you: 'Dig',
  createOrganization: {
    formButtonSubmit: 'Opret organisation',
    invitePage: {
      formButtonReset: 'Spring over',
    },
    title: 'Opret organisation',
  },
  dates: {
    lastDay: "I går: {{ date | timeString('en-US') }}",
    next6Days: "{{ date | weekday('en-US','long') }} på {{ date | timeString('en-US') }}",
    nextDay: "I morgen: {{ date | timeString('en-US') }}",
    numeric: "{{ date | numeric('en-US') }}",
    previous6Days: "Sidst {{ date | weekday('en-US','long') }} på {{ date | timeString('en-US') }}",
    sameDay: "I dag: {{ date | timeString('en-US') }}",
  },
  dividerText: 'eller',
  footerActionLink__useAnotherMethod: 'Brug en anden metode',
  footerPageLink__help: 'Hjælp',
  footerPageLink__privacy: 'Privatliv',
  footerPageLink__terms: 'Vilkår',
  formButtonPrimary: 'Fortsæt',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Glemt adgangskode?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Valgfri',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Indtast eller indsæt en eller flere e-mailadresser, adskilt af mellemrum eller kommaer',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations: 'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Sikkerhedskode',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Bekræft adgangskode',
  formFieldLabel__currentPassword: 'Nuværende adgangskode',
  formFieldLabel__emailAddress: 'E-mailadresse',
  formFieldLabel__emailAddress_username: 'E-mailadresse eller brugernavn',
  formFieldLabel__emailAddresses: 'E-mailadresser',
  formFieldLabel__firstName: 'Fornavn',
  formFieldLabel__lastName: 'Efternavn',
  formFieldLabel__newPassword: 'Ny adgangskode',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Organisationens navn',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Adgangskode',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__role: 'Rolle',
  formFieldLabel__signOutOfOtherSessions: 'Log ud af alle andre enheder',
  formFieldLabel__username: 'Brugernavn',
  impersonationFab: {
    action__signOut: 'Log ud',
    title: 'Logget ind som {{identifier}}',
  },
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Medlem',
  membershipRole__guestMember: 'Gæst',
  organizationList: {
    action__createOrganization: 'Create organization',
    action__invitationAccept: 'Join',
    action__suggestionsAccept: 'Request to join',
    createOrganization: 'Create Organization',
    invitationAcceptedLabel: 'Joined',
    subtitle: 'to continue to {{applicationName}}',
    suggestionsAcceptedLabel: 'Pending approval',
    title: 'Choose an account',
    titleWithoutPersonal: 'Choose an organization',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatic invitations',
    badge__automaticSuggestion: 'Automatic suggestions',
    badge__manualInvitation: 'No automatic enrollment',
    badge__unverified: 'Unverified',
    createDomainPage: {
      subtitle:
        'Add the domain to verify. Users with email addresses at this domain can join the organization automatically or request to join.',
      title: 'Add domain',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Invitationerne kunne ikke sendes. Ret følgende, og prøv igen:',
      formButtonPrimary__continue: 'Send invitationer',
      selectDropdown__role: 'Select role',
      subtitle: 'Inviter nye medlemmer til denne organisation',
      successMessage: 'Invitationer blev sendt',
      title: 'Inviter medlemmer',
    },
    membersPage: {
      action__invite: 'Invitere',
      activeMembersTab: {
        menuAction__remove: 'Fjern medlem',
        tableHeader__actions: '',
        tableHeader__joined: 'Sluttede sig til',
        tableHeader__role: 'Rolle',
        tableHeader__user: 'Bruger',
      },
      detailsTitle__emptyRow: 'Ingen medlemmer at vise',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        table__emptyRow: 'No invitations to display',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Tilbagekald invitation',
        tableHeader__invited: 'Inviteret',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Users who sign up with a matching email domain, will be able to see a suggestion to request to join your organization.',
          headerTitle: 'Automatic suggestions',
          primaryButton: 'Manage verified domains',
        },
        menuAction__approve: 'Approve',
        menuAction__reject: 'Reject',
        tableHeader__requested: 'Requested access',
        table__emptyRow: 'No requests to display',
      },
      start: {
        headerTitle__invitations: 'Invitations',
        headerTitle__members: 'Members',
        headerTitle__requests: 'Requests',
      },
    },
    navbar: {
      description: 'Manage your organization.',
      general: 'General',
      members: 'Members',
      title: 'Organization',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1: 'Are you sure you want to delete this organization?',
          messageLine2: 'This action is permanent and irreversible.',
          successMessage: 'You have deleted the organization.',
          title: 'Delete organization',
        },
        leaveOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1:
            'Er du sikker på, at du vil forlade denne organisation? Du mister adgang til denne organisation og dens applikationer.',
          messageLine2: 'Denne handling er permanent og irreversibel.',
          successMessage: 'Du har forladt organisationen.',
          title: 'Forlad organisationen',
        },
        title: 'Fare',
      },
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
        primaryButton: 'Add domain',
        subtitle:
          'Allow users to join the organization automatically or request to join based on a verified email domain.',
        title: 'Verified domains',
      },
      successMessage: 'Organisationen er blevet opdateret.',
      title: 'Organisationsprofil',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Medlemmer',
      profileSection: {
        primaryButton: '',
        title: 'Organization Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Removing this domain will affect invited users.',
        removeDomainActionLabel__remove: 'Remove domain',
        removeDomainSubtitle: 'Remove this domain from your verified domains',
        removeDomainTitle: 'Remove domain',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Users are automatically invited to join the organization when they sign-up and can join anytime.',
        automaticInvitationOption__label: 'Automatic invitations',
        automaticSuggestionOption__description:
          'Users receive a suggestion to request to join, but must be approved by an admin before they are able to join the organization.',
        automaticSuggestionOption__label: 'Automatic suggestions',
        calloutInfoLabel: 'Changing the enrollment mode will only affect new users.',
        calloutInvitationCountLabel: 'Pending invitations sent to users: {{count}}',
        calloutSuggestionCountLabel: 'Pending suggestions sent to users: {{count}}',
        manualInvitationOption__description: 'Users can only be invited manually to the organization.',
        manualInvitationOption__label: 'No automatic enrollment',
        subtitle: 'Choose how users from this domain can join the organization.',
      },
      start: {
        headerTitle__danger: 'Danger',
        headerTitle__enrollment: 'Enrollment options',
      },
      subtitle: 'The domain {{domain}} is now verified. Continue by selecting enrollment mode.',
      title: 'Update {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Enter the verification code sent to your email address',
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'The domain {{domainName}} needs to be verified via email.',
      subtitleVerificationCodeScreen: 'A verification code was sent to {{emailAddress}}. Enter the code to continue.',
      title: 'Verify domain',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Opret organisation',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Administrer organisation',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Ingen organisation valgt',
    personalWorkspace: 'Personligt arbejdsområde',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Næste',
  paginationButton__previous: 'Forrige',
  paginationRowText__displaying: 'Viser',
  paginationRowText__of: 'af',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Få hjælp',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Brug en backup-kode',
      blockButton__emailCode: 'Send kode til {{identifier}}',
      blockButton__emailLink: 'Send link til {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Log ind med din adgangskode',
      blockButton__phoneCode: 'Send kode til {{identifier}}',
      blockButton__totp: 'Brug din godkendelsesapp',
      getHelp: {
        blockButton__emailSupport: 'E-mail support',
        content:
          'Hvis du har problemer med at logge ind på din konto, skal du sende en e-mail til os, og vi vil samarbejde med dig om at genoprette adgang så hurtigt som muligt.',
        title: 'Få hjælp',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Brug en anden metode',
    },
    backupCodeMfa: {
      subtitle: 'Forsæt til {{applicationName}}',
      title: 'Indtast en backup-kode',
    },
    emailCode: {
      formTitle: 'Bekræftelseskode',
      resendButton: 'Send kode igen',
      subtitle: 'Fortsæt til {{applicationName}}',
      title: 'Tjek din email',
    },
    emailLink: {
      expired: {
        subtitle: 'Vend tilbage til den oprindelige fane for at fortsætte.',
        title: 'Dette bekræftelseslink er udløbet',
      },
      failed: {
        subtitle: 'Vend tilbage til den oprindelige fane for at fortsætte.',
        title: 'Dette bekræftelseslink er ugyldigt',
      },
      formSubtitle: 'Brug bekræftelseslinket sendt til din e-mail',
      formTitle: 'Bekræftelseslink',
      loading: {
        subtitle: 'Du vil snart blive viderestillet',
        title: 'Logger ind...',
      },
      resendButton: 'Send link igen',
      subtitle: 'Fortsæt til {{applicationName}}',
      title: 'Tjek din email',
      unusedTab: {
        title: 'Du kan lukke denne fane',
      },
      verified: {
        subtitle: 'Du vil snart blive viderestillet',
        title: 'Vellykket log ind forsøg',
      },
      verifiedSwitchTab: {
        subtitle: 'Vend tilbage til den oprindelige fane for at fortsætte',
        subtitleNewTab: 'Vend tilbage til den nyligt åbnede fane for at fortsætte',
        titleNewTab: 'Logget ind på anden fane',
      },
    },
    forgotPassword: {
      formTitle: 'Reset password code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Reset your password',
      label__alternativeMethods: 'Or, sign in with another method',
      title: 'Forgot Password?',
    },
    noAvailableMethods: {
      message: 'Kan ikke fortsætte med login. Der er ingen tilgængelig godkendelsesfaktor.',
      subtitle: 'En fejl opstod',
      title: 'Kan ikke logge ind',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Brug en anden metode',
      subtitle: 'Fortsæt til {{applicationName}}',
      title: 'Indtast din adgangskode',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Bekræftelseskode',
      resendButton: 'Send kode igen',
      subtitle: 'gå videre til {{applicationName}}',
      title: 'Tjek din telefon',
    },
    phoneCodeMfa: {
      formTitle: 'Bekræftelseskode',
      resendButton: 'Send kode igen',
      subtitle: '',
      title: 'Tjek din telefon',
    },
    resetPassword: {
      formButtonPrimary: 'Reset Password',
      requiredMessage: 'For security reasons, it is required to reset your password.',
      successMessage: 'Your password was successfully changed. Signing you in, please wait a moment.',
      title: 'Set new password',
    },
    resetPasswordMfa: {
      detailsLabel: 'We need to verify your identity before resetting your password.',
    },
    start: {
      actionLink: 'Tilmeld dig',
      actionLink__use_email: 'Brug email',
      actionLink__use_email_username: 'Brug email eller brugernavn',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Brug telefon',
      actionLink__use_username: 'Brug brugenravn',
      actionText: 'Ingen konto?',
      subtitle: 'Forsæt til {{applicationName}}',
      title: 'Log ind',
    },
    totpMfa: {
      formTitle: 'Bekræftelseskode',
      subtitle: '',
      title: 'Totrinsbekræftelse',
    },
  },
  signInEnterPasswordTitle: 'Indtast din adgangskode',
  signUp: {
    continue: {
      actionLink: 'Log ind',
      actionText: 'Har du en konto?',
      subtitle: 'Forsæt til {{applicationName}}',
      title: 'Udfyld manglende felter',
    },
    emailCode: {
      formSubtitle: 'Indtast bekræftelseskoden sendt til din e-mailadresse',
      formTitle: 'Bekræftelseskode',
      resendButton: 'Send kode igen',
      subtitle: 'Fortsæt til {{applicationName}}',
      title: 'Bekræft din email',
    },
    emailLink: {
      formSubtitle: 'Brug bekræftelseslinket sendt til din e-mailadresse',
      formTitle: 'Bekræftelseslink',
      loading: {
        title: 'Tilmelder...',
      },
      resendButton: 'Send link igen',
      subtitle: 'Forsæt til {{applicationName}}',
      title: 'Bekræft din email',
      verified: {
        title: 'Vellykket tilmelding',
      },
      verifiedSwitchTab: {
        subtitle: 'Vend tilbage til den nyligt åbnede fane for at fortsætte',
        subtitleNewTab: 'Vend tilbage til forrige fane for at fortsætte',
        title: 'E-mail er bekræftet',
      },
    },
    phoneCode: {
      formSubtitle: 'Indtast bekræftelseskoden sendt til dit telefonnummer',
      formTitle: 'Bekræftelseskode',
      resendButton: 'Send kode igen',
      subtitle: 'Fortsæt til {{applicationName}}',
      title: 'Bekræft din telefon',
    },
    start: {
      actionLink: 'Log ind',
      actionText: 'Har du en konto?',
      subtitle: 'Forsæt til {{applicationName}}',
      title: 'Opret din konto',
    },
  },
  socialButtonsBlockButton: 'Forsæt med {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Email address must be a valid email address.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Your password is not strong enough.',
    form_password_pwned: '',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
    form_password_validation_failed: 'Incorrect Password',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passkeys_pa_not_supported: undefined,
    passwordComplexity: {
      maximumLength: 'less than {{length}} characters',
      minimumLength: '{{length}} or more characters',
      requireLowercase: 'a lowercase letter',
      requireNumbers: 'a number',
      requireSpecialCharacter: 'a special character',
      requireUppercase: 'an uppercase letter',
      sentencePrefix: 'Your password must contain',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger: 'Your password works, but could be stronger. Try adding more characters.',
      goodPassword: 'Your password meets all the necessary requirements.',
      notEnough: 'Your password is not strong enough.',
      suggestions: {
        allUppercase: 'Capitalize some, but not all letters.',
        anotherWord: 'Add more words that are less common.',
        associatedYears: 'Avoid years that are associated with you.',
        capitalization: 'Capitalize more than the first letter.',
        dates: 'Avoid dates and years that are associated with you.',
        l33t: "Avoid predictable letter substitutions like '@' for 'a'.",
        longerKeyboardPattern: 'Use longer keyboard patterns and change typing direction multiple times.',
        noNeed: 'You can create strong passwords without using symbols, numbers, or uppercase letters.',
        pwned: 'If you use this password elsewhere, you should change it.',
        recentYears: 'Avoid recent years.',
        repeated: 'Avoid repeated words and characters.',
        reverseWords: 'Avoid reversed spellings of common words.',
        sequences: 'Avoid common character sequences.',
        useWords: 'Use multiple words, but avoid common phrases.',
      },
      warnings: {
        common: 'This is a commonly used password.',
        commonNames: 'Common names and surnames are easy to guess.',
        dates: 'Dates are easy to guess.',
        extendedRepeat: 'Repeated character patterns like "abcabcabc" are easy to guess.',
        keyPattern: 'Short keyboard patterns are easy to guess.',
        namesByThemselves: 'Single names or surnames are easy to guess.',
        pwned: 'Your password was exposed by a data breach on the Internet.',
        recentYears: 'Recent years are easy to guess.',
        sequences: 'Common character sequences like "abc" are easy to guess.',
        similarToCommon: 'This is similar to a commonly used password.',
        simpleRepeat: 'Repeated characters like "aaa" are easy to guess.',
        straightRow: 'Straight rows of keys on your keyboard are easy to guess.',
        topHundred: 'This is a frequently used password.',
        topTen: 'This is a heavily used password.',
        userInputs: 'There should not be any personal or page related data.',
        wordByItself: 'Single words are easy to guess.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Tilføj konto',
    action__manageAccount: 'Administrer konto',
    action__signOut: 'Log ud',
    action__signOutAll: 'Log ud af alle konti',
  },
  userProfile: {
    __experimental_passkeyScreen: {
      removeResource: {
        messageLine1: undefined,
        title: undefined,
      },
      subtitle__rename: undefined,
      title__rename: undefined,
    },
    backupCodePage: {
      actionLabel__copied: 'Kopieret!',
      actionLabel__copy: 'Kopier alle',
      actionLabel__download: 'Download .txt',
      actionLabel__print: 'Print',
      infoText1: 'Backup koder vil blive aktiveret for denne konto.',
      infoText2:
        'Hold backup koderne hemmelige og gem dem sikkert. Du kan genskabe backup koder, hvis du har mistanke om, at de er blevet kompromitteret.',
      subtitle__codelist: 'Opbevar dem sikkert og hold dem hemmelige.',
      successMessage:
        'Backup-koder er nu aktiveret. Du kan bruge en af disse til at logge ind på din konto, hvis du mister adgangen til din totrinsbekræftelse. Hver kode kan kun bruges én gang.',
      successSubtitle:
        'Du kan bruge en af disse til at logge ind på din konto, hvis du mister adgangen til din totrinsbekræftelse.',
      title: 'Tilføj bekræftelse af backup kode',
      title__codelist: 'Backup koder',
    },
    connectedAccountPage: {
      formHint: 'Vælg en udbyder for at forbinde din konto.',
      formHint__noAccounts: 'Der er ingen tilgængelige eksterne kontoudbydere.',
      removeResource: {
        messageLine1: '{{identifier}} vil blive fjernet fra denne konto.',
        messageLine2:
          'Du vil ikke længere være i stand til at bruge denne tilsluttede konto, og eventuelle afhængige funktioner vil ikke længere virke.',
        successMessage: '{{connectedAccount}} er blevet fjernet fra din konto.',
        title: 'Fjern tilsluttet konto',
      },
      socialButtonsBlockButton: 'Forbind {{provider|titleize}} konto',
      successMessage: 'Udbyderen er blevet tilføjet til din konto',
      title: 'Tilføj tilsluttet konto',
    },
    deletePage: {
      actionDescription: 'Type "Delete account" below to continue.',
      confirm: 'Delete account',
      messageLine1: 'Are you sure you want to delete your account?',
      messageLine2: 'This action is permanent and irreversible.',
      title: 'Delete account',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'En e-mail indeholdende en bekræftelseskode vil blive sendt til denne e-mailadresse.',
        formSubtitle: 'Indtast bekræftelseskoden sendt til {{identifier}}',
        formTitle: 'Bekræftelseskode',
        resendButton: 'Send kode igen',
        successMessage: 'E-mailen {{identifier}} er blevet tilføjet til din konto.',
      },
      emailLink: {
        formHint: 'En e-mail indeholdende et bekræftelseslink vil blive sendt til denne e-mailadresse.',
        formSubtitle: 'Klik på bekræftelseslinket i e-mailen sendt til {{identifier}}',
        formTitle: 'Bekræftelseslink',
        resendButton: 'Send link igen',
        successMessage: 'E-mailen {{identifier}} er blevet tilføjet til din konto.',
      },
      removeResource: {
        messageLine1: '{{identifier}} vil blive fjernet fra denne konto.',
        messageLine2: 'Du vil ikke længere kunne logge ind med denne e-mailadresse.',
        successMessage: '{{emailAddress}} er blevet fjernet fra din konto.',
        title: 'Fjern e-mailadresse',
      },
      title: 'Tilføj e-mailadresse',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Fortsæt',
    formButtonPrimary__finish: 'Afslut',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Annuller',
    mfaPage: {
      formHint: 'Vælg en metode, der skal tilføjes.',
      title: 'Tilføj totrinsbekræftelse',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Tilføj et telefonnummer',
      removeResource: {
        messageLine1: '{{identifier}} vil ikke længere modtage bekræftelseskoder, når du logger ind.',
        messageLine2: 'Din konto er muligvis ikke så sikker. Er du sikker på, at du vil fortsætte?',
        successMessage: 'SMS bekræftelse er blevet fjernet for {{mfaPhoneCode}}',
        title: 'Fjern SMS bekræftelse',
      },
      subtitle__availablePhoneNumbers:
        'Vælg et telefonnummer for at registrere SMS bekræftelse til totrinsbekræftelse.',
      subtitle__unavailablePhoneNumbers:
        'Der er ingen tilgængelige telefonnumre til at registrere til SMS bekræftelse til totrinsbekræftelse.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Tilføj SMS bekræftelse',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scan QR-koden i stedet',
        buttonUnableToScan__nonPrimary: 'Kan du ikke scanne QR-koden?',
        infoText__ableToScan:
          'Konfigurer en ny login-metode i din autentificeringsprogram, og scan følgende QR-kode for at linke den til din konto.',
        infoText__unableToScan: 'Konfigurer en ny login-metode i din autentificering, og indtast nøglen nedenfor.',
        inputLabel__unableToScan1:
          'Sørg for, at tidsbaserede eller engangsadgangskoder er aktiveret, og slut derefter tilknytningen af din konto.',
        inputLabel__unableToScan2:
          "Alternativt, hvis din autentificeringsprogram understøtter TOTP URI'er, kan du også kopiere hele URI'en.",
      },
      removeResource: {
        messageLine1: 'Bekræftelseskoder fra denne autentificeringsprogram kræves ikke længere, når du logger ind.',
        messageLine2: 'Din konto er muligvis ikke så sikker. Er du sikker på, at du vil fortsætte?',
        successMessage: 'Totrinsbekræftelse via autentificeringsprogram er blevet fjernet.',
        title: 'Fjern totrinsbekræftelse',
      },
      successMessage:
        'Når du logger ind, skal du indtaste en bekræftelseskode fra denne autentificeringsprogram som et ekstra trin.',
      title: 'Tilføj autentificeringsprogram',
      verifySubtitle: 'Indtast bekræftelseskode, der er genereret af din autentificeringsprogram',
      verifyTitle: 'Bekræftelseskode',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: undefined,
        title: undefined,
      },
      subtitle__rename: undefined,
      title__rename: undefined,
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      successMessage__set: 'Din adgangskode er blevet indstillet.',
      successMessage__signOutOfOtherSessions: 'Alle andre enheder er blevet logget ud.',
      successMessage__update: 'Din adgangskode er blevet opdateret.',
      title__set: 'Sæt adgangskode',
      title__update: 'Skift kodeord',
    },
    phoneNumberPage: {
      infoText: 'En sms, der indeholder et bekræftelseslink, sendes til dette telefonnummer.',
      removeResource: {
        messageLine1: '{{identifier}} vil blive fjernet fra denne konto.',
        messageLine2: 'Du vil ikke længere kunne logge ind med dette telefonnummer.',
        successMessage: '{{phoneNumber}} er blevet fjernet fra din konto.',
        title: 'Fjern telefonnummer',
      },
      successMessage: '{{identifier}} er blevet tilføjet til din konto.',
      title: 'Tilføj telefonnummer',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Upload a JPG, PNG, GIF, or WEBP image smaller than 10 MB',
      imageFormDestructiveActionSubtitle: 'Remove image',
      imageFormSubtitle: 'Upload image',
      imageFormTitle: 'Profile image',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Your profile has been updated.',
      title: '',
    },
    start: {
      __experimental_passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      activeDevicesSection: {
        destructiveAction: 'Log ud af enhed',
        title: 'Aktive enheder',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Prøv igen',
        actionLabel__reauthorize: 'Godkend nu',
        destructiveActionTitle: 'Fjern',
        primaryButton: 'Tilknyt konto',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Tilknyttede konti',
      },
      dangerSection: {
        deleteAccountButton: 'Delete Account',
        title: 'Account termination',
      },
      emailAddressesSection: {
        destructiveAction: 'Fjern e-mailadresse',
        detailsAction__nonPrimary: 'Sæt som primær',
        detailsAction__primary: 'Færdiggøre bekræftelse',
        detailsAction__unverified: 'Færdiggøre bekræftelse',
        primaryButton: 'Tilføj en e-mailadresse',
        title: 'E-mailadresser',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Konto',
      headerTitle__security: 'Sikkerhed',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'generere koder',
          headerTitle: 'Backup koder',
          subtitle__regenerate:
            'Få et nyt sæt sikre backup koder. Tidligere backup koder vil blive slettet og kan ikke bruges.',
          title__regenerate: 'generere backup-koder',
        },
        phoneCode: {
          actionLabel__setDefault: 'Indstil som standard',
          destructiveActionLabel: 'Fjern telefonnummer',
        },
        primaryButton: 'Tilføj totrinsbekræftelse',
        title: 'Totrinsbekræftelse',
        totp: {
          destructiveActionTitle: 'Fjern',
          headerTitle: 'Autentificeringsprogram',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Indtast adgangskode',
        primaryButton__updatePassword: 'Skift adgangskode',
        title: 'Adgangskode',
      },
      phoneNumbersSection: {
        destructiveAction: 'Fjern telefonnummer',
        detailsAction__nonPrimary: 'Sæt som primær',
        detailsAction__primary: 'Færdiggøre bekræftelse',
        detailsAction__unverified: 'Færdiggøre bekræftelse',
        primaryButton: 'Tilføj et telefonnummer',
        title: 'Telefonnumre',
      },
      profileSection: {
        primaryButton: '',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Sæt brugernavn',
        primaryButton__updateUsername: 'Skift brugernavn',
        title: 'Brugernavn',
      },
      web3WalletsSection: {
        destructiveAction: 'Fjern tegnebog',
        primaryButton: 'Web3 tegnebøger',
        title: 'Web3 tegnebøger',
      },
    },
    usernamePage: {
      successMessage: 'Dit brugernavn er blevet opdateret.',
      title__set: 'Opdater profil',
      title__update: 'Opdater profil',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} vil blive fjernet fra denne konto.',
        messageLine2: 'Du vil ikke længere være i stand til at logge ind med denne web3-tegnebog.',
        successMessage: '{{web3Wallet}} er blevet fjernet fra din konto.',
        title: 'Fjern web3-tegnebog',
      },
      subtitle__availableWallets: 'Vælg en web3-tegnebog for at oprette forbindelse til din konto.',
      subtitle__unavailableWallets: 'Der er ingen tilgængelige web3-tegnebøger.',
      successMessage: 'Tegnebogen er blevet tilføjet til din konto.',
      title: 'Tilføj web3-tegnebog',
    },
  },
} as const;
