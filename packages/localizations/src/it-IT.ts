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
  formButtonPrimary__verify: 'Verifica',
  formFieldAction__forgotPassword: 'Password dimenticata?',
  formFieldError__matchingPasswords: 'Le password coincidono.',
  formFieldError__notMatchingPasswords: 'Le password non coincidono.',
  formFieldError__verificationLinkExpired: 'Il link di verifica è scaduto. Per favore richiedi un nuovo link.',
  formFieldHintText__optional: 'Opzionale',
  formFieldHintText__slug:
    'Uno slug è un identificativo leggibile dall’uomo che deve essere univoco. Spesso viene usato negli URL.',
  formFieldInputPlaceholder__backupCode: 'Inserisci il codice di backup',
  formFieldInputPlaceholder__emailAddress: "Inserisci l'indirizzo email",
  formFieldInputPlaceholder__emailAddress_username: "Inserisci l'indirizzo email o il nome utente",
  formFieldInputPlaceholder__firstName: 'Inserisci il tuo nome',
  formFieldInputPlaceholder__lastName: 'Inserisci il tuo cognome',
  formFieldInputPlaceholder__organizationDomain: "Inserisci il dominio dell'organizzazione",
  formFieldInputPlaceholder__organizationDomainEmailAddress:
    "Inserisci l'indirizzo email del dominio dell'organizzazione",
  formFieldInputPlaceholder__organizationName: "Inserisci il nome dell'organizzazione",
  formFieldInputPlaceholder__organizationSlug: "Inserisci lo slug dell'organizzazione",
  formFieldInputPlaceholder__password: 'Inserisci la tua password',
  formFieldInputPlaceholder__phoneNumber: 'Inserisci il numero di telefono',
  formFieldInputPlaceholder__username: 'Inserisci il nome utente',

  formFieldLabel__automaticInvitations: 'Abilita inviti automatici per questo dominio',
  formFieldLabel__backupCode: 'Codice di backup',
  formFieldLabel__confirmDeletion: 'Conferma',
  formFieldLabel__confirmPassword: 'Conferma password',
  formFieldLabel__currentPassword: 'Password corrente',
  formFieldLabel__emailAddress: 'Indirizzo email',
  formFieldLabel__emailAddress_username: 'Indirizzo email o nome utente',
  formFieldLabel__emailAddresses: 'Indirizzi email',
  formFieldLabel__firstName: 'Nome',
  formFieldLabel__lastName: 'Cognome',
  formFieldLabel__newPassword: 'Nuova password',
  formFieldLabel__organizationDomain: 'Dominio',
  formFieldLabel__organizationDomainDeletePending: 'Elimina inviti e suggerimenti pendenti',
  formFieldLabel__organizationDomainEmailAddress: 'Indirizzo email di verifica',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Inserisci un indirizzo email sotto questo dominio per ricevere un codice e verificare questo dominio.',
  formFieldLabel__organizationName: 'Nome organizzazione',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Nome della passkey',
  formFieldLabel__password: 'Password',
  formFieldLabel__phoneNumber: 'Numero di telefono',
  formFieldLabel__role: 'Ruolo',
  formFieldLabel__signOutOfOtherSessions: 'Disconnetti tutti gli altri dispositivi',
  formFieldLabel__username: 'Nome utente',
  impersonationFab: {
    action__signOut: 'Disconnetti',
    title: 'Accesso tramite {{identifier}}',
  },
  maintenanceMode: 'Modalità di manutenzione',
  membershipRole__admin: 'Amministratore',
  membershipRole__basicMember: 'Utente',
  membershipRole__guestMember: 'Ospite',
  organizationList: {
    action__createOrganization: 'Crea organizzazione',
    action__invitationAccept: 'Unisciti',
    action__suggestionsAccept: 'Richiedi di unirti',
    createOrganization: 'Crea organizzazione',
    invitationAcceptedLabel: 'Unito',
    subtitle: 'per continuare a {{applicationName}}',
    suggestionsAcceptedLabel: 'In attesa di approvazione',
    title: 'Scegli un account',
    titleWithoutPersonal: 'Scegli un’organizzazione',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Inviti automatici',
    badge__automaticSuggestion: 'Suggerimenti automatici',
    badge__manualInvitation: 'Nessuna iscrizione automatica',
    badge__unverified: 'Non verificato',
    createDomainPage: {
      subtitle:
        'Aggiungi il dominio da verificare. Gli utenti con indirizzi email in questo dominio possono unirsi all’organizzazione automaticamente o richiedere di unirsi.',
      title: 'Aggiungi dominio',
    },
    invitePage: {
      detailsTitle__inviteFailed: "L'invito non puó essere inviato. Correggi i seguenti e riprova:",
      formButtonPrimary__continue: 'Invia inviti',
      selectDropdown__role: 'Seleziona ruolo',
      subtitle: 'Invita un nuovo membro in questa organizzazione',
      successMessage: 'Invito inviato con successo',
      title: 'Invita membri',
    },
    membersPage: {
      action__invite: 'Invita',
      activeMembersTab: {
        menuAction__remove: 'Rimuovi membro',
        tableHeader__actions: 'Azioni',
        tableHeader__joined: 'Iscritto',
        tableHeader__role: 'Ruolo',
        tableHeader__user: 'Utente',
      },
      detailsTitle__emptyRow: 'Nessun membro da visualizzare',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invita utenti collegando un dominio email con la tua organizzazione. Chiunque si iscriva con un dominio email corrispondente potrà unirsi all’organizzazione in qualsiasi momento.',
          headerTitle: 'Inviti automatici',
          primaryButton: 'Gestisci domini verificati',
        },
        table__emptyRow: 'Nessun invito da visualizzare',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revoca invito',
        tableHeader__invited: 'Invitato',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Gli utenti che si iscrivono con un dominio email corrispondente, potranno vedere un suggerimento di richiesta di unirsi alla tua organizzazione.',
          headerTitle: 'Suggerimenti automatici',
          primaryButton: 'Gestisci domini verificati',
        },
        menuAction__approve: 'Approva',
        menuAction__reject: 'Rifiuta',
        tableHeader__requested: 'Richiesta accesso',
        table__emptyRow: 'Nessuna richiesta da visualizzare',
      },
      start: {
        headerTitle__invitations: 'Inviti',
        headerTitle__members: 'Membri',
        headerTitle__requests: 'Richieste',
      },
    },
    navbar: {
      description: 'Gestisci la tua organizzazione.',
      general: 'Generale',
      members: 'Membri',
      title: 'Organizzazione',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Scrivi "{{organizationName}}" qui sotto per continuare.',
          messageLine1: 'Sei sicuro di voler eliminare questa organizzazione?',
          messageLine2: 'Questa azione è permanente e irreversibile.',
          successMessage: 'Hai eliminato l’organizzazione.',
          title: 'Elimina organizzazione',
        },
        leaveOrganization: {
          actionDescription: 'Scrivi "{{organizationName}}" qui sotto per continuare.',
          messageLine1:
            'Sei sicuro di voler lasciare questa organizzazione? Perderai accesso a questa organizzazione e le sue applicazioni.',
          messageLine2: 'Questa azione é permanente ed irreversibile.',
          successMessage: "Hai lasciato l'organizzazione.",
          title: 'Lascia organizzazione',
        },
        title: 'Pericolo',
      },
      domainSection: {
        menuAction__manage: 'Gestisci',
        menuAction__remove: 'Elimina',
        menuAction__verify: 'Verifica',
        primaryButton: 'Aggiungi dominio',
        subtitle:
          "Consenti agli utenti di unirsi automaticamente all'organizzazione oppure di richiedere di unirsi in base a un dominio email verificato.",
        title: 'Domini verificati',
      },
      successMessage: "L'organizzazione é stata aggiornata.",
      title: "Profilo dell'organizzazione",
    },
    removeDomainPage: {
      messageLine1: 'Il dominio email {{domain}} verrà rimosso.',
      messageLine2: "Gli utenti non potranno più unirsi automaticamente all'organizzazione dopo questo.",
      successMessage: '{{domain}} è stato rimosso.',
      title: 'Rimuovi dominio',
    },
    start: {
      headerTitle__general: 'Generale',
      headerTitle__members: 'Membri',
      profileSection: {
        primaryButton: 'Salva modifiche',
        title: "Profilo dell'organizzazione",
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Rimuovere questo dominio influirá sugli utenti invitati.',
        removeDomainActionLabel__remove: 'Rimuovi dominio',
        removeDomainSubtitle: 'Rimuovi questo dominio dai tuoi domini verificati',
        removeDomainTitle: 'Rimuovi dominio',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          "Gli utenti sono automaticamente invitati a unirsi all'organizzazione quando si registrano e possono unirsi in qualsiasi momento.",
        automaticInvitationOption__label: 'Inviti automatici',
        automaticSuggestionOption__description:
          "Gli utenti ricevono un suggerimento per richiedere di unirsi, ma devono essere approvati da un amministratore prima di poter accedere all'organizzazione.",
        automaticSuggestionOption__label: 'Suggerimenti automatici',
        calloutInfoLabel: 'La modifica della modalità di iscrizione influenzerà solo i nuovi utenti.',
        calloutInvitationCountLabel: 'Inviti in sospeso inviati agli utenti: {{count}}',
        calloutSuggestionCountLabel: 'Suggerimenti in sospeso inviati agli utenti: {{count}}',
        manualInvitationOption__description: "Gli utenti possono essere invitati manualmente solo all'organizzazione.",
        manualInvitationOption__label: 'Nessuna iscrizione automatica',
        subtitle: "Scegli come gli utenti di questo dominio possono unirsi all'organizzazione.",
      },
      start: {
        headerTitle__danger: 'Pericolo',
        headerTitle__enrollment: 'Opzioni di iscrizione',
      },
      subtitle: 'Il dominio {{domain}} è ora verificato. Continua selezionando la modalità di iscrizione.',
      title: 'Aggiorna {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Inserisci il codice di verifica inviato al tuo indirizzo email',
      formTitle: 'Codice di verifica',
      resendButton: 'Non hai ricevuto un codice? Reinvia',
      subtitle: 'Il dominio {{domainName}} deve essere verificato tramite email.',
      subtitleVerificationCodeScreen:
        'È stato inviato un codice di verifica a {{emailAddress}}. Inserisci il codice per continuare.',
      title: 'Verifica dominio',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Crea Organizzazione',
    action__invitationAccept: 'Unisciti',
    action__manageOrganization: 'Gestisci Organizzazione',
    action__suggestionsAccept: 'Richiedi di unirti',
    notSelected: 'Nessuna organizzazione selezionata',
    personalWorkspace: 'Spazio di lavoro personale',
    suggestionsAcceptedLabel: 'In attesa di approvazione',
  },
  paginationButton__next: 'Prossimo',
  paginationButton__previous: 'Precedente',
  paginationRowText__displaying: 'Visualizzando',
  paginationRowText__of: 'di',
  reverification: {
    alternativeMethods: {
      actionLink: 'Clicca qui per utilizzare un metodo alternativo',
      actionText: 'Usa un metodo di verifica alternativo',
      blockButton__backupCode: 'Verifica con il codice di backup',
      blockButton__emailCode: 'Verifica con il codice via email',
      blockButton__password: 'Verifica con la password',
      blockButton__phoneCode: 'Verifica con il codice SMS',
      blockButton__totp: 'Verifica con il TOTP',
      getHelp: {
        blockButton__emailSupport: 'Contatta il supporto via email',
        content: 'Se hai bisogno di assistenza, contatta il nostro supporto.',
        title: 'Ottieni aiuto',
      },
      subtitle: 'Scegli un metodo per verificarti',
      title: 'Verifica necessaria',
    },
    backupCodeMfa: {
      subtitle: 'Usa il codice di backup che ti è stato fornito al momento della registrazione.',
      title: 'Verifica con il codice di backup',
    },
    emailCode: {
      formTitle: 'Inserisci il codice che ti è stato inviato via email.',
      resendButton: 'Invia di nuovo il codice',
      subtitle: 'Controlla la tua email per il codice di verifica.',
      title: 'Verifica con il codice email',
    },
    noAvailableMethods: {
      message: 'Non sono disponibili metodi di verifica.',
      subtitle: 'Contatta il supporto per assistenza.',
      title: 'Nessun metodo disponibile',
    },
    password: {
      actionLink: 'Reimposta la password',
      subtitle: 'Inserisci la tua password per continuare.',
      title: 'Verifica con la password',
    },
    phoneCode: {
      formTitle: 'Inserisci il codice che ti è stato inviato via SMS.',
      resendButton: 'Invia di nuovo il codice',
      subtitle: 'Controlla il tuo SMS per il codice di verifica.',
      title: 'Verifica con il codice SMS',
    },
    phoneCodeMfa: {
      formTitle: 'Inserisci il codice che ti abbiamo inviato via SMS.',
      resendButton: 'Invia di nuovo il codice',
      subtitle: 'Controlla il tuo SMS per il codice di verifica.',
      title: 'Verifica SMS (MFA)',
    },
    totpMfa: {
      formTitle: 'Inserisci il codice dalla tua app di autenticazione.',
      subtitle: 'Usa l’app di autenticazione che hai configurato.',
      title: 'Verifica TOTP (MFA)',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Aggiungi account',
      action__signOutAll: 'Disconnettiti da tutti gli account',
      subtitle: "Seleziona l'account con cui desideri continuare.",
      title: 'Scegli un account',
    },
    alternativeMethods: {
      actionLink: 'Richiedi aiuto',
      actionText: 'Non ne possiedi nessuno?',
      blockButton__backupCode: 'Usa un codice di backup',
      blockButton__emailCode: 'Invia codice a {{identifier}}',
      blockButton__emailLink: 'Invia link a {{identifier}}',
      blockButton__passkey: 'Usa una passkey',
      blockButton__password: 'Accedi con la tua password',
      blockButton__phoneCode: 'Invia codice a {{identifier}}',
      blockButton__totp: 'Usa la tua app di autenticazione',
      getHelp: {
        blockButton__emailSupport: 'Supporto email',
        content:
          'Se stai incontrando delle difficoltá ad accedere al tuo account, inviaci una email e ti aiuteremo a ripristinare il tuo account il prima possibile.',
        title: 'Richiedi aiuto',
      },
      subtitle: 'Problemi di accesso? Puoi usare uno di questi metodi per accedere.',
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
      clientMismatch: {
        subtitle: 'Il client utilizzato non corrisponde al tipo di account associato.',
        title: 'Errore di mismatch del client',
      },
      expired: {
        subtitle: 'Ritorna alla scheda originaria per continuare',
        title: 'Questo link di verifica è scaduto',
      },
      failed: {
        subtitle: 'Ritorna alla scheda originaria per continuare',
        title: 'Questo link di verifica non è valido',
      },
      formSubtitle: 'Usa il link di verifica inviato al tuo indirizzo email',
      formTitle: 'Link di verifica',
      loading: {
        subtitle: 'Verrai presto reindirizzato',
        title: 'Accesso in corso...',
      },
      resendButton: 'Rinvia link',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Controlla la tua email',
      unusedTab: {
        title: 'Puoi chiudere questa scheda',
      },
      verified: {
        subtitle: 'Verrai presto reindirizzato',
        title: 'Accesso avvenuto con successo',
      },
      verifiedSwitchTab: {
        subtitle: 'Ritorna alla scheda originaria per continuare',
        subtitleNewTab: 'Ritorna sulla nuova scheda aperta per continuare',
        titleNewTab: "Accedi da un'altra scheda",
      },
    },
    forgotPassword: {
      formTitle: 'Codice di reset della password',
      resendButton: 'Non hai ricevuto un codice? Reinvia',
      subtitle: 'per resettare la tua password',
      subtitle_email: 'Per prima cosa, inserisci il codice inviato al tuo ID email',
      subtitle_phone: 'Per prima cosa, inserisci il codice inviato al tuo telefono',
      title: 'Resetta la password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Resetta la tua password',
      label__alternativeMethods: 'Oppure, accedi con un altro metodo',
      title: 'Hai dimenticato la password?',
    },
    noAvailableMethods: {
      message: "Impossibile procedere con l'accesso. Non ci sono strumenti di autenticazione disponibili.",
      subtitle: 'Si è verificato un errore',
      title: 'Impossibile accedere',
    },
    passkey: {
      subtitle: 'Usa una passkey per un accesso più sicuro e rapido.',
      title: 'Autenticazione tramite passkey',
    },
    password: {
      actionLink: 'Usa un altro metodo',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Inserisci la tua password',
    },
    passwordPwned: {
      title: 'La tua password è stata trovata in un data breach.',
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
      subtitle: 'per accedere a {{applicationName}}',
      title: 'Controlla il tuo telefono',
    },
    resetPassword: {
      formButtonPrimary: 'Resetta la password',
      requiredMessage: 'Per motivi di sicurezza, è richiesto di resettare la tua password.',
      successMessage: 'La tua password è stata cambiata con successo. Ti stiamo collegando, attendi un momento.',
      title: 'Imposta nuova password',
    },
    resetPasswordMfa: {
      detailsLabel: 'Dobbiamo verificare la tua identità prima di resettare la tua password.',
    },
    start: {
      actionLink: 'Registrati',
      actionLink__join_waitlist: "Unisciti alla lista d'attesa",
      actionLink__use_email: 'Usa email',
      actionLink__use_email_username: 'Usa email o username',
      actionLink__use_passkey: 'Usa passkey',
      actionLink__use_phone: 'Usa telefono',
      actionLink__use_username: 'Usa username',
      actionText: 'Non hai un account?',
      actionText__join_waitlist: "Unisciti alla lista d'attesa",
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Accedi',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Codice di verifica',
      subtitle: 'Inserisci il codice di verifica dalla tua app di autenticazione.',
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
      clientMismatch: {
        subtitle: 'Il client che stai utilizzando non corrisponde a quello previsto per il tuo account.',
        title: 'Errore di incompatibilità del client',
      },
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
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Accetto la Politica sulla Privacy',
        label__onlyTermsOfService: 'Accetto i Termini di Servizio',
        label__termsOfServiceAndPrivacyPolicy: 'Accetto i Termini di Servizio e la Politica sulla Privacy',
      },
      continue: {
        subtitle: 'Per completare la registrazione, accetta i termini e la privacy policy.',
        title: 'Continua',
      },
    },
    phoneCode: {
      formSubtitle: 'Inserisci il codice di verifica inviato al tuo numero di telefono',
      formTitle: 'Codice di verifica',
      resendButton: 'Rinvia codice',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Verifica il tuo numero di telefono',
    },
    restrictedAccess: {
      actionLink: 'Contatta il supporto',
      actionText: 'Hai bisogno di aiuto?',
      blockButton__emailSupport: 'Email al supporto',
      blockButton__joinWaitlist: "Unisciti alla lista d'attesa",
      subtitle:
        "L'accesso è limitato per il momento. Ti invitiamo a contattare il supporto per ulteriori informazioni.",
      subtitleWaitlist: "Puoi unirti alla lista d'attesa e ti avviseremo quando l'accesso sarà disponibile.",
      title: 'Accesso limitato',
    },
    start: {
      actionLink: 'Accedi',
      actionLink__use_email: 'Usa email',
      actionLink__use_phone: 'Usa telefono',
      actionText: 'Hai giá un account?',
      subtitle: 'per continuare su {{applicationName}}',
      title: 'Crea il tuo account',
    },
  },
  socialButtonsBlockButton: 'Continua con {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: 'Continua con uno dei seguenti provider',

  unstable__errors: {
    already_a_member_in_organization: 'Sei già un membro di questa organizzazione.',
    captcha_invalid:
      'Registrazione non riuscita a causa di fallite convalide di sicurezza. Per favore, ricarica la pagina e riprova o contatta il supporto per ulteriore assistenza.',
    captcha_unavailable:
      'Registrazione non riuscita a causa della convalida del bot non riuscita. Per favore, ricarica la pagina e riprova o contatta il supporto per ulteriore assistenza.',
    form_code_incorrect: 'Il codice inserito non è corretto. Riprova.',
    form_identifier_exists: 'Questa email/numero di telefono è già in uso.',
    form_identifier_exists__email_address: 'Questa email è già registrata.',
    form_identifier_exists__phone_number: 'Questo numero di telefono è già registrato.',
    form_identifier_exists__username: 'Questo username è già in uso.',
    form_identifier_not_found: 'Non abbiamo trovato nessun account con queste informazioni.',
    form_param_format_invalid: 'Formato non valido.',
    form_param_format_invalid__email_address: "L'indirizzo email deve essere un indirizzo email valido.",
    form_param_format_invalid__phone_number: 'Il numero di telefono deve essere in un formato internazionale valido.',
    form_param_max_length_exceeded__first_name: 'Il nome non deve superare i 256 caratteri.',
    form_param_max_length_exceeded__last_name: 'Il cognome non deve superare i 256 caratteri.',
    form_param_max_length_exceeded__name: 'Il nome non deve superare i 256 caratteri.',
    form_param_nil: 'Questo campo è obbligatorio.',
    form_param_value_invalid: 'Valore non valido.',
    form_password_incorrect: 'Password errata.',
    form_password_length_too_short: 'La password deve avere almeno 8 caratteri.',
    form_password_not_strong_enough: 'La tua password non è abbastanza forte.',
    form_password_pwned: 'Questa password è stata trovata in una violazione dei dati. Scegli una password diversa.',
    form_password_pwned__sign_in:
      'Questa password è stata trovata in una violazione dei dati. Non può essere utilizzata. Reimposta la tua password.',
    form_password_size_in_bytes_exceeded:
      'La tua password ha superato il numero massimo di byte consentiti, per favore accorciala o rimuovi alcuni caratteri speciali.',
    form_password_validation_failed: 'Password errata.',
    form_username_invalid_character: 'Il nome utente contiene caratteri non validi.',
    form_username_invalid_length: 'Il nome utente deve avere una lunghezza compresa tra 3 e 32 caratteri.',
    identification_deletion_failed: 'Non puoi eliminare la tua ultima identificazione.',
    not_allowed_access: 'Non hai accesso a questa risorsa.',
    organization_domain_blocked: "Il dominio dell'organizzazione è stato bloccato.",
    organization_domain_common: 'Questo dominio è troppo comune per essere utilizzato.',
    organization_membership_quota_exceeded: "Hai raggiunto il limite massimo di membri nell'organizzazione.",
    organization_minimum_permissions_needed: 'Non hai i permessi minimi necessari per completare questa operazione.',
  },

  userButton: {
    action__addAccount: 'Aggiungi account',
    action__manageAccount: 'Gestisci account',
    action__signOut: 'Disconnetti',
    action__signOutAll: 'Disconnetti da tutti gli accounts',
  },
  userProfile: {
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
      actionDescription: 'Digita "Elimina account" qui sotto per continuare.',
      confirm: 'Elimina account',
      messageLine1: 'Sei sicuro di voler eliminare il tuo account?',
      messageLine2: 'Questa azione è permanente e irreversibile.',
      title: 'Elimina account',
    },
    emailAddressPage: {
      emailCode: {
        formSubtitle: 'Inserisci il codice di verifica inviato a {{identifier}}',
        formTitle: 'Codice di verifica',
        resendButton: 'Rinvia codice',
        successMessage: "L'indirizzo email {{identifier}} é stato aggiunto al tuo account.",
      },
      emailLink: {
        formSubtitle: 'Clicca sul link di verifica nella email inviata a {{identifier}}',
        formTitle: 'Link di verifica',
        resendButton: 'Rinvia link',
        successMessage: "L'indirizzo email {{identifier}} é stato aggiunto al tuo account.",
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      formHint: undefined,
      removeResource: {
        messageLine1: '{{identifier}} sará rimosso dal tuo account.',
        messageLine2: 'Non sarai piú in grado di accedere utilizzando questo indirizzo email.',
        successMessage: '{{emailAddress}} é stato rimosso dal tuo account.',
        title: 'Rimuovi indirizzo email',
      },
      title: 'Aggiungi un indirizzo email',
      verifyTitle: 'Verifica indirizzo email',
    },
    formButtonPrimary__add: 'Aggiungi',
    formButtonPrimary__continue: 'Continua',
    formButtonPrimary__finish: 'Concludi',
    formButtonPrimary__remove: 'Rimuovi',
    formButtonPrimary__save: 'Salva',
    formButtonReset: 'Cancella',
    mfaPage: {
      formHint: 'Seleziona un metodo da aggiungere.',
      title: 'Aggiungi verifica in 2 passaggi',
    },
    mfaPhoneCodePage: {
      backButton: 'Usa numero esistente',
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
        'Quando accedi, dovrai inserire un codice di verifica inviato a questo numero di telefono come passaggio aggiuntivo.',
      successMessage2:
        "Salva questi codici di backup e conservali in un luogo sicuro. Se perdi l'accesso al tuo dispositivo di autenticazione, puoi utilizzare i codici di backup per accedere.",
      successTitle: 'Verifica codice SMS abilitata',
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
      account: 'Profilo',
      description: 'Gestisci il tuo account.',
      security: 'Sicurezza',
      title: 'Account',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: 'Sei sicuro di voler rimuovere questa chiave di accesso dal tuo account?',
        title: 'Rimuovi chiave di accesso',
      },
      subtitle__rename: 'Modifica il nome della tua chiave di accesso',
      title__rename: 'Rinomina chiave di accesso',
    },

    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'È consigliabile disconnettersi da tutti gli altri dispositivi che potrebbero aver utilizzato la tua vecchia password.',
      readonly:
        'La tua password corrente non può essere modificata perché puoi accedere solo tramite la connessione aziendale.',
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
      verifySubtitle: 'Inserisci il codice di verifica inviato a {{identifier}}',
      verifyTitle: 'Verifica numero di telefono',
    },
    profilePage: {
      fileDropAreaHint: 'Carica una immagine piú piccola di 10MB di tipo JPG, PNG, GIF, oppure WEBP',
      imageFormDestructiveActionSubtitle: 'Rimuovi immagine',
      imageFormSubtitle: 'Carica immagine',
      imageFormTitle: 'Immagine di profilo',
      readonly:
        'Le informazioni del tuo profilo sono state fornite dalla connessione aziendale e non possono essere modificate.',
      successMessage: 'Il tuo profile é stato aggiornato.',
      title: 'Aggiorna profilo',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Disconnetti dal dispositivo',
        title: 'Dispositivi attivi',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Riprova',
        actionLabel__reauthorize: 'Autorizza ora',
        destructiveActionTitle: 'Rimuovi',
        primaryButton: 'Collega account',
        subtitle__disconnected: 'Il tuo account è disconnesso. Per favore, riconnetti il tuo account per continuare.',
        subtitle__reauthorize:
          'Gli ambiti richiesti sono stati aggiornati e potresti riscontrare funzionalità limitate. Per favore, ri-autorizza questa applicazione per evitare problemi.',
        title: 'Account collegati',
      },
      dangerSection: {
        deleteAccountButton: 'Elimina account',
        title: 'Terminazione account',
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
        title: 'Account aziendali',
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
      passkeysSection: {
        menuAction__destructive: 'Rimuovi chiave di accesso',
        menuAction__rename: 'Rinomina chiave di accesso',
        title: 'Gestisci le tue chiavi di accesso',
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
        primaryButton: 'Salva modifiche',
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
      web3WalletButtonsBlockButton: 'Continua con il tuo portafoglio Web3',
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
