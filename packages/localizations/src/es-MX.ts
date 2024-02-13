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

export const esMX: LocalizationResource = {
  locale: 'es-MX',
  backButton: 'Atrás',
  badge__default: 'Por defecto',
  badge__otherImpersonatorDevice: 'Otro dispositivo de imitación',
  badge__primary: 'Primario',
  badge__requiresAction: 'Requiere acción',
  badge__thisDevice: 'Este dispositivo',
  badge__unverified: 'No confirmado',
  badge__userDevice: 'Dispositivo de usuario',
  badge__you: 'Usted',
  createOrganization: {
    formButtonSubmit: 'Crear organización',
    invitePage: {
      formButtonReset: 'Saltar',
    },
    title: 'Crear organización',
  },
  dates: {
    lastDay: "Ayer a las {{ date | timeString('es-ES') }}",
    next6Days: "{{ date | weekday('es-ES','long') }} a las {{ date | timeString('es-ES') }}",
    nextDay: "Mañana a las {{ date | timeString('es-ES') }}",
    numeric: "{{ date | numeric('es-ES') }}",
    previous6Days: "Último {{ date | weekday('es-ES','long') }} en {{ date | timeString('es-ES') }}",
    sameDay: "Hoy a las {{ date | timeString('es-ES') }}",
  },
  dividerText: 'o',
  footerActionLink__useAnotherMethod: 'Usar otro método',
  footerPageLink__help: 'Ayuda',
  footerPageLink__privacy: 'Privacidad',
  footerPageLink__terms: 'Términos',
  formButtonPrimary: 'Continuar',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Has olvidado tu contraseña?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Opcional',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Ingrese o pegue una o más direcciones de correo electrónico, separadas por espacios o comas',
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
  formFieldLabel__backupCode: 'Código de respaldo',
  formFieldLabel__confirmDeletion: 'Confirmarción',
  formFieldLabel__confirmPassword: 'Confirme la contraseña',
  formFieldLabel__currentPassword: 'Contraseña actual',
  formFieldLabel__emailAddress: 'Correo electrónico',
  formFieldLabel__emailAddress_username: 'Correo electrónico o nombre de usuario',
  formFieldLabel__emailAddresses: 'Direcciones de correo',
  formFieldLabel__firstName: 'Nombre',
  formFieldLabel__lastName: 'Apellidos',
  formFieldLabel__newPassword: 'Nueva contraseña',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Nombre de la Organización',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__password: 'Contraseña',
  formFieldLabel__phoneNumber: 'Número telefónico',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Cerrar sesión en todos los demás dispositivos',
  formFieldLabel__username: 'Nombre de usuario',
  impersonationFab: {
    action__signOut: 'Cerrar',
    title: 'Registrado como {{identifier}}',
  },
  membershipRole__admin: 'Administrador',
  membershipRole__basicMember: 'Miembro',
  membershipRole__guestMember: 'Invitado',
  organizationList: {
    action__createOrganization: 'Crear organización',
    action__invitationAccept: 'Unirse',
    action__suggestionsAccept: 'Pedir unirse',
    createOrganization: 'Crear Organización',
    invitationAcceptedLabel: 'Unido',
    subtitle: 'Para continuar con {{applicationName}}',
    suggestionsAcceptedLabel: 'Aprobación pendiente',
    title: 'Elige una cuenta',
    titleWithoutPersonal: 'Elige una organización',
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
        'No se pudieron enviar las invitaciones. Solucione lo siguiente y vuelva a intentarlo:',
      formButtonPrimary__continue: 'Enviar invitaciones',
      selectDropdown__role: 'Select role',
      subtitle: 'Invitar nuevos miembros a esta organización',
      successMessage: 'Invitaciones enviadas con éxito',
      title: 'Invitar miembros',
    },
    membersPage: {
      action__invite: 'Invitar',
      activeMembersTab: {
        menuAction__remove: 'Eliminar miembro',
        tableHeader__actions: '',
        tableHeader__joined: 'Se unió',
        tableHeader__role: 'Rol',
        tableHeader__user: 'Usuario',
      },
      detailsTitle__emptyRow: 'No hay miembros para mostrar',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        manualInvitations: {
          headerSubtitle: 'Invita manualmente a miembros y gestiona invitaciones existentes.',
          headerTitle: 'Invitación individual',
        },
        table__emptyRow: 'No hay invitaciones para mostrar',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revocar invitación',
        tableHeader__invited: 'Invitado',
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
        requests: {
          headerSubtitle: 'Browse and manage users who requested to join the organization.',
          headerTitle: 'Requests',
        },
        tableHeader__requested: 'Requested access',
        table__emptyRow: 'No requests to display',
      },
      start: {
        headerTitle__invitations: 'Invitaciones',
        headerTitle__members: 'Miembros',
        headerTitle__requests: 'Solicitudes',
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
          actionDescription: 'Escribe "{{organizationName}}" a continuación para continuar.',
          messageLine1: '¿Estas seguro que quieres eliminar esta organización?',
          messageLine2: 'Esta acción es permanente e irreversible.',
          successMessage: 'Haz eliminado la organización.',
          title: 'Eliminar la organización',
        },
        leaveOrganization: {
          actionDescription: 'Escribe "{{organizationName}}" a continuación para continuar.',
          messageLine1:
            '¿Está seguro de que desea abandonar esta organización? Perderá el acceso a esta organización y sus aplicaciones.',
          messageLine2: 'Esta acción es permanente e irreversible.',
          successMessage: 'Has dejado la organización.',
          title: 'Abandonar la organización',
        },
        title: 'Peligro',
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
      successMessage: 'La organización ha sido actualizada.',
      title: 'Perfil de la organización',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Miembros',
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
        formButton__save: 'Save',
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
    action__createOrganization: 'Crear Organización',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Administrar Organización',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Ninguna organización seleccionada',
    personalWorkspace: 'Cuenta personal',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Próximo',
  paginationButton__previous: 'Previo',
  paginationRowText__displaying: 'Mostrando',
  paginationRowText__of: 'de',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Consigue ayuda',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Usa un código de respaldo',
      blockButton__emailCode: 'Enviar código a{{identifier}}',
      blockButton__emailLink: 'Enviar enlace a{{identifier}}',
      blockButton__password: 'Entra con tu contraseña',
      blockButton__phoneCode: 'Enviar código a{{identifier}}',
      blockButton__totp: 'Usa tu aplicación de autenticación',
      getHelp: {
        blockButton__emailSupport: 'Soporte de correo electrónico',
        content:
          'Si tiene dificultades para iniciar sesión en su cuenta, envíenos un correo electrónico y trabajaremos con usted para restablecer el acceso lo antes posible.',
        title: 'Consigue ayuda',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Usa otro método',
    },
    backupCodeMfa: {
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Introduce un código de seguridad',
    },
    emailCode: {
      formTitle: 'Código de verificación',
      resendButton: 'Re-enviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Revise su correo electrónico',
    },
    emailLink: {
      expired: {
        subtitle: 'Regrese a la pestaña original para continuar.',
        title: 'Este enlace de verificación ha expirado',
      },
      failed: {
        subtitle: 'Regrese a la pestaña original para continuar.',
        title: 'Este enlace de verificación es invalido',
      },
      formSubtitle: 'Utilice el enlace de verificación enviado a su correo electrónico',
      formTitle: 'Enlace de verificación',
      loading: {
        subtitle: 'Serás redirigido pronto',
        title: 'Iniciando sesión...',
      },
      resendButton: 'Reenviar enlace',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Revise su correo electrónico',
      unusedTab: {
        title: 'Puede cerrar esta pestaña',
      },
      verified: {
        subtitle: 'Serás redirigido pronto',
        title: 'Inició sesión con éxito',
      },
      verifiedSwitchTab: {
        subtitle: 'Regrese a la pestaña original para continuar',
        subtitleNewTab: 'Regrese a la pestaña recién abierta para continuar',
        titleNewTab: 'Inició sesión en otra pestaña',
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
      message: 'No se puede continuar con el inicio de sesión. No hay ningún factor de autenticación disponible.',
      subtitle: 'Ocurrió un error',
      title: 'No puedo iniciar sesión',
    },
    password: {
      actionLink: 'Use otro método',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Introduzca su contraseña',
    },
    phoneCode: {
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar con {{applicationName}}',
      title: 'Revisa tu teléfono',
    },
    phoneCodeMfa: {
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar con {{applicationName}}',
      title: 'Revisa tu teléfono',
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
      actionLink: 'Regístrese',
      actionLink__use_email: 'Use email',
      actionLink__use_email_username: 'Use email or username',
      actionLink__use_phone: 'Use phone',
      actionLink__use_username: 'Use username',
      actionText: '¿No tiene cuenta?',
      subtitle: 'para continuar con {{applicationName}}',
      title: 'Iniciar sesión',
    },
    totpMfa: {
      formTitle: 'Código de verificación',
      subtitle: 'To continue, please enter the verification code generated by your authenticator app',
      title: 'Verificación de dos pasos',
    },
  },
  signInEnterPasswordTitle: 'Ingresa tu contraseña',
  signUp: {
    continue: {
      actionLink: 'Entrar',
      actionText: '¿Tiene una cuenta?',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Rellene los campos que faltan',
    },
    emailCode: {
      formSubtitle: 'Introduzca el código de verificación enviado a su correo electrónico',
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Verifique su correo electrónico',
    },
    emailLink: {
      formSubtitle: 'Utilice el enlace de verificación enviado a su dirección de correo electrónico',
      formTitle: 'Enlace de verificación',
      loading: {
        title: 'Registrando...',
      },
      resendButton: 'Reenviar enlace',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Verifica tu correo electrónico',
      verified: {
        title: 'Registrado con éxito',
      },
      verifiedSwitchTab: {
        subtitle: 'Regrese a la pestaña recién abierta para continuar',
        subtitleNewTab: 'Volver a la pestaña anterior para continuar',
        title: 'Correo electrónico verificado con éxito',
      },
    },
    phoneCode: {
      formSubtitle: 'Introduzca el código de verificación enviado a su número de teléfono.',
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Verifique su teléfono',
    },
    start: {
      actionLink: 'Acceder',
      actionText: '¿Tienes una cuenta?',
      subtitle: 'para continuar con {{applicationName}}',
      title: 'Crea tu cuenta',
    },
  },
  socialButtonsBlockButton: 'Continuar con {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_not_found: 'No encontrado, puede estar mal escrito.',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'La dirección del correo electronico debe ser valida.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Your password is not strong enough.',
    form_password_pwned:
      'Esta contraseña se encontró como parte de una infracción y no se puede usar; pruebe con otra contraseña.',
    form_password_size_in_bytes_exceeded:
      'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
    form_password_validation_failed: 'Incorrect Password',
    form_username_invalid_character: 'Caracter invalido.',
    form_username_invalid_length: 'Longitud de usuario muy corta.',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    passwordComplexity: {
      maximumLength: 'less than {{length}} characters',
      minimumLength: '{{length}} o mas caracteres',
      requireLowercase: 'al menos una letra minuscula',
      requireNumbers: 'almenos un numero',
      requireSpecialCharacter: 'al menos un caracter especial',
      requireUppercase: 'al menos una letra mayuscula',
      sentencePrefix: 'Tu contraseña debe contener',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger: 'Your password works, but could be stronger. Try adding more characters.',
      goodPassword: 'Your password meets all the necessary requirements.',
      notEnough: 'Tu contraseña no es lo suficientemente segura.',
      suggestions: {
        allUppercase: 'Escribe en mayúsculas algunas, pero no todas las letras.',
        anotherWord: 'Añade más palabras que sean menos comunes.',
        associatedYears: 'Evita años asociados contigo.',
        capitalization: 'Escribe en mayúsculas alguna letra más además de la primera.',
        dates: 'Evita fechas que estén asociadas contigo.',
        l33t: "Evita sustituciones predecibles como '@' por 'a'",
        longerKeyboardPattern: 'Usa patrones de teclado más largos y cambia la dirección de escritura varias veces.',
        noNeed: 'Puedes crear contraseñas seguras sin usar símbolos, números o mayúsculas.',
        pwned: 'Si utiliza esta contraseña en otro lugar, debería cambiarla.',
        recentYears: 'Evita años recientes.',
        repeated: 'Evitas palabras y letras repetidas.',
        reverseWords: 'Evita palabras comunes escritas al revés',
        sequences: 'Evita secuencias de letras comunes.',
        useWords: 'Usa varias palabras, pero evita frases comunes.',
      },
      warnings: {
        common: 'Es una contraseña usada comúnmente.',
        commonNames: 'Nombre y apellidos comunes son fáciles de adivinar.',
        dates: 'Las fechas son fáciles de adivinar.',
        extendedRepeat: 'Patrones repetidos como "abcabcabc" son fáciles de adivinar.',
        keyPattern: 'Patrones cortos son fáciles de adivinar.',
        namesByThemselves: 'Nombres o apellidos a solas son fáciles de adivinar.',
        pwned: 'Su contraseña fue expuesta por una violación de datos en Internet.',
        recentYears: 'Los años recientes son fáciles de adivinar.',
        sequences: 'Patrones comunes como "abc" son fáciles de adivinar',
        similarToCommon: 'Es similar a una contraseña usada habitualmente.',
        simpleRepeat: 'Caracteres repetidos como "aaa" son fáciles de adivinar',
        straightRow: 'Teclas consecutivas en tu teclado son fáciles de adivinar.',
        topHundred: 'Es una contraseña usada con mucha frecuencia.',
        topTen: 'Es de las contraseñas más usadas.',
        userInputs: 'No debería haber datos personales o relacionados con esta página.',
        wordByItself: 'Palabras únicas son fáciles de adivinar.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Añadir cuenta',
    action__manageAccount: 'Administrar cuenta',
    action__signOut: 'Cerrar sesión',
    action__signOutAll: 'Salir de todas las cuentas',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copiado!',
      actionLabel__copy: 'Copiar todo',
      actionLabel__download: 'Descargar .txt',
      actionLabel__print: 'Imprimir',
      infoText1: 'Se habilitarán códigos de respaldo para esta cuenta.',
      infoText2:
        'Mantenga los códigos de respaldo en secreto y guárdelos de forma segura. Puede regenerar códigos de respaldo si sospecha que se han visto comprometidos.',
      subtitle__codelist: 'Guardelos de forma segura y manténgalos en secreto.',
      successMessage:
        'Los códigos de respaldo ahora están habilitados. Puede usar uno de estos para iniciar sesión en su cuenta, si pierde el acceso a su dispositivo de autenticación. Cada código solo se puede utilizar una vez.',
      successSubtitle:
        'Puede usar uno de estos para iniciar sesión en su cuenta, si pierde el acceso a su dispositivo de autenticación.',
      title: 'Agregar verificación de código de respaldo',
      title__codelist: 'Códigos de respaldo',
    },
    connectedAccountPage: {
      formHint: 'Seleccione un proveedor para conectar su cuenta.',
      formHint__noAccounts: 'No hay proveedores de cuentas externas disponibles.',
      removeResource: {
        messageLine1: '{{identifier}} será eliminado de esta cuenta.',
        messageLine2: 'Ya no podrá usar esta cuenta activa y las funciones dependientes ya no funcionarán.',
        successMessage: '{{connectedAccount}} ha sido eliminado de su cuenta.',
        title: 'Eliminar cuenta conectada',
      },
      socialButtonsBlockButton: 'Conectar cuenta de {{provider|titleize}}',
      successMessage: 'El proveedor ha sido agregado a su cuenta',
      title: 'Agregar cuenta conectada',
    },
    deletePage: {
      actionDescription: 'Escribe "Delete account" a continuación para continuar',
      confirm: 'Eliminar cuenta',
      messageLine1: '¿Estas seguro que quieres eliminar tu cuenta?',
      messageLine2: 'Esta acción es permanente e irreversible.',
      title: 'Eliminar cuenta',
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          'A esta dirección de correo electrónico se le enviará un correo electrónico con un Código de verificación.',
        formSubtitle: 'Introduzca el código de verificación enviado a {{identifier}}',
        formTitle: 'Código de verificación',
        resendButton: 'Re-enviar código',
        successMessage: 'El correo electrónico {{identifier}} se ha agregado a su cuenta.',
      },
      emailLink: {
        formHint:
          'Se enviará un correo electrónico con un enlace de verificación a esta dirección de correo electrónico.',
        formSubtitle: 'Haga clic en el enlace de verificación en el correo electrónico enviado a {{identifier}}',
        formTitle: 'Enlace de verificación',
        resendButton: 'Reenviar enlace',
        successMessage: 'El correo electrónico {{identifier}} se ha agregado a su cuenta.',
      },
      removeResource: {
        messageLine1: '{{identifier}} será eliminado de esta cuenta.',
        messageLine2: 'Ya no podrá iniciar sesión con esta dirección de correo electrónico.',
        successMessage: '{{emailAddress}} ha sido eliminado de su cuenta.',
        title: 'Eliminar dirección de correo electrónico',
      },
      title: 'Agregar dirección de correo electrónico',
    },
    formButtonPrimary__continue: 'Continuar',
    formButtonPrimary__finish: 'Terminar',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Cancelar',
    mfaPage: {
      formHint: 'Seleccione un método para agregar.',
      title: 'Agregar verificación en dos pasos',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Agregar un número de teléfono',
      removeResource: {
        messageLine1: '{{identifier}} dejará de recibir el Código de verificación al iniciar sesión.',
        messageLine2: 'Es posible que su cuenta no sea tan segura. ¿Estás seguro de que quieres continuar?',
        successMessage: 'Se eliminó la verificación de dos pasos del código SMS para {{mfaPhoneCode}}',
        title: 'Eliminar la verificación en dos pasos',
      },
      subtitle__availablePhoneNumbers:
        'Seleccione un número de teléfono para registrarse para la verificación en dos pasos del código SMS.',
      subtitle__unavailablePhoneNumbers:
        'No hay números de teléfono disponibles para registrarse para la verificación en dos pasos del código SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Agregar verificación de código SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Escanea el código QR en su lugar',
        buttonUnableToScan__nonPrimary: '¿No puedes escanear el código QR?',
        infoText__ableToScan:
          'Configure un nuevo método de inicio de sesión en su aplicación de autenticación y escanee el siguiente código QR para vincularlo a su cuenta.',
        infoText__unableToScan:
          'Configure un nuevo método de inicio de sesión en su autenticador e ingrese la clave que se proporciona a continuación.',
        inputLabel__unableToScan1:
          'Asegúrese de que las contraseñas basadas en el tiempo o de un solo uso estén habilitadas, luego termine de vincular su cuenta.',
        inputLabel__unableToScan2:
          'Alternativamente, si su autenticador admite TOTP URIs, también puede copiar el URI completo.',
      },
      removeResource: {
        messageLine1: 'El código de verificación de este autenticador ya no será necesario al iniciar sesión.',
        messageLine2: 'Es posible que su cuenta no sea tan segura. ¿Estás seguro de que quieres continuar?',
        successMessage: 'Se eliminó la verificación en dos pasos a través de la aplicación de autenticación.',
        title: 'Eliminar la verificación en dos pasos',
      },
      successMessage:
        'La verificación en dos pasos ahora está habilitada. Al iniciar sesión, deberá ingresar un Código de verificación de este autenticador como un paso adicional.',
      title: 'Agregar aplicación de autenticación',
      verifySubtitle: 'Ingrese el Código de verificación generado por su autenticador',
      verifyTitle: 'Código de verificación',
    },
    mobileButton__menu: 'Menú',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      changePasswordSuccessMessage: 'Tu contraseña ha sido actualizada.',
      changePasswordTitle: 'Cambiar contraseña',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      sessionsSignedOutSuccessMessage: 'Todos los demás dispositivos han cerrado sesión.',
      successMessage: 'Su contraseña ha sido establecida.',
      title: 'Configurar la clave',
    },
    phoneNumberPage: {
      infoText: 'Se enviará un mensaje de texto con un enlace de verificación a este número de teléfono.',
      removeResource: {
        messageLine1: '{{identifier}} será eliminado de esta cuenta.',
        messageLine2: 'Ya no podrá iniciar sesión con este número de teléfono.',
        successMessage: '{{phoneNumber}} ha sido eliminado de su cuenta.',
        title: 'Eliminar número de teléfono',
      },
      successMessage: '{{identifier}} ha sido añadido a tu cuenta.',
      title: 'Agregar el número de teléfono',
    },
    profilePage: {
      fileDropAreaHint: 'Cargue una imagen JPG, PNG, GIF o WEBP de menos de 10 MB',
      imageFormDestructiveActionSubtitle: 'Eliminar la imagen',
      imageFormSubtitle: 'Cargar imagen',
      imageFormTitle: 'Imagen de perfil',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Tu perfil ha sido actualizado.',
      title: 'Actualizar Cuenta',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Cerrar sesión en el dispositivo',
        title: 'Dispositivos activos',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Inténtelo nuevamente',
        actionLabel__reauthorize: 'Authorize now',
        destructiveActionTitle: 'Quitar',
        primaryButton: 'Conectar cuenta',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Cuentas conectadas',
      },
      dangerSection: {
        deleteAccountButton: 'Eliminar cuenta',
        title: 'Peligro',
      },
      emailAddressesSection: {
        destructiveAction: 'Eliminar dirección de correo electrónico',
        detailsAction__nonPrimary: 'Establecer como primario',
        detailsAction__primary: 'Completar la verificación',
        detailsAction__unverified: 'Completar la verificación',
        primaryButton: 'Agregar una dirección de correo electrónico',
        title: 'Correos electrónicos',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Cuenta',
      headerTitle__security: 'Seguridad',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Regenerar códigos',
          headerTitle: 'Códigos de respaldo',
          subtitle__regenerate:
            'Obtenga un nuevo conjunto de códigos de respaldo seguros. Los códigos de respaldo anteriores se eliminarán y no podrán ser usados.',
          title__regenerate: 'Regenerar códigos de respaldo',
        },
        phoneCode: {
          actionLabel__setDefault: 'Establecer por defecto',
          destructiveActionLabel: 'Eliminar número telefónico',
        },
        primaryButton: 'Añadir verificación de dos pasos',
        title: 'Verificación de dos pasos',
        totp: {
          destructiveActionTitle: 'Eliminar',
          headerTitle: 'Aplicación de autenticación',
        },
      },
      passwordSection: {
        primaryButton__changePassword: 'Cambiar contraseña',
        primaryButton__setPassword: 'Establecer contraseña ',
        title: 'Contraseña',
      },
      phoneNumbersSection: {
        destructiveAction: 'Quitar número de teléfono',
        detailsAction__nonPrimary: 'Establecer como primario',
        detailsAction__primary: 'Completar la verificación',
        detailsAction__unverified: 'Completar la verificación',
        primaryButton: 'Agregar un número de teléfono',
        title: 'Números telefónicos',
      },
      profileSection: {
        primaryButton: 'Edit Profile',
        title: 'Perfil',
      },
      usernameSection: {
        primaryButton__changeUsername: 'Cambiar nombre de usuario',
        primaryButton__setUsername: 'Crear nombre de usuario',
        title: 'Nombre de usuario',
      },
      web3WalletsSection: {
        destructiveAction: 'Quitar cartera',
        primaryButton: 'Web3 cartera',
        title: 'Web3 cartera',
      },
    },
    usernamePage: {
      successMessage: 'Su nombre de usuario ha sido actualizado.',
      title: 'Actualizar nombre de usuario',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} será eliminado de esta cuenta.',
        messageLine2: 'Ya no podrá iniciar sesión con esta billetera web3.',
        successMessage: '{{web3Wallet}} ha sido eliminado de su cuenta.',
        title: 'Eliminar la billetera web3',
      },
      subtitle__availableWallets: 'Seleccione una billetera web3 para conectarse a su cuenta.',
      subtitle__unavailableWallets: 'No hay billetera web3 disponibles.',
      successMessage: 'La billetera ha sido agregada a su cuenta.',
      title: 'Añadir web3 billetera',
    },
  },
} as const;
