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

export const ptBR: LocalizationResource = {
  locale: 'pt-BR',
  backButton: 'Voltar',
  badge__default: 'Padrão',
  badge__otherImpersonatorDevice: 'Personificar outro dispositivo',
  badge__primary: 'Principal',
  badge__requiresAction: 'Requer ação',
  badge__thisDevice: 'Este dispositivo',
  badge__unverified: 'Não verificado',
  badge__userDevice: 'Dispositivo do usuário',
  badge__you: 'Você',
  createOrganization: {
    formButtonSubmit: 'Criar organização',
    invitePage: {
      formButtonReset: 'Pular',
    },
    title: 'Criar organização',
  },
  dates: {
    lastDay: "Ontem às {{ date | timeString('pt-BR') }}",
    next6Days: "{{ date | weekday('pt-BR','long') }} às {{ date | timeString('pt-BR') }}",
    nextDay: "Amanhã às {{ date | timeString('pt-BR') }}",
    numeric: "{{ date | numeric('pt-BR') }}",
    previous6Days: "Último {{ date | weekday('pt-BR','long') }} às {{ date | timeString('pt-BR') }}",
    sameDay: "Hoje às {{ date | timeString('pt-BR') }}",
  },
  dividerText: 'ou',
  footerActionLink__useAnotherMethod: 'Utilize outro método',
  footerPageLink__help: 'Ajuda',
  footerPageLink__privacy: 'Privacidade',
  footerPageLink__terms: 'Termos de uso',
  formButtonPrimary: 'Continuar',
  formButtonPrimary__verify: 'Verificar',
  formFieldAction__forgotPassword: 'Esqueceu a senha?',
  formFieldError__matchingPasswords: 'Senhas conferem.',
  formFieldError__notMatchingPasswords: 'Senhas não conferem.',
  formFieldError__verificationLinkExpired: 'O link de verificação expirou. Por favor solicite um novo link.',
  formFieldHintText__optional: 'Opcional',
  formFieldHintText__slug:
    'Um rótulo é um identificador legível por humanos que deve ser único. É comumente usado em URLs.',
  formFieldInputPlaceholder__backupCode: 'Insira o código de backup',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Excluir conta',
  formFieldInputPlaceholder__emailAddress: 'Digite o endereço de e-mail',
  formFieldInputPlaceholder__emailAddress_username: 'Digite seu e-mail ou nome de usuário',
  formFieldInputPlaceholder__emailAddresses: 'Insira um ou mais endereços de e-mail separados por espaços ou vírgulas',
  formFieldInputPlaceholder__firstName: 'Digite seu primeiro nome',
  formFieldInputPlaceholder__lastName: 'Digite seu sobrenome',
  formFieldInputPlaceholder__organizationDomain: 'Digite o domínio da organização',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'Digite o e-mail associado ao domínio da organização',
  formFieldInputPlaceholder__organizationName: 'Digite o nome da organização',
  formFieldInputPlaceholder__organizationSlug: 'minha-org',
  formFieldInputPlaceholder__password: 'Digite sua senha',
  formFieldInputPlaceholder__phoneNumber: 'Digite seu número de telefone',
  formFieldInputPlaceholder__username: 'Digite seu nome de usuário',
  formFieldLabel__automaticInvitations: 'Ativar convites automáticos para este domínio',
  formFieldLabel__backupCode: 'Código de backup',
  formFieldLabel__confirmDeletion: 'Confirmar exclusão',
  formFieldLabel__confirmPassword: 'Confirmar senha',
  formFieldLabel__currentPassword: 'Senha atual',
  formFieldLabel__emailAddress: 'Seu e-mail',
  formFieldLabel__emailAddress_username: 'E-mail ou nome de usuário',
  formFieldLabel__emailAddresses: 'Endereços de e-mail',
  formFieldLabel__firstName: 'Nome',
  formFieldLabel__lastName: 'Sobrenome',
  formFieldLabel__newPassword: 'Nova senha',
  formFieldLabel__organizationDomain: 'Domínio',
  formFieldLabel__organizationDomainDeletePending: 'Excluir convites e sugestões pendentes',
  formFieldLabel__organizationDomainEmailAddress: 'Endereço de e-mail de verificação',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Endereço de e-mail para receber um código e verificar este domínio',
  formFieldLabel__organizationName: 'Nome da organização',
  formFieldLabel__organizationSlug: 'Rótulo do URL',
  formFieldLabel__passkeyName: 'Nome da chave de acesso',
  formFieldLabel__password: 'Senha',
  formFieldLabel__phoneNumber: 'Telefone',
  formFieldLabel__role: 'Função',
  formFieldLabel__signOutOfOtherSessions: 'Desconectar de todos os outros dispositivos',
  formFieldLabel__username: 'Nome de usuário',
  impersonationFab: {
    action__signOut: 'Sair',
    title: 'Logado como {{identifier}}',
  },
  maintenanceMode: 'Estamos em manutenção, mas não se preocupe, não deve levar mais do que alguns minutos',
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
        'Adicione o domínio para verificar. Usuários com endereços de e-mail neste domínio podem se juntar à organização automaticamente ou solicitar participação.',
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
        tableHeader__actions: 'Ações',
        tableHeader__joined: 'Entrou',
        tableHeader__role: 'Função',
        tableHeader__user: 'Usuário',
      },
      detailsTitle__emptyRow: 'Nenhum membro para exibir',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Convide usuários conectando um domínio de e-mail com sua organização. Qualquer pessoa que se inscrever com um domínio de e-mail correspondente poderá se juntar à organização a qualquer momento.',
          headerTitle: 'Convites automáticos',
          primaryButton: 'Gerenciar domínios verificados',
        },
        table__emptyRow: 'Nenhum convite para exibir',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Cancelar convite',
        tableHeader__invited: 'Convidado',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Usuários que se inscrevem com um domínio de e-mail correspondente podem ver uma sugestão para solicitar participação em sua organização.',
          headerTitle: 'Sugestões automáticas',
          primaryButton: 'Gerenciar domínios verificados',
        },
        menuAction__approve: 'Aprovar',
        menuAction__reject: 'Rejeitar',
        tableHeader__requested: 'Acesso solicitado',
        table__emptyRow: 'Nenhuma solicitação para exibir',
      },
      start: {
        headerTitle__invitations: 'Convites',
        headerTitle__members: 'Membros',
        headerTitle__requests: 'Solicitações',
      },
    },
    navbar: {
      description: 'Gerencie sua organização.',
      general: 'Geral',
      members: 'Membros',
      title: 'Organização',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Digite {{organizationName}} abaixo para continuar.',
          messageLine1: 'Tem certeza de que deseja excluir esta organização?',
          messageLine2: 'Esta ação é permanente e irreversível.',
          successMessage: 'Você excluiu a organização.',
          title: 'Excluir organização',
        },
        leaveOrganization: {
          actionDescription: 'Digite {{organizationName}} abaixo para continuar.',
          messageLine1:
            'Tem certeza de que deseja sair desta organização? Você perderá o acesso a esta organização e suas aplicações.',
          messageLine2: 'Esta ação é permanente e não pode ser desfeita.',
          successMessage: 'Você saiu da organização.',
          title: 'Sair da organização',
        },
        title: 'Perigo',
      },
      domainSection: {
        menuAction__manage: 'Gerenciar',
        menuAction__remove: 'Excluir',
        menuAction__verify: 'Verificar',
        primaryButton: 'Adicionar domínio',
        subtitle:
          'Permita que os usuários se juntem à organização automaticamente ou solicitem participação com base em um domínio de e-mail verificado.',
        title: 'Domínios verificados',
      },
      successMessage: 'A organização foi atualizada.',
      title: 'Perfil da organização',
    },
    removeDomainPage: {
      messageLine1: 'O domínio de e-mail {{domain}} será removido.',
      messageLine2: 'Os usuários não poderão mais se juntar à organização automaticamente após isso.',
      successMessage: '{{domain}} foi removido.',
      title: 'Excluir domínio',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membros',
      profileSection: {
        primaryButton: 'Atualizar perfil',
        title: 'Perfil da Organização',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'A exclusão deste domínio afetará os usuários convidados.',
        removeDomainActionLabel__remove: 'Excluir domínio',
        removeDomainSubtitle: 'Remova este domínio de seus domínios verificados',
        removeDomainTitle: 'Excluir domínio',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Os usuários são convidados automaticamente a se juntar à organização quando se inscrevem e podem se juntar a qualquer momento.',
        automaticInvitationOption__label: 'Convites automáticos',
        automaticSuggestionOption__description:
          'Os usuários recebem uma sugestão para solicitar participação, mas devem ser aprovados por um administrador antes de poderem se juntar à organização.',
        automaticSuggestionOption__label: 'Sugestões automáticas',
        calloutInfoLabel: 'Alterar o modo de inscrição afetará apenas os novos usuários.',
        calloutInvitationCountLabel: 'Convites pendentes enviados aos usuários: {{count}}',
        calloutSuggestionCountLabel: 'Sugestões pendentes enviadas aos usuários: {{count}}',
        manualInvitationOption__description: 'Os usuários só podem ser convidados manualmente para a organização.',
        manualInvitationOption__label: 'Sem inscrição automática',
        subtitle: 'Escolha como os usuários deste domínio podem se juntar à organização.',
      },
      start: {
        headerTitle__danger: 'Perigo',
        headerTitle__enrollment: 'Opções de inscrição',
      },
      subtitle: 'O domínio {{domain}} agora está verificado. Continue selecionando o modo de inscrição.',
      title: 'Update {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Insira o código de verificação enviado para o seu endereço de e-mail',
      formTitle: 'Código de verificação',
      resendButton: 'Não recebeu um código? Reenviar',
      subtitle: 'O domínio {{domainName}} precisa ser verificado por e-mail.',
      subtitleVerificationCodeScreen:
        'Um código de verificação foi enviado para {{emailAddress}}. Insira o código para continuar.',
      title: 'Verificar domínio',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Criar organização',
    action__invitationAccept: 'Participar',
    action__manageOrganization: 'Gerenciar organização',
    action__suggestionsAccept: 'Solicitar participação',
    notSelected: 'Nenhuma organização selecionada',
    personalWorkspace: 'Conta pessoal',
    suggestionsAcceptedLabel: 'Aprovação pendente',
  },
  paginationButton__next: 'Próximo',
  paginationButton__previous: 'Anterior',
  paginationRowText__displaying: 'Exibindo',
  paginationRowText__of: 'de',
  reverification: {
    alternativeMethods: {
      actionLink: 'Solicitar ajuda',
      actionText: 'Não tem nenhum dos métodos? Tente outra forma.',
      blockButton__backupCode: 'Usar código de backup',
      blockButton__emailCode: 'Enviar código para {{identifier}}',
      blockButton__password: 'Usar senha',
      blockButton__phoneCode: 'Enviar código de telefone',
      blockButton__totp: 'Usar autenticação TOTP',
      getHelp: {
        blockButton__emailSupport: 'Entrar em contato com o suporte',
        content: 'Se você não tem nenhum dos métodos listados, entre em contato com nosso suporte.',
      },
      subtitle: 'Escolha um dos métodos alternativos para verificar sua identidade.',
      title: 'Métodos alternativos de verificação',
    },
    backupCodeMfa: {
      subtitle: 'Digite seu código de backup para continuar.',
      title: 'Verificação com código de backup',
    },
    emailCode: {
      formTitle: 'Código enviado para seu e-mail',
      resendButton: 'Reenviar código',
      subtitle: 'Verifique seu e-mail e insira o código para continuar.',
      title: 'Verifique seu e-mail',
    },
    noAvailableMethods: {
      message: 'Nenhum método de verificação disponível. Entre em contato com o suporte.',
      subtitle: 'Não há métodos de verificação disponíveis no momento.',
      title: 'Métodos de verificação indisponíveis',
    },
    password: {
      actionLink: 'Usar outro método',
      subtitle: 'Digite sua senha para continuar.',
      title: 'Digite sua senha',
    },
    phoneCode: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: 'Verifique seu celular para o código de verificação.',
      title: 'Verifique seu celular',
    },
    phoneCodeMfa: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: 'Verifique seu celular para o código de verificação.',
      title: 'Verifique seu celular',
    },
    totpMfa: {
      formTitle: 'Código de verificação TOTP',
      subtitle: 'Digite o código de verificação gerado pelo seu aplicativo de autenticação.',
      title: 'Autenticação TOTP',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Adicionar conta',
      action__signOutAll: 'Sair de todas as contas',
      subtitle: 'Selecione a conta com a qual gostaria de continuar.',
      title: 'Escolha uma conta.',
    },
    alternativeMethods: {
      actionLink: 'Ajuda',
      actionText: 'Não tem nenhum destes?',
      blockButton__backupCode: 'Utilize um código de backup',
      blockButton__emailCode: 'Enviar código para {{identifier}}',
      blockButton__emailLink: 'Enviar link para {{identifier}}',
      blockButton__passkey: 'Acessar com sua chave de acesso',
      blockButton__password: 'Acessar com sua senha',
      blockButton__phoneCode: 'Enviar código para {{identifier}}',
      blockButton__totp: 'Utilize seu aplicativo autenticador',
      getHelp: {
        blockButton__emailSupport: 'E-mail de suporte',
        content:
          'Se estiver com dificuldades para entrar em sua conta, envie um e-mail para nós que iremos te ajudar a restaurar seu acesso o mais rápido possível.',
        title: 'Ajuda',
      },
      subtitle: 'Encontrando dificuldades? Você pode utilizar qualquer um destes métodos para acessar.',
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
      title: 'Verifique seu e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Para continuar, abra o link de verificação no mesmo dispositivo e navegador em que iniciou o login',
        title: 'Link de verificação é inválido para este dispositivo',
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
        subtitle: 'Você será redirecionado em breve',
        title: 'Conectando...',
      },
      resendButton: 'Não recebeu um link? Reenviar',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique seu e-mail',
      unusedTab: {
        title: 'Você pode fechar esta aba',
      },
      verified: {
        subtitle: 'Você será redirecionado em breve',
        title: 'Login realizado com sucesso',
      },
      verifiedSwitchTab: {
        subtitle: 'Retorne para a aba original para continuar',
        subtitleNewTab: 'Retorne para a nova aba que foi aberta para continuar',
        titleNewTab: 'Conectado em outra aba',
      },
    },
    forgotPassword: {
      formTitle: 'Código de redefinição de senha',
      resendButton: 'Não recebeu um código? Reenviar',
      subtitle: 'para redefinir sua senha',
      subtitle_email: 'Primeiro, digite o código enviado para seu e-mail',
      subtitle_phone: 'Primeiro, digite o código enviado para seu telefone',
      title: 'Redefinir senha',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Redefinir sua senha',
      label__alternativeMethods: 'Ou, faça login com outro método.',
      title: 'Esqueceu a senha?',
    },
    noAvailableMethods: {
      message: 'Não foi possível fazer login. Não há nenhum método de autenticação disponível.',
      subtitle: 'Aconteceu um erro',
      title: 'Não foi possível fazer login',
    },
    passkey: {
      subtitle:
        'Usar sua chave de acesso confirma a sua identidade. Seu dispositivo pode solicitar sua impressão digital, reconhecimento facial ou PIN.',
      title: 'Use sua chave de acesso.',
    },
    password: {
      actionLink: 'Utilize outro método',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Insira sua senha',
    },
    passwordPwned: {
      title: 'Senha comprometida',
    },
    phoneCode: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique seu telefone',
    },
    phoneCodeMfa: {
      formTitle: 'Código de verificação',
      resendButton: 'Reenviar código',
      subtitle: 'Para continuar, insira o código enviado para o seu telefone.',
      title: 'Verifique seu telefone',
    },
    resetPassword: {
      formButtonPrimary: 'Redefinir Senha',
      requiredMessage: 'Por razões de segurança, é necessário redefinir sua senha.',
      successMessage: 'Sua senha foi alterada com sucesso. Entrando, por favor aguarde um momento.',
      title: 'Redefinir Senha',
    },
    resetPasswordMfa: {
      detailsLabel: 'Precisamos verificar sua identidade antes de redefinir sua senha.',
    },
    start: {
      actionLink: 'Registre-se',
      actionLink__join_waitlist: 'Entrar na lista de espera',
      actionLink__use_email: 'Usar e-mail',
      actionLink__use_email_username: 'Usar e-mail ou nome de usuário',
      actionLink__use_passkey: 'Ou use sua chave de acesso',
      actionLink__use_phone: 'Usar telefone',
      actionLink__use_username: 'Usar nome de usuário',
      actionText: 'Não possui uma conta?',
      actionText__join_waitlist: 'Quer ser notificado quando estivermos prontos?',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Entrar',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Código de verificação',
      subtitle: 'Para continuar, insira o código gerado pelo seu aplicativo autenticador.',
      title: 'Verificação em duas etapas',
    },
  },
  signInEnterPasswordTitle: 'Insira sua senha',
  signUp: {
    continue: {
      actionLink: 'Entrar',
      actionText: 'Possui uma conta?',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Preencha os campos ausentes',
    },
    emailCode: {
      formSubtitle: 'Insira o código enviado para seu e-mail',
      formTitle: 'Código de verificação',
      resendButton: 'Não recebeu o código? Reenviar',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique seu e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Para continuar, abra o link de verificação no mesmo dispositivo e navegador em que iniciou o cadastro',
        title: 'Link de verificação é inválido para este dispositivo',
      },
      formSubtitle: 'Utilize o link enviado no seu e-mail',
      formTitle: 'Link de verificação',
      loading: {
        title: 'Conectando...',
      },
      resendButton: 'Reenviar link',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique seu e-mail',
      verified: {
        title: 'Cadastro realizado com sucesso',
      },
      verifiedSwitchTab: {
        subtitle: 'Retorne para a nova aba que foi aberta para continuar',
        subtitleNewTab: 'Retorne para a aba anterior para continuar',
        title: 'E-mail verificado com sucesso',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Eu concordo com a {{privacyPolicyLink || link("Política de Privacidade")}}',
        label__onlyTermsOfService: 'Eu concordo com os {{termsOfServiceLink || link("Termos de Uso")}}',
        label__termsOfServiceAndPrivacyPolicy:
          'Eu concordo com os {{termsOfServiceLink || link("Termos de Uso")}} e com a {{ privacyPolicyLink || link("Política de Privacidade") }}',
      },
      continue: {
        subtitle: 'Por favor leia e aceite os termos para continuar',
        title: 'Continuar',
      },
    },

    phoneCode: {
      formSubtitle: 'Insira o código enviado para seu telefone',
      formTitle: 'Código de verificação',
      resendButton: 'Não recebeu o código? Reenviar',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Verifique seu telefone',
    },
    restrictedAccess: {
      actionLink: 'Entrar',
      actionText: 'Já possui uma conta?',
      blockButton__emailSupport: 'Suporte por e-mail',
      blockButton__joinWaitlist: 'Entre na lista de espera',
      subtitle:
        'Cadastros estão desabilitados no momento. Se você deveria ter acesso, por favor entre em contato com o suporte.',
      subtitleWaitlist:
        'Cadastros estão desabilitados no momento. Para ser um dos primeiros a saber quando lançaremos, entre na lista de espera.',
      title: 'Acesso restrito',
    },

    start: {
      actionLink: 'Entrar',
      actionLink__use_email: 'Ou use e-mail',
      actionLink__use_phone: 'Ou use telefone',
      actionText: 'Possui uma conta?',
      subtitle: 'para continuar em {{applicationName}}',
      title: 'Criar sua conta',
    },
  },
  socialButtonsBlockButton: 'Continuar com {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: '{{email}} já é membro da organização.',
    captcha_invalid:
      'Não foi possível se inscrever devido a falhas nas validações de segurança. Por favor, atualize a página para tentar novamente ou entre em contato com o suporte para obter mais ajuda.',
    captcha_unavailable:
      'Não foi possível se inscrever devido à indisponibilidade do captcha. Por favor atualize a página para tentar novamente ou entre em contato com o suporte para obter mais ajuda.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: 'E-mail já está em uso. Por favor, tente outro.',
    form_identifier_exists__phone_number: 'Telefone já está em uso. Por favor, tente outro.',
    form_identifier_exists__username: 'Nome de usuário já está em uso. Por favor, tente outro.',
    form_identifier_not_found: 'Não foi possível encontrar o usuário.',
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'O endereço de e-mail deve ser um endereço de e-mail válido.',
    form_param_format_invalid__phone_number: 'Número de telefone precisa estar num formato internacional válido.',
    form_param_max_length_exceeded__first_name: 'O primeiro nome não deve exceder 256 caracteres.',
    form_param_max_length_exceeded__last_name: 'O sobrenome não deve exceder 256 caracteres.',
    form_param_max_length_exceeded__name: 'O nome não deve exceder 256 caracteres.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: 'Senha incorreta.',
    form_password_length_too_short: 'Sua senha é muito curta. Por favor, tente novamente.',
    form_password_not_strong_enough: 'Sua senha não é forte o suficiente.',
    form_password_pwned: 'Esta senha foi comprometida e não pode ser usada, por favor, tente outra senha.',
    form_password_pwned__sign_in: 'Esta senha foi comprometida, por favor redefina sua senha.',
    form_password_size_in_bytes_exceeded:
      'Sua senha excedeu o número máximo de bytes permitidos, por favor, encurte-a ou remova alguns caracteres especiais.',
    form_password_validation_failed: 'Senha incorreta',
    form_username_invalid_character: 'Nome de usuário contém caracteres inválidos. Por favor, tente outro.',
    form_username_invalid_length: 'Nome de usuário deve ter entre 3 e 256 caracteres.',
    identification_deletion_failed: 'Você não pode excluir sua última identificação.',
    not_allowed_access: 'Acesso não permitido.',
    organization_domain_blocked: 'Este é um provedor de domínio de e-mail bloqueado. Por favor, use um diferente.',
    organization_domain_common: 'Este é um provedor de domínio de e-mail comum. Por favor, use um diferente.',
    organization_membership_quota_exceeded:
      'Você chegou ao seu limite de membros da organização, incluindo convites pendentes.',
    organization_minimum_permissions_needed:
      'É necessário que haja pelo menos um membro da organização com as permissões mínimas necessárias.',
    passkey_already_exists: 'Uma chave de acesso já está registrada neste dispositivo.',
    passkey_not_supported: 'Chaves de acesso não são suportadas neste dispositivo.',
    passkey_pa_not_supported: 'Registro precisa de chave de acesso mas dispositivo não a suporta.',
    passkey_registration_cancelled: 'Registro de chave de acesso cancelado ou expirado.',
    passkey_retrieval_cancelled: 'Verificação de chave de acesso cancelada ou expirada.',
    passwordComplexity: {
      maximumLength: 'menos de {{length}} caracteres',
      minimumLength: '{{length}} ou mais caracteres',
      requireLowercase: 'uma letra minúscula',
      requireNumbers: 'um número',
      requireSpecialCharacter: 'um caractere especial',
      requireUppercase: 'uma letra maiúscula',
      sentencePrefix: 'Sua senha deve conter',
    },
    phone_number_exists: 'Este número de telefone já está em uso. Por favor, tente outro.',
    zxcvbn: {
      couldBeStronger: 'Sua senha funciona, mas poderia ser mais forte. Tente adicionar mais caracteres.',
      goodPassword: 'Sua senha atende a todos os requisitos necessários.',
      notEnough: 'Sua senha não é forte o suficiente.',
      suggestions: {
        allUppercase: 'Utilize apenas algumas letras maiúsculas, não todas.',
        anotherWord: 'Adicione mais palavras que são menos comuns.',
        associatedYears: 'Evite anos associados a você.',
        capitalization: 'Utilize outras letras maiúsculas, além do que primeira.',
        dates: 'Evite datas e anos associados a você.',
        l33t: "Evite substituições previsíveis de letras, como '@' por 'a'.",
        longerKeyboardPattern: 'Use padrões de teclado mais longos e mude a direção da digitação várias vezes.',
        noNeed: 'Você pode criar senhas fortes sem usar símbolos, números ou letras maiúsculas.',
        pwned: 'Se você usar esta senha em outro lugar, você deve mudá-la.',
        recentYears: 'Evite anos recentes.',
        repeated: 'Evite palavras e caracteres repetidos.',
        reverseWords: 'Evite utilizar palavras comuns escritas de "trás para frente".',
        sequences: 'Evite sequências comuns de caracteres.',
        useWords: 'Use várias palavras, mas evite frases comuns.',
      },
      warnings: {
        common: 'Esta é uma senha comumente usada.',
        commonNames: 'Nomes e sobrenomes comuns são fáceis de adivinhar.',
        dates: 'Datas são fáceis de adivinhar.',
        extendedRepeat: 'Padrões de caracteres repetidos, como "abcabcabc" são fáceis de adivinhar.',
        keyPattern: 'Padrões curtos de teclado são fáceis de adivinhar.',
        namesByThemselves: 'Nomes ou sobrenomes são fáceis de adivinhar.',
        pwned: 'Sua senha foi exposta por uma violação de dados na Internet.',
        recentYears: 'Anos recentes são fáceis de adivinhar.',
        sequences: 'Sequências comuns de caracteres, como "abc" são fáceis de adivinhar.',
        similarToCommon: 'Esta é semelhante a uma senha comumente usada.',
        simpleRepeat: 'Caracteres repetidos, como "aaa" são fáceis de adivinhar.',
        straightRow: 'Letras que vêm em sequência teclado são fáceis de adivinhar.',
        topHundred: 'Esta é uma senha usada frequentemente.',
        topTen: 'Esta é uma senha muito usada.',
        userInputs: 'Não deve haver nenhum dado pessoal ou relacionado à página.',
        wordByItself: 'Palavras simples são fáceis de adivinhar.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Adicionar conta',
    action__manageAccount: 'Gerenciar conta',
    action__signOut: 'Sair',
    action__signOutAll: 'Sair de todas as contas',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copiado!',
      actionLabel__copy: 'Copiar tudo',
      actionLabel__download: 'Download .txt',
      actionLabel__print: 'Imprimir',
      infoText1: 'Códigos de backup serão ativados para esta conta.',
      infoText2:
        'Guarde-os em segurança e mantenha-os em sigilo. Você pode gerar novos códigos de backup se suspeitar que eles tenham sido comprometidos.',
      subtitle__codelist: 'Guarde-os em segurança e mantenha-os em sigilo.',
      successMessage:
        'Códigos de backup foram ativados para esta conta. Você pode usar um deles para fazer login na sua conta caso perca o acesso ao seu dispositivo de autenticação. Cada código poderá ser utilizado apenas uma vez.',
      successSubtitle:
        'Você pode usar um deles para fazer login na sua conta caso perca o acesso ao seu dispositivo de autenticação.',
      title: 'Adicionar código de backup para verificação',
      title__codelist: 'Códigos de backup',
    },
    connectedAccountPage: {
      formHint: 'Selecione um provedor para conectar à sua conta.',
      formHint__noAccounts: 'Não há provedores de conta externos disponíveis.',
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2:
          'Você não conseguirá mais usar esta conta e quaisquer recursos dependentes dela deixarão de funcionar.',
        successMessage: '{{connectedAccount}} foi removido da sua conta.',
        title: 'Remover conta conectada',
      },
      socialButtonsBlockButton: 'Conectar conta {{provider|titleize}}',
      successMessage: 'O provedor foi adicionado à sua conta',
      title: 'Conecte uma conta',
    },
    deletePage: {
      actionDescription: 'Digite Excluir conta abaixo para continuar.',
      confirm: 'Excluir conta',
      messageLine1: 'Tem certeza de que deseja excluir sua conta?',
      messageLine2: 'Esta ação é permanente e irreversível.',
      title: 'Excluir conta',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Um e-mail contendo um código de verificação será enviado para este endereço de e-mail.',
        formSubtitle: 'Insira o código de verificação enviado para {{identifier}}',
        formTitle: 'Código de verificação',
        resendButton: 'Não recebeu um código? Reenviar',
        successMessage: 'O e-mail {{identifier}} foi adicionado na sua conta.',
      },
      emailLink: {
        formHint: 'Um e-mail contendo um link de verificação será enviado para este endereço de e-mail.',
        formSubtitle: 'Clique no link de verificação enviado para {{identifier}}',
        formTitle: 'Link de verificação',
        resendButton: 'Não recebeu um código? Reenviar',
        successMessage: 'O e-mail {{identifier}} foi adicionado na sua conta.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Você não conseguirá fazer login novamente com este endereço de e-mail.',
        successMessage: '{{emailAddress}} foi removido da sua conta.',
        title: 'Remover e-mail',
      },
      title: 'Adicionar e-mail',
      verifyTitle: 'Verificar endereço de e-mail',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Continuar',
    formButtonPrimary__finish: 'Finalizar',
    formButtonPrimary__remove: 'Excluir',
    formButtonPrimary__save: 'Salvar',
    formButtonReset: 'Cancelar',
    mfaPage: {
      formHint: 'Selecione um método para adicionar.',
      title: 'Adicione verificação em duas etapas',
    },
    mfaPhoneCodePage: {
      backButton: 'Usar número existente',
      primaryButton__addPhoneNumber: 'Adicione um número de telefone',
      removeResource: {
        messageLine1: '{{identifier}} não receberá mais códigos de verificação ao realizar o login.',
        messageLine2: 'Sua conta pode ficar menos segura. Tem certeza que deseja continuar?',
        successMessage: 'Código SMS de verificação em duas etapas foi removido para {{mfaPhoneCode}}',
        title: 'Remover verificação em duas etapas',
      },
      subtitle__availablePhoneNumbers:
        'Selecione um número de telefone para registrar a verificação em duas etapas por código SMS.',
      subtitle__unavailablePhoneNumbers:
        'Não há números de telefone disponíveis para registrar a verificação em duas etapas por código SMS.',
      successMessage1:
        'Ao acessar, será necessário o passo adicional de digitar o código de verificação enviado a este telefone.',
      successMessage2:
        'Salve estes códigos de backup e os armazene em um lugar seguro. Se você perder acesso ao seu dispositivo de autenticação, você pode utilizá-los para acessar o sistema.',
      successTitle: 'Verificação por SMS habilitada',
      title: 'Adicionar verificação por SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Escanear código QR em vez disso',
        buttonUnableToScan__nonPrimary: 'Não pode escanear o código QR?',
        infoText__ableToScan:
          'Configure um novo método de login no seu aplicativo autenticador e escaneie o seguinte código QR para vinculá-lo à sua conta.',
        infoText__unableToScan:
          'Configure um novo método de login no seu aplicativo autenticador e insira a chave informada abaixo.',
        inputLabel__unableToScan1:
          "Certifique-se de que o 'One-time passwords' está habilitado, em seguida, conclua a vinculação de sua conta.",
        inputLabel__unableToScan2:
          'Alternativamente, se seu autenticador suportar URIs TOTP, você também pode copiar a URI completa.',
      },
      removeResource: {
        messageLine1:
          'Os códigos de verificação deste aplicativo autenticador não serão mais necessários ao fazer login.',
        messageLine2: 'Sua conta pode ficar menos segura. Tem certeza que deseja continuar?',
        successMessage: 'A verificação em duas etapas via aplicativo autenticador foi removida.',
        title: 'Remover verificação em duas etapas',
      },
      successMessage:
        'A verificação em duas etapas está ativa agora. Ao fazer login, você precisará inserir um código de verificação deste aplicativo autenticador como uma etapa adicional.',
      title: 'Adicionar um aplicativo autenticador',
      verifySubtitle: 'Insira o código de verificação gerado pelo seu aplicativo autenticador',
      verifyTitle: 'Código de verificação',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Perfil',
      description: 'Gerencie seus dados de perfil.',
      security: 'Segurança',
      title: 'Conta',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} será removido desta conta.',
        title: 'Remover chave de acesso',
      },
      subtitle__rename: 'Você pode renomear a chave de acesso para que seja mais fácil encontrá-la.',
      title__rename: 'Renomear chave de acesso',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'É recomendado sair de todos os demais dispositivos que podem ter utilizado sua senha antiga.',
      readonly:
        'Sua senha atualmente não pode ser editada porque você só pode fazer login por meio da conexão da empresa.',
      successMessage__set: 'Sua senha foi salva.',
      successMessage__signOutOfOtherSessions: 'Todos os outros dispositivos foram desconectados.',
      successMessage__update: 'Sua senha foi atualizada.',
      title__set: 'Defina a senha',
      title__update: 'Trocar senha',
    },
    phoneNumberPage: {
      infoText: 'Um SMS contendo um link de verificação será enviado para este telefone.',
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Você não conseguirá fazer login novamente utilizando este número de telefone.',
        successMessage: '{{phoneNumber}} foi removido da sua conta.',
        title: 'Remover telefone',
      },
      successMessage: '{{identifier}} foi adicionado na sua conta.',
      title: 'Adicionar telefone',
      verifySubtitle: 'Insira o código de verificação enviado para {{identifier}}',
      verifyTitle: 'Verificar número de telefone',
    },
    profilePage: {
      fileDropAreaHint: 'Carregue uma imagem JPG, PNG, GIF ou WEBP menor que 10 MB',
      imageFormDestructiveActionSubtitle: 'Remover imagem',
      imageFormSubtitle: 'Carregar imagem',
      imageFormTitle: 'Imagem do perfil',
      readonly: 'As informações do seu perfil foram fornecidas pela conexão corporativa e não podem ser editadas.',
      successMessage: 'Seu perfil foi atualizado.',
      title: 'Atualizar perfil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Sair do dispositivo',
        title: 'Dispositivos ativos',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Tentar novamente',
        actionLabel__reauthorize: 'Reautorizar agora',
        destructiveActionTitle: 'Remover',
        primaryButton: 'Conectar conta',
        subtitle__disconnected: 'Esta conta foi descontectada',
        subtitle__reauthorize:
          'Os escopos necessários foram atualizados, e você pode estar experimentado funcionalidades limitadas. Por favor, reautorize esta aplicação para evitar outros problemas',
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
          actionLabel__regenerate: 'Gerar códigos novamente',
          headerTitle: 'Códigos de backup',
          subtitle__regenerate:
            'Obtenha um novo conjunto de códigos de backup seguros. Os códigos de backup anteriores serão excluídos e não poderão ser usados.',
          title__regenerate: 'Gerar códigos de backup novamente',
        },
        phoneCode: {
          actionLabel__setDefault: 'Definir como principal',
          destructiveActionLabel: 'Remover telefone',
        },
        primaryButton: 'Adicione verificação',
        title: 'Verificação em duas etapas',
        totp: {
          destructiveActionTitle: 'Remover',
          headerTitle: 'Aplicativo autenticador',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Remover',
        menuAction__rename: 'Renomear',
        title: 'Chaves de acesso',
      },
      passwordSection: {
        primaryButton__setPassword: 'Defina a senha',
        primaryButton__updatePassword: 'Trocar a senha',
        title: 'Senha',
      },
      phoneNumbersSection: {
        destructiveAction: 'Remover telefone',
        detailsAction__nonPrimary: 'Definir como principal',
        detailsAction__primary: 'Completar verificação',
        detailsAction__unverified: 'Completar verificação',
        primaryButton: 'Adicione um telefone',
        title: 'Números de telefone',
      },
      profileSection: {
        primaryButton: 'Atualizar perfil',
        title: 'Perfil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Definir nome de usuário',
        primaryButton__updateUsername: 'Trocar nome de usuário',
        title: 'Nome de usuário',
      },
      web3WalletsSection: {
        destructiveAction: 'Remover carteira',
        primaryButton: 'Carteiras Web3',
        title: 'Carteiras Web3',
      },
    },
    usernamePage: {
      successMessage: 'Seu nome de usuário foi atualizado.',
      title__set: 'Atualizar nome de usuário',
      title__update: 'Atualizar nome de usuário',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} será removido desta conta.',
        messageLine2: 'Você não poderá mais usar esta carteira Web3 para entrar na sua conta.',
        successMessage: '{{Web3Wallet}} foi removido da sua conta.',
        title: 'Remover carteira Web3',
      },
      subtitle__availableWallets: 'Selecione uma carteira Web3 para conectar à sua conta.',
      subtitle__unavailableWallets: 'Não há carteiras Web3 disponíveis.',
      successMessage: 'A carteira foi adicionada à sua conta.',
      title: 'Adicionar carteira Web3',
      web3WalletButtonsBlockButton: 'Conectar carteira Web3',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Entrar',
      actionText: 'Já possui acesso?',
      formButton: 'Entrar na lista de espera',
      subtitle: 'Entre com seu e-mail e entraremos em contato quando seu lugar estiver disponível',
      title: 'Entre na lista de espera',
    },
    success: {
      message: 'Te redireceionando em breve...',
      subtitle: 'Entraremos em contato quando seu lugar estiver disponível',
      title: 'Obrigado por entrar na lista de espera!',
    },
  },
} as const;
