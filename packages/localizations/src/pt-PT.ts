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

export const ptPT: LocalizationResource = {
  locale: 'pt-PT',
  __experimental_userVerification: {
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
  backButton: 'Voltar',
  badge__default: 'Padrão',
  badge__otherImpersonatorDevice: 'Personificar outro dispositivo',
  badge__primary: 'Principal',
  badge__requiresAction: 'Requer ação',
  badge__thisDevice: 'Este dispositivo',
  badge__unverified: 'Não verificado',
  badge__userDevice: 'Dispositivo do utilizador',
  badge__you: 'O utilizador',
  createOrganization: {
    formButtonSubmit: 'Criar organização',
    invitePage: {
      formButtonReset: 'Ignorar',
    },
    title: 'Criar organização',
  },
  dates: {
    lastDay: "Ontem às {{ date | timeString('pt-PT') }}",
    next6Days: "{{ date | weekday('pt-PT','long') }} às {{ date | timeString('pt-PT') }}",
    nextDay: "Amanhã às {{ date | timeString('pt-PT') }}",
    numeric: "{{ date | numeric('pt-PT') }}",
    previous6Days: "Último {{ date | weekday('pt-PT','long') }} às {{ date | timeString('pt-PT') }}",
    sameDay: "Hoje às {{ date | timeString('pt-PT') }}",
  },
  dividerText: 'ou',
  footerActionLink__useAnotherMethod: 'Utilize outro método',
  footerPageLink__help: 'Ajuda',
  footerPageLink__privacy: 'Privacidade',
  footerPageLink__terms: 'Termos de uso',
  formButtonPrimary: 'Continuar',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Esqueceu a palavra-passe?',
  formFieldError__matchingPasswords: 'Passwords match.',
  formFieldError__notMatchingPasswords: "Passwords don't match.",
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Opcional',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses: 'Insira um ou mais endereços de e-mail separados por espaços ou vírgulas',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: undefined,
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Ativar convites automáticos para este domínio',
  formFieldLabel__backupCode: 'Código de backup',
  formFieldLabel__confirmDeletion: 'Confirmar exclusão',
  formFieldLabel__confirmPassword: 'Confirmar palavra-passe',
  formFieldLabel__currentPassword: 'Palavra-passe atual',
  formFieldLabel__emailAddress: 'Insira o seu e-mail',
  formFieldLabel__emailAddress_username: 'E-mail ou nome de utilizador',
  formFieldLabel__emailAddresses: 'Endereços de e-mail',
  formFieldLabel__firstName: 'Nome',
  formFieldLabel__lastName: 'Apelido',
  formFieldLabel__newPassword: 'Nova palavra-passe',
  formFieldLabel__organizationDomain: 'Domínio',
  formFieldLabel__organizationDomainDeletePending: 'Excluir convites e sugestões pendentes',
  formFieldLabel__organizationDomainEmailAddress: 'Endereço de e-mail de verificação',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Endereço de e-mail para receber um código e verificar este domínio',
  formFieldLabel__organizationName: 'Nome da organização',
  formFieldLabel__organizationSlug: 'URL Slug',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Palavra-passe',
  formFieldLabel__phoneNumber: 'Telemóvel',
  formFieldLabel__role: 'Função',
  formFieldLabel__signOutOfOtherSessions: 'Desconectar de todos os outros dispositivos',
  formFieldLabel__username: 'Nome de utilizador',
  impersonationFab: {
    action__signOut: 'Terminar sessão',
    title: 'Sessão iniciada como {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Administrador',
  membershipRole__basicMember: 'Membro',
  membershipRole__guestMember: 'Convidado',
  organizationList: {
    action__createOrganization: 'Criar organização',
    action__invitationAccept: 'Participar',
    action__suggestionsAccept: 'Solicitar participação',
    createOrganization: 'Criar organização',
    invitationAcceptedLabel: 'Participando',
    subtitle: 'para continuar no {{applicationName}}',
    suggestionsAcceptedLabel: 'Aprovação pendente',
    title: 'Selecione uma conta',
    titleWithoutPersonal: 'Selecione uma organização',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Convites automáticos',
    badge__automaticSuggestion: 'Sugestões automáticas',
    badge__manualInvitation: 'Sem inscrição automática',
    badge__unverified: 'Não verificado',
    createDomainPage: {
      subtitle:
        'Adicione o domínio para verificar. Utilizadores com endereços de e-mail neste domínio podem entrar na organização automaticamente ou solicitar entrada.',
      title: 'Adicionar domínio',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Os convites não puderam ser enviados. Corrija o seguinte e tente novamente:',
      formButtonPrimary__continue: 'Enviar convites',
      selectDropdown__role: 'Select role',
      subtitle: 'Convidar novos membros para esta organização',
      successMessage: 'Convites enviados com sucesso',
      title: 'Convidar membros',
    },
    membersPage: {
      action__invite: 'Convidar',
      activeMembersTab: {
        menuAction__remove: 'Remover membro',
        tableHeader__actions: undefined,
        tableHeader__joined: 'Entrou',
        tableHeader__role: 'Função',
        tableHeader__user: 'Utilizador',
      },
      detailsTitle__emptyRow: 'Nenhum membro para mostrar',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Convide utilizadores conectando um domínio de e-mail com a sua organização. Qualquer pessoa que se inscrever com um domínio de e-mail correspondente poderá se entrar na organização a qualquer momento.',
          headerTitle: 'Convites automáticos',
          primaryButton: 'Configurar domínios verificados',
        },
        table__emptyRow: 'Nenhum convite a mostrar',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Cancelar convite',
        tableHeader__invited: 'Convidado',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Utilizadores que se inscrevem com um domínio de e-mail correspondente podem ver uma sugestão para solicitar participação na sua organização.',
          headerTitle: 'Sugestões automáticas',
          primaryButton: 'Configurar domínios verificados',
        },
        menuAction__approve: 'Aprovar',
        menuAction__reject: 'Rejeitar',
        tableHeader__requested: 'Acesso solicitado',
        table__emptyRow: 'Nenhuma solicitação a mostrar',
      },
      start: {
        headerTitle__invitations: 'Convites',
        headerTitle__members: 'Membros',
        headerTitle__requests: 'Pedidos',
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
          actionDescription: 'Escreva {{organizationName}} abaixo para continuar.',
          messageLine1: 'Tem certeza de que deseja excluir esta organização?',
          messageLine2: 'Esta ação é permanente e irreversível.',
          successMessage: 'Você excluiu a organização.',
          title: 'Excluir organização',
        },
        leaveOrganization: {
          actionDescription: 'Escreva {{organizationName}} abaixo para continuar.',
          messageLine1:
            'Tem certeza de que deseja sair desta organização? Você perderá o acesso a esta organização e às suas aplicações.',
          messageLine2: 'Esta ação é permanente e não pode ser desfeita.',
          successMessage: 'Você saiu da organização.',
          title: 'Sair da organização',
        },
        title: 'Perigo',
      },
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
        primaryButton: 'Adicionar domínio',
        subtitle:
          'Permita que os utilizadores juntem-se à organização automaticamente ou solicitem participação com base num domínio de e-mail verificado.',
        title: 'Domínios verificados',
      },
      successMessage: 'A organização foi atualizada.',
      title: 'Perfil da organização',
    },
    removeDomainPage: {
      messageLine1: 'O domínio de e-mail {{domain}} será removido.',
      messageLine2: 'Os utilizadores não conseguirão entrar na organização após isso.',
      successMessage: '{{domain}} foi removido.',
      title: 'Excluir domínio',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membros',
      profileSection: {
        primaryButton: undefined,
        title: 'Organization Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'A exclusão deste domínio afetará os utilizadores convidados.',
        removeDomainActionLabel__remove: 'Excluir domínio',
        removeDomainSubtitle: 'Remova este domínio dos seus domínios verificados',
        removeDomainTitle: 'Excluir domínio',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Os utilizadores são automaticamente convidados a entrar na organização quando se inscrevem.',
        automaticInvitationOption__label: 'Convites automáticos',
        automaticSuggestionOption__description:
          'Os utilizadores recebem uma sugestão para solicitar participação, mas devem ser aprovados por um administrador antes de poderem entrar na organização.',
        automaticSuggestionOption__label: 'Sugestões automáticas',
        calloutInfoLabel: 'Alterar o modo de inscrição afetará apenas os novos utilizadores.',
        calloutInvitationCountLabel: 'Convites pendentes enviados aos utilizadores: {{count}}',
        calloutSuggestionCountLabel: 'Sugestões pendentes enviadas aos utilizadores: {{count}}',
        manualInvitationOption__description: 'Os utilizadores só podem ser convidados manualmente para a organização.',
        manualInvitationOption__label: 'Sem inscrição automática',
        subtitle: 'Escolha como os utilizadores deste domínio se podem entrar na organização.',
      },
      start: {
        headerTitle__danger: 'Perigo',
        headerTitle__enrollment: 'Opções de inscrição',
      },
      subtitle: 'O domínio {{domain}} agora está verificado. Continue por selecionar o modo de inscrição.',
      title: 'Update {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Insira o código de verificação enviado para o seu endereço de e-mail',
      formTitle: 'Código de verificação',
      resendButton: 'Não recebeu um código? Reenviar',
      subtitle: 'O domínio {{domainName}} precisa ser verificado por e-mail.',
      subtitleVerificationCodeScreen:
        'Um código de verificação foi enviado para {{emailAddress}}. Insira-o para continuar.',
      title: 'Verificar domínio',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Criar organização',
    action__invitationAccept: 'Participar',
    action__manageOrganization: 'Configurar organização',
    action__suggestionsAccept: 'Solicitar participação',
    notSelected: 'Nenhuma organização selecionada',
    personalWorkspace: 'Conta pessoal',
    suggestionsAcceptedLabel: 'Aprovação pendente',
  },
  paginationButton__next: 'Próximo',
  paginationButton__previous: 'Anterior',
  paginationRowText__displaying: 'Apresentando',
  paginationRowText__of: 'de',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Ajuda',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Utilize um código de backup',
      blockButton__emailCode: 'Enviar código para {{identifier}}',
      blockButton__emailLink: 'Enviar link para {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Fazer login com palavra-passe',
      blockButton__phoneCode: 'Enviar código para {{identifier}}',
      blockButton__totp: 'Utilize o seu autenticador',
      getHelp: {
        blockButton__emailSupport: 'E-mail de suporte',
        content:
          'Se estiver com dificuldades para entrar na sua conta, envie-nos um e-mail e iremos ajudar-te a restaurar o acesso o mais rápido possível.',
        title: 'Ajuda',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Utilize outro método',
    },
    backupCodeMfa: {
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Insira um código de backup',
    },
    emailCode: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique o seu e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      expired: {
        subtitle: 'Retorne para a aba original para continuar',
        title: 'Este link de verificação expirou',
      },
      failed: {
        subtitle: 'Retorne para a aba original para continuar',
        title: 'Este link de verificação é inválido',
      },
      formSubtitle: 'Utilize o link enviado no seu e-mail',
      formTitle: 'Link de verificação',
      loading: {
        subtitle: 'Será redirecionado em breve',
        title: 'Entrando...',
      },
      resendButton: 'Não recebeu um link? Reenviar',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique o seu e-mail',
      unusedTab: {
        title: 'Já pode fechar esta aba',
      },
      verified: {
        subtitle: 'Será redirecionado em breve',
        title: 'Login realizado com sucesso',
      },
      verifiedSwitchTab: {
        subtitle: 'Retorne para a aba original para continuar',
        subtitleNewTab: 'Retorne para a nova aba que foi aberta para continuar',
        titleNewTab: 'Conectado em outra aba',
      },
    },
    forgotPassword: {
      formTitle: 'Código de redefinição de palavra-passe',
      resendButton: 'Não recebeu um código? Reenviar',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Repor a palavra-passe',
      label__alternativeMethods: 'Ou, faça login com outro método.',
      title: 'Esqueceu-se da palavra-passe?',
    },
    noAvailableMethods: {
      message: 'Não foi possível fazer login. Não há nenhum método de autenticação disponível.',
      subtitle: 'Ocorreu um erro',
      title: 'Não foi possível fazer login',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Utilize outro método',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Insira a sua palavra-passe',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique o seu telemóvel',
    },
    phoneCodeMfa: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: undefined,
      title: 'Verifique o seu telemóvel',
    },
    resetPassword: {
      formButtonPrimary: 'Repor Palavra-passe',
      requiredMessage: 'For security reasons, it is required to reset your password.',
      successMessage: 'A sua palavra-passe foi alterada com sucesso. Entrando, por favor aguarde um momento.',
      title: 'Repor Palavra-passe',
    },
    resetPasswordMfa: {
      detailsLabel: 'Precisamos verificar a sua identidade antes de redefinir a palavra-passe.',
    },
    start: {
      actionLink: 'Registre-se',
      actionLink__use_email: 'Usar e-mail',
      actionLink__use_email_username: 'Usar e-mail ou nome de utilizador',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Usar telemóvel',
      actionLink__use_username: 'Usar nome de utilizador',
      actionText: 'Não possui uma conta?',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Entrar',
    },
    totpMfa: {
      formTitle: 'Código de verificação',
      subtitle: undefined,
      title: 'Verificação de duas etapas',
    },
  },
  signInEnterPasswordTitle: 'Insira a sua palavra-passe',
  signUp: {
    continue: {
      actionLink: 'Entrar',
      actionText: 'Já possui uma conta?',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Preencha os campos ausentes',
    },
    emailCode: {
      formSubtitle: 'Insira o código enviado para o seu e-mail',
      formTitle: 'Código de verificação',
      resendButton: 'Não recebeu o código? Reenviar',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique o seu e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      formSubtitle: 'Utilize o link enviado no seu e-mail',
      formTitle: 'Link de verificação',
      loading: {
        title: 'Entrando...',
      },
      resendButton: 'Reenviar link',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique seu e-mail',
      verified: {
        title: 'Registo realizado com sucesso',
      },
      verifiedSwitchTab: {
        subtitle: 'Volte para a nova aba que foi aberta para continuar',
        subtitleNewTab: 'Volte para a aba anterior para continuar',
        title: 'E-mail verificado com sucesso',
      },
    },
    phoneCode: {
      formSubtitle: 'Insira o código enviado para o seu telemóvel',
      formTitle: 'Código de verificação',
      resendButton: 'Não recebeu o código? Reenviar',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique o seu telemóvel',
    },
    start: {
      actionLink: 'Entrar',
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'Já tem uma conta?',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Criar a sua conta',
    },
  },
  socialButtonsBlockButton: 'Continuar com {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'Não foi possível inscrever-se devido a falhas nas validações de segurança. Por favor, atualize a página para tentar novamente ou entre em contato com o suporte para obter mais ajuda.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'O endereço de e-mail deve ser válido.',
    form_param_format_invalid__phone_number: 'O número de telemóvel deve ser válido.',
    form_param_max_length_exceeded__first_name: 'O primeiro nome não deve exceder 256 caracteres.',
    form_param_max_length_exceeded__last_name: 'O apelido não deve exceder 256 caracteres.',
    form_param_max_length_exceeded__name: 'O nome não deve exceder 256 caracteres.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'A sua palavra-passe não é forte o suficiente.',
    form_password_pwned:
      'Esta palavra-passe foi encontrada como parte de uma violação e não pode ser usada, por favor, tente outra palavra-passe.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'A sua palavra-passe excedeu o número máximo de bytes permitidos, por favor, encurte-a ou remova alguns caracteres especiais.',
    form_password_validation_failed: 'Palavra-passe incorreta',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'Você não pode excluir a sua última identificação.',
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: 'menos de {{length}} caracteres',
      minimumLength: '{{length}} ou mais caracteres',
      requireLowercase: 'uma letra minúscula',
      requireNumbers: 'um número',
      requireSpecialCharacter: 'um caractere especial',
      requireUppercase: 'uma letra maiúscula',
      sentencePrefix: 'A sua palavra-passe deve conter',
    },
    phone_number_exists: 'Este número de telemóvel já está em uso. Por favor, tente outro.',
    zxcvbn: {
      couldBeStronger: 'A sua palavra-passe funciona, mas poderia ser mais forte. Tente adicionar mais caracteres.',
      goodPassword: 'A sua palavra-passe atende a todos os requisitos necessários.',
      notEnough: 'A sua palavra-passe não é forte o suficiente.',
      suggestions: {
        allUppercase: 'Utilize apenas algumas letras maiúsculas, não todas.',
        anotherWord: 'Adicione palavras menos comuns.',
        associatedYears: 'Evite anos associados a você.',
        capitalization: 'Utilize outras letras maiúsculas, além do que primeira.',
        dates: 'Evite datas e anos associados a você.',
        l33t: "Evite substituições previsíveis de letras, como '@' por 'a'.",
        longerKeyboardPattern: 'Use padrões de teclado mais longos e mude a direção da digitação várias vezes.',
        noNeed: 'Você pode criar palavras-passes fortes sem usar símbolos, números ou letras maiúsculas.',
        pwned: 'Se usar esta palavra-passe noutro lugar, deve mudá-la.',
        recentYears: 'Evite anos recentes.',
        repeated: 'Evite palavras e caracteres repetidos.',
        reverseWords: 'Evite utilizar palavras comuns escritas de "trás para frente".',
        sequences: 'Evite sequências comuns de caracteres.',
        useWords: 'Use várias palavras, mas evite frases comuns.',
      },
      warnings: {
        common: 'Esta é uma palavra-passe comumente usada.',
        commonNames: 'Nomes e apelidos comuns são fáceis de adivinhar.',
        dates: 'Datas são fáceis de adivinhar.',
        extendedRepeat: 'Padrões de caracteres repetidos, como "abcabcabc" são fáceis de adivinhar.',
        keyPattern: 'Padrões curtos de teclado são fáceis de adivinhar.',
        namesByThemselves: 'Nomes ou apelidos são fáceis de adivinhar.',
        pwned: 'A sua palavra-passe foi exposta numa violação de dados na Internet.',
        recentYears: 'Anos recentes são fáceis de adivinhar.',
        sequences: 'Sequências comuns de caracteres, como "abc" são fáceis de adivinhar.',
        similarToCommon: 'Esta é semelhante a uma palavra-passe comumente usada.',
        simpleRepeat: 'Caracteres repetidos, como "aaa" são fáceis de adivinhar.',
        straightRow: 'Letras que vêm em sequência no teclado são fáceis de adivinhar.',
        topHundred: 'Esta é uma palavra-passe usada frequentemente.',
        topTen: 'Esta é uma palavra-passe muito usada.',
        userInputs: 'Não deve haver nenhum dado pessoal ou relacionado à página.',
        wordByItself: 'Palavras simples são fáceis de adivinhar.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Adicionar conta',
    action__manageAccount: 'Configurar conta',
    action__signOut: 'Terminar sessão',
    action__signOutAll: 'Terminar sessão de todas as contas',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copiado!',
      actionLabel__copy: 'Copiar tudo',
      actionLabel__download: 'Download .txt',
      actionLabel__print: 'Imprimir',
      infoText1: 'Códigos de backup serão ativados para esta conta.',
      infoText2:
        'Guarde-os em segurança e não os partilhe. Você pode gerar novos códigos de backup se suspeitar que eles tenham sido comprometidos.',
      subtitle__codelist: 'Guarde-os em segurança e não os partilhe.',
      successMessage:
        'Códigos de backup foram ativados para esta conta. Pode usar um deles para fazer login na sua conta caso perca o acesso ao seu dispositivo de autenticação. Cada código poderá ser utilizado apenas uma vez.',
      successSubtitle:
        'Pode usar um deles para fazer login na sua conta caso perca o acesso ao seu dispositivo de autenticação.',
      title: 'Adicionar código de backup para verificação',
      title__codelist: 'Códigos de backup',
    },
    connectedAccountPage: {
      formHint: 'Selecione um provedor para conectar à sua conta.',
      formHint__noAccounts: 'Não há provedores de conta externos disponíveis.',
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Não vai conseguir usar esta conta e, quaisquer recursos dependentes dela deixarão de funcionar.',
        successMessage: '{{connectedAccount}} foi removido da sua conta.',
        title: 'Remover conta conectada',
      },
      socialButtonsBlockButton: 'Conectar conta {{provider|titleize}}',
      successMessage: 'O provedor foi adicionado à sua conta',
      title: 'Conecte uma conta',
    },
    deletePage: {
      actionDescription: 'Escreva Excluir conta abaixo para continuar.',
      confirm: 'Excluir conta',
      messageLine1: 'Tem certeza de que deseja excluir a sua conta?',
      messageLine2: 'Esta ação é permanente e irreversível.',
      title: 'Excluir conta',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Um e-mail contendo um código de verificação será enviado para este endereço de e-mail.',
        formSubtitle: 'Insira o código de verificação enviado para {{identifier}}',
        formTitle: 'Código de verificação',
        resendButton: 'Não recebeu um código? Reenviar',
        successMessage: 'O e-mail {{identifier}} foi adicionado à sua conta.',
      },
      emailLink: {
        formHint: 'Um e-mail contendo um link de verificação será enviado para este endereço de e-mail.',
        formSubtitle: 'Clique no link de verificação enviado para {{identifier}}',
        formTitle: 'Link de verificação',
        resendButton: 'Não recebeu um código? Reenviar',
        successMessage: 'O e-mail {{identifier}} foi adicionado à sua conta.',
      },
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Não vai conseguir fazer login novamente com este endereço de e-mail.',
        successMessage: '{{emailAddress}} foi removido da sua conta.',
        title: 'Remover e-mail',
      },
      title: 'Adicionar e-mail',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Continuar',
    formButtonPrimary__finish: 'Finalizar',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Cancelar',
    mfaPage: {
      formHint: 'Selecione um método para adicionar.',
      title: 'Adicione verificação de duas etapas',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Adicione um número de telemóvel',
      removeResource: {
        messageLine1: '{{identifier}} não receberá mais códigos de verificação ao realizar o login.',
        messageLine2: 'A sua conta pode ficar menos segura. Tem certeza que deseja continuar?',
        successMessage: 'Código SMS de verificação de duas etapas foi removido para {{mfaPhoneCode}}',
        title: 'Remover verificação de duas etapas',
      },
      subtitle__availablePhoneNumbers:
        'Selecione um número de telemóvel para registrar a verificação de duas etapas por código SMS.',
      subtitle__unavailablePhoneNumbers:
        'Não há números de telemóvel disponíveis para registrar a verificação de duas etapas por código SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Adicionar verificação por SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Ler código QR em vez disso',
        buttonUnableToScan__nonPrimary: 'Não pode ler o código QR?',
        infoText__ableToScan:
          'Configure um novo método de login no seu autenticador e leia o seguinte código QR para vinculá-lo à sua conta.',
        infoText__unableToScan:
          'Configure um novo método de login no seu autenticador e insira a chave informada abaixo.',
        inputLabel__unableToScan1:
          "Certifique-se de que o 'One-time passwords' está ativo, de seguida, conclua a conexão da sua conta.",
        inputLabel__unableToScan2:
          'Alternativamente, se o seu autenticador suportar URIs TOTP, também pode copiar a URI completa.',
      },
      removeResource: {
        messageLine1: 'Os códigos de verificação deste autenticador não serão mais necessários ao fazer login.',
        messageLine2: 'A sua conta pode ficar menos segura. Tem certeza que deseja continuar?',
        successMessage: 'A verificação de duas etapas via autenticador foi removida.',
        title: 'Remover verificação de duas etapas',
      },
      successMessage:
        'A verificação de duas etapas está agora ativa. Ao fazer login, precisará de inserir um código de verificação deste autenticador como uma etapa adicional.',
      title: 'Adicionar um autenticador',
      verifySubtitle: 'Insira o código de verificação gerado pelo seu autenticador',
      verifyTitle: 'Código de verificação',
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
      readonly: 'A sua palavra-passe não pode ser editada porque só pode fazer login por meio da conexão da empresa.',
      successMessage__set: 'A sua palavra-passe foi guardada.',
      successMessage__signOutOfOtherSessions: 'Todos os outros dispositivos foram desconectados.',
      successMessage__update: 'A sua palavra-passe foi atualizada.',
      title__set: 'Defina a palavra-passe',
      title__update: 'Trocar palavra-passe',
    },
    phoneNumberPage: {
      infoText: 'Um SMS contendo um link de verificação será enviado para este telemóvel.',
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Não vai conseguir fazer login novamente com este número de telemóvel.',
        successMessage: '{{phoneNumber}} foi removido da sua conta.',
        title: 'Remover telemóvel',
      },
      successMessage: '{{identifier}} foi adicionado à sua conta.',
      title: 'Adicionar telemóvel',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Carregue uma imagem JPG, PNG, GIF ou WEBP menor que 10MB',
      imageFormDestructiveActionSubtitle: 'Remover imagem',
      imageFormSubtitle: 'Carregar imagem',
      imageFormTitle: 'Imagem de perfil',
      readonly: 'As informações do perfil foram fornecidas pela conexão corporativa e não podem ser editadas.',
      successMessage: 'O perfil foi atualizado.',
      title: 'Atualizar perfil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Terminar sessão',
        title: 'Dispositivos ativos',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Tentar novamente',
        actionLabel__reauthorize: 'Reautorizar agora',
        destructiveActionTitle: 'Remover',
        primaryButton: 'Conectar conta',
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Contas conectadas',
      },
      dangerSection: {
        deleteAccountButton: 'Excluir Conta',
        title: 'Perigo',
      },
      emailAddressesSection: {
        destructiveAction: 'Remover e-mail',
        detailsAction__nonPrimary: 'Definir como principal',
        detailsAction__primary: 'Completar verificação',
        detailsAction__unverified: 'Completar verificação',
        primaryButton: 'Adicionar um e-mail',
        title: 'Endereços de e-mail',
      },
      enterpriseAccountsSection: {
        title: 'Contas corporativas',
      },
      headerTitle__account: 'Conta',
      headerTitle__security: 'Segurança',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Gerar novos códigos',
          headerTitle: 'Códigos de backup',
          subtitle__regenerate:
            'Obter um novo conjunto de códigos de backup seguros. Os códigos de backup anteriores serão excluídos e não poderão ser utilizados novamente.',
          title__regenerate: 'Gerar novos códigos de backup',
        },
        phoneCode: {
          actionLabel__setDefault: 'Definir como principal',
          destructiveActionLabel: 'Remover telemóvel',
        },
        primaryButton: 'Adicione verificação',
        title: 'Verificação de duas etapas',
        totp: {
          destructiveActionTitle: 'Remover',
          headerTitle: 'Autenticador',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Definir palavra-passe',
        primaryButton__updatePassword: 'Trocar palavra-passe',
        title: 'Palavra-passe',
      },
      phoneNumbersSection: {
        destructiveAction: 'Remover telemóvel',
        detailsAction__nonPrimary: 'Definir como principal',
        detailsAction__primary: 'Completar verificação',
        detailsAction__unverified: 'Completar verificação',
        primaryButton: 'Adicione um telemóvel',
        title: 'Números de telemóvel',
      },
      profileSection: {
        primaryButton: undefined,
        title: 'Perfil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Definir nome de utilizador',
        primaryButton__updateUsername: 'Trocar nome de utilizador',
        title: 'Nome de utilizador',
      },
      web3WalletsSection: {
        destructiveAction: 'Remover carteira',
        primaryButton: 'Carteiras Web3',
        title: 'Carteiras Web3',
      },
    },
    usernamePage: {
      successMessage: 'O nome de utilizador foi atualizado.',
      title__set: 'Atualizar nome de utilizador',
      title__update: 'Atualizar nome de utilizador',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Não vai conseguir usar esta carteira Web3 para entrar na sua conta.',
        successMessage: '{{Web3Wallet}} foi removido da sua conta.',
        title: 'Remover carteira Web3',
      },
      subtitle__availableWallets: 'Selecione uma carteira Web3 para conectar à sua conta.',
      subtitle__unavailableWallets: 'Não há carteiras Web3 disponíveis.',
      successMessage: 'A carteira foi adicionada à sua conta.',
      title: 'Adicionar carteira Web3',
      web3WalletButtonsBlockButton: undefined,
    },
  },
} as const;
