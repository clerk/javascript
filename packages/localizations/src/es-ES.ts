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

export const esES: LocalizationResource = {
  locale: 'es-ES',
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
  formFieldError__notMatchingPasswords: 'Las contraseñas no coinciden.',
  formFieldError__verificationLinkExpired: 'El enlace de verificación ha expirado. Por favor solicite uno nuevo.',
  formFieldHintText__optional: 'Opcional',
  formFieldHintText__slug: 'Un slug es un ID legible que debe ser único. Es comúnmente usado en URLs.',
  formFieldInputPlaceholder__backupCode: 'Ingrese su código de respaldo',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Eliminar cuenta',
  formFieldInputPlaceholder__emailAddress: 'Ingrese su dirección de correo electrónico',
  formFieldInputPlaceholder__emailAddress_username: 'Ingrese su correo electrónico o nombre de usuario',
  formFieldInputPlaceholder__emailAddresses:
    'Ingrese o pegue una o más direcciones de correo electrónico, separadas por espacios o comas',
  formFieldInputPlaceholder__firstName: 'Ingrese su nombre',
  formFieldInputPlaceholder__lastName: 'Ingrese sus apellidos',
  formFieldInputPlaceholder__organizationDomain: 'Ingrese el dominio de la organización',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'Ingrese un correo electrónico del dominio',
  formFieldInputPlaceholder__organizationName: 'Ingrese el nombre de la organización',
  formFieldInputPlaceholder__organizationSlug: 'Ingrese un slug único para la organización',
  formFieldInputPlaceholder__password: 'Ingrese su contraseña',
  formFieldInputPlaceholder__phoneNumber: 'Ingrese su número telefónico',
  formFieldInputPlaceholder__username: 'Ingrese su nombre de usuario',

  formFieldLabel__automaticInvitations: 'Activar invitaciones automáticas para este dominio',
  formFieldLabel__backupCode: 'Código de respaldo',
  formFieldLabel__confirmDeletion: 'Confirmación',
  formFieldLabel__confirmPassword: 'Confirme la contraseña',
  formFieldLabel__currentPassword: 'Contraseña actual',
  formFieldLabel__emailAddress: 'Correo electrónico',
  formFieldLabel__emailAddress_username: 'Correo electrónico o nombre de usuario',
  formFieldLabel__emailAddresses: 'Direcciones de correo',
  formFieldLabel__firstName: 'Nombre',
  formFieldLabel__lastName: 'Apellidos',
  formFieldLabel__newPassword: 'Nueva contraseña',
  formFieldLabel__organizationDomain: 'Dominio',
  formFieldLabel__organizationDomainDeletePending: 'Borrar invitaciones y sugerencias pendientes',
  formFieldLabel__organizationDomainEmailAddress: 'Correo de verificación',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Ingrese una dirección de correo electrónico bajo este dominio para recibir un código y verificarlo.',
  formFieldLabel__organizationName: 'Nombre de la Organización',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Nombre de la clave de acceso',
  formFieldLabel__password: 'Contraseña',
  formFieldLabel__phoneNumber: 'Número telefónico',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Cerrar sesión en todos los demás dispositivos',
  formFieldLabel__username: 'Nombre de usuario',
  impersonationFab: {
    action__signOut: 'Cerrar',
    title: 'Registrado como {{identifier}}',
  },
  maintenanceMode: 'Modo de mantenimiento',
  membershipRole__admin: 'Administrador',
  membershipRole__basicMember: 'Miembro',
  membershipRole__guestMember: 'Invitado',
  organizationList: {
    action__createOrganization: 'Crear organización',
    action__invitationAccept: 'Unirse',
    action__suggestionsAccept: 'Solicitud a unirse',
    createOrganization: 'Crear Organización',
    invitationAcceptedLabel: 'Unido',
    subtitle: 'para continuar a {{applicationName}}',
    suggestionsAcceptedLabel: 'Aprobación pendiente',
    title: 'Choose an account',
    titleWithoutPersonal: 'Escoja una organización',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Invitaciones automáticas',
    badge__automaticSuggestion: 'Sugerencias automáticas',
    badge__manualInvitation: 'Sin inscripción automática',
    badge__unverified: 'No verificado',
    createDomainPage: {
      subtitle:
        'Agregue el dominio para verificar. Los usuarios con direcciones de correo electrónico en este dominio pueden unirse a la organización automáticamente o solicitar unirse.',
      title: 'Agregar dominio',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'No se pudieron enviar las invitaciones. Solucione lo siguiente y vuelva a intentarlo:',
      formButtonPrimary__continue: 'Enviar invitaciones',
      selectDropdown__role: 'Seleccionar rol',
      subtitle: 'Invitar nuevos miembros a esta organización',
      successMessage: 'Invitaciones enviadas con éxito',
      title: 'Invitar miembros',
    },
    membersPage: {
      action__invite: 'Invitar',
      activeMembersTab: {
        menuAction__remove: 'Quitar miembro',
        tableHeader__actions: 'Acciones',
        tableHeader__joined: 'Unido',
        tableHeader__role: 'Rol',
        tableHeader__user: 'Usuario',
      },
      detailsTitle__emptyRow: 'No hay miembros para mostrar',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite a usuarios conectando un dominio de correo electrónico con su organización. Cualquiera que se registre con un dominio de correo electrónico coincidente podrá unirse a la organización en cualquier momento.',
          headerTitle: 'Invitaciones automáticas',
          primaryButton: 'Gestionar dominios verificados',
        },
        table__emptyRow: 'Sin invitaciones para mostrar',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revocar invitación',
        tableHeader__invited: 'Invitado',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Los usuarios que se registren con un dominio de correo electrónico coincidente podrán ver una sugerencia para solicitar unirse a su organización.',
          headerTitle: 'Sugerencias automáticas',
          primaryButton: 'Gestionar dominios verificados',
        },
        menuAction__approve: 'Aprobar',
        menuAction__reject: 'Rechazar',
        tableHeader__requested: 'Acceso solicitado',
        table__emptyRow: 'Sin solicitudes para mostrar',
      },
      start: {
        headerTitle__invitations: 'Invitaciones',
        headerTitle__members: 'Miembros',
        headerTitle__requests: 'Solicitudes',
      },
    },
    navbar: {
      description: 'Gestione su organización.',
      general: 'General',
      members: 'Miembros',
      title: 'Organización',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Escriba "{{organizationName}}" a continuación para continuar.',
          messageLine1: '¿Está seguro de que desea eliminar esta organización?',
          messageLine2: 'Esta acción es permanente e irreversible.',
          successMessage: 'Ha eliminado la organización.',
          title: 'Borrar organización',
        },
        leaveOrganization: {
          actionDescription: 'Escriba "{{organizationName}}" a continuación para continuar.',
          messageLine1:
            '¿Está seguro de que desea abandonar esta organización? Perderá el acceso a esta organización y sus aplicaciones.',
          messageLine2: 'Esta acción es permanente e irreversible.',
          successMessage: 'Has dejado la organización.',
          title: 'Abandonar la organización',
        },
        title: 'Peligro',
      },
      domainSection: {
        menuAction__manage: 'Gestione',
        menuAction__remove: 'Eliminar',
        menuAction__verify: 'Verificar',
        primaryButton: 'Añadir dominio',
        subtitle:
          'Permita que los usuarios se unan a la organización automáticamente o soliciten unirse basándose en un dominio de correo electrónico verificado.',
        title: 'Dominios verificados',
      },
      successMessage: 'La organización ha sido actualizada.',
      title: 'Perfil de la organización',
    },
    removeDomainPage: {
      messageLine1: 'Se eliminará el dominio de correo electrónico {{domain}}.',
      messageLine2: 'Los usuarios no podrán unirse a la organización automáticamente después de esto.',
      successMessage: '{{dominio}} ha sido eliminado.',
      title: 'Eliminar dominio',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Miembros',
      profileSection: {
        primaryButton: 'Actualizar perfil',
        title: 'Perfil de la Organización',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'La eliminación de este dominio afectará a los usuarios invitados.',
        removeDomainActionLabel__remove: 'Eliminar dominio',
        removeDomainSubtitle: 'Elimine este dominio de sus dominios verificados',
        removeDomainTitle: 'Eliminar dominio',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Los usuarios son invitados automáticamente a unirse a la organización cuando se registran y pueden unirse en cualquier momento.',
        automaticInvitationOption__label: 'Invitaciones automáticas',
        automaticSuggestionOption__description:
          'Los usuarios reciben una sugerencia para solicitar unirse, pero deben ser aprobados por un administrador antes de poder unirse a la organización.',
        automaticSuggestionOption__label: 'Sugerencias automáticas',
        calloutInfoLabel: 'Cambiar el modo de inscripción solo afectará a nuevos usuarios.',
        calloutInvitationCountLabel: 'Invitaciones pendientes enviadas a los usuarios: {{count}}',
        calloutSuggestionCountLabel: 'Sugerencias pendientes enviadas a los usuarios: {{count}}',
        manualInvitationOption__description: 'Los usuarios solo pueden ser invitados manualmente a la organización.',
        manualInvitationOption__label: 'Sin inscripción automática',
        subtitle: 'Elija cómo los usuarios de este dominio pueden unirse a la organización.',
      },
      start: {
        headerTitle__danger: 'Peligro',
        headerTitle__enrollment: 'Opciones de inscripción',
      },
      subtitle: 'El dominio {{domain}} está ahora verificado. Continúe seleccionando el modo de inscripción.',
      title: 'Actualizar {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Ingrese el código de verificación enviado a su dirección de correo electrónico',
      formTitle: 'Código de verificación',
      resendButton: '¿No recibió un código? Reenviar',
      subtitle: 'El dominio {{domainName}} necesita ser verificado por correo electrónico.',
      subtitleVerificationCodeScreen:
        'Se envió un código de verificación a {{emailAddress}}. Ingrese el código para continuar.',
      title: 'Verificar dominio',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Crear Organización',
    action__invitationAccept: 'Unirse',
    action__manageOrganization: 'Administrar Organización',
    action__suggestionsAccept: 'Solicitar unirse',
    notSelected: 'Ninguna organización seleccionada',
    personalWorkspace: 'Espacio de trabajo personal',
    suggestionsAcceptedLabel: 'Aprobación pendiente',
  },
  paginationButton__next: 'Próximo',
  paginationButton__previous: 'Previo',
  paginationRowText__displaying: 'Mostrando',
  paginationRowText__of: 'de',
  reverification: {
    alternativeMethods: {
      actionLink: 'Probar otro método',
      actionText: '¿No tienes acceso a este método? Prueba otra opción.',
      blockButton__backupCode: 'Usar código de respaldo',
      blockButton__emailCode: 'Usar código de correo electrónico',
      blockButton__password: 'Usar contraseña',
      blockButton__phoneCode: 'Usar código de teléfono',
      blockButton__totp: 'Usar verificación TOTP',
      getHelp: {
        blockButton__emailSupport: 'Contactar soporte por correo electrónico',
        content:
          'Si no puedes verificar tu identidad con los métodos anteriores, comunícate con nuestro equipo de soporte.',
        title: 'Necesitas ayuda con la verificación?',
      },
      subtitle: 'Selecciona uno de los métodos disponibles para verificar tu identidad.',
      title: 'Reverificación de identidad',
    },
    backupCodeMfa: {
      subtitle: 'Introduce tu código de respaldo para continuar con el acceso.',
      title: 'Verificación por código de respaldo',
    },
    emailCode: {
      formTitle: 'Ingresa el código que hemos enviado a tu correo electrónico.',
      resendButton: 'Reenviar código',
      subtitle: 'Revisa tu bandeja de entrada para el código de verificación.',
      title: 'Verificación por correo electrónico',
    },
    noAvailableMethods: {
      message: 'Lo sentimos, no tienes ningún método de verificación disponible. Contacta con soporte.',
      subtitle: 'No se encontraron métodos alternativos disponibles.',
      title: 'Métodos de verificación no disponibles',
    },
    password: {
      actionLink: '¿Olvidaste tu contraseña? Recupérala aquí.',
      subtitle: 'Usa tu contraseña para verificar tu identidad.',
      title: 'Verificación por contraseña',
    },
    phoneCode: {
      formTitle: 'Introduce el código enviado a tu teléfono.',
      resendButton: 'Reenviar código',
      subtitle: 'Recibirás un código SMS para verificar tu identidad.',
      title: 'Verificación por teléfono',
    },
    phoneCodeMfa: {
      formTitle: 'Código de verificación de 2 pasos',
      resendButton: 'Reenviar código',
      subtitle: 'Introduce el código de verificación de dos factores enviado a tu teléfono.',
      title: 'Verificación por teléfono (2FA)',
    },
    totpMfa: {
      formTitle: 'Código TOTP',
      subtitle: 'Introduce el código de autenticación TOTP para completar la verificación.',
      title: 'Verificación por TOTP (2FA)',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Añadir cuenta',
      action__signOutAll: 'Cerrar sesión de todas las cuentas',
      subtitle: 'Seleccione la cuenta con la que desea continuar.',
      title: 'Elija una cuenta',
    },
    alternativeMethods: {
      actionLink: 'Consigue ayuda',
      actionText: '¿No tienes ninguno de estos?',
      blockButton__backupCode: 'Usa un código de respaldo',
      blockButton__emailCode: 'Enviar código a {{identifier}}',
      blockButton__emailLink: 'Enviar enlace a {{identifier}}',
      blockButton__passkey: 'Usar llave de acceso',
      blockButton__password: 'Entra con tu contraseña',
      blockButton__phoneCode: 'Enviar código a {{identifier}}',
      blockButton__totp: 'Usa tu aplicación de autenticación',
      getHelp: {
        blockButton__emailSupport: 'Soporte de correo electrónico',
        content:
          'Si tiene dificultades para iniciar sesión en su cuenta, envíenos un correo electrónico y trabajaremos con usted para restablecer el acceso lo antes posible.',
        title: 'Consigue ayuda',
      },
      subtitle: '¿Tienes problemas? Puedes usar cualquiera de estos métodos para iniciar sesión.',
      title: 'Usa otro método',
    },
    backupCodeMfa: {
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Introduce un código de seguridad',
    },
    emailCode: {
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Revise su correo electrónico',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'El cliente no coincide con el solicitado. Por favor, intente de nuevo.',
        title: 'Error de cliente no coincidente',
      },
      expired: {
        subtitle: 'Regrese a la pestaña original para continuar.',
        title: 'Este enlace de verificación ha expirado',
      },
      failed: {
        subtitle: 'Regrese a la pestaña original para continuar.',
        title: 'Este enlace de verificación es inválido',
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
      formTitle: 'Código de restablecimiento de contraseña',
      resendButton: '¿No recibiste un código? Reenviar',
      subtitle: 'para restablecer tu contraseña',
      subtitle_email: 'Primero, introduce el código enviado a tu correo electrónico',
      subtitle_phone: 'Primero, introduce el código enviado a tu teléfono',
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
      subtitle: 'Use su clave de acceso para continuar con la autenticación.',
      title: 'Clave de acceso',
    },

    password: {
      actionLink: 'Usa otro método',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Introduzca su contraseña',
    },
    passwordPwned: {
      title: 'Tu contraseña ha sido comprometida',
    },
    phoneCode: {
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Revisa tu teléfono',
    },
    phoneCodeMfa: {
      formTitle: 'Código de verificación',
      resendButton: 'Reenviar código',
      subtitle: 'Introduce el código enviado a tu teléfono para continuar.',
      title: 'Revisa tu teléfono',
    },
    resetPassword: {
      formButtonPrimary: 'Restablecer Contraseña',
      requiredMessage: 'Por razones de seguridad, se requiere restablecer su contraseña.',
      successMessage: 'Tu contraseña ha sido cambiada exitosamente. Iniciando sesión, por favor espera un momento.',
      title: 'Establecer nueva contraseña',
    },
    resetPasswordMfa: {
      detailsLabel: 'Necesitamos verificar tu identidad antes de restablecer tu contraseña.',
    },
    start: {
      actionLink: 'Regístrese',
      actionLink__join_waitlist: 'Únase a la lista de espera',
      actionLink__use_email: 'Usar correo electrónico',
      actionLink__use_email_username: 'Usar correo electrónico o nombre de usuario',
      actionLink__use_passkey: 'Usar una clave de acceso',
      actionLink__use_phone: 'Usar teléfono',
      actionLink__use_username: 'Usar nombre de usuario',
      actionText: '¿No tienes cuenta?',
      actionText__join_waitlist: '¿Te gustaría unirte a la lista de espera?',

      subtitle: 'para continuar a {{applicationName}}',
      title: 'Entrar',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Código de verificación',
      subtitle: 'Introduce el código que te enviamos a tu dispositivo',
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
      resendButton: 'Re-enviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Verifique su correo electrónico',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Parece que no estás usando el dispositivo correcto para verificar tu cuenta.',
        title: 'Error de dispositivo',
      },
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
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'He leído y acepto la Política de Privacidad',
        label__onlyTermsOfService: 'He leído y acepto los Términos de Servicio',
        label__termsOfServiceAndPrivacyPolicy: 'He leído y acepto los Términos de Servicio y la Política de Privacidad',
      },
      continue: {
        subtitle: 'Al continuar, aceptas las condiciones mencionadas.',
        title: 'Por favor, acepta nuestros términos y políticas para continuar',
      },
    },

    phoneCode: {
      formSubtitle: 'Introduzca el código de verificación enviado a su número de teléfono',
      formTitle: 'Código de verificación',
      resendButton: 'Re-enviar código',
      subtitle: 'para continuar a {{applicationName}}',
      title: 'Verifique su teléfono',
    },
    restrictedAccess: {
      actionLink: 'Contáctanos para más información',
      actionText: '¿Tienes problemas? Obtén ayuda',
      blockButton__emailSupport: 'Soporte por correo electrónico',
      blockButton__joinWaitlist: 'Unirte a la lista de espera',
      subtitle: 'El acceso a esta funcionalidad está restringido en este momento.',
      subtitleWaitlist: 'Te has unido a la lista de espera. Nos pondremos en contacto contigo pronto.',
      title: 'Acceso restringido',
    },

    start: {
      actionLink: 'Iniciar sesión',
      actionLink__use_email: 'Usar correo electrónico',
      actionLink__use_phone: 'Usar teléfono',
      actionText: '¿Ya tienes una cuenta?',
      subtitle: 'para continuar en {{applicationName}}',
      title: 'Crea tu cuenta',
    },
  },
  socialButtonsBlockButton: 'Continuar con {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: 'Demasiados botones sociales visibles. Desplázate para ver más.',
  unstable__errors: {
    already_a_member_in_organization: '{{email}} ya es miembro de la organización.',
    captcha_invalid:
      'Registro fallido debido a validaciones de seguridad fallidas. Por favor, actualice la página para intentarlo de nuevo o comuníquese con el soporte para más asistencia.',
    captcha_unavailable:
      'Registro fallido debido a una validación de bot fallida. Por favor, actualice la página para intentarlo de nuevo o comuníquese con el soporte para más asistencia.',
    form_code_incorrect: 'El código ingresado es incorrecto.',
    form_identifier_exists: 'Ya existe una cuenta con este identificador.',
    form_identifier_exists__email_address: 'Ya existe una cuenta con esta dirección de correo electrónico.',
    form_identifier_exists__phone_number: 'Ya existe una cuenta con este número de teléfono.',
    form_identifier_exists__username: 'Ya existe una cuenta con este nombre de usuario.',
    form_identifier_not_found: 'No se ha encontrado ninguna cuenta con este identificador.',
    form_param_format_invalid: 'Formato de parámetro inválido.',
    form_param_format_invalid__email_address:
      'La dirección de correo electrónico debe ser una dirección de correo electrónico válida.',
    form_param_format_invalid__phone_number: 'El número de teléfono debe estar en un formato internacional válido.',
    form_param_max_length_exceeded__first_name: 'El nombre no debe exceder los 256 caracteres.',
    form_param_max_length_exceeded__last_name: 'El apellido no debe exceder los 256 caracteres.',
    form_param_max_length_exceeded__name: 'El nombre no debe exceder los 256 caracteres.',
    form_param_nil: 'Este campo es obligatorio.',
    form_param_value_invalid: 'Valor inválido.',
    form_password_incorrect: 'Contraseña incorrecta.',
    form_password_length_too_short: 'La contraseña es demasiado corta.',
    form_password_not_strong_enough: 'Tu contraseña no es lo suficientemente fuerte.',
    form_password_pwned: 'Tu contraseña ha sido comprometida en una violación de seguridad.',
    form_password_pwned__sign_in: 'La contraseña ya está en uso en otro servicio.',
    form_password_size_in_bytes_exceeded:
      'Tu contraseña ha excedido el número máximo de bytes permitidos, por favor acórtala o elimina algunos caracteres especiales.',
    form_password_validation_failed: 'La validación de la contraseña falló.',
    form_username_invalid_character: 'El nombre de usuario contiene caracteres inválidos.',
    form_username_invalid_length: 'El nombre de usuario debe tener entre 3 y 20 caracteres.',
    identification_deletion_failed: 'No puedes eliminar tu última identificación.',
    not_allowed_access: 'Acceso no permitido.',
    organization_domain_blocked: 'Este es un dominio bloqueado, por favor usa otro.',
    organization_domain_common: 'Este es un dominio común, por favor usa otro.',
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Has alcanzado tu límite de miembros de la organización, incluyendo invitaciones pendientes.',
    organization_minimum_permissions_needed:
      'Es necesario que haya al menos un miembro de la organización con los permisos mínimos necesarios.',
    passkey_already_exists: 'Ya existe una clave de acceso.',
    passkey_not_supported: 'Las claves de acceso no son compatibles.',
    passkey_pa_not_supported: 'La clave de acceso no es compatible con la autenticación de dispositivos.',
    passkey_registration_cancelled: 'El registro de la clave de acceso fue cancelado.',
    passkey_retrieval_cancelled: 'La recuperación de la clave de acceso fue cancelada.',
    passwordComplexity: {
      maximumLength: 'La contraseña no debe exceder los {{maxLength}} caracteres.',
      minimumLength: 'La contraseña debe tener al menos {{minLength}} caracteres.',
      requireLowercase: 'La contraseña debe contener al menos una letra minúscula.',
      requireNumbers: 'La contraseña debe contener al menos un número.',
      requireSpecialCharacter: 'La contraseña debe contener al menos un carácter especial.',
      requireUppercase: 'La contraseña debe contener al menos una letra mayúscula.',
      sentencePrefix: 'Tu contraseña debe cumplir con los requisitos de complejidad.',
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
      actionLabel__copied: '¡Copiado!',
      actionLabel__copy: 'Copiar todo',
      actionLabel__download: 'Descargar .txt',
      actionLabel__print: 'Imprimir',
      infoText1: 'Se habilitarán códigos de respaldo para esta cuenta.',
      infoText2:
        'Mantenga los códigos de respaldo en secreto y guárdelos de forma segura. Puede regenerar códigos de respaldo si sospecha que se han visto comprometidos.',
      subtitle__codelist: 'Guárdelos de forma segura y manténgalos en secreto.',
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
      socialButtonsBlockButton: 'Conectar cuenta de {{provider | titleize}}',
      successMessage: 'El proveedor ha sido agregado a su cuenta',
      title: 'Agregar cuenta conectada',
    },
    deletePage: {
      actionDescription: 'Escribe "Eliminar cuenta" a continuación para continuar.',
      confirm: 'Eliminar cuenta',
      messageLine1: '¿Estás seguro de que quieres eliminar tu cuenta?',
      messageLine2: 'Esta acción es permanente e irreversible.',
      title: 'Eliminar cuenta',
    },
    emailAddressPage: {
      emailCode: {
        formSubtitle: 'Introduzca el código de verificación enviado a {{identifier}}',
        formTitle: 'Código de verificación',
        resendButton: 'Re-enviar código',
        successMessage: 'El correo electrónico {{identifier}} se ha agregado a su cuenta.',
      },
      emailLink: {
        formSubtitle: 'Haga clic en el enlace de verificación en el correo electrónico enviado a {{identifier}}',
        formTitle: 'Enlace de verificación',
        resendButton: 'Reenviar enlace',
        successMessage: 'El correo electrónico {{identifier}} se ha agregado a su cuenta.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      formHint: undefined,
      removeResource: {
        messageLine1: '{{identifier}} será eliminado de esta cuenta.',
        messageLine2: 'Ya no podrá iniciar sesión con esta dirección de correo electrónico.',
        successMessage: '{{emailAddress}} ha sido eliminado de su cuenta.',
        title: 'Eliminar dirección de correo electrónico',
      },
      title: 'Agregar dirección de correo electrónico',
      verifyTitle: 'Verificar correo electrónico',
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
        'Al iniciar sesión, deberá ingresar un código de verificación enviado a este número de teléfono como un paso adicional.',
      successMessage2:
        'Guarde estos códigos de respaldo y almacénelos en un lugar seguro. Si pierde el acceso a su dispositivo de autenticación, puede usar los códigos de respaldo para iniciar sesión.',
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
        'La verificación en dos pasos ahora está habilitada. Al iniciar sesión, deberá ingresar un código de verificación de este autenticador como un paso adicional.',
      title: 'Agregar aplicación de autenticación',
      verifySubtitle: 'Ingrese el código de verificación generado por su autenticador',
      verifyTitle: 'Código de verificación',
    },
    mobileButton__menu: 'Menú',
    navbar: {
      account: 'Perfil',
      description: 'Gestiona la información de tu cuenta.',
      security: 'Seguridad',
      title: 'Cuenta',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '¿Estás seguro de que deseas eliminar este recurso?',
        title: 'Eliminar Recurso',
      },
      subtitle__rename: 'Ingresa el nuevo nombre para la clave de acceso.',
      title__rename: 'Renombrar Clave de Acceso',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Se recomienda cerrar sesión en todos los demás dispositivos que puedan haber usado su contraseña anterior.',
      readonly:
        'Su contraseña actualmente no puede ser editada porque solo puede iniciar sesión a través de la conexión empresarial.',
      successMessage__set: 'Su contraseña ha sido establecida.',
      successMessage__signOutOfOtherSessions: 'Todos los demás dispositivos han cerrado sesión.',
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
      verifySubtitle: 'Introduzca el código de verificación enviado a {{identifier}}',
      verifyTitle: 'Verificar número de teléfono',
    },
    profilePage: {
      fileDropAreaHint: 'Cargue una imagen JPG, PNG, GIF o WEBP de menos de 10 MB',
      imageFormDestructiveActionSubtitle: 'Eliminar la imagen',
      imageFormSubtitle: 'Cargar imagen',
      imageFormTitle: 'Imagen de perfil',
      readonly: 'La información de su perfil ha sido proporcionada por la conexión empresarial y no puede ser editada.',
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
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'Los permisos necesarios han sido actualizados, y podría estar experimentando funcionalidad limitada. Por favor, reautorice esta aplicación para evitar problemas.',
        title: 'Cuentas conectadas',
      },
      dangerSection: {
        deleteAccountButton: 'Eliminar cuenta',
        title: 'Eliminar cuenta',
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
        title: 'Cuentas empresariales',
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
        menuAction__destructive: 'Eliminar Clave de Acceso',
        menuAction__rename: 'Renombrar Clave de Acceso',
        title: 'Sección de Claves de Acceso',
      },

      passwordSection: {
        primaryButton__setPassword: 'Establecer contraseña',
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
        primaryButton: 'Guardar Cambios',
        title: 'Perfil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Crear nombre de usuario',
        primaryButton__updateUsername: 'Cambiar nombre de usuario',
        title: 'Nombre de usuario',
      },
      web3WalletsSection: {
        destructiveAction: 'Quitar cartera',
        primaryButton: 'Agregar cartera Web3',
        title: 'Cartera Web3',
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
      subtitle__unavailableWallets: 'No hay billeteras web3 disponibles.',
      successMessage: 'La billetera ha sido agregada a su cuenta.',
      title: 'Añadir billetera Web3',
      web3WalletButtonsBlockButton: 'Conectar billetera',
    },
  },

  waitlist: {
    start: {
      actionLink: '¡Únete a la lista de espera!',
      actionText:
        'Si no tienes acceso, puedes unirte a nuestra lista de espera para recibir una invitación más adelante.',
      formButton: 'Unirse ahora',
      subtitle: 'Sé uno de los primeros en acceder a {{applicationName}}.',
      title: 'Únete a la lista de espera',
    },
    success: {
      message: '¡Felicidades! Te has unido exitosamente a la lista de espera.',
      subtitle: 'Recibirás una invitación para unirte cuando haya espacio disponible.',
      title: '¡Te has unido a la lista de espera!',
    },
  },
} as const;
