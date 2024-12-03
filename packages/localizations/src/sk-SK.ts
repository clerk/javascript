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

export const skSK: LocalizationResource = {
  locale: 'sk-SK',
  backButton: 'Späť',
  badge__default: 'Predvolené',
  badge__otherImpersonatorDevice: 'Iné zariadenie zástupcu',
  badge__primary: 'Hlavný',
  badge__requiresAction: 'Vyžaduje akciu',
  badge__thisDevice: 'Toto zariadenie',
  badge__unverified: 'Nepotvrdené',
  badge__userDevice: 'Zariadenie používateľa',
  badge__you: 'Vy',
  createOrganization: {
    formButtonSubmit: 'Vytvoriť organizáciu',
    invitePage: {
      formButtonReset: 'Preskočiť',
    },
    title: 'Vytvoriť organizáciu',
  },
  dates: {
    lastDay: "Včera o {{ date | timeString('sk-SK') }}",
    next6Days: "Příští {{ date | weekday('sk-SK','long') }} o {{ date | timeString('sk-SK') }}",
    nextDay: "Zajtra o {{ date | timeString('sk-SK') }}",
    numeric: "{{ date | numeric('sk-SK') }}",
    previous6Days: "Minulý {{ date | weekday('sk-SK','long') }} o {{ date | timeString('sk-SK') }}",
    sameDay: "Dnes o {{ date | timeString('sk-SK') }}",
  },
  dividerText: 'alebo',
  footerActionLink__useAnotherMethod: 'Použiť inú metódu',
  footerPageLink__help: 'Pomoc',
  footerPageLink__privacy: 'Ochrana súkromia',
  footerPageLink__terms: 'Podmienky',
  formButtonPrimary: 'Pokračovať',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Zabudli ste heslo?',
  formFieldError__matchingPasswords: 'Heslá sa zhodujú.',
  formFieldError__notMatchingPasswords: 'Heslá sa nezhodujú.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Voliteľné',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses:
    'Zadajte alebo vložte jednu alebo viac emailových adries oddelených medzerou alebo čiarkou',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: undefined,
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Záložný kód',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Potvrdiť heslo',
  formFieldLabel__currentPassword: 'Súčasné heslo',
  formFieldLabel__emailAddress: 'Emailová adresa',
  formFieldLabel__emailAddress_username: 'Emailová adresa alebo užívateľské meno',
  formFieldLabel__emailAddresses: 'Emailové adresy',
  formFieldLabel__firstName: 'Meno',
  formFieldLabel__lastName: 'Priezvisko',
  formFieldLabel__newPassword: 'Nové heslo',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Názov organizácie',
  formFieldLabel__organizationSlug: 'URL adresa',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Heslo',
  formFieldLabel__phoneNumber: 'Telefónne číslo',
  formFieldLabel__role: 'Rola',
  formFieldLabel__signOutOfOtherSessions: 'Odhlásiť sa zo všetkých ostatných zariadení',
  formFieldLabel__username: 'Užívateľské meno',
  impersonationFab: {
    action__signOut: 'Odhlásiť sa',
    title: 'Prihlásený(á) ako {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Správca',
  membershipRole__basicMember: 'Člen',
  membershipRole__guestMember: 'Host',
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
      detailsTitle__inviteFailed: 'Pozvánky sa nepodarilo odoslať. Opravte nasledujúce a skúste to znovu:',
      formButtonPrimary__continue: 'Odoslať pozvánky',
      selectDropdown__role: 'Select role',
      subtitle: 'Pozvať nových členov do tejto organizácie',
      successMessage: 'Pozvánky boli úspešne odoslané.',
      title: 'Pozvať členov',
    },
    membersPage: {
      action__invite: 'Pozvať',
      activeMembersTab: {
        menuAction__remove: 'Odstrániť člena',
        tableHeader__actions: undefined,
        tableHeader__joined: 'Pripojil sa',
        tableHeader__role: 'Rola',
        tableHeader__user: 'Užívateľ',
      },
      detailsTitle__emptyRow: 'Žiadni členovia na zobrazenie',
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
        menuAction__revoke: 'Zrušiť pozvanie',
        tableHeader__invited: 'Pozvaní',
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
            'Naozaj chcete opustiť túto organizáciu? Stratíte prístup k tejto organizácii a jej aplikáciám.',
          messageLine2: 'Táto akcia je trvalá a nezvratná.',
          successMessage: 'Opustili ste organizáciu.',
          title: 'Opustiť organizáciu',
        },
        title: 'Upozornenie',
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
      successMessage: 'Organizácia bola aktualizovaná.',
      title: 'Profil organizácie',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Členovia',
      profileSection: {
        primaryButton: undefined,
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
    action__createOrganization: 'Vytvoriť organizáciu',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Spravovať organizáciu',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Nie je vybraná žiadna organizácia',
    personalWorkspace: 'Osobný pracovný priestor',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Ďalšie',
  paginationButton__previous: 'Predchádzajúce',
  paginationRowText__displaying: 'Zobrazuje sa',
  paginationRowText__of: 'z',
  reverification: {
    alternativeMethods: {
      actionLink: undefined,
      actionText: undefined,
      blockButton__backupCode: undefined,
      blockButton__emailCode: undefined,
      blockButton__password: undefined,
      blockButton__phoneCode: undefined,
      blockButton__totp: undefined,
      getHelp: {
        blockButton__emailSupport: undefined,
        content: undefined,
        title: undefined,
      },
      subtitle: undefined,
      title: undefined,
    },
    backupCodeMfa: {
      subtitle: undefined,
      title: undefined,
    },
    emailCode: {
      formTitle: undefined,
      resendButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    noAvailableMethods: {
      message: undefined,
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: undefined,
      subtitle: undefined,
      title: undefined,
    },
    phoneCode: {
      formTitle: undefined,
      resendButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    phoneCodeMfa: {
      formTitle: undefined,
      resendButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    totpMfa: {
      formTitle: undefined,
      subtitle: undefined,
      title: undefined,
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
      actionLink: 'Získať pomoc',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Použiť záložný kód',
      blockButton__emailCode: 'Odoslať overovací kód na email {{identifier}}',
      blockButton__emailLink: 'Odoslať odkaz na email {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Prihlásiť sa pomocou hesla',
      blockButton__phoneCode: 'Poslať SMS kód na telefónne číslo {{identifier}}',
      blockButton__totp: 'Použiť autentifikačnú aplikáciu',
      getHelp: {
        blockButton__emailSupport: 'Podpora cez email',
        content:
          'Ak máte problémy s prihlásením do svojho účtu, kontaktujte nás emailom a pokúsime sa vám čo najskôr obnoviť prístup.',
        title: 'Získať pomoc',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Použiť inú metódu',
    },
    backupCodeMfa: {
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Zadajte záložný kód',
    },
    emailCode: {
      formTitle: 'Overovací kód',
      resendButton: 'Znovu poslať kód',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Skontrolujte svoj email',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      expired: {
        subtitle: 'Vráťte sa do pôvodného okna pre pokračovanie.',
        title: 'Tento overovací odkaz vypršal',
      },
      failed: {
        subtitle: 'Vráťte sa do pôvodného okna pre pokračovanie.',
        title: 'Tento overovací odkaz je neplatný',
      },
      formSubtitle: 'Použite overovací odkaz zaslaný na váš email',
      formTitle: 'Overovací odkaz',
      loading: {
        subtitle: 'Čoskoro budete presmerovaní',
        title: 'Prihlasujem...',
      },
      resendButton: 'Znovu poslať odkaz',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Skontrolujte svoj email',
      unusedTab: {
        title: 'Môžete zatvoriť toto okno',
      },
      verified: {
        subtitle: 'Čoskoro budete presmerovaní',
        title: 'Úspešne prihlásené',
      },
      verifiedSwitchTab: {
        subtitle: 'Vráťte sa do pôvodného okna pre pokračovanie',
        subtitleNewTab: 'Vráťte sa do novootvoreného okna pre pokračovanie',
        titleNewTab: 'Prihlásené v inom okne',
      },
    },
    forgotPassword: {
      formTitle: 'Overovací kód pre obnovenie hesla',
      resendButton: 'Znovu poslať kód',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Obnoviť heslo',
      label__alternativeMethods: 'Alebo sa prihláste pomocou inej metódy.',
      title: 'Zabudli ste heslo?',
    },
    noAvailableMethods: {
      message: 'Nemožno pokračovať v prihlásení. Nie je k dispozícii žiadna dostupná autentifikačná metóda.',
      subtitle: 'Došlo k chybe',
      title: 'Nie je možné sa prihlásiť',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Použiť inú metódu',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Zadajte svoje heslo',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Overovací kód',
      resendButton: 'Znova odoslať kód',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Skontrolujte váš telefón',
    },
    phoneCodeMfa: {
      formTitle: 'Overovací kód',
      resendButton: 'Znova odoslať kód',
      subtitle: undefined,
      title: 'Skontrolujte váš telefón',
    },
    resetPassword: {
      formButtonPrimary: 'Obnoviť heslo',
      requiredMessage: 'For security reasons, it is required to reset your password.',
      successMessage: 'Vaše heslo bolo úspešne zmenené. Prihlasujem vás, prosím počkajte okamžite.',
      title: 'Obnoviť heslo',
    },
    resetPasswordMfa: {
      detailsLabel: 'Pred obnovením hesla je potrebné overiť vašu totožnosť.',
    },
    start: {
      actionLink: 'Registrovať sa',
      actionLink__join_waitlist: undefined,
      actionLink__use_email: 'Použiť email',
      actionLink__use_email_username: 'Použiť email alebo užívateľské meno',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Použiť telefón',
      actionLink__use_username: 'Použiť užívateľské meno',
      actionText: 'Nemáte účet?',
      actionText__join_waitlist: undefined,
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Prihlásiť sa',
      titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Overovací kód',
      subtitle: undefined,
      title: 'Dvojfaktorové overenie',
    },
  },
  signInEnterPasswordTitle: 'Zadajte svoje heslo',
  signUp: {
    continue: {
      actionLink: 'Prihlásiť sa',
      actionText: 'Máte účet?',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Vyplňte chýbajúce polia',
    },
    emailCode: {
      formSubtitle: 'Zadajte overovací kód poslaný na vašu emailovú adresu',
      formTitle: 'Overovací kód',
      resendButton: 'Znovu poslať kód',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Overte svoj email',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      formSubtitle: 'Použite overovací odkaz poslaný na vašu emailovú adresu',
      formTitle: 'Overovací odkaz',
      loading: {
        title: 'Prebieha registrácia...',
      },
      resendButton: 'Znovu poslať odkaz',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Overte svoj email',
      verified: {
        title: 'Úspešne zaregistrované',
      },
      verifiedSwitchTab: {
        subtitle: 'Vráťte sa do novootvoreného okna pre pokračovanie',
        subtitleNewTab: 'Vráťte sa do predchádzajúceho okna pre pokračovanie',
        title: 'Email úspešne overený',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: undefined,
        label__onlyTermsOfService: undefined,
        label__termsOfServiceAndPrivacyPolicy: undefined,
      },
      continue: {
        subtitle: undefined,
        title: undefined,
      },
    },
    phoneCode: {
      formSubtitle: 'Zadajte overovací kód poslaný na vaše telefónne číslo',
      formTitle: 'Overovací kód',
      resendButton: 'Znovu poslať kód',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Overte svoj telefón',
    },
    restrictedAccess: {
      actionLink: undefined,
      actionText: undefined,
      blockButton__emailSupport: undefined,
      blockButton__joinWaitlist: undefined,
      subtitle: undefined,
      subtitleWaitlist: undefined,
      title: undefined,
    },
    start: {
      actionLink: 'Prihlásiť sa',
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'Máte účet?',
      subtitle: 'pre pokračovanie do {{applicationName}}',
      title: 'Vytvorte si účet',
    },
  },
  socialButtonsBlockButton: 'Pokračovať s {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Email address must be a valid email address.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'Vaše heslo nie je dostatočne silné.',
    form_password_pwned: 'Toto heslo bolo nájdené v rámci úniku dát a nemôže byť použité, prosím zvoľte iné heslo.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Vaše heslo prekročilo maximálny povolený počet bytov, prosím skráťte ho alebo odstráňte niektoré špeciálne znaky.',
    form_password_validation_failed: 'Nesprávne heslo',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: 'menej ako {{length}} znakov',
      minimumLength: '{{length}} alebo viac znakov',
      requireLowercase: 'malé písmeno',
      requireNumbers: 'číslicu',
      requireSpecialCharacter: 'špeciálny znak',
      requireUppercase: 'veľké písmeno',
      sentencePrefix: 'Vaše heslo musí obsahovať',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    web3_missing_identifier: undefined,
    zxcvbn: {
      couldBeStronger: 'Vaše heslo funguje, ale mohlo by byť silnejšie. Skúste pridať viac znakov.',
      goodPassword: 'Dobrá práca. Toto je vynikajúce heslo.',
      notEnough: 'Vaše heslo není dostatočne silné.',
      suggestions: {
        allUppercase: 'Použite veľké písmena len u niektorých, nie všetkých písmen.',
        anotherWord: 'Pridajte viac slov, ktoré nie sú tak bežné.',
        associatedYears: 'Vyhnite sa rokom, ktoré sú s vami spojené.',
        capitalization: 'Písmená píšte s veľkým počiatočným písmenom a viac ako len prvým písmenom.',
        dates: 'Vyhnite sa dátumom a rokom, ktoré sú s vami spojené.',
        l33t: "Vyhnite sa predvídateľným náhradám písmen, napríklad '@' miesto 'a'.",
        longerKeyboardPattern: 'Použite dlhšie vzory na klávesnici a menite smer písania viackrát.',
        noNeed: 'Môžete vytvárať silné heslá aj bez použitia symbolov, čísel alebo veľkých písmen.',
        pwned: 'Ak používate toto heslo aj niekde inde, mali by ste ho zmeniť.',
        recentYears: 'Vyhnite sa nedávnym rokom.',
        repeated: 'Vyhnite sa opakujúcim sa slovám a znakom.',
        reverseWords: 'Vyhnite sa obráteným pravopisom bežných slov.',
        sequences: 'Vyhnite sa bežným sekvenciám znakov.',
        useWords: 'Použite viac slov, ale vyhnite sa bežným frázam.',
      },
      warnings: {
        common: 'Toto je bežne používané heslo.',
        commonNames: 'Bežné mená a priezviská sú ľahko uhádnuteľné.',
        dates: 'Dátum je ľahko uhádnuteľný.',
        extendedRepeat: 'Opakujúce sa vzory znakov ako "abcabcabc" sú ľahko uhádnuteľné.',
        keyPattern: 'Krátke vzory na klávesnici sú ľahko uhádnuteľné.',
        namesByThemselves: 'Samostatné mená alebo priezviská sú ľahko uhádnuteľné.',
        pwned: 'Vaše heslo bolo odhalené pri úniku údajov na internete.',
        recentYears: 'Nedávne roky sú ľahko uhádnuteľné.',
        sequences: 'Bežné sekvencie znakov ako "abc" sú ľahko uhádnuteľné.',
        similarToCommon: 'Toto je podobné bežne používanému heslu.',
        simpleRepeat: 'Opakujúce sa znaky ako "aaa" sú ľahko uhádnuteľné.',
        straightRow: 'Rady klávesnice sú ľahko uhádnuteľné.',
        topHundred: 'Toto je často používané heslo.',
        topTen: 'Toto je často používané heslo.',
        userInputs: 'Heslo by nemalo obsahovať osobné alebo stránkou súvisiace údaje.',
        wordByItself: 'Samostatné slová sú ľahko uhádnuteľné.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Pridať účet',
    action__manageAccount: 'Spravovať účet',
    action__signOut: 'Odhlásiť sa',
    action__signOutAll: 'Odhlásiť sa zo všetkých účtov',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Skopírované!',
      actionLabel__copy: 'Kopírovať všetko',
      actionLabel__download: 'Stiahnuť .txt',
      actionLabel__print: 'Vytlačiť',
      infoText1: 'Pre tento účet budú povolené záložné kódy.',
      infoText2:
        'Záložné kódy uchovávajte tajne a bezpečne. Môžete vygenerovať nové záložné kódy, ak máte podozrenie, že boli skompromitované.',
      subtitle__codelist: 'Uchovávajte ich bezpečne a tajne.',
      successMessage:
        'Záložné kódy sú teraz povolené. Ak stratíte prístup k vášmu overovaciemu zariadeniu, môžete použiť jeden z týchto kódov na prihlásenie do vášho účtu. Každý kód možno použiť iba raz.',
      successSubtitle:
        'Použite jeden z týchto kódov na prihlásenie do vášho účtu, ak stratíte prístup k vášmu overovaciemu zariadeniu.',
      title: 'Pridať overovanie pomocou záložných kódov',
      title__codelist: 'Záložné kódy',
    },
    connectedAccountPage: {
      formHint: 'Vyberte poskytovateľa pre pripojenie vášho účtu.',
      formHint__noAccounts: 'Nie sú k dispozícii žiadni dostupní externí poskytovatelia účtov.',
      removeResource: {
        messageLine1: '{{identifier}} bude odobraný z tohto účtu.',
        messageLine2: 'Nebudete už môcť používať tento pripojený účet a akékoľvek závislé funkcie prestanú fungovať.',
        successMessage: '{{connectedAccount}} bol odstránený z vášho účtu.',
        title: 'Odstrániť pripojený účet',
      },
      socialButtonsBlockButton: 'Pripojiť účet {{provider|titleize}}',
      successMessage: 'Poskytovateľ bol pridaný k vášmu účtu.',
      title: 'Pridať pripojený účet',
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
        formHint: 'Na túto e-mailovú adresu bude odoslaný overovací kód.',
        formSubtitle: 'Zadajte overovací kód zaslaný na adresu {{identifier}}',
        formTitle: 'Overovací kód',
        resendButton: 'Znovu odoslať kód',
        successMessage: 'E-mailová adresa {{identifier}} bola pridaná k vášmu účtu.',
      },
      emailLink: {
        formHint: 'Na túto e-mailovú adresu bude odoslaný overovací odkaz.',
        formSubtitle: 'Kliknite na overovací odkaz v e-maile zaslanom na adresu {{identifier}}',
        formTitle: 'Overovací odkaz',
        resendButton: 'Znovu odoslať odkaz',
        successMessage: 'E-mailová adresa {{identifier}} bola pridaná k vášmu účtu.',
      },
      enterpriseSsoLink: {
        formHint: undefined,
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      removeResource: {
        messageLine1: '{{identifier}} bude odstránená z tohto účtu.',
        messageLine2: 'Nebudete sa môcť prihlásiť pomocou tejto e-mailovej adresy.',
        successMessage: '{{emailAddress}} bola odobraná z vášho účtu.',
        title: 'Odstrániť e-mailovú adresu',
      },
      title: 'Pridať e-mailovú adresu',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Pokračovať',
    formButtonPrimary__finish: 'Dokončiť',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Zrušiť',
    mfaPage: {
      formHint: 'Vyberte spôsob pridania.',
      title: 'Pridať dvojfaktorové overenie',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Pridať telefónne číslo',
      removeResource: {
        messageLine1: '{{identifier}} už nebude dostávať overovacie kódy pri prihlasovaní.',
        messageLine2: 'Váš účet nemusí byť tak bezpečný. Naozaj chcete pokračovať?',
        successMessage: 'Dvojfaktorové overovanie pomocou SMS kódu bolo odstránené pre {{mfaPhoneCode}}',
        title: 'Odstrániť dvojfaktorové overovanie',
      },
      subtitle__availablePhoneNumbers:
        'Vyberte telefónne číslo pre registráciu dvojfaktorového overovania pomocou SMS kódu.',
      subtitle__unavailablePhoneNumbers:
        'Nie sú k dispozícii žiadne dostupné telefónne čísla pre registráciu dvojfaktorového overovania pomocou SMS kódu.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Pridať overovanie pomocou SMS kódu',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Namiesto toho naskenujte QR kód',
        buttonUnableToScan__nonPrimary: 'Nemôžete naskenovať QR kód?',
        infoText__ableToScan:
          'Nastavte novú metódu prihlásenia vo vašej aplikácii pre overovanie a naskenujte nasledujúci QR kód, aby ste ju spojili so svojím účtom.',
        infoText__unableToScan:
          'Nastavte novú metódu prihlásenia vo vašej aplikácii pre overovanie a zadajte nižšie uvedený kľúč.',
        inputLabel__unableToScan1:
          'Uistite sa, že je povolené časovo závislé alebo jednorázové heslo a dokončite spojenie vášho účtu.',
        inputLabel__unableToScan2:
          'Alternatívne, ak vaša aplikácia pre overovanie podporuje TOTP URI, môžete tiež skopírovať celý URI.',
      },
      removeResource: {
        messageLine1: 'Pri prihlasovaní už nebudú vyžadované overovacie kódy z tejto aplikácie pre overovanie.',
        messageLine2: 'Váš účet nemusí byť tak bezpečný. Naozaj chcete pokračovať?',
        successMessage: 'Dvojfaktorové overovanie pomocou aplikácie pre overovanie bolo odstránené.',
        title: 'Odstrániť dvojfaktorové overovanie',
      },
      successMessage:
        'Dvojfaktorové overovanie je teraz povolené. Pri prihlásení budete musieť zadať overovací kód z tejto aplikácie pre overovanie ako ďalší krok.',
      title: 'Pridať aplikáciu pre overovanie',
      verifySubtitle: 'Zadajte overovací kód generovaný vašou aplikáciou pre overovanie.',
      verifyTitle: 'Overovací kód',
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
      successMessage__set: 'Vaše heslo bolo nastavené.',
      successMessage__signOutOfOtherSessions: 'Všetky ostatné zariadenia boli odhlásené.',
      successMessage__update: 'Vaše heslo bolo aktualizované.',
      title__set: 'Nastaviť heslo',
      title__update: 'Zmeniť heslo',
    },
    phoneNumberPage: {
      infoText: 'Na toto telefónne číslo bude odoslaná textová správa obsahujúca overovací odkaz.',
      removeResource: {
        messageLine1: '{{identifier}} bude odobrané z tohto účtu.',
        messageLine2: 'Nebudete sa môcť prihlásiť pomocou tohto telefónneho čísla.',
        successMessage: '{{phoneNumber}} bolo odstránené z vášho účtu.',
        title: 'Odstrániť telefónne číslo',
      },
      successMessage: '{{identifier}} bolo pridané k vášmu účtu.',
      title: 'Pridať telefónne číslo',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Nahrajte obrázok vo formátoch JPG, PNG, GIF alebo WEBP s veľkosťou menšou než 10 MB',
      imageFormDestructiveActionSubtitle: 'Odstrániť obrázok',
      imageFormSubtitle: 'Nahrať obrázok',
      imageFormTitle: 'Profilový obrázok',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Váš profil bol aktualizovaný.',
      title: 'Aktualizovať profil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Odhlásiť sa zo zariadenia',
        title: 'Aktívne zariadenia',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Skúsiť znovu',
        actionLabel__reauthorize: 'Autorizovať teraz',
        destructiveActionTitle: 'Odstrániť',
        primaryButton: 'Pripojiť účet',
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Pripojené účty',
      },
      dangerSection: {
        deleteAccountButton: 'Delete Account',
        title: 'Account termination',
      },
      emailAddressesSection: {
        destructiveAction: 'Odstrániť emailovú adresu',
        detailsAction__nonPrimary: 'Nastaviť ako hlavnú',
        detailsAction__primary: 'Dokončiť overenie',
        detailsAction__unverified: 'Dokončiť overenie',
        primaryButton: 'Pridať emailovú adresu',
        title: 'Emailové adresy',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Účet',
      headerTitle__security: 'Bezpečnosť',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Obnoviť kódy',
          headerTitle: 'Záložné kódy',
          subtitle__regenerate:
            'Získajte novú sadu zabezpečených záložných kódov. Predchádzajúce záložné kódy budú zmazané a nebudú použiteľné.',
          title__regenerate: 'Obnoviť záložné kódy',
        },
        phoneCode: {
          actionLabel__setDefault: 'Nastaviť ako predvolené',
          destructiveActionLabel: 'Odstrániť telefónne číslo',
        },
        primaryButton: 'Pridať dvojfaktorovú autentifikáciu',
        title: 'Dvojfaktorová autentifikácia',
        totp: {
          destructiveActionTitle: 'Odstrániť',
          headerTitle: 'Aplikácia Authenticator',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Nastaviť heslo',
        primaryButton__updatePassword: 'Zmeniť heslo',
        title: 'Heslo',
      },
      phoneNumbersSection: {
        destructiveAction: 'Odstrániť telefónne číslo',
        detailsAction__nonPrimary: 'Nastaviť ako hlavné',
        detailsAction__primary: 'Dokončiť overenie',
        detailsAction__unverified: 'Dokončiť overenie',
        primaryButton: 'Pridať telefónne číslo',
        title: 'Telefónne čísla',
      },
      profileSection: {
        primaryButton: undefined,
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Nastaviť užívateľské meno',
        primaryButton__updateUsername: 'Zmeniť užívateľské meno',
        title: 'Užívateľské meno',
      },
      web3WalletsSection: {
        destructiveAction: 'Odstrániť peňaženku',
        primaryButton: 'Web3 peňaženky',
        title: 'Web3 peňaženky',
      },
    },
    usernamePage: {
      successMessage: 'Vaše užívateľské meno bolo aktualizované.',
      title__set: 'Aktualizovať užívateľské meno',
      title__update: 'Aktualizovať užívateľské meno',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} bude odobraná z tohto účtu.',
        messageLine2: 'Nebudete sa už môcť prihlásiť pomocou tejto web3 peňaženky.',
        successMessage: '{{web3Wallet}} bola odstránená z vášho účtu.',
        title: 'Odstrániť web3 peňaženku',
      },
      subtitle__availableWallets: 'Vyberte web3 peňaženku na pripojenie k vášmu účtu.',
      subtitle__unavailableWallets: 'Nie sú k dispozícii žiadne dostupné web3 peňaženky.',
      successMessage: 'Peňaženka bola pridaná k vášmu účtu.',
      title: 'Pridať web3 peňaženku',
      web3WalletButtonsBlockButton: undefined,
    },
  },
  waitlist: {
    start: {
      actionLink: undefined,
      actionText: undefined,
      formButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    success: {
      message: undefined,
      subtitle: undefined,
      title: undefined,
    },
  },
} as const;
