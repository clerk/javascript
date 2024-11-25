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

export const viVN: LocalizationResource = {
  locale: 'vi-VN',
  backButton: 'Quay lại',
  badge__default: 'Mặc định',
  badge__otherImpersonatorDevice: 'Thiết bị nhân danh khác',
  badge__primary: 'Chính',
  badge__requiresAction: 'Yêu cầu hành động',
  badge__thisDevice: 'Thiết bị này',
  badge__unverified: 'Chưa xác minh',
  badge__userDevice: 'Thiết bị người dùng',
  badge__you: 'Bạn',
  createOrganization: {
    formButtonSubmit: 'Tạo tổ chức',
    invitePage: {
      formButtonReset: 'Bỏ qua',
    },
    title: 'Tạo Tổ chức',
  },
  dates: {
    lastDay: "Hôm qua lúc {{ date | timeString('vi-VN') }}",
    next6Days: "Vào {{ date | weekday('vi-VN','long') }} tới lúc {{ date | timeString('vi-VN') }}",
    nextDay: "Ngày mai lúc {{ date | timeString('vi-VN') }}",
    numeric: "{{ date | numeric('vi-VN') }}",
    previous6Days: "Vào {{ date | weekday('vi-VN','long') }} trước đó lúc {{ date | timeString('vi-VN') }}",
    sameDay: "Hôm nay lúc {{ date | timeString('vi-VN') }}",
  },
  dividerText: 'hoặc',
  footerActionLink__useAnotherMethod: 'Sử dụng phương pháp khác',
  footerPageLink__help: 'Trợ giúp',
  footerPageLink__privacy: 'Quyền riêng tư',
  footerPageLink__terms: 'Điều khoản',
  formButtonPrimary: 'Tiếp tục',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Quên mật khẩu?',
  formFieldError__matchingPasswords: 'Mật khẩu khớp.',
  formFieldError__notMatchingPasswords: 'Mật khẩu không khớp.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Tùy chọn',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses:
    'Nhập hoặc dán một hoặc nhiều địa chỉ email, cách nhau bằng khoảng trắng hoặc dấu phẩy',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: undefined,
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Mã sao lưu',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Xác nhận mật khẩu',
  formFieldLabel__currentPassword: 'Mật khẩu hiện tại',
  formFieldLabel__emailAddress: 'Địa chỉ email',
  formFieldLabel__emailAddress_username: 'Địa chỉ email hoặc tên người dùng',
  formFieldLabel__emailAddresses: 'Các địa chỉ email',
  formFieldLabel__firstName: 'Tên',
  formFieldLabel__lastName: 'Họ',
  formFieldLabel__newPassword: 'Mật khẩu mới',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Tên tổ chức',
  formFieldLabel__organizationSlug: 'Đường dẫn rút gọn',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Mật khẩu',
  formFieldLabel__phoneNumber: 'Số điện thoại',
  formFieldLabel__role: 'Vai trò',
  formFieldLabel__signOutOfOtherSessions: 'Đăng xuất khỏi tất cả các thiết bị khác',
  formFieldLabel__username: 'Tên người dùng',
  impersonationFab: {
    action__signOut: 'Đăng xuất',
    title: 'Đăng nhập với tư cách {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Quản trị viên',
  membershipRole__basicMember: 'Thành viên',
  membershipRole__guestMember: 'Khách',
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
      detailsTitle__inviteFailed: 'Không thể gửi lời mời. Sửa các lỗi sau và thử lại:',
      formButtonPrimary__continue: 'Gửi lời mời',
      selectDropdown__role: 'Select role',
      subtitle: 'Mời thành viên mới vào tổ chức này',
      successMessage: 'Mời đã được gửi thành công',
      title: 'Mời thành viên',
    },
    membersPage: {
      action__invite: 'Mời',
      activeMembersTab: {
        menuAction__remove: 'Gỡ bỏ thành viên',
        tableHeader__actions: undefined,
        tableHeader__joined: 'Tham gia',
        tableHeader__role: 'Vai trò',
        tableHeader__user: 'Người dùng',
      },
      detailsTitle__emptyRow: 'Không có thành viên để hiển thị',
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
        menuAction__revoke: 'Thu hồi lời mời',
        tableHeader__invited: 'Đã mời',
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
          messageLine1: 'Bạn có chắc chắn muốn xóa tổ chức này không?',
          messageLine2: 'Hành động này là vĩnh viễn và không thể hoàn tác.',
          successMessage: 'Bạn đã xóa tổ chức.',
          title: 'Xóa tổ chức',
        },
        leaveOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1:
            'Bạn có chắc chắn muốn rời khỏi tổ chức này? Bạn sẽ mất quyền truy cập vào tổ chức này và các ứng dụng của nó.',
          messageLine2: 'Hành động này là vĩnh viễn và không thể hoàn tác.',
          successMessage: 'Bạn đã rời khỏi tổ chức.',
          title: 'Rời khỏi tổ chức',
        },
        title: 'Nguy hiểm',
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
      successMessage: 'Tổ chức đã được cập nhật.',
      title: 'Hồ sơ Tổ chức',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Thành viên',
      profileSection: {
        primaryButton: undefined,
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
    action__createOrganization: 'Tạo Tổ chức',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Quản lý Tổ chức',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Chưa chọn tổ chức',
    personalWorkspace: 'Không gian Cá nhân',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Tiếp',
  paginationButton__previous: 'Trước',
  paginationRowText__displaying: 'Hiển thị',
  paginationRowText__of: 'của',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Nhận trợ giúp',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Sử dụng mã sao lưu',
      blockButton__emailCode: 'Gửi mã qua email cho {{identifier}}',
      blockButton__emailLink: 'Gửi liên kết qua email cho {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Đăng nhập bằng mật khẩu của bạn',
      blockButton__phoneCode: 'Gửi mã SMS cho {{identifier}}',
      blockButton__totp: 'Sử dụng ứng dụng xác thực của bạn',
      getHelp: {
        blockButton__emailSupport: 'Hỗ trợ qua email',
        content:
          'Nếu bạn gặp khó khăn khi đăng nhập vào tài khoản của mình, hãy gửi email cho chúng tôi và chúng tôi sẽ cùng bạn khôi phục quyền truy cập trong thời gian ngắn nhất.',
        title: 'Nhận trợ giúp',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Sử dụng phương pháp khác',
    },
    backupCodeMfa: {
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Nhập mã sao lưu',
    },
    emailCode: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Kiểm tra email của bạn',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      expired: {
        subtitle: 'Quay trở lại cửa sổ gốc để tiếp tục.',
        title: 'Liên kết xác minh này đã hết hạn',
      },
      failed: {
        subtitle: 'Quay trở lại cửa sổ gốc để tiếp tục.',
        title: 'Liên kết xác minh này không hợp lệ',
      },
      formSubtitle: 'Sử dụng liên kết xác minh được gửi đến email của bạn',
      formTitle: 'Liên kết xác minh',
      loading: {
        subtitle: 'Bạn sẽ được chuyển hướng sớm',
        title: 'Đang đăng nhập...',
      },
      resendButton: 'Không nhận được liên kết? Gửi lại',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Kiểm tra email của bạn',
      unusedTab: {
        title: 'Bạn có thể đóng cửa sổ này',
      },
      verified: {
        subtitle: 'Bạn sẽ được chuyển hướng sớm',
        title: 'Đăng nhập thành công',
      },
      verifiedSwitchTab: {
        subtitle: 'Quay trở lại cửa sổ gốc để tiếp tục',
        subtitleNewTab: 'Quay trở lại cửa sổ mới mở để tiếp tục',
        titleNewTab: 'Đăng nhập trên cửa sổ khác',
      },
    },
    forgotPassword: {
      formTitle: 'Mã đặt lại mật khẩu',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Đặt lại mật khẩu',
      label__alternativeMethods: 'Hoặc, đăng nhập bằng phương pháp khác.',
      title: 'Quên mật khẩu?',
    },
    noAvailableMethods: {
      message: 'Không thể tiếp tục đăng nhập. Không có phương thức xác thực nào khả dụng.',
      subtitle: 'Đã xảy ra lỗi',
      title: 'Không thể đăng nhập',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Sử dụng phương pháp khác',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Nhập mật khẩu của bạn',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Mã xác nhận',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Kiểm tra điện thoại của bạn',
    },
    phoneCodeMfa: {
      formTitle: 'Mã xác nhận',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: undefined,
      title: 'Kiểm tra điện thoại của bạn',
    },
    resetPassword: {
      formButtonPrimary: 'Đặt lại mật khẩu',
      requiredMessage: 'For security reasons, it is required to reset your password.',
      successMessage: 'Mật khẩu của bạn đã được thay đổi thành công. Đang đăng nhập, vui lòng chờ một chút.',
      title: 'Đặt lại mật khẩu',
    },
    resetPasswordMfa: {
      detailsLabel: 'Chúng tôi cần xác minh danh tính của bạn trước khi đặt lại mật khẩu.',
    },
    start: {
      actionLink: 'Đăng ký',
      actionLink__join_waitlist: undefined,
      actionLink__use_email: 'Sử dụng email',
      actionLink__use_email_username: 'Sử dụng email hoặc tên đăng nhập',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Sử dụng số điện thoại',
      actionLink__use_username: 'Sử dụng tên đăng nhập',
      actionText: 'Chưa có tài khoản?',
      actionText__join_waitlist: undefined,
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Đăng nhập',
    },
    totpMfa: {
      formTitle: 'Mã xác minh',
      subtitle: undefined,
      title: 'Xác minh hai bước',
    },
  },
  signInEnterPasswordTitle: 'Nhập mật khẩu của bạn',
  signUp: {
    continue: {
      actionLink: 'Đăng nhập',
      actionText: 'Đã có tài khoản?',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Điền các trường bị thiếu',
    },
    emailCode: {
      formSubtitle: 'Nhập mã xác minh đã được gửi đến địa chỉ email của bạn',
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Xác minh email của bạn',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      formSubtitle: 'Sử dụng liên kết xác minh đã được gửi đến địa chỉ email của bạn',
      formTitle: 'Liên kết xác minh',
      loading: {
        title: 'Đang đăng ký...',
      },
      resendButton: 'Không nhận được liên kết? Gửi lại',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Xác minh email của bạn',
      verified: {
        title: 'Đăng ký thành công',
      },
      verifiedSwitchTab: {
        subtitle: 'Quay lại cửa sổ mới được mở để tiếp tục',
        subtitleNewTab: 'Quay lại cửa sổ trước để tiếp tục',
        title: 'Xác minh email thành công',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: undefined,
        label__onlyTermsOfService: undefined,
        label__termsOfServiceAndPrivacyPolicy: undefined,
      },
      continue: {
        subtitle: undefined,
        title: undefined,
      },
    },
    phoneCode: {
      formSubtitle: 'Nhập mã xác minh đã được gửi đến số điện thoại của bạn',
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Xác minh số điện thoại của bạn',
    },
    restrictedAccess: {
      actionLink: undefined,
      actionText: undefined,
      blockButton__emailSupport: undefined,
      blockButton__joinWaitlist: undefined,
      subtitle: undefined,
      subtitleWaitlist: undefined,
      title: undefined,
    },
    start: {
      actionLink: 'Đăng nhập',
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'Đã có tài khoản?',
      subtitle: 'để tiếp tục với {{applicationName}}',
      title: 'Tạo tài khoản của bạn',
    },
  },
  socialButtonsBlockButton: 'Tiếp tục với {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'Đăng ký không thành công do không vượt qua các xác thực bảo mật. Vui lòng làm mới trang và thử lại hoặc liên hệ hỗ trợ để được trợ giúp thêm.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Địa chỉ email phải là một địa chỉ email hợp lệ',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'Mật khẩu của bạn không đủ mạnh.',
    form_password_pwned:
      'Mật khẩu này đã được phát hiện trong một cuộc tấn công và không thể sử dụng, vui lòng thử mật khẩu khác.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Mật khẩu của bạn đã vượt quá số byte tối đa cho phép, vui lòng rút ngắn hoặc loại bỏ một số ký tự đặc biệt.',
    form_password_validation_failed: 'Mật khẩu không đúng',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'Bạn không thể xóa thông tin nhận dạng cuối cùng của bạn.',
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
      maximumLength: 'ít hơn {{length}} ký tự',
      minimumLength: '{{length}} hoặc nhiều ký tự',
      requireLowercase: 'một chữ cái viết thường',
      requireNumbers: 'một số',
      requireSpecialCharacter: 'một ký tự đặc biệt',
      requireUppercase: 'một chữ cái viết hoa',
      sentencePrefix: 'Mật khẩu của bạn phải chứa',
    },
    phone_number_exists: 'Số điện thoại này đã được sử dụng. Vui lòng thử số khác.',
    zxcvbn: {
      couldBeStronger: 'Mật khẩu của bạn đủ mạnh, nhưng có thể mạnh hơn. Hãy thêm nhiều ký tự hơn.',
      goodPassword: 'Mật khẩu của bạn đáp ứng tất cả các yêu cầu cần thiết.',
      notEnough: 'Mật khẩu của bạn không đủ mạnh.',
      suggestions: {
        allUppercase: 'Viết hoa một số ký tự, nhưng không phải tất cả.',
        anotherWord: 'Thêm nhiều từ ít phổ biến hơn.',
        associatedYears: 'Tránh các năm liên quan đến bạn.',
        capitalization: 'Viết hoa nhiều hơn chỉ chữ cái đầu tiên.',
        dates: 'Tránh sử dụng ngày tháng năm liên quan đến bạn.',
        l33t: "Tránh việc thay thế chữ cái dễ đoán bằng các ký tự như '@' thay cho 'a'.",
        longerKeyboardPattern: 'Sử dụng các mẫu bàn phím dài hơn và thay đổi hướng gõ nhiều lần.',
        noNeed: 'Bạn có thể tạo mật khẩu mạnh mà không cần sử dụng ký tự đặc biệt, số hoặc chữ cái viết hoa.',
        pwned: 'Nếu bạn sử dụng mật khẩu này ở những nơi khác, bạn nên thay đổi nó.',
        recentYears: 'Tránh các năm gần đây.',
        repeated: 'Tránh việc lặp lại từ và ký tự.',
        reverseWords: 'Tránh việc viết ngược các từ thông thường.',
        sequences: 'Tránh các chuỗi ký tự thông thường.',
        useWords: 'Sử dụng nhiều từ, nhưng tránh các cụm từ thông thường.',
      },
      warnings: {
        common: 'Đây là một mật khẩu phổ biến.',
        commonNames: 'Các tên riêng và họ phổ biến dễ đoán.',
        dates: 'Ngày tháng dễ đoán.',
        extendedRepeat: 'Các mẫu ký tự lặp lại như "abcabcabc" dễ đoán.',
        keyPattern: 'Mẫu bàn phím ngắn dễ đoán.',
        namesByThemselves: 'Các tên riêng hoặc họ riêng dễ đoán.',
        pwned: 'Mật khẩu của bạn đã bị rò rỉ qua một cuộc tấn công dữ liệu trên Internet.',
        recentYears: 'Các năm gần đây dễ đoán.',
        sequences: 'Các chuỗi ký tự phổ biến như "abc" dễ đoán.',
        similarToCommon: 'Đây giống với một mật khẩu phổ biến.',
        simpleRepeat: 'Các ký tự lặp lại như "aaa" dễ đoán.',
        straightRow: 'Các hàng phím trên bàn phím của bạn dễ đoán.',
        topHundred: 'Đây là một mật khẩu được sử dụng thường xuyên.',
        topTen: 'Đây là một mật khẩu được sử dụng rất nhiều.',
        userInputs: 'Không nên có bất kỳ dữ liệu cá nhân hoặc liên quan đến trang web.',
        wordByItself: 'Một từ đơn dễ đoán.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Thêm tài khoản',
    action__manageAccount: 'Quản lý tài khoản',
    action__signOut: 'Đăng xuất',
    action__signOutAll: 'Đăng xuất khỏi tất cả các tài khoản',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Đã sao chép!',
      actionLabel__copy: 'Sao chép tất cả',
      actionLabel__download: 'Tải xuống .txt',
      actionLabel__print: 'In',
      infoText1: 'Các mã sao lưu sẽ được kích hoạt cho tài khoản này.',
      infoText2:
        'Giữ các mã sao lưu bí mật và lưu chúng một cách an toàn. Bạn có thể tạo lại các mã sao lưu nếu bạn nghi ngờ chúng đã bị xâm phạm.',
      subtitle__codelist: 'Lưu chúng một cách an toàn và giữ chúng bí mật.',
      successMessage:
        'Mã sao lưu đã được kích hoạt. Bạn có thể sử dụng một trong các mã này để đăng nhập vào tài khoản của mình, nếu bạn mất quyền truy cập vào thiết bị xác thực của mình. Mỗi mã chỉ có thể sử dụng một lần.',
      successSubtitle:
        'Bạn có thể sử dụng một trong các mã này để đăng nhập vào tài khoản của mình, nếu bạn mất quyền truy cập vào thiết bị xác thực của mình.',
      title: 'Thêm mã xác thực sao lưu',
      title__codelist: 'Các mã sao lưu',
    },
    connectedAccountPage: {
      formHint: 'Chọn một nhà cung cấp để kết nối tài khoản của bạn.',
      formHint__noAccounts: 'Không có nhà cung cấp tài khoản bên ngoài khả dụng.',
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2:
          'Bạn sẽ không thể sử dụng tài khoản liên kết này và bất kỳ tính năng phụ thuộc nào sẽ không còn hoạt động.',
        successMessage: '{{connectedAccount}} đã được xóa khỏi tài khoản của bạn.',
        title: 'Xóa tài khoản liên kết',
      },
      socialButtonsBlockButton: 'Kết nối tài khoản {{provider|titleize}}',
      successMessage: 'Nhà cung cấp đã được thêm vào tài khoản của bạn',
      title: 'Thêm tài khoản liên kết',
    },
    deletePage: {
      actionDescription: 'Type "Delete account" below to continue.',
      confirm: 'Xóa tài khoản',
      messageLine1: 'Bạn có chắc chắn muốn xóa tài khoản của mình không?',
      messageLine2: 'Hành động này là vĩnh viễn và không thể hoàn tác.',
      title: 'Xóa tài khoản',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Một email chứa mã xác minh sẽ được gửi đến địa chỉ email này.',
        formSubtitle: 'Nhập mã xác minh được gửi đến {{identifier}}',
        formTitle: 'Mã xác minh',
        resendButton: 'Không nhận được mã? Gửi lại',
        successMessage: 'Email {{identifier}} đã được thêm vào tài khoản của bạn.',
      },
      emailLink: {
        formHint: 'Một email chứa liên kết xác minh sẽ được gửi đến địa chỉ email này.',
        formSubtitle: 'Nhấp vào liên kết xác minh trong email được gửi đến {{identifier}}',
        formTitle: 'Liên kết xác minh',
        resendButton: 'Không nhận được liên kết? Gửi lại',
        successMessage: 'Email {{identifier}} đã được thêm vào tài khoản của bạn.',
      },
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2: 'Bạn sẽ không thể đăng nhập bằng địa chỉ email này nữa.',
        successMessage: '{{emailAddress}} đã được xóa khỏi tài khoản của bạn.',
        title: 'Xóa địa chỉ email',
      },
      title: 'Thêm địa chỉ email',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Tiếp tục',
    formButtonPrimary__finish: 'Hoàn thành',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Hủy',
    mfaPage: {
      formHint: 'Chọn một phương pháp để thêm.',
      title: 'Thêm xác minh hai bước',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Thêm số điện thoại',
      removeResource: {
        messageLine1: '{{identifier}} sẽ không còn nhận được mã xác thực khi đăng nhập.',
        messageLine2: 'Tài khoản của bạn có thể không an toàn. Bạn có chắc chắn muốn tiếp tục không?',
        successMessage: 'Xác thực hai bước bằng mã SMS đã được gỡ bỏ cho {{mfaPhoneCode}}',
        title: 'Gỡ bỏ xác thực hai bước',
      },
      subtitle__availablePhoneNumbers: 'Chọn một số điện thoại để đăng ký xác thực hai bước bằng mã SMS.',
      subtitle__unavailablePhoneNumbers:
        'Không có số điện thoại nào khả dụng để đăng ký xác thực hai bước bằng mã SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Thêm mã xác thực SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Quét mã QR thay vì đó',
        buttonUnableToScan__nonPrimary: 'Không thể quét mã QR?',
        infoText__ableToScan:
          'Thiết lập một phương thức đăng nhập mới trong ứng dụng xác thực của bạn và quét mã QR dưới đây để liên kết nó với tài khoản của bạn.',
        infoText__unableToScan:
          'Thiết lập một phương thức đăng nhập mới trong ứng dụng xác thực và nhập Khóa được cung cấp bên dưới.',
        inputLabel__unableToScan1:
          'Đảm bảo đã kích hoạt mật khẩu dựa trên thời gian hoặc mật khẩu một lần, sau đó hoàn thành việc liên kết tài khoản của bạn.',
        inputLabel__unableToScan2:
          'Hoặc nếu ứng dụng xác thực của bạn hỗ trợ TOTP URIs, bạn cũng có thể sao chép toàn bộ URI.',
      },
      removeResource: {
        messageLine1: 'Mã xác thực từ ứng dụng xác thực này sẽ không còn được yêu cầu khi đăng nhập.',
        messageLine2: 'Tài khoản của bạn có thể không an toàn. Bạn có chắc chắn muốn tiếp tục không?',
        successMessage: 'Xác thực hai bước qua ứng dụng xác thực đã được gỡ bỏ.',
        title: 'Gỡ bỏ xác thực hai bước',
      },
      successMessage:
        'Xác thực hai bước đã được kích hoạt. Khi đăng nhập, bạn sẽ cần nhập mã xác thực từ ứng dụng xác thực này như một bước bổ sung.',
      title: 'Thêm ứng dụng xác thực',
      verifySubtitle: 'Nhập mã xác thực được tạo bởi ứng dụng xác thực của bạn',
      verifyTitle: 'Mã xác thực',
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
      readonly: 'Hiện tại bạn không thể chỉnh sửa mật khẩu vì bạn chỉ có thể đăng nhập qua kết nối doanh nghiệp.',
      successMessage__set: 'Mật khẩu của bạn đã được thiết lập.',
      successMessage__signOutOfOtherSessions: 'Tất cả các thiết bị khác đã được đăng xuất.',
      successMessage__update: 'Mật khẩu của bạn đã được cập nhật.',
      title__set: 'Thiết lập mật khẩu',
      title__update: 'Thay đổi mật khẩu',
    },
    phoneNumberPage: {
      infoText: 'Một tin nhắn chứa liên kết xác minh sẽ được gửi đến số điện thoại này.',
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2: 'Bạn sẽ không thể đăng nhập bằng số điện thoại này nữa.',
        successMessage: '{{phoneNumber}} đã được xóa khỏi tài khoản của bạn.',
        title: 'Xóa số điện thoại',
      },
      successMessage: '{{identifier}} đã được thêm vào tài khoản của bạn.',
      title: 'Thêm số điện thoại',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Tải lên ảnh JPG, PNG, GIF, hoặc WEBP có dung lượng nhỏ hơn 10 MB',
      imageFormDestructiveActionSubtitle: 'Xóa ảnh',
      imageFormSubtitle: 'Tải ảnh lên',
      imageFormTitle: 'Hình ảnh hồ sơ',
      readonly: 'Thông tin hồ sơ của bạn đã được cung cấp bởi kết nối doanh nghiệp và không thể chỉnh sửa.',
      successMessage: 'Hồ sơ của bạn đã được cập nhật.',
      title: 'Cập nhật hồ sơ',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Đăng xuất khỏi thiết bị',
        title: 'Thiết bị hoạt động',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Thử lại',
        actionLabel__reauthorize: 'Xác thực ngay',
        destructiveActionTitle: 'Xóa',
        primaryButton: 'Kết nối tài khoản',
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Tài khoản đã kết nối',
      },
      dangerSection: {
        deleteAccountButton: 'Xóa Tài khoản',
        title: 'Nguy hiểm',
      },
      emailAddressesSection: {
        destructiveAction: 'Xóa địa chỉ email',
        detailsAction__nonPrimary: 'Đặt làm chính',
        detailsAction__primary: 'Hoàn tất xác minh',
        detailsAction__unverified: 'Hoàn tất xác minh',
        primaryButton: 'Thêm địa chỉ email',
        title: 'Địa chỉ email',
      },
      enterpriseAccountsSection: {
        title: 'Tài khoản doanh nghiệp',
      },
      headerTitle__account: 'Tài khoản',
      headerTitle__security: 'Bảo mật',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Tạo lại mã',
          headerTitle: 'Mã sao lưu',
          subtitle__regenerate:
            'Nhận một bộ mã sao lưu an toàn mới. Các mã sao lưu trước đó sẽ bị xóa và không thể sử dụng được.',
          title__regenerate: 'Tạo lại mã sao lưu',
        },
        phoneCode: {
          actionLabel__setDefault: 'Đặt làm mặc định',
          destructiveActionLabel: 'Xóa số điện thoại',
        },
        primaryButton: 'Thêm xác thực hai bước',
        title: 'Xác thực hai bước',
        totp: {
          destructiveActionTitle: 'Xóa',
          headerTitle: 'Ứng dụng xác thực',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Đặt mật khẩu',
        primaryButton__updatePassword: 'Thay đổi mật khẩu',
        title: 'Mật khẩu',
      },
      phoneNumbersSection: {
        destructiveAction: 'Xóa số điện thoại',
        detailsAction__nonPrimary: 'Đặt làm chính',
        detailsAction__primary: 'Hoàn tất xác minh',
        detailsAction__unverified: 'Hoàn tất xác minh',
        primaryButton: 'Thêm số điện thoại',
        title: 'Số điện thoại',
      },
      profileSection: {
        primaryButton: undefined,
        title: 'Hồ sơ',
      },
      usernameSection: {
        primaryButton__setUsername: 'Đặt tên người dùng',
        primaryButton__updateUsername: 'Thay đổi tên người dùng',
        title: 'Tên người dùng',
      },
      web3WalletsSection: {
        destructiveAction: 'Xóa ví',
        primaryButton: 'Ví Web3',
        title: 'Ví Web3',
      },
    },
    usernamePage: {
      successMessage: 'Tên người dùng của bạn đã được cập nhật.',
      title__set: 'Cập nhật tên người dùng',
      title__update: 'Cập nhật tên người dùng',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2: 'Bạn sẽ không thể đăng nhập bằng ví web3 này nữa.',
        successMessage: '{{web3Wallet}} đã được xóa khỏi tài khoản của bạn.',
        title: 'Xóa ví web3',
      },
      subtitle__availableWallets: 'Chọn một ví web3 để kết nối với tài khoản của bạn.',
      subtitle__unavailableWallets: 'Không có ví web3 khả dụng.',
      successMessage: 'Ví đã được thêm vào tài khoản của bạn.',
      title: 'Thêm ví web3',
      web3WalletButtonsBlockButton: undefined,
    },
  },
  reverification: {
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
