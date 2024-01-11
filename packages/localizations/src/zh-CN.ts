import type { LocalizationResource } from '@clerk/types';

export const zhCN: LocalizationResource = {
  locale: 'zh-CN',
  backButton: '返回',
  badge__default: '默认',
  badge__otherImpersonatorDevice: '其他模拟器设备',
  badge__primary: '主要',
  badge__requiresAction: '需要操作',
  badge__thisDevice: '此设备',
  badge__unverified: '未验证',
  badge__userDevice: '用户设备',
  badge__you: '您',
  createOrganization: {
    formButtonSubmit: '创建组织',
    invitePage: {
      formButtonReset: '跳过',
    },
    title: '创建组织',
  },
  dates: {
    lastDay: "昨天{{ date | timeString('zh-CN') }}",
    next6Days: "{{ date | weekday('zh-CN','long') }} {{ date | timeString('zh-CN') }}",
    nextDay: "明天{{ date | timeString('zh-CN') }}",
    numeric: "{{ date | numeric('zh-CN') }}",
    previous6Days: "上周{{ date | weekday('zh-CN','long') }} {{ date | timeString('zh-CN') }}",
    sameDay: "今天{{ date | timeString('zh-CN') }}",
  },
  dividerText: '或者',
  footerActionLink__useAnotherMethod: '使用另一种方法',
  footerPageLink__help: '帮助',
  footerPageLink__privacy: '隐私',
  footerPageLink__terms: '条款',
  formButtonPrimary: '继续',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: '忘记密码？',
  formFieldError__matchingPasswords: '密码匹配。',
  formFieldError__notMatchingPasswords: '密码不匹配。',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: '选填',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses: '输入或粘贴一个或多个电子邮件地址，用空格或逗号分隔',
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
  formFieldLabel__backupCode: '备用代码',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: '确认密码',
  formFieldLabel__currentPassword: '当前密码',
  formFieldLabel__emailAddress: '电子邮件地址',
  formFieldLabel__emailAddress_username: '电子邮件地址或用户名',
  formFieldLabel__emailAddresses: '电子邮件地址',
  formFieldLabel__firstName: '名字',
  formFieldLabel__lastName: '姓氏',
  formFieldLabel__newPassword: '新密码',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: '组织名称',
  formFieldLabel__organizationSlug: 'URL 简称',
  formFieldLabel__password: '密码',
  formFieldLabel__phoneNumber: '电话号码',
  formFieldLabel__role: '角色',
  formFieldLabel__signOutOfOtherSessions: '登出所有其他设备',
  formFieldLabel__username: '用户名',
  impersonationFab: {
    action__signOut: '退出登录',
    title: '以 {{identifier}} 登录',
  },
  membershipRole__admin: '管理员',
  membershipRole__basicMember: '成员',
  membershipRole__guestMember: '访客',
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
      detailsTitle__inviteFailed: '邀请无法发送。修复以下问题然后重试：',
      formButtonPrimary__continue: '发送邀请',
      subtitle: '邀请新成员加入此组织',
      successMessage: '邀请成功发送',
      title: '邀请成员',
    },
    membersPage: {
      action__invite: '邀请',
      activeMembersTab: {
        menuAction__remove: '移除成员',
        tableHeader__actions: '',
        tableHeader__joined: '加入',
        tableHeader__role: '角色',
        tableHeader__user: '用户',
      },
      detailsTitle__emptyRow: '没有可显示的成员',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        manualInvitations: {
          headerSubtitle: 'Manually invite members and manage existing invitations.',
          headerTitle: 'Individual invitations',
        },
        table__emptyRow: 'No invitations to display',
      },
      invitedMembersTab: {
        menuAction__revoke: '撤销邀请',
        tableHeader__invited: '已邀请',
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
          messageLine1: '您确定要离开此组织吗？您将失去对此组织及其应用程序的访问权限。',
          messageLine2: '此操作是永久性的且无法撤销。',
          successMessage: '您已离开了组织。',
          title: '离开组织',
        },
        title: '危险',
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
      successMessage: '组织已更新。',
      title: '组织简介',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: '成员',
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
    action__createOrganization: '创建组织',
    action__invitationAccept: 'Join',
    action__manageOrganization: '管理组织',
    action__suggestionsAccept: 'Request to join',
    notSelected: '未选择组织',
    personalWorkspace: '个人工作区',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: '下一页',
  paginationButton__previous: '上一页',
  paginationRowText__displaying: '显示',
  paginationRowText__of: '的',
  signIn: {
    alternativeMethods: {
      actionLink: '获取帮助',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: '使用备用代码',
      blockButton__emailCode: '电子邮件验证码到 {{identifier}}',
      blockButton__emailLink: '电子邮件链接到 {{identifier}}',
      blockButton__password: '使用您的密码登录',
      blockButton__phoneCode: '发送短信代码到 {{identifier}}',
      blockButton__totp: '使用您的验证应用程序',
      getHelp: {
        blockButton__emailSupport: '邮件支持',
        content: '如果您在登录账户时遇到困难，请给我们发送电子邮件，我们将尽快让您恢复访问。',
        title: '获取帮助',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: '使用其他方法',
    },
    backupCodeMfa: {
      subtitle: '继续使用 {{applicationName}}',
      title: '输入备用代码',
    },
    emailCode: {
      formTitle: '验证码',
      resendButton: '重新发送验证码',
      subtitle: '继续使用 {{applicationName}}',
      title: '查看您的电子邮件',
    },
    emailLink: {
      expired: {
        subtitle: '返回原始标签页继续。',
        title: '此验证链接已过期',
      },
      failed: {
        subtitle: '返回原始标签页继续。',
        title: '此验证链接无效',
      },
      formSubtitle: '使用发送到您的电子邮件的验证链接',
      formTitle: '验证链接',
      loading: {
        subtitle: '即将为您重定向',
        title: '正在登录...',
      },
      resendButton: '重新发送链接',
      subtitle: '继续使用 {{applicationName}}',
      title: '查看您的电子邮件',
      unusedTab: {
        title: '您可以关闭此标签页',
      },
      verified: {
        subtitle: '即将为您重定向',
        title: '成功登录',
      },
      verifiedSwitchTab: {
        subtitle: '返回原始标签页继续',
        subtitleNewTab: '返回新打开的标签页继续',
        titleNewTab: '在其他标签页上登录',
      },
    },
    forgotPassword: {
      formTitle: '重置密码代码',
      resendButton: '重新发送代码',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: '重置密码',
      label__alternativeMethods: '或者，使用其他方式登录。',
      title: '忘记密码？',
    },
    noAvailableMethods: {
      message: '无法继续登录。没有可用的身份验证因素。',
      subtitle: '出现错误',
      title: '无法登录',
    },
    password: {
      actionLink: '使用其他方法',
      subtitle: '继续使用 {{applicationName}}',
      title: '输入您的密码',
    },
    phoneCode: {
      formTitle: '验证码',
      resendButton: '重新发送验证码',
      subtitle: '继续使用 {{applicationName}}',
      title: '检查手机短信',
    },
    phoneCodeMfa: {
      formTitle: '验证码',
      resendButton: '重新发送验证码',
      subtitle: '',
      title: '检查手机短信',
    },
    resetPassword: {
      formButtonPrimary: '重置密码',
      requiredMessage:
        'An account already exists with an unverified email address. Please reset your password for security.',
      successMessage: '您的密码已成功更改。正在为您登录，请稍等。',
      title: '重置密码',
    },
    resetPasswordMfa: {
      detailsLabel: '我们需要验证您的身份才能重置您的密码。',
    },
    start: {
      actionLink: '注册',
      actionLink__use_email: '使用电子邮件',
      actionLink__use_email_username: '使用电子邮件或用户名',
      actionLink__use_phone: '使用电话',
      actionLink__use_username: '使用用户名',
      actionText: '还没有账户？',
      subtitle: '继续使用 {{applicationName}}',
      title: '登录',
    },
    totpMfa: {
      formTitle: '验证码',
      subtitle: '',
      title: '两步验证',
    },
  },
  signInEnterPasswordTitle: '输入您的密码',
  signUp: {
    continue: {
      actionLink: '登录',
      actionText: '已经有账户了？',
      subtitle: '继续使用 {{applicationName}}',
      title: '填写缺少的字段',
    },
    emailCode: {
      formSubtitle: '输入发送到您的电子邮件地址的验证码',
      formTitle: '验证码',
      resendButton: '重新发送验证码',
      subtitle: '继续使用 {{applicationName}}',
      title: '验证您的电子邮件',
    },
    emailLink: {
      formSubtitle: '使用发送到您的电子邮件地址的验证链接',
      formTitle: '验证链接',
      loading: {
        title: '正在注册...',
      },
      resendButton: '重新发送链接',
      subtitle: '继续使用 {{applicationName}}',
      title: '验证您的电子邮件',
      verified: {
        title: '成功注册',
      },
      verifiedSwitchTab: {
        subtitle: '返回新打开的标签页继续',
        subtitleNewTab: '返回上一个标签页继续',
        title: '成功验证电子邮件',
      },
    },
    phoneCode: {
      formSubtitle: '输入发送到您的电话号码的验证码',
      formTitle: '验证码',
      resendButton: '重新发送验证码',
      subtitle: '继续使用 {{applicationName}}',
      title: '验证您的电话',
    },
    start: {
      actionLink: '登录',
      actionText: '已经有账户了？',
      subtitle: '继续使用 {{applicationName}}',
      title: '创建您的账户',
    },
  },
  socialButtonsBlockButton: '使用 {{provider|titleize}} 登录',
  unstable__errors: {
    captcha_invalid: '由于安全验证失败，注册未成功。请刷新页面重试或联系支持获取更多帮助。',
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
    form_password_not_strong_enough: '您的密码强度不够。',
    form_password_pwned: '这个密码在数据泄露中被发现，不能使用，请换一个密码试试。',
    form_password_size_in_bytes_exceeded: '您的密码超过了允许的最大字节数，请缩短它或去掉一些特殊字符。',
    form_password_validation_failed: '密码错误',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    passwordComplexity: {
      maximumLength: '少于{{length}}个字符',
      minimumLength: '{{length}}个或更多字符',
      requireLowercase: '一个小写字母',
      requireNumbers: '一个数字',
      requireSpecialCharacter: '一个特殊字符',
      requireUppercase: '一个大写字母',
      sentencePrefix: '您的密码必须包含',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger: '您的密码可以用，但可以更强。试着添加更多字符。',
      goodPassword: '做得好。这是一个优秀的密码。',
      notEnough: '您的密码强度不够。',
      suggestions: {
        allUppercase: '大写一些，但不是所有的字母。',
        anotherWord: '添加更不常见的更多单词。',
        associatedYears: '避免与你有关的年份。',
        capitalization: '大写不仅仅是第一个字母。',
        dates: '避免与你有关的日期和年份。',
        l33t: '避免预测的字母替换，如"@"代替"a"。',
        longerKeyboardPattern: '使用更长的键盘模式，并多次改变打字方向。',
        noNeed: '你可以创建强密码，而无需使用符号，数字或大写字母。',
        pwned: '如果您在其他地方使用此密码，您应该更改它。',
        recentYears: '避免近年来。',
        repeated: '避免重复的单词和字符。',
        reverseWords: '避免常用词的反向拼写。',
        sequences: '避免常见字符序列。',
        useWords: '使用多个单词，但避免常见短语。',
      },
      warnings: {
        common: '这是一个常用的密码。',
        commonNames: '常见的名字和姓氏易被猜到。',
        dates: '日期易被猜到。',
        extendedRepeat: '像"abcabcabc"这样的重复字符模式易被猜到。',
        keyPattern: '短键盘模式易被猜到。',
        namesByThemselves: '单个名字或姓氏易被猜到。',
        pwned: '您的密码在互联网上的数据泄露中被暴露。',
        recentYears: '近年来易被猜到。',
        sequences: '像"abc"这样的常见字符序列易被猜到。',
        similarToCommon: '这个密码和常用密码相似。',
        simpleRepeat: '像"aaa"这样的重复字符易被猜到。',
        straightRow: '键盘上的直行键易被猜到。',
        topHundred: '这是一个频繁使用的密码。',
        topTen: '这是一个大量使用的密码。',
        userInputs: '不应该有任何个人或页面相关的数据。',
        wordByItself: '单个单词易被猜到。',
      },
    },
  },
  userButton: {
    action__addAccount: '添加账户',
    action__manageAccount: '管理账户',
    action__signOut: '退出登录',
    action__signOutAll: '退出所有账户',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: '已复制！',
      actionLabel__copy: '复制全部',
      actionLabel__download: '下载 .txt',
      actionLabel__print: '打印',
      infoText1: '将为此账户启用备份代码。',
      infoText2: '保密并安全存储备份代码。如果您怀疑它们已经泄露，您可以重新生成备份代码。',
      subtitle__codelist: '安全存储并保守秘密。',
      successMessage:
        '现在已启用备份代码。如果您失去了验证设备的访问权限，您可以使用其中之一登录您的账户。每个代码只能使用一次。',
      successSubtitle: '如果您失去了验证设备的访问权限，您可以使用其中之一登录您的账户。',
      title: '添加备份代码验证',
      title__codelist: '备份代码',
    },
    connectedAccountPage: {
      formHint: '选择一个供应商来连接您的账户。',
      formHint__noAccounts: '没有可用的外部账户供应商。',
      removeResource: {
        messageLine1: '{{identifier}} 将从此账户中被移除。',
        messageLine2: '您将无法再使用这个已连接的账户，任何依赖的功能将不再工作。',
        successMessage: '{{connectedAccount}} 已从您的账户中移除。',
        title: '移除已连接的账户',
      },
      socialButtonsBlockButton: '连接 {{provider|titleize}} 账户',
      successMessage: '供应商已被添加到您的账户',
      title: '添加已连接的账户',
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
        formHint: '一封含有验证码的邮件将会被发送到这个电子邮件地址。',
        formSubtitle: '输入发送到 {{identifier}} 的验证码',
        formTitle: '验证码',
        resendButton: '重发验证码',
        successMessage: '电子邮件 {{identifier}} 已被添加到您的账户。',
      },
      emailLink: {
        formHint: '一封含有验证链接的邮件将会被发送到这个电子邮件地址。',
        formSubtitle: '点击发送到 {{identifier}} 的邮件中的验证链接',
        formTitle: '验证链接',
        resendButton: '重发链接',
        successMessage: '电子邮件 {{identifier}} 已被添加到您的账户。',
      },
      removeResource: {
        messageLine1: '{{identifier}} 将从此账户中被移除。',
        messageLine2: '您将无法使用这个电子邮件地址登录。',
        successMessage: '电子邮件 {{emailAddress}} 已从您的账户中移除。',
        title: '移除电子邮件地址',
      },
      title: '添加电子邮件地址',
    },
    formButtonPrimary__continue: '继续',
    formButtonPrimary__finish: '完成',
    formButtonReset: '取消',
    mfaPage: {
      formHint: '选择一个添加的方法。',
      title: '添加两步验证',
    },
    mfaPhoneCodePage: {
      primaryButton__addPhoneNumber: '添加电话号码',
      removeResource: {
        messageLine1: '{{identifier}} 将不再在登录时接收验证代码。',
        messageLine2: '您的账户可能不再安全。您确定要继续吗？',
        successMessage: '已移除{{mfaPhoneCode}}的短信验证码两步验证',
        title: '移除两步验证',
      },
      subtitle__availablePhoneNumbers: '选择一个电话号码来注册短信验证码两步验证。',
      subtitle__unavailablePhoneNumbers: '没有可用的电话号码来注册短信验证码两步验证。',
      successMessage:
        '现在已启用此电话号码的短信验证码两步验证。在登录时，您需要输入发送到这个电话号码的验证码作为额外步骤。',
      title: '添加短信验证码验证',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: '扫描二维码',
        buttonUnableToScan__nonPrimary: '不能扫描二维码？',
        infoText__ableToScan: '在您的验证器应用中设置一个新的登录方法，并扫描下面的二维码将其链接到您的账户。',
        infoText__unableToScan: '在验证器中设置一个新的登录方法，并输入下面提供的 Key。',
        inputLabel__unableToScan1: '确保启用了基于时间或一次性密码，然后完成链接您的账户。',
        inputLabel__unableToScan2: '或者，如果您的验证器支持 TOTP URIs，您也可以复制完整的 URI。',
      },
      removeResource: {
        messageLine1: '登录时，将不再需要来自此验证器的验证码。',
        messageLine2: '您的账户可能不再安全。您确定要继续吗？',
        successMessage: '已移除通过验证器应用程序的两步验证。',
        title: '移除两步验证',
      },
      successMessage: '现在已启用两步验证。在登录时，您需要输入来自此验证器的验证码作为额外步骤。',
      title: '添加验证器应用程序',
      verifySubtitle: '输入您的验证器生成的验证码',
      verifyTitle: '验证代码',
    },
    mobileButton__menu: '菜单',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      changePasswordSuccessMessage: '您的密码已更新。',
      changePasswordTitle: '更改密码',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      sessionsSignedOutSuccessMessage: '所有其他设备已退出。',
      successMessage: '您的密码已设置。',
      title: '设置密码',
    },
    phoneNumberPage: {
      infoText: '一条包含验证链接的短信将会发送到这个电话号码。',
      infoText__secondary: '可能会产生信息和数据费用。',
      removeResource: {
        messageLine1: '{{identifier}} 将从此账户中被移除。',
        messageLine2: '您将无法使用这个电话号码登录。',
        successMessage: '电话号码 {{phoneNumber}} 已从您的账户中移除。',
        title: '移除电话号码',
      },
      successMessage: '{{identifier}} 已被添加到您的账户。',
      title: '添加电话号码',
    },
    profilePage: {
      fileDropAreaAction: '选择文件',
      fileDropAreaHint: '上传小于10MB的JPG, PNG, GIF, 或WEBP格式的图片',
      fileDropAreaTitle: '拖拽文件到这里，或者...',
      imageFormDestructiveActionSubtitle: '移除图片',
      imageFormSubtitle: '上传图片',
      imageFormTitle: '个人资料图片',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: '您的个人资料已更新。',
      title: '更新个人资料',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: '退出设备',
        title: '活动设备',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: '再试一次',
        actionLabel__reauthorize: '立即授权',
        destructiveActionTitle: '移除',
        primaryButton: '连接账户',
        title: '已连接的账户',
      },
      dangerSection: {
        deleteAccountButton: 'Delete Account',
        title: 'Account termination',
      },
      emailAddressesSection: {
        destructiveAction: '移除电子邮件地址',
        detailsAction__nonPrimary: '设为主要',
        detailsAction__primary: '完成验证',
        detailsAction__unverified: '完成验证',
        primaryButton: '添加电子邮件地址',
        title: '电子邮件地址',
      },
      enterpriseAccountsSection: {
        title: '企业账户',
      },
      headerTitle__account: '账户',
      headerTitle__security: '安全',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: '重新生成代码',
          headerTitle: '备份代码',
          subtitle__regenerate: '获取一套新的安全备份代码。之前的备份代码将被删除，无法使用。',
          title__regenerate: '重新生成备份代码',
        },
        phoneCode: {
          actionLabel__setDefault: '设为默认',
          destructiveActionLabel: '移除电话号码',
        },
        primaryButton: '添加两步验证',
        title: '两步验证',
        totp: {
          destructiveActionTitle: '移除',
          headerTitle: '验证器应用程序',
        },
      },
      passwordSection: {
        primaryButton__changePassword: '更改密码',
        primaryButton__setPassword: '设置密码',
        title: '密码',
      },
      phoneNumbersSection: {
        destructiveAction: '移除电话号码',
        detailsAction__nonPrimary: '设为主要',
        detailsAction__primary: '完成验证',
        detailsAction__unverified: '完成验证',
        primaryButton: '添加电话号码',
        title: '电话号码',
      },
      profileSection: {
        primaryButton: 'Edit Profile',
        title: '个人资料',
      },
      usernameSection: {
        primaryButton__changeUsername: '更改用户名',
        primaryButton__setUsername: '设置用户名',
        title: '用户名',
      },
      web3WalletsSection: {
        destructiveAction: '移除钱包',
        primaryButton: 'Web3 钱包',
        title: 'Web3 钱包',
      },
    },
    usernamePage: {
      successMessage: '您的用户名已更新。',
      title: '更新用户名',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} 将从此账户中被移除。',
        messageLine2: '您将无法使用这个 web3 钱包登录。',
        successMessage: '{{web3Wallet}} 已从您的账户中移除。',
        title: '移除 web3 钱包',
      },
      subtitle__availableWallets: '选择一个 web3 钱包连接到您的账户。',
      subtitle__unavailableWallets: '没有可用的 web3 钱包。',
      successMessage: '钱包已被添加到您的账户。',
      title: '添加web3钱包',
    },
  },
} as const;
