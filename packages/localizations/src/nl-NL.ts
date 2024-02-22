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

export const nlNL: LocalizationResource = {
  locale: 'nl-NL',
  backButton: 'Terug',
  badge__default: 'Standaard',
  badge__otherImpersonatorDevice: 'Ander immitatie apparaat',
  badge__primary: 'Hoofd',
  badge__requiresAction: 'Actie nodig',
  badge__thisDevice: 'Dit apparaat',
  badge__unverified: 'Ongeverifieerd',
  badge__userDevice: 'Gebruikersapparaat',
  badge__you: 'Jij',
  createOrganization: {
    formButtonSubmit: 'Maak organisatie aan',
    invitePage: {
      formButtonReset: 'Overslaan',
    },
    title: 'Organisatie aanmaken',
  },
  dates: {
    lastDay: "Gisteren om {{ date | timeString('nl-NL') }}",
    next6Days: "{{ date | weekday('nl-NL','long') }} om {{ date | timeString('nl-NL') }}",
    nextDay: "Morgen om {{ date | timeString('nl-NL') }}",
    numeric: "{{ date | numeric('nl-NL') }}",
    previous6Days: "Vorige {{ date | weekday('nl-NL','long') }} om {{ date | timeString('nl-NL') }}",
    sameDay: "Vandaag om {{ date | timeString('nl-NL') }}",
  },
  dividerText: 'or',
  footerActionLink__useAnotherMethod: 'Een andere methode gebruiken',
  footerPageLink__help: 'Help',
  footerPageLink__privacy: 'Privacy',
  footerPageLink__terms: 'Voorwaarden',
  formButtonPrimary: 'Doorgaan',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Wachtwoord vergeten?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Optioneel',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    "Typ of plak één of meerdere emailadressen, gescheiden door spaties of komma's.",
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
  formFieldLabel__backupCode: 'Backupcode',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Wachtwoord bevestigen',
  formFieldLabel__currentPassword: 'Current password',
  formFieldLabel__emailAddress: 'E-mailadres',
  formFieldLabel__emailAddress_username: 'E-mailadres of gebruikersnaam',
  formFieldLabel__emailAddresses: 'E-mailadressen',
  formFieldLabel__firstName: 'Voornaam',
  formFieldLabel__lastName: 'Achternaam',
  formFieldLabel__newPassword: 'Nieuw wachtwoord',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Organisatienaam',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__password: 'Wachtwoord',
  formFieldLabel__phoneNumber: 'Telefoonnummer',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Sign out of all other devices',
  formFieldLabel__username: 'Gebruikersnaam',
  impersonationFab: {
    action__signOut: 'Uitloggen',
    title: 'Ingelogd als {{identifier}}',
  },
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Lid',
  membershipRole__guestMember: 'Gast',
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
      detailsTitle__inviteFailed:
        'De uitnodigingen konden niet verzonden worden. Los het volgende op en probeer het opnieuw:',
      formButtonPrimary__continue: 'Uitnodigingen verzenden',
      selectDropdown__role: 'Select role',
      subtitle: 'Nodig nieuwe leden uit voor deze organisatie',
      successMessage: 'Uitnodigingen succesvol verzonden',
      title: 'Leden uitnodigen',
    },
    membersPage: {
      action__invite: 'Uitnodigen',
      activeMembersTab: {
        menuAction__remove: 'Verwijder lid',
        tableHeader__actions: '',
        tableHeader__joined: 'Toegetreden',
        tableHeader__role: 'Rol',
        tableHeader__user: 'Gebruiker',
      },
      detailsTitle__emptyRow: 'Geen leden gevonden',
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
        menuAction__revoke: 'Uitnodiging intrekken',
        tableHeader__invited: 'Uitgenodigd',
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
            'Weet je zeker dat je deze organisatie wilt verlaten? Je zult toegang verliezen tot deze organisatie en haar applicaties.',
          messageLine2: 'Deze actie is permanent en onomkeerbaar.',
          successMessage: 'Je hebt deze organisatie verlaten.',
          title: 'Verlaat organisatie',
        },
        title: 'Gevaar',
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
      successMessage: 'De organisatie is bijgewerkt.',
      title: 'Organisatieprofiel',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Leden',
      profileSection: {
        primaryButton: 'Edit profile',
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
    action__createOrganization: 'Maak organisatie aan',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Beheer organisatie',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Geen organisatie geselecteerd',
    personalWorkspace: 'Persoonlijke werkruimte',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Volgende',
  paginationButton__previous: 'Vorige',
  paginationRowText__displaying: 'Weergeven',
  paginationRowText__of: 'van',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Help',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Gebruik een backupcode',
      blockButton__emailCode: 'Verzend code naar {{identifier}}',
      blockButton__emailLink: 'Verzend link naar {{identifier}}',
      blockButton__password: 'Inloggen met je wachtwoord',
      blockButton__phoneCode: 'Verzend code naar {{identifier}}',
      blockButton__totp: 'Gebruik je authenticator app',
      getHelp: {
        blockButton__emailSupport: 'E-mail klantenservice',
        content: 'Als je geen toegang hebt neem dan contact op met de klantenservice en we helpen je verder.',
        title: 'Help',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Gebruik een andere methode',
    },
    backupCodeMfa: {
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Voer een backupcode in',
    },
    emailCode: {
      formTitle: 'Verificatiecode',
      resendButton: 'Verstuur code opnieuw',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Check je e-mail',
    },
    emailLink: {
      expired: {
        subtitle: 'Ga naar de oorspronkelijke tab om verder te gaan.',
        title: 'Deze verificatielink is verlopen',
      },
      failed: {
        subtitle: 'Ga naar de oorspronkelijke tab om verder te gaan.',
        title: 'Deze verificatielink is niet geldig',
      },
      formSubtitle: 'Gebruik de verificatielink die verzonden is naar je e-mailadres',
      formTitle: 'Verificatielink',
      loading: {
        subtitle: 'Je zal weldra doorgestuurd worden',
        title: 'Inloggen ...',
      },
      resendButton: 'Verstuur link opnieuw',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Check je e-mail',
      unusedTab: {
        title: 'Je kan deze tab sluiten.',
      },
      verified: {
        subtitle: 'Je zal weldra doorgestuurd worden',
        title: 'Successvol ingelogd',
      },
      verifiedSwitchTab: {
        subtitle: 'Ga naar de oorspronkelijke tab om verder te gaan',
        subtitleNewTab: 'Ga naar de pasgeopende tab om verder te gaan',
        titleNewTab: 'Ingelogd in andere tab',
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
      message: 'Het is niet mogelijk om door te gaan met inloggen. Er is geen beschikbare authenticatiefactor.',
      subtitle: 'Er heeft zich een fout voorgedaan',
      title: 'Inloggen onmogelijk',
    },
    password: {
      actionLink: 'Gebruik een andere methode',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Vul je wachtwoord in',
    },
    phoneCode: {
      formTitle: 'Verificatie code',
      resendButton: 'Verstuur code opnieuw',
      subtitle: 'om verder te gaan naar {{applicationName}}',
      title: 'Check je telefoon',
    },
    phoneCodeMfa: {
      formTitle: 'Verificatie code',
      resendButton: 'Verstuur code opnieuw',
      subtitle: '',
      title: 'Check je telefoon',
    },
    resetPassword: {
      formButtonPrimary: 'Reset Password',
      requiredMessage:
        'An account already exists with an unverified email address. Please reset your password for security.',
      successMessage: 'Your password was successfully changed. Signing you in, please wait a moment.',
      title: 'Set new password',
    },
    resetPasswordMfa: {
      detailsLabel: 'We need to verify your identity before resetting your password.',
    },
    start: {
      actionLink: 'Registreren',
      actionLink__use_email: 'Use email',
      actionLink__use_email_username: 'Use email or username',
      actionLink__use_phone: 'Use phone',
      actionLink__use_username: 'Use username',
      actionText: 'Geen account?',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Log in',
    },
    totpMfa: {
      formTitle: 'Verificatiecode',
      subtitle: '',
      title: 'Tweestapsverificatie',
    },
  },
  signInEnterPasswordTitle: 'Vul je wachtwoord in',
  signUp: {
    continue: {
      actionLink: 'Inloggen',
      actionText: 'Heb je een account?',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Vul de ontbrekende velden in',
    },
    emailCode: {
      formSubtitle: 'Voer de verificatiecode in die verzonden is naar je e-mailadres',
      formTitle: 'Verificatiecode',
      resendButton: 'Verstuur code opnieuw',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Bevestig je e-mailadres',
    },
    emailLink: {
      formSubtitle: 'Gebruik de verificatielink die verzonden is naar je e-mailadres',
      formTitle: 'Verificatielink',
      loading: {
        title: 'Registreren ...',
      },
      resendButton: 'Verstuur link opnieuw',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Bevestig je e-mailadres',
      verified: {
        title: 'Succesvol geregistreerd',
      },
      verifiedSwitchTab: {
        subtitle: 'Ga naar de pas geopende tab om verder te gaan',
        subtitleNewTab: 'Ga naar de vorige tab om verder te gaan',
        title: 'E-mail bevestigd',
      },
    },
    phoneCode: {
      formSubtitle: 'Voer de verificatiecode in die verzonden is naar je telefoonnummer',
      formTitle: 'Verificatiecode',
      resendButton: 'Verstuur code opnieuw',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Bevestig je telefoonnummer',
    },
    start: {
      actionLink: 'Inloggen',
      actionText: 'Heb je al een account?',
      subtitle: 'om door te gaan naar {{applicationName}}',
      title: 'Maak je account aan',
    },
  },
  socialButtonsBlockButton: 'Ga verder met {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: '',
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
    form_password_size_in_bytes_exceeded:
      'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
    form_password_validation_failed: 'Incorrect Password',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    passwordComplexity: {
      maximumLength: '',
      minimumLength: '',
      requireLowercase: '',
      requireNumbers: '',
      requireSpecialCharacter: '',
      requireUppercase: '',
      sentencePrefix: '',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger: 'Your password works, but could be stronger. Try adding more characters.',
      goodPassword: 'Your password meets all the necessary requirements.',
      notEnough: 'Je wachtwoord is niet sterk genoeg.',
      suggestions: {
        allUppercase: 'Zet een deel in hoofdletters, maar niet alle letters.',
        anotherWord: 'Voeg meer woorden toe die minder vaak voorkomen.',
        associatedYears: 'Vermijd jaartallen die met jou geassocieerd zijn.',
        capitalization: 'Zet meer dan de eerste letter in hoofdletter.',
        dates: 'Vermijd data en jaartallen die met jou geassocieerd zijn.',
        l33t: "Vermijd voorspelbare vervangingen, zoals '@' voor 'a'.",
        longerKeyboardPattern: 'Gebruik langere toetsenbord patronen, en wissel meerdere keren van richting.',
        noNeed: 'Je kan ook een sterk wachtwoord maken zonder speciale tekens, hoofdletters of nummers.',
        pwned: 'Als u dit wachtwoord elders gebruikt, moet u het veranderen.',
        recentYears: 'Vermijd recente jaartallen.',
        repeated: 'Vermijd herhalende woorden en letters.',
        reverseWords: 'Vermijd het omdraaien van veelvoorkomende woorden.',
        sequences: 'Vermijd veelvoorkomende tekstreeksen.',
        useWords: 'Gebruik meerdere woorden, maar vermijd veelvoorkomende zinnen.',
      },
      warnings: {
        common: 'Dit wachtwoord wordt veel gebruikt.',
        commonNames: 'Veelvoorkomende voor- en achternamen zijn makkelijk te raden.',
        dates: 'Datums zijn makkelijk te raden.',
        extendedRepeat: 'Herhalende patronen zoals "abcabcabc" zijn makkelijk te raden.',
        keyPattern: 'Korte toetsenbord patronen zijn makkelijk te raden.',
        namesByThemselves: 'Voor- en achternamen op zich zijn makkelijk te raden.',
        pwned: 'Dit wachtwoord is in een datalek gevonden.',
        recentYears: 'Recente jaartallen zijn makkelijk te raden.',
        sequences: 'Veelvoorkomende tekstreeksen zoals "abc" zijn makkelijk te raden.',
        similarToCommon: 'Dit lijkt op een veelvoorkomend wachtwoord.',
        simpleRepeat: 'Herhalende letters zoals "aaa" zijn makkelijk te raden.',
        straightRow: 'Opeenvolgende toetsen op jouw toetsenbord zijn makkelijk te raden.',
        topHundred: 'Dit wachtwoord wordt erg veel gebruikt.',
        topTen: 'Dit wachtwoord wordt heel erg veel gebruikt.',
        userInputs: 'Vermijd persoonlijke of website gerelateerde woorden.',
        wordByItself: 'Woorden op zich zijn makkelijk te raden.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Account toevoegen',
    action__manageAccount: 'Account beheren',
    action__signOut: 'Uitloggen',
    action__signOutAll: 'Uitloggen uit alle accounts',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Gekopieerd!',
      actionLabel__copy: 'Kopieer',
      actionLabel__download: 'Download .txt',
      actionLabel__print: 'Print',
      infoText1: 'Backupcodes zullen voor dit account ingeschakeld zijn.',
      infoText2:
        'Houd de backupcodes geheim en bewaar ze veilig. U kunt backupcodes opnieuw genereren als u vermoedt dat ze zijn aangetast.',
      subtitle__codelist: 'Sla ze veilig op en hou ze geheim.',
      successMessage:
        'Backupcodes zijn nu ingeschakeld. U kunt er een van gebruiken om in te loggen op uw account als u geen toegang meer heeft tot uw authenticatieapparaat. Elke code kan maar één keer gebruikt worden.',
      successSubtitle:
        'Je kunt één van deze gebruiken om in te loggen op je account als je geen toegang meer hebt tot je authenticatieapparaat.',
      title: 'Voeg backup code verificatie toe',
      title__codelist: 'Backup codes',
    },
    connectedAccountPage: {
      formHint: 'Kies een provider om je account te verbinden.',
      formHint__noAccounts: 'Er zijn geen beschikbare externe accountproviders.',
      removeResource: {
        messageLine1: '{{identifier}} zal verwijderd worden uit dit account.',
        messageLine2:
          'Je kunt deze verbonden account niet meer gebruiken en afhankelijke functies zullen niet meer werken.',
        successMessage: '{{connectedAccount}} is verwijderd uit je account.',
        title: 'Verwijder externe account',
      },
      socialButtonsBlockButton: 'Verbind {{provider|titleize}} account',
      successMessage: 'Deze provider is toegevoegd aan je account.',
      title: 'Verbind externe account',
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
        formHint: 'Een mail met daarin een verificatiecode is verstuurd naar dit adres.',
        formSubtitle: 'Voer de verificatiecode in die verstuurd is naar {{identifier}}',
        formTitle: 'Verificatiecode',
        resendButton: 'Verstuur code opnieuw',
        successMessage: 'Het e-mailadres {{identifier}} is toegevoegd aan je account.',
      },
      emailLink: {
        formHint: 'Een mail met daarin een verificatielink is verstuurd naar dit adres.',
        formSubtitle: 'Klik op de verificatielink die verstuurd is naar {{identifier}}',
        formTitle: 'Verificatielink',
        resendButton: 'Verstuur link opnieuw',
        successMessage: 'Het e-mailadres {{identifier}} is toegevoegd aan je account.',
      },
      removeResource: {
        messageLine1: '{{identifier}} zal verwijderd worden uit dit account.',
        messageLine2: 'Je zal niet meer kunnen inloggen met dit e-mailadres.',
        successMessage: '{{emailAddress}} is verwijderd uit je account.',
        title: 'Verwijder e-mailadres',
      },
      title: 'E-mailadres toevoegen',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Doorgaan',
    formButtonPrimary__finish: 'Afronden',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Annuleren',
    mfaPage: {
      formHint: 'Kies een methode om toe te voegen.',
      title: 'Tweestapsverificatie toevoegen',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Telefoonnummer toevoegen',
      removeResource: {
        messageLine1: '{{identifier}} zal niet langer verificatiecodes ontvangen bij het inloggen.',
        messageLine2: 'Uw account is mogelijk niet zo veilig. Weet je zeker dat je door wilt gaan?',
        successMessage: 'SMS-code tweestapsverificatie is verwijderd voor {{mfaPhoneCode}}',
        title: 'Verwijder tweestapsverificatie',
      },
      subtitle__availablePhoneNumbers:
        'Selecteer een telefoonnummer om je te registreren voor SMS-code twee-stapsverificatie.',
      subtitle__unavailablePhoneNumbers:
        'Er zijn geen beschikbare telefoonnummers om te registreren voor SMS-code tweestapsverificatie.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Voeg SMS-code verificatie toe',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Alternatief, scan een QR code',
        buttonUnableToScan__nonPrimary: 'Kan je de code niet scannen?',
        infoText__ableToScan: 'Scan de QR code met je authenticator app om de authenticator toe te voegen.',
        infoText__unableToScan:
          'Stel een nieuwe aanmeldmethode in op je authenticator en voer de onderstaande sleutel in.',
        inputLabel__unableToScan1:
          'Zorg ervoor dat tijdsgebaseerde of eenmalige wachtwoorden zijn ingeschakeld, en voltooi vervolgens het koppelen van uw account.',
        inputLabel__unableToScan2: "Als je authenticator TOTP-URI's ondersteunt, kun je ook de volledige URI kopiëren.",
      },
      removeResource: {
        messageLine1: 'Verificatiecodes van deze authenticator zullen niet langer vereist zijn bij het inloggen.',
        messageLine2: 'Uw account is mogelijk niet zo veilig. Weet je zeker dat je door wilt gaan?',
        successMessage: 'Tweestapsverificatie via authenticator-applicatie is verwijderd.',
        title: 'Verwijder tweestapsverificatie',
      },
      successMessage:
        'Tweestapsverificatie is nu ingesteld. Bij het inloggen zal je een verificatiecode van je authenticator app moeten invoeren.',
      title: 'Voeg authenticator toe',
      verifySubtitle: 'Voer de verificatiecode in die je authenticator app heeft gegenereerd.',
      verifyTitle: 'Verificatiecode',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      changePasswordSuccessMessage: 'Your password has been updated.',
      changePasswordTitle: 'Change password',
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      sessionsSignedOutSuccessMessage: 'All other devices have been signed out.',
      successMessage: 'Je wachtwoord is ingesteld.',
      title: 'Stel wachtwoord in',
    },
    phoneNumberPage: {
      infoText: 'Een SMS met daarin een verificatiecode is verstuurd naar dit nummer.',
      removeResource: {
        messageLine1: '{{identifier}} zal van deze account verwijderd worden.',
        messageLine2: 'Je zal niet meer kunnen inloggen met dit telefoonnummer.',
        successMessage: '{{phoneNumber}} is verwijderd uit je account.',
        title: 'Verwijder telefoonnummer',
      },
      successMessage: '{{identifier}} is toegevoegd aan je account.',
      title: 'Telefoonnummer toevoegen',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Upload een JPG, PNG, GIF, of WEBP afbeelding kleiner dan 10 MB',
      imageFormDestructiveActionSubtitle: 'Verwijder afbeelding',
      imageFormSubtitle: 'Afbeelding uploaden',
      imageFormTitle: 'Profielfoto',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Je profiel is bijgewerkt.',
      title: 'Profiel bijwerken',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Log uit op apparaat',
        title: 'Actieve apparaten',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Probeer opnieuw',
        actionLabel__reauthorize: 'Authoriseer nu',
        destructiveActionTitle: 'Verwijderen',
        primaryButton: 'Verbind een account',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Aangesloten accounts',
      },
      dangerSection: {
        deleteAccountButton: 'Delete Account',
        title: 'Account termination',
      },
      emailAddressesSection: {
        destructiveAction: 'Verwijder e-mailadres',
        detailsAction__nonPrimary: 'Stel in als hoofd',
        detailsAction__primary: 'Rond verificatie af',
        detailsAction__unverified: 'Rond verificatie af',
        primaryButton: 'Voeg een e-mailadres toe',
        title: 'E-mailadressen',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Account',
      headerTitle__security: 'Beveiliging',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Hergenereer codes',
          headerTitle: 'Backupcodes',
          subtitle__regenerate: 'Genereer een nieuwe set backupcodes. De vorige kunnen niet meer gebruikt worden.',
          title__regenerate: 'Hergenereer backupcodes',
        },
        phoneCode: {
          actionLabel__setDefault: 'Stel in als standaard',
          destructiveActionLabel: 'Verwijder telefoonnummer',
        },
        primaryButton: 'Tweestapsverificatie instellen',
        title: 'Tweestapsverificatie',
        totp: {
          destructiveActionTitle: 'Verwijderen',
          headerTitle: 'Authenticatorapplicatie',
        },
      },
      passwordSection: {
        primaryButton__changePassword: 'Wachtwoord wijzigen',
        primaryButton__setPassword: 'Wachtwoord instellen',
        title: 'Wachtwoord',
      },
      phoneNumbersSection: {
        destructiveAction: 'Verwijder telefoonnummer',
        detailsAction__nonPrimary: 'Stel in als hoofd',
        detailsAction__primary: 'Rond verificatie af',
        detailsAction__unverified: 'Rond verificatie af',
        primaryButton: 'Voeg een telefoonnummer toe',
        title: 'Telefoonnummers',
      },
      profileSection: {
        primaryButton: 'Edit Profile',
        title: 'Profiel',
      },
      usernameSection: {
        primaryButton__changeUsername: 'Wijzig gebruikersnaam',
        primaryButton__setUsername: 'Stel gebruikersnaam in',
        title: 'Gebruikersnaam',
      },
      web3WalletsSection: {
        destructiveAction: 'Verwijder portefeuille',
        primaryButton: 'Web3 portefeuilles',
        title: 'Web3 portefeuilles',
      },
    },
    usernamePage: {
      successMessage: 'Je gebruikersnaam is bijgewerkt.',
      title: 'Gebruikersnaam bijwerken',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} zal verwijderd worden uit dit account.',
        messageLine2: 'Je zal niet meer kunnen inloggen met deze web3 portefeuille.',
        successMessage: '{{web3Wallet}} is verwijderd uit je account.',
        title: 'Verwijder web3 portefeuille',
      },
      subtitle__availableWallets: 'Selecteer een web3 portefeuille om toe te voegen.',
      subtitle__unavailableWallets: 'Er zijn geen beschikbare web3 portefeuilles.',
      successMessage: 'De portefeuille is toegevoegd aan dit account.',
      title: 'Web3 portefeuille toevoegen.',
    },
  },
} as const;
