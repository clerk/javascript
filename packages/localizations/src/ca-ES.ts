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

export const caES: LocalizationResource = {
  locale: 'ca-ES',
  backButton: 'Enrere',
  badge__default: 'Per defecte',
  badge__otherImpersonatorDevice: 'Un altre dispositiu impostor',
  badge__primary: 'Principal',
  badge__requiresAction: 'Requereix acció',
  badge__thisDevice: 'Aquest dispositiu',
  badge__unverified: 'No verificat',
  badge__userDevice: "Dispositiu de l'usuari",
  badge__you: 'Tu',
  createOrganization: {
    formButtonSubmit: 'Crea organització',
    invitePage: {
      formButtonReset: 'Omet',
    },
    title: 'Crea organització',
  },
  dates: {
    lastDay: "Ahir a les {{ date | timeString('en-US') }}",
    next6Days: "{{ date | weekday('en-US','long') }} a les {{ date | timeString('en-US') }}",
    nextDay: "Demà a les {{ date | timeString('en-US') }}",
    numeric: "{{ date | numeric('en-US') }}",
    previous6Days: "El darrer {{ date | weekday('en-US','long') }} a les {{ date | timeString('en-US') }}",
    sameDay: "Avui a les {{ date | timeString('en-US') }}",
  },
  dividerText: 'o',
  footerActionLink__useAnotherMethod: 'Utilitza un altre mètode',
  footerPageLink__help: 'Ajuda',
  footerPageLink__privacy: 'Privacitat',
  footerPageLink__terms: 'Termes',
  formButtonPrimary: 'Continua',
  formButtonPrimary__verify: 'Verifica',
  formFieldAction__forgotPassword: 'Has oblidat la contrasenya?',
  formFieldError__matchingPasswords: 'Les contrasenyes coincideixen.',
  formFieldError__notMatchingPasswords: 'Les contrasenyes no coincideixen.',
  formFieldError__verificationLinkExpired: "L'enllaç de verificació ha caducat. Si us plau, sol·licita un nou enllaç.",
  formFieldHintText__optional: 'Opcional',
  formFieldHintText__slug: "Un slug és un ID llegible per humans que ha de ser únic. Sovint s'utilitza en URL.",
  formFieldInputPlaceholder__backupCode: 'Codi de seguretat',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Eliminar compte',
  formFieldInputPlaceholder__emailAddress: 'exemple@correu.com',
  formFieldInputPlaceholder__emailAddress_username: "exemple@correu.com o nom d'usuari",
  formFieldInputPlaceholder__emailAddresses: 'exemple@correu.com, exemple2@correu.com',
  formFieldInputPlaceholder__firstName: 'Nom',
  formFieldInputPlaceholder__lastName: 'Cognoms',
  formFieldInputPlaceholder__organizationDomain: 'exemple.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'contacte@exemple.com',
  formFieldInputPlaceholder__organizationName: "Nom de l'organització",
  formFieldInputPlaceholder__organizationSlug: 'la-meva-org',
  formFieldInputPlaceholder__password: 'Contrasenya',
  formFieldInputPlaceholder__phoneNumber: 'Número de telèfon',
  formFieldInputPlaceholder__username: "Nom d'usuari",
  formFieldLabel__automaticInvitations: 'Activa invitacions automàtiques per a aquest domini',
  formFieldLabel__backupCode: 'Codi de seguretat',
  formFieldLabel__confirmDeletion: 'Confirmació',
  formFieldLabel__confirmPassword: 'Confirma la contrasenya',
  formFieldLabel__currentPassword: 'Contrasenya actual',
  formFieldLabel__emailAddress: 'Adreça de correu electrònic',
  formFieldLabel__emailAddress_username: "Adreça de correu electrònic o nom d'usuari",
  formFieldLabel__emailAddresses: 'Adreces de correu electrònic',
  formFieldLabel__firstName: 'Nom',
  formFieldLabel__lastName: 'Cognoms',
  formFieldLabel__newPassword: 'Nova contrasenya',
  formFieldLabel__organizationDomain: 'Domini',
  formFieldLabel__organizationDomainDeletePending: 'Elimina invitacions pendents i suggeriments',
  formFieldLabel__organizationDomainEmailAddress: 'Adreça de correu electrònic de verificació',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Introdueix una adreça de correu electrònic sota aquest domini per rebre un codi i verificar aquest domini.',
  formFieldLabel__organizationName: 'Nom',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__password: 'Contrasenya',
  formFieldLabel__phoneNumber: 'Número de telèfon',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Tanca la sessió de tots els altres dispositius',
  formFieldLabel__username: "Nom d'usuari",
  impersonationFab: {
    action__signOut: 'Tanca la sessió',
    title: 'Connectat com a {{identifier}}',
  },
  membershipRole__admin: 'Administrador',
  membershipRole__basicMember: 'Membre',
  membershipRole__guestMember: 'Convidat',
  organizationList: {
    action__createOrganization: 'Crea organització',
    action__invitationAccept: 'Uneix-te',
    action__suggestionsAccept: 'Sol·licita unir-te',
    createOrganization: 'Crea Organització',
    invitationAcceptedLabel: 'Unit',
    subtitle: 'per continuar a {{applicationName}}',
    suggestionsAcceptedLabel: 'Aprovació pendent',
    title: 'Trieu un compte',
    titleWithoutPersonal: 'Trieu una organització',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Invitacions automàtiques',
    badge__automaticSuggestion: 'Suggeriments automàtics',
    badge__manualInvitation: 'Sense inscripció automàtica',
    badge__unverified: 'No verificat',
    createDomainPage: {
      subtitle:
        "Afegeix el domini per verificar. Els usuaris amb adreces de correu electrònic en aquest domini poden unir-se a l'organització automàticament o sol·licitar unir-se.",
      title: 'Afegeix domini',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        "Les invitacions no s'han pogut enviar. Ja hi ha invitacions pendents per a les següents adreces de correu electrònic: {{email_addresses}}.",
      formButtonPrimary__continue: 'Envia invitacions',
      selectDropdown__role: 'Selecciona rol',
      subtitle: 'Introdueix o enganxa una o més adreces de correu electrònic, separades per espais o comes.',
      successMessage: "Les invitacions s'han enviat correctament",
      title: 'Convida nous membres',
    },
    membersPage: {
      action__invite: 'Convida',
      activeMembersTab: {
        menuAction__remove: 'Elimina membre',
        tableHeader__actions: undefined,
        tableHeader__joined: 'Unit',
        tableHeader__role: 'Rol',
        tableHeader__user: 'Usuari',
      },
      detailsTitle__emptyRow: 'No hi ha membres per mostrar',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            "Convida usuaris connectant un domini de correu electrònic amb la teva organització. Qualsevol que es registri amb un domini de correu electrònic coincident podrà unir-se a l'organització en qualsevol moment.",
          headerTitle: 'Invitacions automàtiques',
          primaryButton: 'Gestiona dominis verificats',
        },
        table__emptyRow: 'No hi ha invitacions per mostrar',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revoca invitació',
        tableHeader__invited: 'Convidat',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Els usuaris que es registren amb un domini de correu electrònic coincident, podran veure una suggerència per sol·licitar unir-se a la teva organització.',
          headerTitle: 'Suggeriments automàtics',
          primaryButton: 'Gestiona dominis verificats',
        },
        menuAction__approve: 'Aprova',
        menuAction__reject: 'Rebutja',
        tableHeader__requested: 'Accés sol·licitat',
        table__emptyRow: 'No hi ha sol·licituds per mostrar',
      },
      start: {
        headerTitle__invitations: 'Invitacions',
        headerTitle__members: 'Membres',
        headerTitle__requests: 'Sol·licituds',
      },
    },
    navbar: {
      description: 'Gestiona la teva organització.',
      general: 'General',
      members: 'Membres',
      title: 'Organització',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Escriu "{{organizationName}}" a continuació per continuar.',
          messageLine1: 'Estàs segur que vols eliminar aquesta organització?',
          messageLine2: 'Aquesta acció és permanent i irreversible.',
          successMessage: "Has eliminat l'organització.",
          title: 'Elimina organització',
        },
        leaveOrganization: {
          actionDescription: 'Escriu "{{organizationName}}" a continuació per continuar.',
          messageLine1:
            "Estàs segur que vols deixar aquesta organització? Perdràs l'accés a aquesta organització i les seves aplicacions.",
          messageLine2: 'Aquesta acció és permanent i irreversible.',
          successMessage: "Has deixat l'organització.",
          title: 'Deixa organització',
        },
        title: 'Perill',
      },
      domainSection: {
        menuAction__manage: 'Gestiona',
        menuAction__remove: 'Elimina',
        menuAction__verify: 'Verifica',
        primaryButton: 'Afegeix domini',
        subtitle:
          "Permet als usuaris unir-se a l'organització automàticament o sol·licitar unir-se basant-se en un domini de correu electrònic verificat.",
        title: 'Dominis verificats',
      },
      successMessage: "L'organització s'ha actualitzat.",
      title: 'Actualitza perfil',
    },
    removeDomainPage: {
      messageLine1: 'El domini de correu electrònic {{domain}} serà eliminat.',
      messageLine2: "Els usuaris ja no podran unir-se a l'organització automàticament després d'això.",
      successMessage: '{{domain}} ha estat eliminat.',
      title: 'Elimina domini',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membres',
      profileSection: {
        primaryButton: 'Actualitza perfil',
        title: "Perfil de l'Organització",
        uploadAction__title: 'Logotip',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Eliminar aquest domini afectarà els usuaris convidats.',
        removeDomainActionLabel__remove: 'Elimina domini',
        removeDomainSubtitle: 'Elimina aquest domini dels teus dominis verificats',
        removeDomainTitle: 'Elimina domini',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          "Els usuaris són convidats automàticament a unir-se a l'organització quan es registren i poden unir-se en qualsevol moment.",
        automaticInvitationOption__label: 'Invitacions automàtiques',
        automaticSuggestionOption__description:
          "Els usuaris reben una suggerència per sol·licitar unir-se, però ha de ser aprovat per un administrador abans de poder-se unir a l'organització.",
        automaticSuggestionOption__label: 'Suggeriments automàtics',
        calloutInfoLabel: "Canviar el mode d'inscripció només afectarà els nous usuaris.",
        calloutInvitationCountLabel: 'Invitacions pendents enviades a usuaris: {{count}}',
        calloutSuggestionCountLabel: 'Suggeriments pendents enviats a usuaris: {{count}}',
        manualInvitationOption__description: "Els usuaris només poden ser convidats manualment a l'organització.",
        manualInvitationOption__label: 'Sense inscripció automàtica',
        subtitle: "Trieu com els usuaris d'aquest domini poden unir-se a l'organització.",
      },
      start: {
        headerTitle__danger: 'Perill',
        headerTitle__enrollment: "Opcions d'inscripció",
      },
      subtitle: "El domini {{domain}} ara està verificat. Continua seleccionant el mode d'inscripció.",
      title: 'Actualitza {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Introdueix el codi de verificació enviat al teu correu electrònic',
      formTitle: 'Codi de verificació',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'El domini {{domainName}} necessita ser verificat via correu electrònic.',
      subtitleVerificationCodeScreen:
        "S'ha enviat un codi de verificació a {{emailAddress}}. Introdueix el codi per continuar.",
      title: 'Verifica domini',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Crea organització',
    action__invitationAccept: 'Uneix-te',
    action__manageOrganization: 'Gestiona',
    action__suggestionsAccept: 'Sol·licita unir-te',
    notSelected: "No s'ha seleccionat cap organització",
    personalWorkspace: 'Compte personal',
    suggestionsAcceptedLabel: 'Aprovació pendent',
  },
  paginationButton__next: 'Següent',
  paginationButton__previous: 'Anterior',
  paginationRowText__displaying: 'Mostrant',
  paginationRowText__of: 'de',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Afegeix compte',
      action__signOutAll: 'Tanca la sessió de tots els comptes',
      subtitle: 'Selecciona el compte amb el qual vols continuar.',
      title: 'Trieu un compte',
    },
    alternativeMethods: {
      actionLink: 'Obtén ajuda',
      actionText: "No tens cap d'aquests?",
      blockButton__backupCode: 'Utilitza un codi de seguretat',
      blockButton__emailCode: 'Envia codi per correu electrònic a {{identifier}}',
      blockButton__emailLink: 'Envia enllaç per correu electrònic a {{identifier}}',
      blockButton__password: 'Inicia sessió amb la teva contrasenya',
      blockButton__phoneCode: 'Envia codi SMS a {{identifier}}',
      blockButton__totp: "Utilitza la teva aplicació d'autenticació",
      getHelp: {
        blockButton__emailSupport: 'Suport per correu electrònic',
        content:
          "Si tens dificultats per iniciar sessió al teu compte, envia'ns un correu electrònic i treballarem amb tu per restaurar l'accés tan aviat com sigui possible.",
        title: 'Obtén ajuda',
      },
      subtitle: "Tens problemes? Pots utilitzar qualsevol d'aquests mètodes per iniciar sessió.",
      title: 'Utilitza un altre mètode',
    },
    backupCodeMfa: {
      subtitle: "El teu codi de seguretat és el que vas obtenir quan vas configurar l'autenticació de dos passos.",
      title: 'Introdueix un codi de seguretat',
    },
    emailCode: {
      formTitle: 'Codi de verificació',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'per continuar a {{applicationName}}',
      title: 'Comprova el teu correu electrònic',
    },
    emailLink: {
      expired: {
        subtitle: 'Torna a la pestanya original per continuar.',
        title: 'Aquest enllaç de verificació ha caducat',
      },
      failed: {
        subtitle: 'Torna a la pestanya original per continuar.',
        title: 'Aquest enllaç de verificació no és vàlid',
      },
      formSubtitle: "Utilitza l'enllaç de verificació enviat al teu correu electrònic",
      formTitle: 'Enllaç de verificació',
      loading: {
        subtitle: 'Seràs redirigit aviat',
        title: 'Iniciant sessió...',
      },
      resendButton: "No has rebut l'enllaç? Reenvia",
      subtitle: 'per continuar a {{applicationName}}',
      title: 'Comprova el teu correu electrònic',
      unusedTab: {
        title: 'Pots tancar aquesta pestanya',
      },
      verified: {
        subtitle: 'Seràs redirigit aviat',
        title: 'Has iniciat sessió amb èxit',
      },
      verifiedSwitchTab: {
        subtitle: 'Torna a la pestanya original per continuar',
        subtitleNewTab: 'Torna a la pestanya recentment oberta per continuar',
        titleNewTab: "S'ha iniciat sessió en una altra pestanya",
      },
    },
    forgotPassword: {
      formTitle: 'Codi de restabliment de contrasenya',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'per restablir la teva contrasenya',
      subtitle_email: 'Primer, introdueix el codi enviat al teu ID de correu electrònic',
      subtitle_phone: 'Primer, introdueix el codi enviat al teu telèfon',
      title: 'Restableix la contrasenya',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Restableix la teva contrasenya',
      label__alternativeMethods: 'O bé, inicia sessió amb un altre mètode',
      title: 'Has oblidat la contrasenya?',
    },
    noAvailableMethods: {
      message: "No es pot procedir amb l'inici de sessió. No hi ha cap factor d'autenticació disponible.",
      subtitle: "S'ha produït un error",
      title: 'No es pot iniciar sessió',
    },
    password: {
      actionLink: 'Utilitza un altre mètode',
      subtitle: 'Introdueix la contrasenya associada al teu compte',
      title: 'Introdueix la teva contrasenya',
    },
    phoneCode: {
      formTitle: 'Codi de verificació',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'per continuar a {{applicationName}}',
      title: 'Comprova el teu telèfon',
    },
    phoneCodeMfa: {
      formTitle: 'Codi de verificació',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'Per continuar, introdueix el codi de verificació enviat al teu telèfon',
      title: 'Comprova el teu telèfon',
    },
    resetPassword: {
      formButtonPrimary: 'Restableix la contrasenya',
      requiredMessage:
        'Ja existeix un compte amb una adreça de correu electrònic no verificada. Si us plau, restableix la teva contrasenya per seguretat.',
      successMessage: "La teva contrasenya s'ha canviat amb èxit. Iniciant sessió, espera un moment.",
      title: 'Estableix una nova contrasenya',
    },
    resetPasswordMfa: {
      detailsLabel: 'Necessitem verificar la teva identitat abans de restablir la teva contrasenya.',
    },
    start: {
      actionLink: "Registra't",
      actionLink__use_email: 'Utilitza correu electrònic',
      actionLink__use_email_username: "Utilitza correu electrònic o nom d'usuari",
      actionLink__use_phone: 'Utilitza telèfon',
      actionLink__use_username: "Utilitza nom d'usuari",
      actionText: 'No tens un compte?',
      subtitle: 'Benvingut de nou! Si us plau, inicia sessió per continuar',
      title: 'Inicia sessió a {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Codi de verificació',
      subtitle: "Per continuar, introdueix el codi de verificació generat per la teva aplicació d'autenticació",
      title: 'Verificació de dos passos',
    },
  },
  signInEnterPasswordTitle: 'Introdueix la teva contrasenya',
  signUp: {
    continue: {
      actionLink: 'Inicia sessió',
      actionText: 'Ja tens un compte?',
      subtitle: 'Si us plau, completa els detalls restants per continuar.',
      title: 'Completa els camps que falten',
    },
    emailCode: {
      formSubtitle: 'Introdueix el codi de verificació enviat a la teva adreça de correu electrònic',
      formTitle: 'Codi de verificació',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'Introdueix el codi de verificació enviat al teu correu',
      title: 'Verifica el teu correu electrònic',
    },
    emailLink: {
      formSubtitle: "Utilitza l'enllaç de verificació enviat a la teva adreça de correu electrònic",
      formTitle: 'Enllaç de verificació',
      loading: {
        title: 'Registrant...',
      },
      resendButton: "No has rebut l'enllaç? Reenvia",
      subtitle: 'per continuar a {{applicationName}}',
      title: 'Verifica el teu correu electrònic',
      verified: {
        title: 'Registre completat amb èxit',
      },
      verifiedSwitchTab: {
        subtitle: 'Torna a la pestanya recentment oberta per continuar',
        subtitleNewTab: 'Torna a la pestanya anterior per continuar',
        title: 'Correu electrònic verificat amb èxit',
      },
    },
    phoneCode: {
      formSubtitle: 'Introdueix el codi de verificació enviat al teu número de telèfon',
      formTitle: 'Codi de verificació',
      resendButton: 'No has rebut el codi? Reenvia',
      subtitle: 'Introdueix el codi de verificació enviat al teu telèfon',
      title: 'Verifica el teu telèfon',
    },
    start: {
      actionLink: 'Inicia sessió',
      actionText: 'Ja tens un compte?',
      subtitle: 'Benvingut! Si us plau, completa els detalls per començar.',
      title: 'Crea el teu compte',
    },
  },
  socialButtonsBlockButton: 'Continua amb {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      "El registre no ha estat exitós a causa de validacions de seguretat fallides. Si us plau, actualitza la pàgina per tornar-ho a intentar o posa't en contacte amb el suport per obtenir més assistència.",
    captcha_unavailable:
      "El registre no ha estat exitós a causa de la validació fallida de bot. Si us plau, actualitza la pàgina per tornar-ho a intentar o posa't en contacte amb el suport per obtenir més assistència.",
    form_code_incorrect: 'El codi introduït no és vàlid. Si us plau, comprova el codi i torna-ho a intentar.',
    form_identifier_exists: 'Aquest identificador ja existeix. Si us plau, tria un altre identificador.',
    form_identifier_not_found: "No s'ha trobat cap identificador coincident. Si us plau, comprova el valor introduït.",
    form_param_format_invalid: 'Format de paràmetre no vàlid.',
    form_param_format_invalid__email_address: "L'adreça de correu electrònic ha de ser una adreça vàlida.",
    form_param_format_invalid__phone_number: 'El número de telèfon ha de tenir un format internacional vàlid.',
    form_param_max_length_exceeded__first_name: 'El nom no ha de superar els 256 caràcters.',
    form_param_max_length_exceeded__last_name: 'Els cognoms no han de superar els 256 caràcters.',
    form_param_max_length_exceeded__name: 'El nom no ha de superar els 256 caràcters.',
    form_param_nil: 'El valor del camp no pot ser nul. Si us plau, completa aquest camp.',
    form_password_incorrect: 'La contrasenya introduïda és incorrecta.',
    form_password_length_too_short: 'La teva contrasenya ha de tenir almenys 8 caràcters.',
    form_password_not_strong_enough: 'La teva contrasenya no és prou forta.',
    form_password_pwned:
      'Aquesta contrasenya ha aparegut en una filtració i no es pot utilitzar, si us plau, prova una altra contrasenya.',
    form_password_size_in_bytes_exceeded:
      'La teva contrasenya ha superat el nombre màxim de bytes permesos, si us plau, redueix-la o elimina alguns caràcters especials.',
    form_password_validation_failed: 'Contrasenya incorrecta',
    form_username_invalid_character: "El nom d'usuari conté caràcters no vàlids.",
    form_username_invalid_length: "El nom d'usuari ha de tenir entre 3 i 50 caràcters.",
    identification_deletion_failed: 'No pots eliminar la teva última identificació.',
    not_allowed_access: "No tens permís per accedir a aquesta pàgina. Si us plau, posa't en contacte amb el suport.",
    passwordComplexity: {
      maximumLength: 'menys de {{length}} caràcters',
      minimumLength: '{{length}} o més caràcters',
      requireLowercase: 'una lletra minúscula',
      requireNumbers: 'un número',
      requireSpecialCharacter: 'un caràcter especial',
      requireUppercase: 'una lletra majúscula',
      sentencePrefix: 'La teva contrasenya ha de contenir',
    },
    phone_number_exists: "Aquest número de telèfon ja està en ús. Si us plau, prova'n un altre.",
    zxcvbn: {
      couldBeStronger: 'La teva contrasenya funciona, però podria ser més forta. Prova afegint més caràcters.',
      goodPassword: 'La teva contrasenya compleix tots els requisits necessaris.',
      notEnough: 'La teva contrasenya no és prou forta.',
      suggestions: {
        allUppercase: 'Capitalitza algunes, però no totes les lletres.',
        anotherWord: 'Afegeix més paraules que siguin menys comunes.',
        associatedYears: 'Evita anys que estiguin associats amb tu.',
        capitalization: 'Capitalitza més que la primera lletra.',
        dates: 'Evita dates i anys que estiguin associats amb tu.',
        l33t: "Evita substitucions de lletres previsibles com '@' per 'a'.",
        longerKeyboardPattern:
          'Utilitza patrons de teclat més llargs i canvia la direcció de la tipografia diverses vegades.',
        noNeed: 'Pots crear contrasenyes fortes sense utilitzar símbols, números o lletres majúscules.',
        pwned: 'Si utilitzes aquesta contrasenya en un altre lloc, hauries de canviar-la.',
        recentYears: 'Evita anys recents.',
        repeated: 'Evita paraules i caràcters repetits.',
        reverseWords: 'Evita ortografies invertides de paraules comunes.',
        sequences: 'Evita seqüències de caràcters comuns.',
        useWords: 'Utilitza diverses paraules, però evita frases comunes.',
      },
      warnings: {
        common: 'Aquesta és una contrasenya molt utilitzada.',
        commonNames: "Els noms i cognoms comuns són fàcils d'endevinar.",
        dates: "Les dates són fàcils d'endevinar.",
        extendedRepeat: 'Els patrons de caràcters repetits com "abcabcabc" són fàcils d\'endevinar.',
        keyPattern: "Els patrons curts de teclat són fàcils d'endevinar.",
        namesByThemselves: "Els noms o cognoms sols són fàcils d'endevinar.",
        pwned: 'La teva contrasenya va ser exposada per una violació de dades a Internet.',
        recentYears: "Els anys recents són fàcils d'endevinar.",
        sequences: 'Les seqüències de caràcters comuns com "abc" són fàcils d\'endevinar.',
        similarToCommon: 'Això és similar a una contrasenya molt utilitzada.',
        simpleRepeat: 'Els caràcters repetits com "aaa" són fàcils d\'endevinar.',
        straightRow: "Les files rectes de tecles del teclat són fàcils d'endevinar.",
        topHundred: 'Aquesta és una contrasenya molt utilitzada.',
        topTen: 'Aquesta és una contrasenya altament utilitzada.',
        userInputs: 'No hi hauria de tenir cap dada personal ni relacionada amb la pàgina.',
        wordByItself: "Les paraules soles són fàcils d'endevinar.",
      },
    },
  },
  userButton: {
    action__addAccount: 'Afegeix compte',
    action__manageAccount: 'Gestiona compte',
    action__signOut: 'Tanca sessió',
    action__signOutAll: 'Tanca sessió de tots els comptes',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copiat!',
      actionLabel__copy: 'Copia tot',
      actionLabel__download: 'Descarrega .txt',
      actionLabel__print: 'Imprimeix',
      infoText1: "Els codis de seguretat s'activaran per a aquest compte.",
      infoText2:
        "Guarda els codis de seguretat en secret i emmagatzema'ls de manera segura. Pots regenerar els codis de seguretat si sospites que han estat compromesos.",
      subtitle__codelist: "Emmagatzema'ls de manera segura i mantingues-los en secret.",
      successMessage:
        "Ara els codis de seguretat estan activats. Pots utilitzar un d'aquests per iniciar sessió al teu compte, si perds l'accés al teu dispositiu d'autenticació. Cada codi només es pot utilitzar una vegada.",
      successSubtitle:
        "Pots utilitzar un d'aquests per iniciar sessió al teu compte, si perds l'accés al teu dispositiu d'autenticació.",
      title: 'Afegeix verificació amb codi de seguretat',
      title__codelist: 'Codis de seguretat',
    },
    connectedAccountPage: {
      formHint: 'Selecciona un proveïdor per connectar el teu compte.',
      formHint__noAccounts: 'No hi ha proveïdors de comptes externs disponibles.',
      removeResource: {
        messageLine1: "{{identifier}} serà eliminat d'aquest compte.",
        messageLine2:
          'Ja no podràs utilitzar aquest compte connectat i qualsevol funcionalitat dependent deixarà de funcionar.',
        successMessage: '{{connectedAccount}} ha estat eliminat del teu compte.',
        title: 'Elimina compte connectat',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: "El proveïdor s'ha afegit al teu compte",
      title: 'Afegeix compte connectat',
    },
    deletePage: {
      actionDescription: 'Escriu "Elimina compte" a continuació per continuar.',
      confirm: 'Elimina compte',
      messageLine1: 'Estàs segur que vols eliminar el teu compte?',
      messageLine2: 'Aquesta acció és permanent i irreversible.',
      title: 'Elimina compte',
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          "S'enviarà un correu electrònic que conté un codi de verificació a aquesta adreça de correu electrònic.",
        formSubtitle: 'Introdueix el codi de verificació enviat a {{identifier}}',
        formTitle: 'Codi de verificació',
        resendButton: 'No has rebut el codi? Reenvia',
        successMessage: "El correu electrònic {{identifier}} s'ha afegit al teu compte.",
      },
      emailLink: {
        formHint:
          "S'enviarà un correu electrònic que conté un enllaç de verificació a aquesta adreça de correu electrònic.",
        formSubtitle: "Fes clic a l'enllaç de verificació al correu enviat a {{identifier}}",
        formTitle: 'Enllaç de verificació',
        resendButton: "No has rebut l'enllaç? Reenvia",
        successMessage: "El correu electrònic {{identifier}} s'ha afegit al teu compte.",
      },
      removeResource: {
        messageLine1: "{{identifier}} serà eliminat d'aquest compte.",
        messageLine2: 'Ja no podràs iniciar sessió utilitzant aquesta adreça de correu electrònic.',
        successMessage: '{{emailAddress}} ha estat eliminat del teu compte.',
        title: 'Elimina adreça de correu electrònic',
      },
      title: 'Afegeix adreça de correu electrònic',
      verifyTitle: 'Verifica adreça de correu electrònic',
    },
    formButtonPrimary__add: 'Afegeix',
    formButtonPrimary__continue: 'Continua',
    formButtonPrimary__finish: 'Finalitza',
    formButtonPrimary__remove: 'Elimina',
    formButtonPrimary__save: 'Guarda',
    formButtonReset: 'Cancel·la',
    mfaPage: {
      formHint: 'Selecciona un mètode per afegir.',
      title: 'Afegeix verificació en dos passos',
    },
    mfaPhoneCodePage: {
      backButton: 'Utilitza el número existent',
      primaryButton__addPhoneNumber: 'Afegeix número de telèfon',
      removeResource: {
        messageLine1: '{{ identifier }} ja no rebrà codis de verificació quan iniciï sessió.',
        messageLine2: 'El teu compte podria no ser tan segur.Estàs segur que vols continuar ? ',
        successMessage: 'La verificació en dos passos per SMS ha estat eliminada per { { mfaPhoneCode } } ',
        title: 'Elimina la verificació en dos passos',
      },
      subtitle__availablePhoneNumbers:
        'Selecciona un número de telèfon existent per registrar - lo per la verificació en dos passos per SMS o afegeix - ne un de nou.',
      subtitle__unavailablePhoneNumbers:
        'No hi ha números de telèfon disponibles per registrar - los per la verificació en dos passos per SMS, si us plau, afegeix - ne un de nou.',
      successMessage1:
        'Quan iniciïs sessió, necessitaràs introduir un codi de verificació enviat a aquest número de telèfon com un pas addicional.',
      successMessage2:
        "Guarda aquests codis de seguretat i emmagatzema'ls en un lloc segur. Si perds l'accés al teu dispositiu d'autenticació, pots utilitzar els codis de seguretat per iniciar sessió.",
      successTitle: 'La verificació per codi SMS activada',
      title: 'Afegeix verificació per codi SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Escaneja el codi QR en lloc',
        buttonUnableToScan__nonPrimary: 'No pots escanejar el codi QR? ',
        infoText__ableToScan:
          "Configura un nou mètode d'inici de sessió a la teva aplicació d'autenticador i escaneja el següent codi QR per vincular - lo al teu compte.",
        infoText__unableToScan:
          "Configura un nou mètode d'inici de sessió al teu autenticador i introdueix la clau proporcionada a continuació.",
        inputLabel__unableToScan1:
          "Assegura't que els contrasenyes basades en temps o d'ús únic estan habilitats, després finalitza la vinculació del teu compte.",
        inputLabel__unableToScan2:
          "Alternativament, si el teu autenticador suporta URI de TOTP, també pots copiar l'URI completa.",
      },
      removeResource: {
        messageLine1: "Els codis de verificació d'aquest autenticador ja no seran necessaris quan iniciïs sessió.",
        messageLine2: 'El teu compte podria no ser tan segur.Estàs segur que vols continuar? ',
        successMessage: "La verificació en dos passos mitjançant l'aplicació d'autenticació ha estat eliminada.",
        title: 'Elimina la verificació en dos passos',
      },
      successMessage:
        "La verificació en dos passos ara està habilitada.Quan iniciïs sessió, necessitaràs introduir un codi de verificació d'aquest autenticador com un pas addicional.",
      title: "Afegeix aplicació d'autenticació",
      verifySubtitle: 'Introdueix el codi de verificació generat pel teu autenticador',
      verifyTitle: 'Codi de verificació',
    },
    mobileButton__menu: 'Menú',
    navbar: {
      account: 'Perfil',
      description: 'Gestiona la informació del teu compte.',
      security: 'Seguretat',
      title: 'Compte',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Es recomana tancar sessió en tots els altres dispositius que hagin utilitzat la teva contrasenya antiga.',
      readonly:
        "Actualment no pots editar la teva contrasenya perquè pots iniciar sessió només a través de la connexió d'empresa.",
      successMessage__set: 'La teva contrasenya ha estat establerta.',
      successMessage__signOutOfOtherSessions: "S'ha tancat sessió en tots els altres dispositius.",
      successMessage__update: 'La teva contrasenya ha estat actualitzada.',
      title__set: 'Estableix contrasenya',
      title__update: 'Actualitza contrasenya',
    },
    phoneNumberPage: {
      infoText:
        "S'enviarà un missatge de text que conté un codi de verificació a aquest número de telèfon. Poden aplicar-se tarifes de missatges i dades.",
      removeResource: {
        messageLine1: "{ { identifier } } serà eliminat d'aquest compte.",
        messageLine2: 'Ja no podràs iniciar sessió utilitzant aquest número de telèfon.',
        successMessage: '{ { phoneNumber } } ha estat eliminat del teu compte.',
        title: 'Elimina número de telèfon',
      },
      successMessage: "{ { identifier } } s'ha afegit al teu compte.",
      title: 'Afegeix número de telèfon',
      verifySubtitle: 'Introdueix el codi de verificació enviat a { { identifier } } ',
      verifyTitle: 'Verifica número de telèfon',
    },
    profilePage: {
      fileDropAreaHint: 'Mida recomanada 1:1, fins a 10MB.',
      imageFormDestructiveActionSubtitle: 'Elimina',
      imageFormSubtitle: 'Puja',
      imageFormTitle: 'Imatge de perfil',
      readonly: "La informació del teu perfil ha estat proporcionada per la connexió d'empresa i no pot ser editada.",
      successMessage: 'El teu perfil ha estat actualitzat.',
      title: 'Actualitza perfil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Tanca sessió del dispositiu',
        title: 'Dispositius actius',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Torna-ho a intentar',
        actionLabel__reauthorize: 'Autoritza ara',
        destructiveActionTitle: 'Elimina',
        primaryButton: 'Connecta compte',
        subtitle__reauthorize:
          'Els àmbits requerits han estat actualitzats, i podràs estar experimentant funcionalitat limitada. Si us plau, reautoritza aquesta aplicació per evitar qualsevol problema',
        title: 'Comptes connectats',
      },
      dangerSection: {
        deleteAccountButton: 'Elimina compte',
        title: 'Elimina compte',
      },
      emailAddressesSection: {
        destructiveAction: 'Elimina correu electrònic',
        detailsAction__nonPrimary: 'Estableix com a principal',
        detailsAction__primary: 'Completa la verificació',
        detailsAction__unverified: 'Verifica',
        primaryButton: 'Afegeix adreça de correu electrònic',
        title: 'Adreces de correu electrònic',
      },
      enterpriseAccountsSection: {
        title: "Comptes d'empresa",
      },
      headerTitle__account: 'Detalls del perfil',
      headerTitle__security: 'Seguretat',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Regenera',
          headerTitle: 'Codis de seguretat',
          subtitle__regenerate:
            'Obtén un nou conjunt de codis de seguretat segurs. Els codis de seguretat anteriors seran eliminats i no podran ser utilitzats.',
          title__regenerate: 'Regenera codis de seguretat',
        },
        phoneCode: {
          actionLabel__setDefault: 'Estableix com a predeterminat',
          destructiveActionLabel: 'Elimina',
        },
        primaryButton: 'Afegeix verificació en dos passos',
        title: 'Verificació en dos passos',
        totp: {
          destructiveActionTitle: 'Elimina',
          headerTitle: "Aplicació d'autenticació",
        },
      },
      passwordSection: {
        primaryButton__setPassword: 'Estableix contrasenya',
        primaryButton__updatePassword: 'Actualitza contrasenya',
        title: 'Contrasenya',
      },
      phoneNumbersSection: {
        destructiveAction: 'Elimina número de telèfon',
        detailsAction__nonPrimary: 'Estableix com a principal',
        detailsAction__primary: 'Completa la verificació',
        detailsAction__unverified: 'Verifica número de telèfon',
        primaryButton: 'Afegeix número de telèfon',
        title: 'Números de telèfon',
      },
      profileSection: {
        primaryButton: 'Actualitza perfil',
        title: 'Perfil',
      },
      usernameSection: {
        primaryButton__setUsername: "Estableix nom d'usuari",
        primaryButton__updateUsername: "Actualitza nom d'usuari",
        title: "Nom d'usuari",
      },
      web3WalletsSection: {
        destructiveAction: 'Elimina cartera',
        primaryButton: 'Carteres Web3',
        title: 'Carteres Web3',
      },
    },
    usernamePage: {
      successMessage: "El teu nom d'usuari ha estat actualitzat.",
      title__set: "Estableix nom d'usuari",
      title__update: "Actualitza nom d'usuari",
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: "{{identifier}} serà eliminat d'aquest compte.",
        messageLine2: 'Ja no podràs iniciar sessió utilitzant aquesta cartera Web3.',
        successMessage: '{{web3Wallet}} ha estat eliminada del teu compte.',
        title: 'Elimina cartera Web3',
      },
      subtitle__availableWallets: 'Selecciona una cartera Web3 per connectar al teu compte.',
      subtitle__unavailableWallets: 'No hi ha carteres Web3 disponibles.',
      successMessage: 'La cartera ha estat afegida al teu compte.',
      title: 'Afegeix cartera Web3',
    },
  },
} as const;
