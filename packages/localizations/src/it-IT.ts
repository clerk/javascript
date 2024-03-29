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

export const itIT: LocalizationResource = {
  locale: 'it-IT',
  __experimental_formFieldLabel__passkeyName: undefined,
  backButton: 'Indietro',
  badge__default: 'Predefinito',
  badge__otherImpersonatorDevice: 'Altro dispositivo impersonato',
  badge__primary: 'Primario',
  badge__requiresAction: 'Richiede azione',
  badge__thisDevice: 'Questo dispositivo',
  badge__unverified: 'Non verificato',
  badge__userDevice: 'Dispositivo utente',
  badge__you: 'Tu',
  createOrganization: {
    formButtonSubmit: 'Crea organizzazione',
    invitePage: {
      formButtonReset: 'Salta',
    },
    title: 'Crea organizzazione',
  },
  dates: {
    lastDay: "Ieri alle {{ date | timeString('it-IT') }}",
    next6Days: "{{ date | weekday('it-IT','long') }} alle {{ date | timeString('it-IT') }}",
    nextDay: "Domani alle {{ date | timeString('it-IT') }}",
    numeric: "{{ date | numeric('it-IT') }}",
    previous6Days: "{{ date | weekday('it-IT','long') }} alle {{ date | timeString('it-IT') }}",
    sameDay: "Oggi alle {{ date | timeString('it-IT') }}",
  },
  dividerText: 'oppure',
  footerActionLink__useAnotherMethod: 'Utilizzo un altro metodo',
  footerPageLink__help: 'Aiuto',
  footerPageLink__privacy: 'Privacy',
  footerPageLink__terms: 'Termini',
  formButtonPrimary: 'Continua',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Password dimenticata?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Opzionale',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Inserisci o incolla uno o piú indirizzi email, separati da spazi o virgole',
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
  formFieldLabel__backupCode: 'Codice di backup',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Conferma password',
  formFieldLabel__currentPassword: 'Password corrente',
  formFieldLabel__emailAddress: 'Indirizzo email',
  formFieldLabel__emailAddress_username: 'Indirizzo email o nome utente',
  formFieldLabel__emailAddresses: 'Indirizzi email',
  formFieldLabel__firstName: 'Nome',
  formFieldLabel__lastName: 'Cognome',
  formFieldLabel__newPassword: 'Nuova password',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Nome organizzazione',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__password: 'Password',
  formFieldLabel__phoneNumber: 'Numero di telefono',
  formFieldLabel__role: 'Ruolo',
  formFieldLabel__signOutOfOtherSessions: 'Disconnetti tutti gli altri dispositivi',
  formFieldLabel__username: 'Nome utente',
  impersonationFab: {
    action__signOut: 'Disconnetti',
    title: 'Accesso tramite {{identifier}}',
  },
  membershipRole__admin: 'Amministratore',
  membershipRole__basicMember: 'Utente',
  membershipRole__guestMember: 'Ospite',
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
      detailsTitle__inviteFailed: "L'invito non puó essere inviato. Correggi i seguenti e riprova:",
      formButtonPrimary__continue: 'Invia inviti',
      selectDropdown__role: 'Select role',
      subtitle: 'Invita un nuovo membro in questa organizzazione',
      successMessage: 'Invito inviato con successo',
      title: 'Invita membri',
    },
    membersPage: {
      action__invite: 'Invita',
      activeMembersTab: {
        menuAction__remove: 'Rimuovi membro',
        tableHeader__actions: '',
        tableHeader__joined: 'Iscritto',
        tableHeader__role: 'Ruolo',
        tableHeader__user: 'Utente',
      },
      detailsTitle__emptyRow: 'Nessun membro da visualizzare',
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
        menuAction__revoke: 'Revoca invito',
        tableHeader__invited: 'Invitato',
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
            'Sei sicuro di voler lasciare questa organizzazione? Perderai accesso a questa organizzazione e le sue applicazioni.',
          messageLine2: 'Questa azione é permanente ed irreversibile.',
          successMessage: "Hai lasciato l'organizzazione.",
          title: 'Lascia organizzazione',
        },
        title: 'Pericolo',
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
      successMessage: "L'organizzazione é stata aggiornata.",
      title: "Profilo dell'organizzazione",
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membri',
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
    action__createOrganization: 'Crea Organizzazione',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Gestisci Organizzazione',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Nessuna organizzazione selezionata',
    personalWorkspace: 'Spazio di lavoro personale',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Prossimo',
  paginationButton__previous: 'Precedente',
  paginationRowText__displaying: 'Visualizzando',
  paginationRowText__of: 'di',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Richiedi aiuto',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Usa in codice di backup',
      blockButton__emailCode: 'Invia codice a {{identifier}}',
      blockButton__emailLink: 'Invia link a {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Accedi con la tua password',
      blockButton__phoneCode: 'Invia codice a {{identifier}}',
      blockButton__totp: 'Usa la tua app di autenticazione',
      getHelp: {
        blockButton__emailSupport: 'Supporto email',
        content:
          'Se stai incontrando delle difficoltá ad accedere al tuo account, inviaci una email e ti aiuteremo a ripristinare il tuo account il prima possibile.',
        title: 'Richiedi aiuto',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Usa un altro metodo',
    },
    backupCodeMfa: {
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Inserisci un codice di backup',
    },
    emailCode: {
      formTitle: 'Codice di verifica',
      resendButton: 'Rinvia codice',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Controlla la tua email',
    },
    emailLink: {
      expired: {
        subtitle: 'Ritorna alla scheda originaria per continuare',
        title: 'This verification link has expired',
      },
      failed: {
        subtitle: 'Ritorna alla scheda originaria per continuare',
        title: 'Quest link di verifica non é valido',
      },
      formSubtitle: 'Usa il link di verifica inviato al tuo indirizzo email',
      formTitle: 'Link di verifica',
      loading: {
        subtitle: 'Verrai presto rediretto',
        title: 'Accesso in corso...',
      },
      resendButton: 'Rinvia link',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Controlla la tua email',
      unusedTab: {
        title: 'Puoi chiudere questa scheda',
      },
      verified: {
        subtitle: 'Verrai presto rediretto',
        title: 'Accesso avvenuto con successo',
      },
      verifiedSwitchTab: {
        subtitle: 'Ritorna alla scheda originaria per continuare',
        subtitleNewTab: 'Ritorna sulla nuova scheda aperta per continuare',
        titleNewTab: "Accedi da un'altra scheda",
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
      message: "Impossibile procedere con l'accesso. Non ci sono strumenti di autenticazione disponibili.",
      subtitle: 'Si é verificato un errore',
      title: 'Impossibile accedere',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Usa un altro metodo',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Inserisci la tua password',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Codice di verifica',
      resendButton: 'Rinvia il codice',
      subtitle: 'per accedera a {{applicationName}}',
      title: 'Controlla il tuo telefono',
    },
    phoneCodeMfa: {
      formTitle: 'Codice di verifica',
      resendButton: 'Rinvia il codice',
      subtitle: '',
      title: 'Controlla il tuo telefono',
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
      actionLink: 'Registrati',
      actionLink__use_email: 'Use email',
      actionLink__use_email_username: 'Use email or username',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Use phone',
      actionLink__use_username: 'Use username',
      actionText: 'Non hai un account?',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Accedi',
    },
    totpMfa: {
      formTitle: 'Codice di verifica',
      subtitle: '',
      title: 'Verifica in due passaggi',
    },
  },
  signInEnterPasswordTitle: 'Inserisci la tua password',
  signUp: {
    continue: {
      actionLink: 'Accedi',
      actionText: 'Hai un account?',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Compila i campi mancanti',
    },
    emailCode: {
      formSubtitle: 'Inserisci il codice di verifica inviato alla tua email',
      formTitle: 'Codice di verifica',
      resendButton: 'Rinvia codice',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Verifica la tua email',
    },
    emailLink: {
      formSubtitle: 'Usa il link di verifica inviato al tuo indirizzo email',
      formTitle: 'Link di verifica',
      loading: {
        title: 'Registrando...',
      },
      resendButton: 'Rinvia link',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Verifica la tua email',
      verified: {
        title: 'Registrato con successo',
      },
      verifiedSwitchTab: {
        subtitle: 'Ritorna alla nuova tab aperta per continuare',
        subtitleNewTab: 'Ritorna alla tab precedente per continuare',
        title: 'Email verificata con successo',
      },
    },
    phoneCode: {
      formSubtitle: 'Inserisci il codice di verifica inviato al tuo numero di telefono',
      formTitle: 'Codice di verifica',
      resendButton: 'Rinvia codice',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Verifica il tuo numero di telefono',
    },
    start: {
      actionLink: 'Accedi',
      actionText: 'Hai giá un account?',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Crea il tuo account',
    },
  },
  socialButtonsBlockButton: 'Continua con {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_exists__email_address: undefined,
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
      notEnough: 'La tua password non è abbastanza forte.',
      suggestions: {
        allUppercase: 'Scrivi alcune lettere in maiuscolo, ma non tutte.',
        anotherWord: 'Aggiungi un maggior numero di parole meno comuni.',
        associatedYears: 'Evita gli anni associati alla tua persona.',
        capitalization: "Scrivi la prima lettera e almeno un'altra in maiuscolo.",
        dates: 'Evita le date e gli anni associati alla tua persona.',
        l33t: 'Evita prevedibili sostituzioni di lettere come "@" per "a".',
        longerKeyboardPattern: 'Usa combinazioni di tasti più lunghe e cambia più volte la direzione di digitazione.',
        noNeed: 'Puoi creare password complesse senza utilizzare simboli, numeri o lettere maiuscole.',
        pwned: 'Se usi questa password altrove, dovresti cambiarla.',
        recentYears: 'Evita gli anni recenti.',
        repeated: 'Evita la ripetizione di parole e caratteri.',
        reverseWords: 'Evita di scrivere parole di uso comune al contrario.',
        sequences: 'Evita le sequenze di caratteri comuni.',
        useWords: 'Usa più parole, ma evita frasi comuni.',
      },
      warnings: {
        common: 'Questa è una password di uso comune.',
        commonNames: 'I nomi e cognomi comuni sono facili da indovinare.',
        dates: 'Le date sono facili da indovinare.',
        extendedRepeat: 'Le combinazioni di caratteri ripetuti come "abcabcabc" sono facili da indovinare.',
        keyPattern: 'Le brevi combinazioni di tasti sono facili da indovinare.',
        namesByThemselves: 'I singoli nomi o cognomi sono facili da indovinare.',
        pwned: 'La tua password è stata esposta da una violazione dei dati su Internet.',
        recentYears: 'Gli anni recenti sono facili da indovinare.',
        sequences: 'Le sequenze di caratteri comuni come "abc" sono facili da indovinare.',
        similarToCommon: 'Questa assomiglia a una password di uso comune.',
        simpleRepeat: 'I caratteri ripetuti come "aaa" sono facili da indovinare.',
        straightRow: 'Le sequenze lineari dei tasti sulla tastiera sono facili da indovinare.',
        topHundred: 'Questa è una password usata spesso.',
        topTen: 'Questa è una password molto usata.',
        userInputs: 'Non devono essere presenti dati personali o relativi alla pagina.',
        wordByItself: 'Le singole parole sono facili da indovinare.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Aggiungi account',
    action__manageAccount: 'Gestisci account',
    action__signOut: 'Disconnetti',
    action__signOutAll: 'Disconnetti da tutti gli accounts',
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
      actionLabel__copied: 'Copiati!',
      actionLabel__copy: 'Copia tutti',
      actionLabel__download: 'Scarica .txt',
      actionLabel__print: 'Stampa',
      infoText1: 'I codici di backup saranno abilitati per questo account.',
      infoText2:
        'Tieni segreti i codici di backup e salvali in maniera sicura. Potrai generare altri codici di backup se pensi che possano essere compromessi.',
      subtitle__codelist: 'Salvali in maniera sicura e tienili segreti.',
      successMessage:
        'I codici di backup sono ora abilitati. Puoi ora utilizzare questi codici di backup per accedere al tuo account, nel caso di perdita del proprio strumento di autenticazione. Ogni codice potrá essere utilizzato una sola volta.',
      successSubtitle:
        'Puoi ora utilizzare questi codici di backup per accedere al tuo account, nel caso di perdita del proprio strumento di autenticazione.',
      title: 'Aggiungi verifica codici backup',
      title__codelist: 'Codici di backup',
    },
    connectedAccountPage: {
      formHint: 'Seleziona un provider per collegare il tuo account.',
      formHint__noAccounts: 'Non ci sono provider esterni disponibili.',
      removeResource: {
        messageLine1: '{{identifier}} sará rimosso dal tuo account.',
        messageLine2:
          'Non sarai piú in grado di accedere utilizzando questo account e le funzionalitá collegate smetteranno di funzionare.',
        successMessage: '{{connectedAccount}} é stato rimosso dal tuo account.',
        title: 'Rimuovi account collegato',
      },
      socialButtonsBlockButton: 'Collega {{provider|titleize}} account',
      successMessage: 'Il provider é stato aggiunto al tuo account',
      title: 'Aggiungi account collegato',
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
        formHint: 'Una email contenente un codice di verifica é stata inviata a questo indirizzo email.',
        formSubtitle: 'Inserisci il codice di verifica inviato a {{identifier}}',
        formTitle: 'Codice di verifica',
        resendButton: 'Rinvia codice',
        successMessage: "L'indirizzo email {{identifier}} é stato aggiunto al tuo account.",
      },
      emailLink: {
        formHint: 'Una email contenente un link di verifica sará inviata a questo indirizzo email.',
        formSubtitle: 'Clicca sul link di verifica nella email inviata a {{identifier}}',
        formTitle: 'Link di verifica',
        resendButton: 'Rinvia link',
        successMessage: "L'indirizzo email {{identifier}} é stato aggiunto al tuo account.",
      },
      removeResource: {
        messageLine1: '{{identifier}} sará rimosso dal tuo account.',
        messageLine2: 'Non sarai piú in grado di accedere utilizzando questo indirizzo email.',
        successMessage: '{{emailAddress}} é stato rimosso dal tuo account.',
        title: 'Rimuovi indirizzo email',
      },
      title: 'Aggiungi un indirizzo email',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Continua',
    formButtonPrimary__finish: 'Concludi',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Cancella',
    mfaPage: {
      formHint: 'Seleziona un metodo da aggiungere.',
      title: 'Aggiungi verifica in 2 passaggi',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Aggiungi un numero di telefono',
      removeResource: {
        messageLine1: "{{identifier}} non riceverá piú i codici di verifica all'accesso.",
        messageLine2: 'Il tuo account potrebbe essere non sicuro. Sei sicuro di voler continuare?',
        successMessage: 'La verifica in 2 passaggi tramite SMS é stata rimossa per {{mfaPhoneCode}}',
        title: 'Rimuovi verifica in 2 passsaggi',
      },
      subtitle__availablePhoneNumbers:
        'Seleziona un numero di telefono da registrare per la verifica in 2 passaggi tramite SMS.',
      subtitle__unavailablePhoneNumbers:
        'Non ci sono numeri di telefono da registrare per la verifica in 2 passaggi tramite SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Aggiungi verifica tramite SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scansiona il codice QR',
        buttonUnableToScan__nonPrimary: 'Non é possibile scansionare il codice QR?',
        infoText__ableToScan:
          'Aggiungi un nuovo metodo di accesso nella tua app di autenticazione e scansione il seguente codice QR per associarla a questo account.',
        infoText__unableToScan:
          'Aggiungi un nuovo metodo di accesso nella tua app di autenticazione ed aggiungi la chiave di sicurezza generata sotto.',
        inputLabel__unableToScan1:
          'Assicurarsi che le password Time-based oppure One-time siano abilitate, poi continua il collegamento al tuo account.',
        inputLabel__unableToScan2:
          "Alternativamente, se il tuo autenticatore supporta TOTP URIs, puoi anche copiare l'intera URI.",
      },
      removeResource: {
        messageLine1: "I codici di verifica di questo autenticatore non saranno piú richiesti all'accesso.",
        messageLine2: 'Il tuo account potrebbe essere non sicuro. Sei sicuro di voler continuare?',
        successMessage: 'La verifica in 2 passaggi tramite autenticatore é stata rimossa.',
        title: 'Rimuovi verifica in 2 passaggi',
      },
      successMessage:
        "Verifica in 2 passaggi attivata. All'accesso sará richiesto di inserire un codice di verifica generato dall'app di autenticazione come ulteriore passaggio.",
      title: 'Aggiungi app di autenticazione',
      verifySubtitle: 'Inserisci il codice di verifica generato dalla tua app di autenticazione',
      verifyTitle: 'Codice di verifica',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      successMessage__set: 'La tua password é stata impostata.',
      successMessage__signOutOfOtherSessions: 'Tutti gli altri dispositivi sono stati disconnessi.',
      successMessage__update: 'La tua password è stata aggiornata.',
      title__set: 'Imposta password',
      title__update: 'Cambia password',
    },
    phoneNumberPage: {
      infoText: 'Un SMS contenente un link di verifica é stato inviato a questo numero di telefono.',
      removeResource: {
        messageLine1: '{{identifier}} sará rimosso dal tuo account.',
        messageLine2: 'Non sarai piú in grado di accedere utilizzando questo numero di telefono.',
        successMessage: '{{phoneNumber}} é stato rimosso dal tuo account.',
        title: 'Rimuovi numero di telefono',
      },
      successMessage: '{{identifier}} é stato aggiunto al tuo account.',
      title: 'Aggiungi numero di telefono',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Carica una immagine piú piccola di 10MB di tipo JPG, PNG, GIF, oppure WEBP',
      imageFormDestructiveActionSubtitle: 'Rimuovi immagine',
      imageFormSubtitle: 'Carica immagine',
      imageFormTitle: 'Immagine di profilo',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Il tuo profile é stato aggiornato.',
      title: 'Aggiorna profilo',
    },
    start: {
      __experimental_passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      activeDevicesSection: {
        destructiveAction: 'Disconnetti dal dispositivo',
        title: 'Dispositivi attivi',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Riprova',
        actionLabel__reauthorize: 'Authorize now',
        destructiveActionTitle: 'Rimuovi',
        primaryButton: 'Collega account',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Account collegati',
      },
      dangerSection: {
        deleteAccountButton: 'Delete Account',
        title: 'Account termination',
      },
      emailAddressesSection: {
        destructiveAction: 'Rimuovi indirizzo email',
        detailsAction__nonPrimary: 'Imposta come principale',
        detailsAction__primary: 'Completa la verifica',
        detailsAction__unverified: 'Completa la verifica',
        primaryButton: 'Aggiungi un indirizzo email',
        title: 'Indirizzi email',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Account',
      headerTitle__security: 'Sicurezza',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Rigenera codici',
          headerTitle: 'Codice di backup',
          subtitle__regenerate:
            'Ottieni una nuova lista di codici di sicurezza di backup. I codici di sicurezza di backup precedentemente generati saranno eliminati e non saranno utilizzabili.',
          title__regenerate: 'Rigenera codici di backup',
        },
        phoneCode: {
          actionLabel__setDefault: 'Imposta come predefinito',
          destructiveActionLabel: 'Rimuovi numero di telefono',
        },
        primaryButton: 'Aggiungi verifica in 2 passaggi',
        title: 'Verifica in 2 passaggi',
        totp: {
          destructiveActionTitle: 'Rimuovi',
          headerTitle: 'Applicazione di autenticazione',
        },
      },
      passwordSection: {
        primaryButton__setPassword: 'Imposta password',
        primaryButton__updatePassword: 'Cambia password',
        title: 'Password',
      },
      phoneNumbersSection: {
        destructiveAction: 'Rimuovi numero di telefono',
        detailsAction__nonPrimary: 'Imposta come principale',
        detailsAction__primary: 'Completa la verifica',
        detailsAction__unverified: 'Completa la verifica',
        primaryButton: 'Aggiungi un numero di telefono',
        title: 'Numeri di telefono',
      },
      profileSection: {
        primaryButton: '',
        title: 'Profilo',
      },
      usernameSection: {
        primaryButton__setUsername: 'Imposta username',
        primaryButton__updateUsername: 'Cambia username',
        title: 'Username',
      },
      web3WalletsSection: {
        destructiveAction: 'Rimuovi wallet',
        primaryButton: 'Web3 wallets',
        title: 'Web3 wallets',
      },
    },
    usernamePage: {
      successMessage: 'Il tuo username é stato aggiornato.',
      title__set: 'Aggiorna username',
      title__update: 'Aggiorna username',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} sará rimosso dal tuo account.',
        messageLine2: 'Non sarai piú in grado di accedere utilizzando questo web3 wallet.',
        successMessage: '{{web3Wallet}} é stato rimosso dal tuo account.',
        title: 'Rimuovi web3 wallet',
      },
      subtitle__availableWallets: 'Seleziona un web3 wallet da collegare al tuo account.',
      subtitle__unavailableWallets: 'Non ci sono web3 wallets disponibili.',
      successMessage: 'Il wallet é stato aggiunto al tuo account.',
      title: 'Aggiungi web3 wallet',
    },
  },
} as const;
