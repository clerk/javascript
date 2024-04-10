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

export const svSE: LocalizationResource = {
  locale: 'sv-SE',
  __experimental_formFieldLabel__passkeyName: undefined,
  backButton: 'Tillbaka',
  badge__default: 'Standard',
  badge__otherImpersonatorDevice: 'Annans imitatörenhet',
  badge__primary: 'Primär',
  badge__requiresAction: 'Kräver åtgärd',
  badge__thisDevice: 'Den här enheten',
  badge__unverified: 'Overifierad',
  badge__userDevice: 'Användarens enhet',
  badge__you: 'Du',
  createOrganization: {
    formButtonSubmit: 'Skapa organisation',
    invitePage: {
      formButtonReset: 'Hoppa över',
    },
    title: 'Skapa organisation',
  },
  dates: {
    lastDay: "Igår klockan {{ date | timeString('sv-SE') }}",
    next6Days: "{{ date | weekday('sv-SE','long') }} klockan {{ date | timeString('sv-SE') }}",
    nextDay: "Imorgon klockan {{ date | timeString('sv-SE') }}",
    numeric: "{{ date | numeric('sv-SE') }}",
    previous6Days: "Senaste {{ date | weekday('sv-SE','long') }} klockan {{ date | timeString('sv-SE') }}",
    sameDay: "Idag klockan {{ date | timeString('sv-SE') }}",
  },
  dividerText: 'eller',
  footerActionLink__useAnotherMethod: 'Använd en annan metod',
  footerPageLink__help: 'Hjälp',
  footerPageLink__privacy: 'Integritet',
  footerPageLink__terms: 'Villkor',
  formButtonPrimary: 'Fortsätt',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Glömt lösenord?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Valfritt',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Ange eller klistra in en eller flera e-postadresser, separerade med mellanslag eller kommatecken',
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
  formFieldLabel__backupCode: 'Reserv-kod',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Bekräfta lösenord',
  formFieldLabel__currentPassword: 'Nuvarande lösenord',
  formFieldLabel__emailAddress: 'E-postadress',
  formFieldLabel__emailAddress_username: 'E-postadress eller användarnamn',
  formFieldLabel__emailAddresses: 'E-postadresser',
  formFieldLabel__firstName: 'Förnamn',
  formFieldLabel__lastName: 'Efternamn',
  formFieldLabel__newPassword: 'Nytt lösenord',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Organisationsnamn',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Lösenord',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__role: 'Roll',
  formFieldLabel__signOutOfOtherSessions: 'Logga ut från alla andra enheter',
  formFieldLabel__username: 'Användarnamn',
  impersonationFab: {
    action__signOut: 'Logga ut',
    title: 'Inloggad som {{identifier}}',
  },
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Medlem',
  membershipRole__guestMember: 'Gäst',
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
      detailsTitle__inviteFailed: 'Inbjudningarna kunde inte skickas. Åtgärda följande och försök igen:',
      formButtonPrimary__continue: 'Skicka inbjudningar',
      selectDropdown__role: 'Select role',
      subtitle: 'Bjud in nya medlemmar till denna organisation',
      successMessage: 'Inbjudningar skickade',
      title: 'Bjud in medlemmar',
    },
    membersPage: {
      action__invite: 'Bjud in',
      activeMembersTab: {
        menuAction__remove: 'Ta bort medlem',
        tableHeader__actions: '',
        tableHeader__joined: 'Gick med',
        tableHeader__role: 'Roll',
        tableHeader__user: 'Användare',
      },
      detailsTitle__emptyRow: 'Inga medlemmar att visa',
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
        menuAction__revoke: 'Återkalla inbjudan',
        tableHeader__invited: 'Inbjudna',
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
            'Är du säker på att du vill lämna denna organisation? Du kommer att förlora åtkomst till organisationen och dess applikationer.',
          messageLine2: 'Denna åtgärd är permanent och oåterkallelig.',
          successMessage: 'Du har lämnat organisationen.',
          title: 'Lämna organisation',
        },
        title: 'Farligt',
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
      successMessage: 'Organisationen har uppdaterats.',
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
      headerTitle__members: 'Medlemmar',
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
    action__createOrganization: 'Skapa organisation',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Hantera organisation',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Ingen organisation vald',
    personalWorkspace: 'Personligt Arbetsområde',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Nästa',
  paginationButton__previous: 'Föregående',
  paginationRowText__displaying: 'Visar',
  paginationRowText__of: 'av',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Få hjälp',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Använd en reservkod',
      blockButton__emailCode: 'Skicka kod till {{identifier}}',
      blockButton__emailLink: 'Skicka länk till {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Logga in med ditt lösenord',
      blockButton__phoneCode: 'Skicka kod till {{identifier}}',
      blockButton__totp: 'Använd din autentiseringsapp',
      getHelp: {
        blockButton__emailSupport: 'E-post support',
        content:
          'Om du har problem med att logga in på ditt konto, kontakta oss via e-post så hjälper vi dig att återställa åtkomsten så snabbt som möjligt.',
        title: 'Få hjälp',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Använd en annan metod',
    },
    backupCodeMfa: {
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Ange en reservkod',
    },
    emailCode: {
      formTitle: 'Verifieringskod',
      resendButton: 'Skicka koden igen',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Kontrollera din e-post',
    },
    emailLink: {
      expired: {
        subtitle: 'Återgå till ursprungliga fliken för att fortsätta.',
        title: 'Denna verifieringslänk har upphört att gälla',
      },
      failed: {
        subtitle: 'Återgå till ursprungliga fliken för att fortsätta.',
        title: 'Denna verifieringslänk är ogiltig',
      },
      formSubtitle: 'Använd verifieringslänken som skickades till din e-postadress',
      formTitle: 'Verifieringslänk',
      loading: {
        subtitle: 'Du kommer att omdirigeras snart',
        title: 'Loggar in...',
      },
      resendButton: 'Skicka länken igen',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Kontrollera din e-post',
      unusedTab: {
        title: 'Du kan stänga den här fliken',
      },
      verified: {
        subtitle: 'Du kommer att omdirigeras snart',
        title: 'Inloggningen lyckades',
      },
      verifiedSwitchTab: {
        subtitle: 'Återgå till ursprungliga fliken för att fortsätta',
        subtitleNewTab: 'Återgå till den nyligen öppnade fliken för att fortsätta',
        titleNewTab: 'Loggade in på annan flik',
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
      message: 'Kan inte fortsätta med inloggning. Det finns ingen tillgänglig autentiseringsfaktor.',
      subtitle: 'Ett fel inträffade',
      title: 'Kan inte logga in',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Använd en annan metod',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Ange ditt lösenord',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Verifieringskod',
      resendButton: 'Skicka koden igen',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Kolla din telefon',
    },
    phoneCodeMfa: {
      formTitle: 'Verifieringskod',
      resendButton: 'Skicka koden igen',
      subtitle: '',
      title: 'Kolla din telefon',
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
      actionLink: 'Skapa konto',
      actionLink__use_email: 'Use email',
      actionLink__use_email_username: 'Use email or username',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Use phone',
      actionLink__use_username: 'Use username',
      actionText: 'Har du inget konto?',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Logga in',
    },
    totpMfa: {
      formTitle: 'Verifieringskod',
      subtitle: '',
      title: 'Tvåstegsverifiering',
    },
  },
  signInEnterPasswordTitle: 'Ange ditt lösenord',
  signUp: {
    continue: {
      actionLink: 'Logga in',
      actionText: 'Har du redan ett konto?',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Fyll i nödvändiga fält',
    },
    emailCode: {
      formSubtitle: 'Ange verifieringskoden som skickades till din e-postadress',
      formTitle: 'Verifieringskod',
      resendButton: 'Skicka koden igen',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Verifiera din e-post',
    },
    emailLink: {
      formSubtitle: 'Använd verifieringslänken som skickades till din e-postadress',
      formTitle: 'Verifieringslänk',
      loading: {
        title: 'Registrerar...',
      },
      resendButton: 'Skicka länken igen',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Verifiera din e-post',
      verified: {
        title: 'Registreringen lyckades',
      },
      verifiedSwitchTab: {
        subtitle: 'Återgå till den nyligen öppnade fliken för att fortsätta',
        subtitleNewTab: 'Återgå till föregående flik för att fortsätta',
        title: 'E-posten har verifierats',
      },
    },
    phoneCode: {
      formSubtitle: 'Ange verifieringskoden som skickades till ditt telefonnummer',
      formTitle: 'Verifieringskod',
      resendButton: 'Skicka koden igen',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Verifiera din telefon',
    },
    start: {
      actionLink: 'Logga in',
      actionText: 'Har du redan ett konto?',
      subtitle: 'för att fortsätta till {{applicationName}}',
      title: 'Skapa ditt konto',
    },
  },
  socialButtonsBlockButton: 'Fortsätt med {{provider|titleize}}',
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
    action__addAccount: 'Lägg till konto',
    action__manageAccount: 'Hantera konto',
    action__signOut: 'Logga ut',
    action__signOutAll: 'Logga ut från alla konton',
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
      actionLabel__copied: 'Kopierat!',
      actionLabel__copy: 'Kopiera alla',
      actionLabel__download: 'Ladda ner .txt',
      actionLabel__print: 'Skriv ut',
      infoText1: 'Backupkoder kommer att aktiveras för detta konto.',
      infoText2:
        'Håll backupkoderna hemliga och förvara dem säkert. Du kan generera nya backupkoder om du misstänker att de har komprometterats.',
      subtitle__codelist: 'Förvara dem säkert och håll dem hemliga.',
      successMessage:
        'Backupkoder är nu aktiverade. Du kan använda en av dessa för att logga in på ditt konto om du förlorar åtkomsten till din autentiseringsenhet. Varje kod kan endast användas en gång.',
      successSubtitle:
        'Du kan använda en av dessa för att logga in på ditt konto om du förlorar åtkomsten till din autentiseringsenhet.',
      title: 'Lägg till backupkodverifiering',
      title__codelist: 'Backupkoder',
    },
    connectedAccountPage: {
      formHint: 'Välj en leverantör för att ansluta ditt konto.',
      formHint__noAccounts: 'Det finns inga tillgängliga externa kontoleverantörer.',
      removeResource: {
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2:
          'Du kommer inte längre att kunna använda detta anslutna konto och alla beroende funktioner kommer att sluta fungera.',
        successMessage: '{{connectedAccount}} har tagits bort från ditt konto.',
        title: 'Ta bort anslutet konto',
      },
      socialButtonsBlockButton: 'Anslut {{provider|titleize}} konto',
      successMessage: 'Leverantören har lagts till i ditt konto.',
      title: 'Lägg till anslutet konto',
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
        formHint: 'Ett e-postmeddelande med en verifieringskod kommer att skickas till denna e-postadress.',
        formSubtitle: 'Ange verifieringskoden som skickats till {{identifier}}',
        formTitle: 'Verifieringskod',
        resendButton: 'Skicka kod igen',
        successMessage: 'E-postadressen {{identifier}} har lagts till i ditt konto.',
      },
      emailLink: {
        formHint: 'Ett e-postmeddelande med en verifieringslänk kommer att skickas till denna e-postadress.',
        formSubtitle: 'Klicka på verifieringslänken i e-postmeddelandet som skickats till {{identifier}}',
        formTitle: 'Verifieringslänk',
        resendButton: 'Skicka länken igen',
        successMessage: 'E-postadressen {{identifier}} har lagts till i ditt konto.',
      },
      removeResource: {
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2: 'Du kommer inte längre att kunna logga in med denna e-postadress.',
        successMessage: '{{emailAddress}} har tagits bort från ditt konto.',
        title: 'Ta bort e-postadress',
      },
      title: 'Lägg till e-postadress',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Fortsätt',
    formButtonPrimary__finish: 'Slutför',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Avbryt',
    mfaPage: {
      formHint: 'Välj en metod att lägga till.',
      title: 'Lägg till tvåstegsverifiering',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Lägg till ett telefonnummer',
      removeResource: {
        messageLine1: '{{identifier}} kommer inte längre att ta emot verifieringskoder vid inloggning.',
        messageLine2: 'Ditt konto kan vara mindre säkert. Är du säker på att du vill fortsätta?',
        successMessage: 'SMS-kod tvåstegsverifiering har tagits bort för {{mfaPhoneCode}}',
        title: 'Ta bort tvåstegsverifiering',
      },
      subtitle__availablePhoneNumbers: 'Välj ett telefonnummer att registrera för SMS-kod tvåstegsverifiering.',
      subtitle__unavailablePhoneNumbers:
        'Det finns inga tillgängliga telefonnummer att registrera för SMS-kod tvåstegsverifiering.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Lägg till SMS-kodverifiering',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Skanna QR-kod istället',
        buttonUnableToScan__nonPrimary: 'Kan inte skanna QR-kod?',
        infoText__ableToScan:
          'Konfigurera en ny inloggningsmetod i din autentiseringsapp och skanna följande QR-kod för att länka den till ditt konto.',
        infoText__unableToScan: 'Konfigurera en ny inloggningsmetod i din autentiseringsapp och ange nyckeln nedan.',
        inputLabel__unableToScan1:
          'Se till att tidsbaserade eller engångslösenord är aktiverade och slutför sedan länkningen till ditt konto.',
        inputLabel__unableToScan2:
          'Alternativt, om din autentiseringsapp stödjer TOTP URI kan du också kopiera hela URI.',
      },
      removeResource: {
        messageLine1: 'Verifieringskoder från denna autentiseringsapp kommer inte längre att krävas vid inloggning.',
        messageLine2: 'Ditt konto kan vara mindre säkert. Är du säker på att du vill fortsätta?',
        successMessage: 'Tvåstegsverifiering via autentiseringsapp har tagits bort.',
        title: 'Ta bort tvåstegsverifiering',
      },
      successMessage:
        'Tvåstegsverifiering är nu aktiverat. Vid inloggning behöver du ange en verifieringskod från denna autentiseringsapp som ett extra steg.',
      title: 'Lägg till autentiseringsapp',
      verifySubtitle: 'Ange verifieringskoden genererad av din autentiseringsapp',
      verifyTitle: 'Verifieringskod',
    },
    mobileButton__menu: 'Meny',
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
      successMessage__set: 'Ditt lösenord har angetts.',
      successMessage__signOutOfOtherSessions: 'Alla andra enheter har loggats ut.',
      successMessage__update: 'Ditt lösenord har uppdaterats.',
      title__set: 'Ange lösenord',
      title__update: 'Byt lösenord',
    },
    phoneNumberPage: {
      infoText: 'Ett textmeddelande med en verifieringslänk kommer att skickas till detta telefonnummer.',
      removeResource: {
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2: 'Du kommer inte längre att kunna logga in med detta telefonnummer.',
        successMessage: '{{phoneNumber}} har tagits bort från ditt konto.',
        title: 'Ta bort telefonnummer',
      },
      successMessage: '{{identifier}} har lagts till i ditt konto.',
      title: 'Lägg till telefonnummer',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Ladda upp en JPG, PNG, GIF, eller WEBP bild som är mindre än 10 MB',
      imageFormDestructiveActionSubtitle: 'Ta bort bild',
      imageFormSubtitle: 'Ladda upp bild',
      imageFormTitle: 'Profilbild',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Din profil har uppdaterats.',
      title: 'Uppdatera profil',
    },
    start: {
      __experimental_passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      activeDevicesSection: {
        destructiveAction: 'Logga ut från enhet',
        title: 'Aktiva enheter',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Försök igen',
        actionLabel__reauthorize: 'Autorisera nu',
        destructiveActionTitle: 'Ta bort',
        primaryButton: 'Anslut konto',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Anslutna konton',
      },
      dangerSection: {
        deleteAccountButton: 'Delete Account',
        title: 'Account termination',
      },
      emailAddressesSection: {
        destructiveAction: 'Ta bort e-postadress',
        detailsAction__nonPrimary: 'Sätt som primär',
        detailsAction__primary: 'Fullborda verifiering',
        detailsAction__unverified: 'Fullborda verifiering',
        primaryButton: 'Lägg till en e-postadress',
        title: 'E-postadresser',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Konto',
      headerTitle__security: 'Säkerhet',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Återgenerera koder',
          headerTitle: 'Säkerhetskopieringskoder',
          subtitle__regenerate:
            'Få en ny uppsättning säkra säkerhetskopieringskoder. Tidigare koder kommer att raderas och kan inte användas.',
          title__regenerate: 'Återgenerera säkerhetskopieringskoder',
        },
        phoneCode: {
          actionLabel__setDefault: 'Ange som standard',
          destructiveActionLabel: 'Ta bort telefonnummer',
        },
        primaryButton: 'Lägg till tvåstegsverifiering',
        title: 'Tvåstegsverifiering',
        totp: {
          destructiveActionTitle: 'Ta bort',
          headerTitle: 'Autentiseringsapp',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Ställ in lösenord',
        primaryButton__updatePassword: 'Byt lösenord',
        title: 'Lösenord',
      },
      phoneNumbersSection: {
        destructiveAction: 'Ta bort telefonnummer',
        detailsAction__nonPrimary: 'Sätt som primär',
        detailsAction__primary: 'Fullborda verifiering',
        detailsAction__unverified: 'Fullborda verifiering',
        primaryButton: 'Lägg till ett telefonnummer',
        title: 'Telefonnummer',
      },
      profileSection: {
        primaryButton: '',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Sätt användarnamn',
        primaryButton__updateUsername: 'Ändra användarnamn',
        title: 'Användarnamn',
      },
      web3WalletsSection: {
        destructiveAction: 'Ta bort plånbok',
        primaryButton: 'Web3 plånböcker',
        title: 'Web3 plånböcker',
      },
    },
    usernamePage: {
      successMessage: 'Ditt användarnamn har uppdaterats.',
      title__set: 'Uppdatera användarnamn',
      title__update: 'Uppdatera användarnamn',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2: 'Du kommer inte längre att kunna logga in med denna web3-plånbok.',
        successMessage: '{{web3Wallet}} har tagits bort från ditt konto.',
        title: 'Ta bort web3-plånbok',
      },
      subtitle__availableWallets: 'Välj en web3-plånbok att ansluta till ditt konto.',
      subtitle__unavailableWallets: 'Det finns inga tillgängliga web3-plånböcker.',
      successMessage: 'Plånboken har lagts till i ditt konto.',
      title: 'Lägg till web3-plånbok',
    },
  },
} as const;
