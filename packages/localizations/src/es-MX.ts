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
  formButtonPrimary__verify: 'Verificar',
  formFieldAction__forgotPassword: 'Has olvidado tu contraseña?',
  formFieldError__matchingPasswords: 'Las contraseñas coinciden.',
  formFieldError__notMatchingPasswords: "Las no contraseñas coinciden.",
  formFieldError__verificationLinkExpired: 'El link de verificación expiro. Porfavor vuelva a solicitarlo.',
  formFieldHintText__optional: 'Opcional',
  formFieldHintText__slug: 'Un slug es una identificación legible por humanos que debe ser única. Se utiliza a menudo en URL.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Eliminar cuenta',
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
  formFieldLabel__automaticInvitations: 'Activar invitaciones automaticas para este dominio',
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
  formFieldLabel__organizationDomainDeletePending: 'Eliminar invitaciones y sugerencias pendientes',
  formFieldLabel__organizationDomainEmailAddress: 'Verificación de correo',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Entrar una dirección de correo electrónico bajo este dominio para recibir un código y verificarlo.',
  formFieldLabel__organizationName: 'Nombre de la Organización',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Contraseña',
  formFieldLabel__phoneNumber: 'Número telefónico',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Cerrar sesión en todos los demás dispositivos',
  formFieldLabel__username: 'Nombre de usuario',
  impersonationFab: {
    action__signOut: 'Cerrar',
    title: 'Registrado como {{identifier}}',
  },
  maintenanceMode: undefined,
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
    badge__automaticInvitation: 'Invitaciones automaticas',
    badge__automaticSuggestion: 'Sugerencias automaticas',
    badge__manualInvitation: 'Sin inscripciónes automaticas',
    badge__unverified: 'No verificado',
    createDomainPage: {
      subtitle:
        'Añada el email para verificar. Los usuarios con direcciones de correo electrónico en este dominio pueden unirse a la organización aquí o pedir unirse.',
      title: 'Anadir dominio',
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
            'Invita usuarios conectando un dominio de correo electrónico con su organización. Cualquiera que se registre con un dominio de correo electrónico coincidente podrá unirse a la organización en cualquier momento.',
          headerTitle: 'Invitaciones automaticas',
          primaryButton: 'Gestionar dominios verificados',
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
            'Los usuarios que inicien sesión con un dominio de correo electrónico coincidente podrán ver una sugerencia para solicitar unirse a su organización.',
          headerTitle: 'Sugerencias automaticas',
          primaryButton: 'Gestionar dominios verificados',
        },
        menuAction__approve: 'Aprobado',
        menuAction__reject: 'Rechazado',
        tableHeader__requested: 'Acceso solicitado',
        table__emptyRow: 'No hay solicitudes para mostrar',
      },
      start: {
        headerTitle__invitations: 'Invitaciones',
        headerTitle__members: 'Miembros',
        headerTitle__requests: 'Solicitudes',
      },
    },
    navbar: {
      description: 'Gestiona tu organización.',
      general: 'General',
      members: 'Miembros',
      title: 'Organización',
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
        menuAction__manage: 'Gestionar',
        menuAction__remove: 'Eliminar',
        menuAction__verify: 'Verificar',
        primaryButton: 'Añadir dominio',
        subtitle:
          'Permite a los usuarios conectarse automaticamente o solicitar unirse a la organización basado en un dominio de correo electrónico verificado.',
        title: 'Verified domains',
      },
      successMessage: 'La organización ha sido actualizada.',
      title: 'Perfil de la organización',
    },
    removeDomainPage: {
      messageLine1: 'Se eliminará el dominio de correo electrónico {{domain}}.',
      messageLine2: 'Los usuarios no podrán unirse a la organización de manera automática una vez que se haya eliminado.',
      successMessage: '{{domain}} se ha eliminado.',
      title: 'Eliminar dominio',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Miembros',
      profileSection: {
        primaryButton: 'Actualizar perfil',
        title: 'Perfil de la organización',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Eliminar este dominio afectará a los usuarios invitados.',
        removeDomainActionLabel__remove: 'Eliminar dominio',
        removeDomainSubtitle: 'Eliminar este dominio de los dominios verificados',
        removeDomainTitle: 'Eliminar dominio',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Los usuarios se unen automáticamente a la organización cuando se registran y pueden unirse en cualquier momento.',
        automaticInvitationOption__label: 'Invitaciones automáticas',
        automaticSuggestionOption__description:
          'Los usuarios reciben una sugerencia para solicitar unirse, pero deben ser aprobados por un administrador antes de poder unirse a la organización.',
        automaticSuggestionOption__label: 'Sugerencias automáticas',
        calloutInfoLabel: 'Cambiar el modo de inscripción solo afectará a los nuevos usuarios.',
        calloutInvitationCountLabel: 'Invitaciones pendientes enviadas a usuarios: {{count}}',
        calloutSuggestionCountLabel: 'Sugerencias pendientes enviadas a usuarios: {{count}}',
        manualInvitationOption__description: 'Los usuarios solo pueden ser invitados manualmente a la organización.',
        manualInvitationOption__label: 'Sin inscripción automática',
        subtitle: 'Seleccione cómo los usuarios de este dominio pueden unirse a la organización.',
      },
      start: {
        headerTitle__danger: 'Peligro',
        headerTitle__enrollment: 'Opciones de inscripción',
      },
      subtitle: 'El dominio {{domain}} ahora está verificado. Continúa seleccionando el modo de inscripción.',
      title: 'Actualizar {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Introduce el código de verificación enviado a su dirección de correo electrónico',
      formTitle: 'Código de verificación',
      resendButton: "No recibiste un código? Reenviar",
      subtitle: 'El dominio {{domainName}} necesita ser verificado vía correo electrónico.',
      subtitleVerificationCodeScreen: 'Se envió un código de verificación a {{emailAddress}}. Introduzca el código para continuar.',
      title: 'Verificar dominio',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Crear Organización',
    action__invitationAccept: 'Unirse',
    action__manageOrganization: 'Administrar Organización',
    action__suggestionsAccept: 'Solicitar unirse',
    notSelected: 'Ninguna organización seleccionada',
    personalWorkspace: 'Espacio personal',
    suggestionsAcceptedLabel: 'Pendiente de aprobación',
  },
  paginationButton__next: 'Siguiente',
  paginationButton__previous: 'Anterior',
  paginationRowText__displaying: 'Mostrando',
  paginationRowText__of: 'de',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Agregar cuenta',
      action__signOutAll: 'Cerrar sesión de todas las cuentas',
      subtitle: 'Seleccione la cuenta con la que desea continuar.',
      title: 'Elija una cuenta',
    },
    alternativeMethods: {
      actionLink: 'Obtener ayuda',
      actionText: '¿No tienes ninguno de estos?',
      blockButton__backupCode: 'Usa un código de respaldo',
      blockButton__emailCode: 'Enviar código a{{identifier}}',
      blockButton__emailLink: 'Enviar enlace a{{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Inicia sesión con tu contraseña',
      blockButton__phoneCode: 'Enviar código a{{identifier}}',
      blockButton__totp: 'Usa tu aplicación de autenticación',
      getHelp: {
        blockButton__emailSupport: 'Soporte de correo electrónico',
        content:
          'Si tiene problemas para ingresar a su cuenta, envíenos un correo electrónico y trabajaremos con usted para restablecer el acceso lo antes posible.',
        title: 'Obtener ayuda',
      },
      subtitle: 'Si está experimentando problemas, puede utilizar uno de estos métodos para ingresar.',
      title: 'Utiliza otro método',
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
        subtitle: 'Regresa a la pestaña original para continuar.',
        title: 'Este enlace de verificación ha expirado',
      },
      failed: {
        subtitle: 'Regresa a la pestaña original para continuar.',
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
      formTitle: 'Código para restablecer la contraseña',
      resendButton: "No recibiste un código? Reenviar",
      subtitle: 'para restablecer tu contraseña',
      subtitle_email: 'Primero, introduce el código enviado a tu {{email}}',
      subtitle_phone: 'Primero, introduce el código enviado a tu {{phone}}',
      title: 'Restablecer contraseña',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Restablecer tu contraseña',
      label__alternativeMethods: 'O, inicia sesión con otro método',
      title: '¿Olvidaste tu contraseña?',
    },

    noAvailableMethods: {
      message: 'No se puede continuar con el inicio de sesión. No hay ningún factor de autenticación disponible.',
      subtitle: 'Ocurrió un error',
      title: 'No puedo iniciar sesión',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Use otro método',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Introduzca su contraseña',
    },
    passwordPwned: {
      title: undefined,
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
      formButtonPrimary: 'Restablecer contraseña',
      requiredMessage: 'Por razones de seguridad, es necesario restablecer su contraseña.',
      successMessage: 'Tu contraseña se ha cambiado correctamente. Te estamos redirigiendo, por favor espera un momento.',
      title: 'Establecer nueva contraseña',
    },
    resetPasswordMfa: {
      detailsLabel: 'Es necesario verificar su identidad para restablecer su contraseña.',
    },
    start: {
      actionLink: 'Registrarse',
      actionLink__use_email: 'Utilizar correo electrónico',
      actionLink__use_email_username: 'Utilizar correo electrónico o nombre de usuario',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Utilizar teléfono',
      actionLink__use_username: 'Utilizar nombre de usuario',
      actionText: '¿No tiene cuenta?',
      subtitle: 'para continuar con {{applicationName}}',
      title: 'Iniciar sesión',
    },
    totpMfa: {
      formTitle: 'Código de verificación',
      subtitle: 'Para continuar, por favor introduce el código generado por tu aplicación de autenticación',
      title: 'Verificación de dos factores',
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
      'El registro falló debido a fallos en la validación de seguridad. Por favor, recargue la página o contáctenos para obtener más asistencia.',
    captcha_unavailable:
      'El registro falló debido a fallos en la validación de bot. Por favor, recargue la página o contáctenos para obtener más asistencia.',
    form_code_incorrect: 'Código incorrecto.',
    form_identifier_exists: 'Este identificador ya existe.',
    form_identifier_exists__email_address: 'La dirección de correo ya existe.',
    form_identifier_exists__phone_number: 'El número de teléfono ya existe.',
    form_identifier_exists__username: 'El nombre de usuario ya existe.',
    form_identifier_not_found: 'No se encontró, puede estar mal escrito.',
    form_param_format_invalid: 'Formato inválido.',
    form_param_format_invalid__email_address: 'La dirección de correo debe ser válida.',
    form_param_format_invalid__phone_number: 'El número de teléfono debe ser en un formato válido internacional.',
    form_param_max_length_exceeded__first_name: 'El nombre debe tener menos de 256 caracteres.',
    form_param_max_length_exceeded__last_name: 'El apellido debe tener menos de 256 caracteres.',
    form_param_max_length_exceeded__name: 'El nombre debe tener menos de 256 caracteres.',
    form_param_nil: 'Campo vacío.',
    form_password_incorrect: 'Contraseña incorrecta.',
    form_password_length_too_short: 'La contraseña es muy corta.',
    form_password_not_strong_enough: 'La contraseña no es suficientemente segura.',
    form_password_pwned:
      'Esta contraseña se encontró como parte de una infracción y no se puede usar; pruebe con otra contraseña.',
    form_password_pwned__sign_in: 'La contraseña es muy insegura.',
    form_password_size_in_bytes_exceeded:
      'La contraseña excede el número máximo de bytes permitidos. Por favor, elimine algunos caracteres especiales o reduzca la longitud de la contraseña.',
    form_password_validation_failed: 'Contraseña incorrecta',
    form_username_invalid_character: 'Carácter inválido.',
    form_username_invalid_length: 'La longitud del nombre de usuario es demasiado corta.',
    identification_deletion_failed: 'No se puede eliminar la última identificación.',
    not_allowed_access: 'No tienes permiso para acceder a este recurso.',
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: 'menos de {{length}} caracteres',
      minimumLength: '{{length}} o más caracteres',
      requireLowercase: 'al menos una letra minúscula',
      requireNumbers: 'al menos un número',
      requireSpecialCharacter: 'al menos un caracter especial',
      requireUppercase: 'al menos una letra mayúscula',
      sentencePrefix: 'Tu contraseña debe contener',
    },
    phone_number_exists: 'Este número de teléfono ya está en uso. Por favor, trata con otro.',
    zxcvbn: {
      couldBeStronger: 'Tu contraseña funciona, pero puede ser más segura. Prueba añadiendo más caracteres.',
      goodPassword: 'Tu contraseña cumple con todos los requisitos necesarios.',
      notEnough: 'Tu contraseña no es lo suficientemente segura.',
      suggestions: {
        allUppercase: 'Escribe algunas letras en mayúsculas, pero no todas.',
        anotherWord: 'Añade palabras menos comunes.',
        associatedYears: 'Evita años asociados contigo.',
        capitalization: 'Escribe algunas letras en mayúsculas además de la primera.',
        dates: 'Evita fechas asociadas contigo.',
        l33t: "Evita sustituciones predecibles como '@' por 'a'",
        longerKeyboardPattern: 'Usa patrones de teclado más largos y cambia la dirección de escritura varias veces.',
        noNeed: 'Puedes crear contraseñas seguras sin usar símbolos, números o mayúsculas.',
        pwned: 'Si utiliza esta contraseña en otro lugar, debería cambiarla.',
        recentYears: 'Evita años recientes.',
        repeated: 'Evita palabras y letras repetidas.',
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
      verifyTitle: 'Verificar dirección de correo electrónico',
    },
    formButtonPrimary__add: 'Agregar',
    formButtonPrimary__continue: 'Continuar',
    formButtonPrimary__finish: 'Terminar',
    formButtonPrimary__remove: 'Eliminar',
    formButtonPrimary__save: 'Guardar',
    formButtonReset: 'Cancelar',
    mfaPage: {
      formHint: 'Seleccione un método para agregar.',
      title: 'Agregar verificación en dos pasos',
    },
    mfaPhoneCodePage: {
      backButton: 'Usar número existente',
      primaryButton__addPhoneNumber: 'Agregar número de teléfono',
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
        'Al iniciar sesión, se le pedirá un código de verificación enviado a este número de teléfono como un paso adicional.',
      successMessage2:
        'Guarde estos códigos de respaldo y almacénelos en un lugar seguro. Si pierde el acceso a su dispositivo de autenticación, puede utilizar los códigos de respaldo para iniciar sesión.',
      successTitle: 'Verificación de código SMS habilitada',
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
          'Asegúrese de que las contraseñas basadas en el tiempo o de un solo uso estén habilitadas, luego finalice de vincular su cuenta.',
        inputLabel__unableToScan2:
          'Alternativamente, si su autenticador admite URIs TOTP, también puede copiar la URI completa.',
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
      account: 'Perfil',
      description: 'Administra tu información de cuenta.',
      security: 'Seguridad',
      title: 'Cuenta',
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
        'Se recomienda cerrar la sesión de todos los otros dispositivos que hayan utilizado su antigua contraseña.',
      readonly: 'Tu contraseña no se puede editar actualmente porque solo se puede acceder a través de la conexión de empresa.',
      successMessage__set: 'Se ha establecido tu contraseña.',
      successMessage__signOutOfOtherSessions: 'Se cerró la sesión de todos los demás dispositivos.',
      successMessage__update: 'Tu contraseña ha sido actualizada.',
      title__set: 'Configurar la clave',
      title__update: 'Cambiar contraseña',
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
      verifySubtitle: 'Ingrese el código de verificación enviado a {{identifier}}',
      verifyTitle: 'Verificar número de teléfono',
    },
    profilePage: {
      fileDropAreaHint: 'Cargue una imagen JPG, PNG, GIF o WEBP de menos de 10 MB',
      imageFormDestructiveActionSubtitle: 'Eliminar la imagen',
      imageFormSubtitle: 'Cargar imagen',
      imageFormTitle: 'Imagen de perfil',
      readonly: 'Tu información de perfil ha sido proporcionada por la conexión de empresa y no se puede editar.',
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
        actionLabel__reauthorize: 'Autorizar ahora',
        destructiveActionTitle: 'Quitar',
        primaryButton: 'Conectar cuenta',
        subtitle__reauthorize:
          'Los permisos requeridos han sido actualizados, y podría experimentar limitaciones. Por favor, autorice de nuevo esta aplicación para evitar cualquier problema',
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
        title: 'Cuentas de empresa',
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
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Establecer contraseña ',
        primaryButton__updatePassword: 'Cambiar contraseña',
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
        primaryButton: '',
        title: 'Perfil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Crear nombre de usuario',
        primaryButton__updateUsername: 'Cambiar nombre de usuario',
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
      title__set: 'Actualizar nombre de usuario',
      title__update: 'Actualizar nombre de usuario',
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
