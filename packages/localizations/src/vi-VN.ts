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

import type { LocalizationResource } from '@clerk/shared/types';

export const viVN: LocalizationResource = {
  locale: 'vi-VN',
  actionBlocked: {
    subtitle: 'Vì lý do bảo mật, yêu cầu này không thể hoàn thành.',
    title: 'Không thể hoàn thành yêu cầu này',
    traceIdLabel: 'Mã tham chiếu',
  },
  apiKeys: {
    action__add: 'Thêm khoá mới',
    action__search: 'Tìm kiếm khoá',
    copySecret: {
      formButtonPrimary__copyAndClose: 'Sao chép và đóng',
      formHint: 'Vì lý do bảo mật, chúng tôi sẽ không cho phép bạn xem lại sau này.',
      formTitle: 'Sao chép khóa API "{{name}}" của bạn ngay bây giờ',
    },
    createdAndExpirationStatus__expiresOn:
      "Tạo {{ createdDate | shortDate('vi-VN') }} • Hết hạn {{ expiresDate | longDate('vi-VN') }}",
    createdAndExpirationStatus__never: "Tạo {{ createdDate | shortDate('vi-VN') }} • Không hết hạn",
    detailsTitle__emptyRow: 'Không tìm thấy khoá API',
    formButtonPrimary__add: 'Tạo khoá',
    formFieldCaption__expiration__expiresOn: 'Hết hạn {{ date }}',
    formFieldCaption__expiration__never: 'Khoá này sẽ không hết hạn',
    formFieldOption__expiration__180d: '180 Ngày',
    formFieldOption__expiration__1d: '1 Ngày',
    formFieldOption__expiration__1y: '1 Năm',
    formFieldOption__expiration__30d: '30 Ngày',
    formFieldOption__expiration__60d: '60 Ngày',
    formFieldOption__expiration__7d: '7 Ngày',
    formFieldOption__expiration__90d: '90 Ngày',
    formFieldOption__expiration__never: 'Không hết hạn',
    formHint: 'Nhập tên để tạo khoá mới. Bạn sẽ có thể hủy bỏ bất kỳ lúc nào.',
    formTitle: 'Thêm khoá API mới',
    lastUsed__days: '{{days}} ngày trước',
    lastUsed__hours: '{{hours}} giờ trước',
    lastUsed__minutes: '{{minutes}} phút trước',
    lastUsed__months: '{{months}} tháng trước',
    lastUsed__seconds: '{{seconds}} giây trước',
    lastUsed__years: '{{years}} năm trước',
    menuAction__revoke: 'Hủy khoá',
    revokeConfirmation: {
      confirmationText: 'Hủy',
      formButtonPrimary__revoke: 'Hủy khoá',
      formHint: 'Bạn có chắc chắn muốn xóa khoá này không?',
      formTitle: 'Hủy khoá "{{apiKeyName}}" không?',
      inputLabel: 'Nhập "Hủy" để xác nhận',
    },
    tableHeader__actions: 'Hành động',
    tableHeader__lastUsed: 'Sử dụng lần cuối',
    tableHeader__name: 'Tên',
  },
  backButton: 'Quay lại',
  badge__activePlan: 'Đang hoạt động',
  badge__banned: 'Bị cấm',
  badge__canceledEndsAt: "Đã hủy • Kết thúc {{ date | shortDate('vi-VN') }}",
  badge__currentPlan: 'Gói hiện tại',
  badge__default: 'Mặc định',
  badge__deprovisioned: 'Đã hủy cấp phép',
  badge__endsAt: "Kết thúc {{ date | shortDate('vi-VN') }}",
  badge__expired: 'Đã hết hạn',
  badge__freeTrial: 'Dùng thử miễn phí',
  badge__otherImpersonatorDevice: 'Thiết bị giả mạo khác',
  badge__pastDueAt: "Quá hạn {{ date | shortDate('vi-VN') }}",
  badge__pastDuePlan: 'Quá hạn',
  badge__primary: 'Chính',
  badge__renewsAt: "Gia hạn {{ date | shortDate('vi-VN') }}",
  badge__requiresAction: 'Yêu cầu hành động',
  badge__startsAt: "Bắt đầu {{ date | shortDate('vi-VN') }}",
  badge__thisDevice: 'Thiết bị này',
  badge__trialEndsAt: "Kết thúc dùng thử {{ date | shortDate('vi-VN') }}",
  badge__unverified: 'Chưa xác minh',
  badge__upcomingPlan: 'Sắp tới',
  badge__userDevice: 'Thiết bị người dùng',
  badge__you: 'Bạn',
  billing: {
    accountCredit: 'Tín dụng tài khoản',
    addPaymentMethod__label: 'Thêm phương thức thanh toán',
    alwaysFree: 'Miễn phí mãi mãi',
    annually: 'Hàng năm',
    availableFeatures: 'Tính năng có sẵn',
    billedAnnually: 'Tính phí hàng năm',
    billedAnnuallyOnly: 'Chỉ tính phí hàng năm',
    billedMonthly: 'Tính phí hàng tháng',
    billedMonthlyOnly: 'Chỉ tính phí hàng tháng',
    cancelFreeTrial: 'Hủy dùng thử miễn phí',
    cancelFreeTrialAccessUntil:
      "Bản dùng thử của bạn sẽ vẫn hoạt động cho đến {{ date | longDate('vi-VN') }}. Sau đó, bạn sẽ mất quyền truy cập vào các tính năng dùng thử. Bạn sẽ không bị tính phí.",
    cancelFreeTrialTitle: 'Hủy dùng thử miễn phí cho gói {{plan}}?',
    cancelSubscription: 'Hủy đăng ký',
    cancelSubscriptionAccessUntil:
      "Bạn có thể tiếp tục sử dụng tính năng '{{plan}}' cho đến {{ date | longDate('vi-VN') }}, sau đó bạn sẽ không còn quyền truy cập.",
    cancelSubscriptionNoCharge: 'Bạn sẽ không bị tính phí cho đăng ký này.',
    cancelSubscriptionPastDue:
      'Gói đăng ký của bạn sẽ kết thúc ngay lập tức và bạn sẽ mất quyền truy cập vào tất cả các tính năng của gói. Bạn sẽ được yêu cầu thanh toán số tiền quá hạn trong lần đăng ký tiếp theo.',
    cancelSubscriptionTitle: 'Hủy đăng ký {{plan}}?',
    cannotSubscribeMonthly:
      'Bạn không thể đăng ký gói này bằng cách thanh toán hàng tháng. Để đăng ký gói này, bạn cần chọn thanh toán hàng năm.',
    cannotSubscribeUnrecoverable: 'Bạn không thể đăng ký gói này. Gói đăng ký hiện tại của bạn đắt hơn gói này.',
    checkout: {
      addPromoCode: 'Thêm mã khuyến mãi',
      applyPromoCode: 'Áp dụng',
      description__paymentSuccessful: 'Thanh toán của bạn đã thành công.',
      description__subscriptionSuccessful: 'Đăng ký mới của bạn đã được thiết lập.',
      discount: 'Giảm giá',
      downgradeNotice:
        'Bạn sẽ giữ đăng ký hiện tại và các tính năng của nó cho đến cuối chu kỳ thanh toán, sau đó bạn sẽ được chuyển sang đăng ký này.',
      emailForm: {
        subtitle: 'Trước khi bạn có thể hoàn thành việc mua hàng, bạn phải thêm địa chỉ email nơi gửi hóa đơn.',
        title: 'Thêm địa chỉ email',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Dùng thử kết thúc vào',
        title__paymentMethod: 'Phương thức thanh toán',
        title__statementId: 'ID hóa đơn',
        title__subscriptionBegins: 'Đăng ký bắt đầu',
        title__totalPaid: 'Tổng thanh toán',
      },
      pastDueNotice: 'Đăng ký trước của bạn đã quá hạn và chưa thanh toán.',
      perMonth: 'hàng tháng',
      promoCodePlaceholder: 'Nhập mã khuyến mãi',
      removePromoCode: 'Xóa mã khuyến mãi',
      title: 'Thanh toán',
      title__paymentSuccessful: 'Thanh toán thành công!',
      title__subscriptionSuccessful: 'Thành công!',
      title__trialSuccess: 'Đã bắt đầu dùng thử thành công!',
      totalDueAfterTrial: 'Tổng số tiền phải trả sau khi dùng thử kết thúc trong {{days}} ngày',
      totalDuePerPeriod: 'Tổng phải trả mỗi kỳ',
    },
    credit: 'Tín dụng',
    creditRemainder: 'Tín dụng cho phần còn lại của đăng ký hiện tại.',
    defaultFreePlanActive: 'Bạn hiện đang trên gói Miễn phí',
    discountAmount: 'Giảm {{amount}}',
    discountCyclesRemaining: 'Còn {{cycles}} {{period}}',
    discountDuration: 'Giảm {{amount}} cho {{cycles}} {{period}} đầu tiên',
    free: 'Miễn phí',
    getStarted: 'Bắt đầu',
    highlightedPlanBadge: 'Phổ biến',
    keepFreeTrial: 'Giữ bản dùng thử miễn phí',
    keepSubscription: 'Giữ đăng ký',
    manage: 'Quản lý',
    manageSubscription: 'Quản lý đăng ký',
    month: 'Tháng',
    monthAbbreviation: 'th',
    monthPerUnit: 'Tháng trên {{unitName}}',
    monthly: 'Hàng tháng',
    months: 'Tháng',
    pastDue: 'Quá hạn',
    pay: 'Thanh toán {{amount}}',
    payerCreditRemainder: 'Tín dụng từ số dư tài khoản.',
    paymentMethod: {
      applePayDescription: {
        annual: 'Thanh toán hàng năm',
        monthly: 'Thanh toán hàng tháng',
      },
      dev: {
        anyNumbers: 'Bất kỳ số nào',
        cardNumber: 'Số thẻ',
        cvcZip: 'CVC, ZIP',
        developmentMode: 'Chế độ phát triển',
        expirationDate: 'Ngày hết hạn',
        testCardInfo: 'Thông tin thử nghiệm',
      },
    },
    paymentMethods__label: 'Phương thức thanh toán',
    pricingTable: {
      billingCycle: 'Chu kỳ thanh toán',
      included: 'Bao gồm',
      seatCost: {
        additionalSeats: '({{additionalTierFeePerBlockAmount}}/{{periodAbbreviation}} cho người dùng bổ sung)',
        freeUpToSeats: 'Miễn phí tối đa {{endsAfterBlock}} người dùng',
        includedSeats: '{{includedSeats}} người dùng bao gồm',
        perSeat: '{{feePerBlockAmount}}/{{periodAbbreviation}} mỗi người dùng',
        tooltip: {
          additionalSeatsEach: 'Người dùng bổ sung có giá {{feePerBlockAmount}}/{{period}} mỗi người dùng.',
          firstSeatsIncludedInPlan: '{{endsAfterBlock}} người dùng đầu tiên đã bao gồm trong gói.',
          freeForUpToSeats: 'Miễn phí tối đa {{endsAfterBlock}} người dùng.',
        },
        unlimitedSeats: 'Không giới hạn người dùng',
        upToSeats: 'Tối đa {{endsAfterBlock}} người dùng',
      },
    },
    proratedDiscount: 'Giảm giá theo tỷ lệ',
    prorationCredit: 'Tín dụng theo tỷ lệ',
    reSubscribe: 'Đăng ký lại',
    seatBreakdownIncludedPlural:
      '{{chargeable}} người dùng với giá {{rate}}/th ({{totalSeats}} tổng cộng - {{included}} bao gồm)',
    seatBreakdownIncludedSingular: '1 người dùng với giá {{rate}}/th ({{totalSeats}} tổng cộng - {{included}} bao gồm)',
    seatBreakdownPlural: '{{chargeable}} người dùng với giá {{rate}}/th',
    seatBreakdownSingular: '1 người dùng với giá {{rate}}/th',
    seats: 'Người dùng',
    seatsWithLimit: 'Người dùng (tối đa {{limit}})',
    seeAllFeatures: 'Xem tất cả tính năng',
    startFreeTrial: 'Bắt đầu dùng thử miễn phí',
    startFreeTrial__days: 'Bắt đầu dùng thử miễn phí {{days}} ngày',
    subscribe: 'Đăng ký',
    subscriptionDetails: {
      beginsOn: 'Bắt đầu vào',
      currentBillingCycle: 'Chu kỳ thanh toán hiện tại',
      endsOn: 'Kết thúc vào',
      firstPaymentAmount: 'Số tiền thanh toán đầu tiên',
      firstPaymentOn: 'Thanh toán đầu tiên vào',
      nextPaymentAmount: 'Số tiền thanh toán tiếp theo',
      nextPaymentOn: 'Thanh toán tiếp theo vào',
      pastDueAt: 'Quá hạn vào',
      renewsAt: 'Gia hạn vào',
      subscribedOn: 'Đăng ký vào',
      title: 'Gói đăng ký',
      trialEndsOn: 'Dùng thử kết thúc vào',
      trialStartedOn: 'Dùng thử bắt đầu vào',
    },
    subtotal: 'Tổng cộng',
    subtotalRenewal: 'Tổng cộng mỗi kỳ',
    switchPlan: 'Chuyển sang gói này',
    switchToAnnual: 'Chuyển sang hàng năm',
    switchToAnnualWithAnnualPrice: 'Chuyển sang gói năm {{price}} / năm',
    switchToMonthly: 'Chuyển sang hàng tháng',
    switchToMonthlyWithPrice: 'Chuyển sang gói tháng {{price}} / tháng',
    totalDue: 'Tổng cần thanh toán',
    totalDuePerPeriod: 'Tổng mỗi kỳ',
    totalDueToday: 'Tổng cần thanh toán hôm nay',
    viewFeatures: 'Xem tính năng',
    viewPayment: 'Xem thanh toán',
    year: 'Năm',
    yearAbbreviation: 'năm',
    yearPerUnit: 'Năm trên {{unitName}}',
    years: 'Năm',
  },
  configureDirectorySync: {
    attributeMappingStep: {
      columns: {
        clerkAttribute: 'Thuộc tính người dùng',
        directoryAttribute: 'Thuộc tính thư mục',
      },
      subtitle:
        'Các thuộc tính thư mục tiêu chuẩn đã được cấu hình sẵn. Các thuộc tính không được liệt kê tại đây sẽ bị bỏ qua.',
      title: 'Xem lại thuộc tính',
    },
    configureStep: {
      actionLabel__generateToken: 'Tạo token mới',
      actionLabel__replaceKey: 'Thay thế JSON key',
      actionLabel__retry: 'Thử lại',
      actionLabel__uploadKey: 'Tải lên JSON key',
      badge__credentialsConfigured: 'Đã cấu hình',
      badge__credentialsMissing: 'Chưa cấu hình',
      domainsLabel: 'Tên miền:',
      error__invalidKeyFile: 'Tệp đó không phải JSON hợp lệ. Hãy tải lên tệp key đã tải xuống từ Google.',
      error__ssoRequired: {
        subtitle:
          'Đồng bộ thư mục yêu cầu kết nối SSO. Hãy cấu hình và xác minh kết nối SSO của bạn trước, sau đó quay lại đây để thiết lập cấp phát.',
        title: 'Chưa cấu hình Single Sign-On',
      },
      formFieldHint__subjectEmail:
        'Thư mục được đọc dưới quyền quản trị viên này. Người này phải là quản trị viên Workspace đang hoạt động.',
      formFieldInputPlaceholder__subjectEmail: 'admin@yourcompany.com',
      formFieldInputPlaceholder__token: 'Tạo token mới để hiển thị',
      formFieldLabel__endpointUrl: 'SCIM endpoint URL',
      formFieldLabel__serviceAccountKey: 'Khóa tài khoản dịch vụ',
      formFieldLabel__subjectEmail: 'Email quản trị viên Google Workspace',
      formFieldLabel__token: 'Bearer token',
      instructions: {
        actionLabel__toggle: 'Xem hướng dẫn',
        custom: {
          step1: 'Tạo tích hợp cấp phát SCIM 2.0 trong nhà cung cấp danh tính của bạn.',
          step2: 'Dán SCIM endpoint URL làm URL cơ sở cho tích hợp.',
          step3: 'Cấu hình tích hợp để xác thực bằng bearer token bên dưới.',
          step4: 'Bật cấp phát cho các sự kiện tạo, cập nhật và hủy kích hoạt người dùng.',
        },
        entra: {
          step1:
            'Trong trung tâm quản trị Microsoft Entra, mở Enterprise applications và chọn ứng dụng dùng cho kết nối SSO của bạn.',
          step2:
            'Trong mục Connectivity, dán SCIM endpoint URL làm Tenant URL và bearer token làm Secret Token, sau đó chọn Test Connection.',
          step3: 'Chọn Provisioning và đặt chế độ cấp phát thành Automatic.',
          step4: 'Gán người dùng và nhóm cần cấp phát, sau đó bật provisioning sang On.',
        },
        google: {
          step1:
            'Trong Google Cloud console, tạo dự án và tài khoản dịch vụ, sau đó tạo JSON key cho tài khoản đó và tải tệp xuống.',
          step2: 'Bật Admin SDK API cho dự án đó.',
          step3:
            'Trong Google Admin console, mở Security, sau đó mở API controls, rồi mở Domain-wide delegation, và thêm tài khoản dịch vụ bằng client ID của tài khoản đó.',
          step4:
            'Cấp quyền thư mục chỉ đọc với các scope: https://www.googleapis.com/auth/admin.directory.user.readonly và https://www.googleapis.com/auth/admin.directory.group.readonly.',
          step5: 'Tải lên JSON key bên dưới và nhập email của quản trị viên Google Workspace để đọc thư mục.',
        },
        okta: {
          step1: 'Trong Okta Admin Console, mở ứng dụng dùng cho kết nối SSO của bạn.',
          step2: 'Mở tab Provisioning và chọn mục Integration.',
          step3: 'Dán SCIM endpoint URL và bearer token có bên dưới.',
          step4: 'Đối với các hành động cấp phát, hãy bật đẩy New Users, Profile Updates và Groups.',
        },
      },
      notice__tokenShownOnce: 'Token này chỉ hiển thị một lần. Tạo token mới nếu bạn làm mất token.',
      subtitle: 'Thêm các thông tin xác thực này vào nhà cung cấp danh tính của bạn để cấu hình Đồng bộ thư mục',
      title: 'Cấu hình',
      warning__ssoInactive:
        'Kết nối SSO này đã được cấu hình nhưng chưa hoạt động. Bạn có thể cấp phát thành viên, nhưng họ sẽ không thể đăng nhập cho đến khi kết nối hoạt động.',
    },
    navbar: {
      title: 'Cấu hình Đồng bộ thư mục',
    },
    providers: {
      custom: 'Nhà cung cấp SCIM tùy chỉnh',
      entra: 'Microsoft Entra ID',
      google: 'Google Workspace',
      okta: 'Okta Workforce',
    },
    roleMappingStep: {
      actionHint__reorder: 'Kéo để sắp xếp lại, hoặc dùng các phím mũi tên',
      actionLabel__reorder: 'Sắp xếp lại ánh xạ {{group}}',
      alert__missingManageMembersPermission: {
        subtitle: 'Hãy yêu cầu người có thể quản lý thành viên thay đổi đồng bộ vai trò hoặc ánh xạ vai trò nhóm.',
        title: 'Ánh xạ vai trò ở chế độ chỉ đọc',
      },
      columns: {
        directoryGroup: 'Nhóm thư mục',
        priority: 'Ưu tiên',
        role: 'Vai trò',
      },
      disableDialog: {
        cancelButton: 'Hủy',
        confirmButton: 'Tắt đồng bộ vai trò',
        subtitle:
          'Thành viên giữ nguyên vai trò hiện tại, nhưng thành viên mới sẽ không nhận vai trò từ nhóm thư mục. Ánh xạ của bạn được lưu lại, và khi bật lại đồng bộ vai trò, các ánh xạ sẽ được áp dụng lại cho mọi thành viên, ghi đè mọi thay đổi vai trò thủ công.',
        title: 'Tắt đồng bộ vai trò',
      },
      empty__noGroups: {
        subtitle: 'Đẩy nhóm từ {{provider}} và các nhóm sẽ hiển thị tại đây, sẵn sàng để ánh xạ.',
        title: 'Chưa cấp phát nhóm nào',
      },
      enableDialog: {
        cancelButton: 'Hủy',
        confirmButton: 'Bật đồng bộ vai trò',
        subtitle:
          'Vai trò tổ chức của thành viên sẽ bị ghi đè bởi vai trò được ánh xạ từ nhóm thư mục của họ, bao gồm cả các vai trò đã gán thủ công.',
        title: 'Bật đồng bộ vai trò',
      },
      error__loadMappings: 'Không thể tải ánh xạ vai trò',
      everyoneElse: 'Mọi người khác',
      formFieldLabel__syncRoles: 'Đồng bộ vai trò',
      roleOption__unassigned: 'Chưa gán',
      subtitle:
        'Thành viên nhận vai trò từ nhóm thư mục mà họ thuộc về. Thành viên thuộc nhiều nhóm sẽ được gán vai trò có mức ưu tiên cao nhất.',
      title: 'Ánh xạ vai trò',
    },
    stepper: {
      attributes: 'Thuộc tính',
      configure: 'Cấu hình',
      roles: 'Vai trò',
      test: 'Kiểm tra',
    },
    testStep: {
      actionLabel__complete: 'Hoàn tất',
      actionLabel__syncNow: 'Đồng bộ ngay',
      badge__active: 'Đang hoạt động',
      badge__deprovisioned: 'Đã hủy cấp phát',
      description:
        'Người dùng sẽ xuất hiện tại đây khi nhà cung cấp danh tính của bạn cấp phát họ, hoạt động gần nhất hiển thị trước.',
      description__pull:
        'Thư mục của bạn được đọc theo lịch. Bắt đầu đồng bộ để lấy người dùng ngay, hoạt động gần nhất hiển thị trước.',
      empty__noUsersProvisioned: 'Chưa có người dùng nào được cấp phát.',
      empty__waitingForFirstSync: 'Đang chờ lần đồng bộ đầu tiên hoàn tất…',
      empty__waitingForFirstUser: 'Đang chờ người dùng được cấp phát đầu tiên…',
      error__lastSyncFailed: 'Lần đồng bộ gần nhất đã thất bại',
      error__loadUsers: 'Không thể tải người dùng đã cấp phát',
      error__syncFailed: 'Không thể bắt đầu đồng bộ. Kiểm tra kết nối và thử lại.',
      note: 'chỉ những người dùng có địa chỉ email thuộc tên miền đã cấu hình mới được xử lý.',
      noteLabel: 'Lưu ý:',
      subtitle: 'Gán hoặc đẩy người dùng thử nghiệm từ {{provider}} để xác minh cấp phát.',
      syncRow: {
        neverSynced: 'Chưa đồng bộ',
        title: 'Đồng bộ thư mục',
      },
      syncStatus__cancelled: 'Đã hủy',
      syncStatus__failed: 'Thất bại',
      syncStatus__running: 'Đang chạy',
      syncStatus__succeeded: 'Thành công',
      title: 'Kiểm tra cấp phát',
    },
  },
  configureSSO: {
    activate: {
      activateButton: 'Kích hoạt SSO',
      activeSubtitle: 'Bất kỳ ai đăng nhập bằng {{domain}} đều phải sử dụng nhà cung cấp danh tính của bạn.',
      activeTitle: 'Kết nối SSO đang hoạt động',
      doneButton: 'Hoàn tất',
      skipButton: 'Bỏ qua',
      subtitle:
        'Kết nối SSO của bạn đã sẵn sàng. Sau khi kích hoạt, bất kỳ ai đăng nhập bằng {{domain}} đều phải sử dụng nhà cung cấp danh tính của bạn.',
      title: 'Kết nối SSO đã được cấu hình',
    },
    changeProviderDialog: {
      cancelButton: 'Hủy',
      confirmButton: 'Đổi nhà cung cấp',
      subtitle: 'Chuyển sang {{provider}} sẽ xóa kết nối {{currentProvider}} "{{name}}" và yêu cầu thiết lập mới.',
      title: 'Đổi nhà cung cấp sang {{provider}}',
    },
    configureStep: {
      activeConnectionWarning: {
        dismiss: 'Bỏ qua',
        title:
          'Kết nối này đang hoạt động. Việc lưu thay đổi sẽ áp dụng ngay lập tức và có thể làm gián đoạn đăng nhập của các thành viên hiện tại.',
      },
      attributeMappingTable: {
        badges: {
          optional: 'Tùy chọn',
          required: 'Bắt buộc',
        },
      },
      oidcCustom: {
        credentialsStep: {
          clientId: {
            label: 'Client ID',
            placeholder: 'Dán Client ID tại đây...',
          },
          clientSecret: {
            label: 'Client secret',
            placeholder: 'Dán Client secret tại đây...',
          },
          headerSubtitle: 'Thêm thông tin xác thực ứng dụng của bạn',
          paragraph: 'Trong ứng dụng OIDC của nhà cung cấp danh tính của bạn, hãy lấy các giá trị này.',
        },
        endpointsStep: {
          discoveryUrl: {
            description:
              'Trong ứng dụng OIDC của nhà cung cấp danh tính của bạn, hãy lấy Discovery endpoint. Dán vào bên dưới.',
            label: 'Discovery endpoint',
            placeholder: 'Dán URL tại đây...',
          },
          headerSubtitle: 'Thêm các endpoint của nhà cung cấp danh tính của bạn',
          manual: {
            authUrl: {
              label: 'Authorization URL',
              placeholder: 'Dán URL tại đây...',
            },
            description: 'Trong ứng dụng OIDC của nhà cung cấp danh tính của bạn, hãy lấy các giá trị này.',
            tokenUrl: {
              label: 'Token URL',
              placeholder: 'Dán URL tại đây...',
            },
            userInfoUrl: {
              label: 'User Info URL',
              placeholder: 'Dán URL tại đây...',
            },
          },
          modes: {
            ariaLabel: 'Phương thức cấu hình endpoint OIDC',
            discoveryUrl: 'Thêm qua Discovery endpoint',
            manual: 'Cấu hình thủ công',
          },
        },
        mainHeaderTitle: 'Cấu hình nhà cung cấp danh tính của bạn',
        redirectUriStep: {
          claims: {
            description: 'Đảm bảo ID token của bạn bao gồm các claim sau:',
            table: {
              columns: {
                attribute: 'Thuộc tính Clerk',
                claim: 'ID token claim',
              },
              rows: {
                email: {
                  attribute: 'Email chính',
                },
                firstName: {
                  attribute: 'Tên',
                },
                lastName: {
                  attribute: 'Họ',
                },
                subject: {
                  attribute: 'ID người dùng bên ngoài',
                },
              },
            },
          },
          headerSubtitle: 'Tạo ứng dụng OIDC mới trong bảng điều khiển của nhà cung cấp danh tính của bạn',
          paragraph:
            'Trong bảng điều khiển của nhà cung cấp danh tính của bạn, hãy tạo ứng dụng OIDC mới hỗ trợ loại cấp mã ủy quyền và sử dụng Redirect URI sau:',
          redirectUri: {
            label: 'Redirect URI được ủy quyền',
          },
        },
      },
      samlCustom: {
        assignUsersStep: {
          headerSubtitle: 'Gán người dùng hoặc nhóm cho ứng dụng SAML của bạn',
          paragraph: 'Gán người dùng hoặc nhóm cho ứng dụng của bạn trước khi họ có thể đăng nhập bằng SSO.',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attributeName: 'Tên thuộc tính',
              userAttribute: 'Thuộc tính người dùng',
            },
            rows: {
              email: {
                attributeName: 'Email chính',
                userAttribute: 'mail',
              },
              firstName: {
                attributeName: 'Tên',
                userAttribute: 'firstName',
              },
              lastName: {
                attributeName: 'Họ',
                userAttribute: 'lastName',
              },
            },
          },
          headerSubtitle: 'Ánh xạ thuộc tính người dùng từ nhà cung cấp danh tính của bạn tới ứng dụng của bạn.',
          paragraph: 'Phản hồi SAML của bạn phải bao gồm các thuộc tính sau:',
        },
        createAppStep: {
          createAppInstructions: {
            paragraph:
              'Trong bảng điều khiển của nhà cung cấp danh tính của bạn, hãy tạo ứng dụng SAML 2.0 mới và sử dụng các chi tiết nhà cung cấp dịch vụ sau:',
          },
          headerSubtitle: 'Tạo ứng dụng SAML mới trong bảng điều khiển của nhà cung cấp danh tính của bạn',
          serviceProviderFields: {
            acsUrl: {
              label: 'URL dịch vụ tiếp nhận khẳng định (ACS URL)',
            },
            spEntityId: {
              label: 'Entity ID',
            },
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Cấu hình metadata của nhà cung cấp danh tính',
          manual: {
            description: 'Trong ứng dụng SAML của nhà cung cấp danh tính của bạn, hãy lấy các giá trị này.',
            issuer: {
              label: 'Issuer',
              placeholder: 'Dán URL tại đây...',
            },
            signOnUrl: {
              label: 'URL đăng nhập',
              placeholder: 'Dán URL tại đây...',
            },
            signingCertificate: {
              fileUploaded: 'Đã tải tệp lên',
              label: 'Chứng chỉ ký',
              removeFile: 'Xóa tệp',
              replaceFile: 'Thay thế tệp',
              uploadFile: 'Tải tệp lên',
            },
          },
          metadataUrl: {
            description:
              'Trong ứng dụng SAML của nhà cung cấp danh tính của bạn, hãy lấy Metadata URL. Dán vào bên dưới.',
            label: 'Metadata URL',
            placeholder: 'Dán URL tại đây...',
          },
          modes: {
            ariaLabel: 'Cấu hình',
            manual: 'Cấu hình thủ công',
            metadataUrl: 'Thêm qua metadata',
          },
        },
        mainHeaderTitle: 'Cấu hình nhà cung cấp danh tính của bạn',
      },
      samlGoogle: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              appAttribute: 'Thuộc tính ứng dụng',
              googleAttribute: 'Thuộc tính Google',
            },
            rows: {
              email: {
                appAttribute: 'email',
                googleAttribute: 'Email chính',
              },
              firstName: {
                appAttribute: 'firstName',
                googleAttribute: 'Tên',
              },
              lastName: {
                appAttribute: 'lastName',
                googleAttribute: 'Họ',
              },
            },
          },
          headerSubtitle: 'Ánh xạ thuộc tính người dùng từ Google Workspace tới ứng dụng của bạn',
          paragraph: 'Chúng tôi yêu cầu phản hồi SAML của bạn trả về email, tên và họ của người dùng.',
          step1: 'Trong <bold>Google Admin Console</bold>, hãy tìm mục <bold>Attributes</bold>.',
          step2:
            'Chọn <bold>Add mapping</bold> cho từng thuộc tính và nhập thuộc tính Google và thuộc tính ứng dụng sau:',
        },
        configureUserAccess: {
          assignUsersInstructions: {
            paragraph1:
              'Sau khi hoàn tất cấu hình trong Google, bạn sẽ được chuyển hướng tới trang tổng quan của ứng dụng.',
            paragraph2:
              'Google có thể mất tới 24 giờ để áp dụng các thay đổi này. Kết nối sẽ vẫn ở trạng thái không hoạt động cho đến khi các thay đổi có hiệu lực.',
            step1: 'Mở mục <bold>User access</bold>.',
            step2: 'Chọn <bold>ON for everyone.</bold>',
            step3: 'Chọn <bold>Save</bold>.',
          },
          headerSubtitle: 'Bật ứng dụng SAML Google Workspace của bạn',
        },
        createAppStep: {
          createAppInstructions: {
            step1: 'Trong thanh điều hướng bên, dưới mục <bold>Apps</bold>, hãy chọn <bold>Web and mobile apps.</bold>',
            step2: 'Chọn <bold>Add app</bold>, sau đó chọn <bold>Add custom SAML app.</bold>',
            step3: 'Nhập <bold>App name.</bold>',
            step4: 'Chọn <bold>Continue</bold>.',
            title: 'Trong Google Workspace, hãy tạo ứng dụng SAML mới:',
          },
          headerSubtitle: 'Tạo ứng dụng SAML mới trong Google Workspace',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Thêm metadata ứng dụng Google Workspace của bạn',
          manual: {
            description: 'Trong ứng dụng Google Workspace của bạn, hãy lấy các giá trị này.',
            issuer: {
              label: 'Entity ID',
              placeholder: 'Dán URL tại đây...',
            },
            signOnUrl: {
              label: 'SSO URL',
              placeholder: 'Dán URL tại đây...',
            },
            signingCertificate: {
              fileUploaded: 'Đã tải tệp lên',
              label: 'Chứng chỉ ký',
              removeFile: 'Xóa tệp',
              replaceFile: 'Thay thế tệp',
              uploadFile: 'Tải tệp lên',
            },
          },
          metadataFile: {
            description: 'Trong ứng dụng Google Workspace của bạn, hãy tải xuống metadata IdP và tải lên bên dưới.',
            fileUploaded: 'Đã tải tệp lên',
            label: 'Metadata IdP',
            removeFile: 'Xóa tệp',
            replaceFile: 'Thay thế tệp',
            uploadFile: 'Tải tệp lên',
          },
          modes: {
            ariaLabel: 'Cấu hình',
            manual: 'Cấu hình thủ công',
            metadataFile: 'Thêm qua metadata',
          },
        },
        mainHeaderTitle: 'Cấu hình Google Workspace',
        serviceProviderStep: {
          headerSubtitle: 'Cấu hình nhà cung cấp dịch vụ',
          nameIdInstructions: {
            step1:
              'Trong mục <bold>Name ID</bold>, hãy chọn danh sách định dạng <bold>Name ID</bold> và chọn <bold>Email</bold>.',
            step2: 'Chọn <bold>Continue</bold>',
          },
          paragraph:
            'Để cấu hình nhà cung cấp dịch vụ của bạn, bạn phải thêm hai trường này vào ứng dụng SAML Google Workspace của bạn:',
          serviceProviderFields: {
            acsUrl: {
              label: 'ACS URL',
            },
            spEntityId: {
              label: 'Entity ID',
            },
          },
          title: 'Cấu hình nhà cung cấp dịch vụ',
        },
      },
      samlMicrosoft: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attribute: 'Thuộc tính',
              claimName: 'Tên claim',
              value: 'Giá trị',
            },
            copyClaimName: 'Sao chép tên claim',
            copyClaimNameCopied: 'Đã sao chép',
            rows: {
              email: {
                attribute: 'Địa chỉ email',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                value: 'user.mail',
              },
              firstName: {
                attribute: 'Tên',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
                value: 'user.givenname',
              },
              lastName: {
                attribute: 'Họ',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
                value: 'user.surname',
              },
            },
          },
          headerSubtitle: 'Thiết lập các thuộc tính mà Microsoft Entra bao gồm trong phản hồi SAML của bạn',
          step1: 'Trên trang <bold>SAML-based Sign-on</bold>, hãy tìm mục <bold>Attributes & Claims</bold>.',
          step2: 'Chọn <bold>Edit.</bold>',
          title: 'Phản hồi SAML của bạn phải bao gồm các thuộc tính sau:',
        },
        createAppStep: {
          assignUsersInstructions: {
            step1: 'Trong mục <bold>Getting Started</bold>, hãy chọn <bold>Assign users and groups.</bold>',
            step2:
              'Chọn <bold>Add user/group.</bold> Bạn sẽ được chuyển hướng tới trang <bold>Add Assignment page.</bold>',
            step3: 'Chọn liên kết <bold>None Selected link.</bold>',
            step4:
              'Chọn <bold>Select</bold> ở cuối trang. Bạn sẽ được chuyển hướng tới trang <bold>Add Assignment</bold>.',
            step5: 'Chọn <bold>Assign</bold>',
            title: 'Gán người dùng hoặc nhóm của bạn trong Microsoft',
          },
          createAppInstructions: {
            step1: 'Đăng nhập vào Microsoft Azure Portal và truy cập <bold>Enterprise applications.</bold>',
            step2:
              'Nhấp vào <bold>New application.</bold> Bạn sẽ được chuyển hướng tới trang <bold>Browse Microsoft Entra Gallery</bold>.',
            step3: 'Chọn <bold>Create your own application.</bold>',
            step4: {
              label: 'Trong hộp thoại mở ra:',
              subSteps: {
                appName: 'Nhập tên ứng dụng của bạn.',
                create: 'Chọn <bold>Create</bold>.',
                nonGallery:
                  "Chọn <bold>Integrate any other application you don't find in the gallery (Non-gallery)</bold>.",
              },
            },
            title: 'Tạo ứng dụng doanh nghiệp mới',
          },
          headerSubtitle: 'Tạo ứng dụng doanh nghiệp mới trong Azure Portal của bạn',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Thêm metadata ứng dụng Microsoft Entra của bạn',
          manual: {
            description:
              'Trên trang <bold>SAML-based Sign-on</bold>, tìm mục <bold>SAML Certificates</bold>. Lấy các giá trị này và thêm vào bên dưới.',
            issuer: {
              label: 'Issuer',
              placeholder: 'Dán URL vào đây...',
            },
            signOnUrl: {
              label: 'URL đăng nhập',
              placeholder: 'Dán URL vào đây...',
            },
            signingCertificate: {
              fileUploaded: 'Đã tải tệp lên',
              label: 'Chứng chỉ ký',
              removeFile: 'Xóa tệp',
              replaceFile: 'Thay thế tệp',
              uploadFile: 'Tải tệp lên',
            },
          },
          metadataUrl: {
            description:
              'Trên trang <bold>SAML-based Sign-on</bold>, tìm mục <bold>SAML Certificates</bold> và sao chép <bold>App Federation Metadata Url</bold>. Dán vào bên dưới.',
            label: 'Metadata URL',
            placeholder: 'Dán URL vào đây...',
          },
          modes: {
            ariaLabel: 'Cấu hình ',
            manual: 'Cấu hình thủ công',
            metadataUrl: 'Thêm qua metadata',
          },
        },
        mainHeaderTitle: 'Cấu hình Microsoft Entra',
        serviceProviderStep: {
          headerSubtitle: 'Thêm cấu hình nhà cung cấp dịch vụ vào Microsoft Entra',
          serviceProviderFields: {
            acsUrl: {
              label: 'URL phản hồi (Assertion Consumer Service URL)',
            },
            spEntityId: {
              label: 'Định danh (Entity ID)',
            },
          },
          step1: 'Trong thanh điều hướng bên, mở menu thả xuống <bold>Manage</bold> và chọn Single sign-on.',
          step2: 'Trong mục <bold>Select a single sign-on method</bold>, chọn <bold>SAML</bold>.',
          step3: 'Tìm mục <bold>Basic SAML Configuration</bold>.',
          step4: 'Chọn <bold>Edit</bold>. Bảng <bold>Basic SAML Configuration</bold> sẽ mở ra.',
          step5:
            'Sao chép các giá trị sau vào <bold>Identifier (Entity ID)</bold> và <bold>Reply URL (ACS URL)</bold>:',
          step6: 'Chọn <bold>Save</bold> ở đầu bảng. Đóng bảng.',
          title: 'Thêm chi tiết nhà cung cấp dịch vụ',
        },
      },
      samlOkta: {
        assignUsersStep: {
          assignUsersInstructions: {
            paragraph: 'Gán người dùng hoặc nhóm cho ứng dụng Okta của bạn trước khi họ có thể đăng nhập bằng SSO',
            step1: 'Trong bảng điều khiển Okta, chọn tab <bold>Assignments</bold>.',
            step2:
              'Mở menu thả xuống <bold>Assign</bold> và chọn <bold>Assign to people</bold> hoặc <bold>Assign to groups</bold>.',
            step3: 'Tìm kiếm người dùng hoặc nhóm cần gán.',
            step4: 'Nhấp <bold>Assign</bold> bên cạnh người dùng hoặc nhóm.',
            step5: 'Nhấp <bold>Done.</bold>',
          },
          headerSubtitle: 'Gán người dùng cho ứng dụng Okta của bạn',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              expression: 'Biểu thức',
              name: 'Tên thuộc tính',
            },
            rows: {
              email: {
                expression: 'user.profile.email',
                name: 'mail',
              },
              firstName: {
                expression: 'user.profile.firstName',
                name: 'firstName',
              },
              lastName: {
                expression: 'user.profile.lastName',
                name: 'lastName',
              },
            },
          },
          headerSubtitle: 'Thiết lập các thuộc tính mà Okta đưa vào phản hồi SAML của bạn',
          paragraph: 'Phản hồi SAML của bạn phải bao gồm các thuộc tính sau:',
          step1: 'Trong bảng điều khiển Okta, tìm mục <bold>Attribute Statements</bold>.',
          step2: 'Chọn <bold>Add Expression</bold> cho từng thuộc tính và nhập các cặp tên và biểu thức sau:',
        },
        createAppStep: {
          completeSamlIntegrationInstructions: {
            step1: 'Trong mục <bold>Feedback</bold>, chọn <bold>This is an internal app that we have created.</bold>',
            step2: 'Nhấp <bold>Finish</bold> để hoàn tất tích hợp.',
            title: 'Hoàn tất tích hợp SAML',
          },
          createAppInstructions: {
            step1: 'Đăng nhập vào Okta và đi tới <bold>Admin → Applications.</bold>',
            step2: 'Nhấp <bold>Create App Integration.</bold> và chọn <bold>SAML 2.0.</bold>',
            step3: 'Điền Cài đặt chung. Tên ứng dụng là bắt buộc.',
            step4: 'Nhấp <bold>Next</bold> để hoàn tất việc tạo ứng dụng.',
            title: 'Tạo ứng dụng SAML mới trong Okta',
          },
          headerSubtitle: 'Tạo và cấu hình ứng dụng SAML trong Okta Dashboard của bạn',
          serviceProviderInstructions: {
            paragraph1:
              'Sau khi hoàn tất <bold>General Settings</bold>, bạn sẽ thấy trang <bold>Configure SAML</bold>.',
            paragraph2: 'Thêm hai trường này vào ứng dụng Okta của bạn để cấu hình nhà cung cấp dịch vụ.',
            serviceProviderFields: {
              acsUrl: {
                label: 'URL đăng nhập một lần',
              },
              spEntityId: {
                label: 'URI đối tượng (SP Entity ID)',
              },
            },
            title: 'Cấu hình nhà cung cấp dịch vụ',
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Thêm metadata ứng dụng Okta của bạn',
          manual: {
            description: 'Trong ứng dụng SAML Okta của bạn, đi tới tab <bold>Sign On</bold> và lấy các giá trị này.',
            issuer: {
              label: 'Issuer',
              placeholder: 'Dán URL vào đây...',
            },
            signOnUrl: {
              label: 'URL đăng nhập',
              placeholder: 'Dán URL vào đây...',
            },
            signingCertificate: {
              fileUploaded: 'Đã tải tệp lên',
              label: 'Chứng chỉ ký',
              removeFile: 'Xóa tệp',
              replaceFile: 'Thay thế tệp',
              uploadFile: 'Tải tệp lên',
            },
          },
          metadataUrl: {
            description:
              'Trong ứng dụng SAML Okta của bạn, đi tới tab <bold>Sign On</bold> và lấy Metadata URL. Dán vào bên dưới.',
            label: 'Metadata URL',
            placeholder: 'Dán URL vào đây...',
          },
          modes: {
            ariaLabel: 'Cấu hình',
            manual: 'Cấu hình thủ công',
            metadataUrl: 'Thêm qua metadata',
          },
        },
        mainHeaderTitle: 'Cấu hình Okta Workforce',
      },
      unsupportedProvider: {
        description:
          'Nhà cung cấp danh tính này không được hỗ trợ trong phiên bản Clerk này. Vui lòng cập nhật lên phiên bản mới nhất để hoàn tất thiết lập.',
        title: 'Nhà cung cấp không được hỗ trợ',
      },
    },
    connectionScopeBanner: {
      subtitle__adding: 'Tổ chức này đã có {{count}} kết nối SSO.',
      subtitle__editing: 'Tổ chức này có {{count}} kết nối SSO. Các thay đổi tại đây chỉ áp dụng cho kết nối này.',
      title__adding: 'Đang thêm kết nối SSO mới',
      title__editing: 'Đang chỉnh sửa "{{name}}"',
    },
    missingManageEnterpriseConnectionsPermission: {
      subtitle: 'Liên hệ với quản trị viên tổ chức của bạn để nâng cấp quyền của bạn.',
      title: 'Bạn không có quyền quản lý đăng nhập một lần (SSO)',
    },
    navbar: {
      title: 'Cấu hình đăng nhập một lần (SSO)',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__claimed: 'Đang được kết nối khác sử dụng',
        badge__expired: 'Đã hết hạn',
        badge__unverified: 'Chưa xác minh',
        badge__verified: 'Đã xác minh',
        checkboxLabel: 'Sử dụng {{domain}} cho kết nối này',
        expiredAtLabel:
          "Xác minh tên miền đã hết hạn vào {{ date | shortDate('vi-VN') }}. Vui lòng xác minh lại để tạo bản ghi DNS mới.",
        expiredLabel: 'Xác minh tên miền đã hết hạn. Vui lòng xác minh lại để tạo bản ghi DNS mới.',
        removeButtonTooltip__lastVerifiedDomain: 'Cần ít nhất một tên miền đã xác minh để thiết lập SSO.',
        removeButtonTooltip__lastVerifiedDomainActive: 'Cần ít nhất một tên miền đã xác minh để duy trì SSO.',
        txtRecord: {
          hostLabel: 'Máy chủ / Tên',
          instructions:
            'Thêm bản ghi TXT này vào nhà cung cấp DNS của bạn. Chúng tôi sẽ tự động xác minh khi bản ghi hoạt động.',
          typeLabel: 'Loại',
          valueLabel: 'Giá trị',
        },
        verifiedAtLabel: "Đã xác minh vào {{ date | shortDate('vi-VN') }}",
        verifyAgainButton: 'Xác minh lại',
      },
      domainSuggestion: {
        formButtonPrimary__add: 'Thêm {{domain}}',
        messageLabel: 'Email của bạn sử dụng {{domain}}. Bạn có muốn thêm nó không?',
      },
      formButtonPrimary__add: 'Thêm',
      formFieldInputPlaceholder__domain: 'Thêm tên miền',
      formFieldLabel__domain: 'Tên miền',
      removeDomainDialog: {
        cancelButton: 'Hủy',
        removeButton: 'Xóa tên miền',
        subtitle__active:
          'Bạn sắp xóa {{domain}} khỏi kết nối doanh nghiệp này. Người dùng sẽ không thể đăng nhập bằng {{domain}} nữa.',
        subtitle__inactive: 'Bạn sắp xóa {{domain}} khỏi kết nối doanh nghiệp này.',
        title: 'Đang xóa tên miền',
      },
      subtitle: 'Thêm và xác minh quyền sở hữu các tên miền mà tổ chức của bạn dùng để đăng nhập.',
      title: 'Thêm tên miền SSO',
    },
    resetConnectionDialog: {
      cancelButton: 'Hủy',
      confirmationFieldLabel: 'Nhập "{{name}}" bên dưới để tiếp tục',
      confirmationFieldPlaceholder: '{{name}}',
      resetButton: 'Đặt lại kết nối',
      subtitle:
        'Bạn có chắc chắn muốn đặt lại kết nối "{{name}}" không? Hành động này không thể hoàn tác và bạn sẽ phải cấu hình lại tất cả các bước',
      title: 'Đặt lại kết nối',
    },
    selectProviderStep: {
      oidc: {
        groupLabel: 'OpenID Connect (OIDC)',
        oidcProvider: 'Nhà cung cấp OIDC',
      },
      saml: {
        customSaml: 'Nhà cung cấp SAML tùy chỉnh',
        google: 'Google Workspace',
        groupLabel: 'SAML',
        microsoft: 'Microsoft Entra (trước đây là AD)',
        okta: 'Okta Workforce',
      },
      subtitle: 'Chọn nhà cung cấp mà bạn sẽ thiết lập SSO cho.',
      title: 'Chọn nhà cung cấp',
      warning: 'Khi đã chọn nhà cung cấp, bạn không thể thay đổi cho đến khi cấu hình hoàn tất',
    },
    signingCertificates: {
      addCertificate: 'Thêm chứng chỉ',
      expired: 'Đã hết hạn {{date}}',
      expires: 'Hết hạn {{date}}',
      expiryAfterSave: 'Ngày hết hạn sẽ hiển thị sau khi bạn lưu.',
      fileUnreadable: 'Không thể đọc tệp. Vui lòng thử lại.',
      notACertificate: 'Một trong các tệp đã tải lên không phải là chứng chỉ.',
      primary: 'Chính',
      primaryTooltip: 'Được kiểm tra trước khi xác minh đăng nhập. Mọi chứng chỉ trong danh sách này đều đáng tin cậy.',
      removeCertificate: 'Xóa chứng chỉ',
    },
    testConfigurationStep: {
      error__noSuccessfulTestRun:
        'Bạn cần ít nhất một lần chạy thử thành công trước khi tiếp tục. Vui lòng tạo URL thử nghiệm và hoàn tất quy trình đăng nhập.',
      subtitle: 'Đăng nhập qua URL thử nghiệm để xác minh kết nối SSO của bạn đã được cấu hình đúng',
      testResults: {
        actionLabel__refresh: 'Làm mới nhật ký',
        empty: {
          subtitle: 'Chọn <bold>Open test URL</bold> để chạy lần kiểm thử đầu tiên',
          title: 'Chưa có kết quả kiểm thử',
        },
        polling: 'Đang chờ lần chạy thử hoàn tất…',
        status__failed: 'Thất bại',
        status__pending: 'Đang chờ',
        status__success: 'Thành công',
        title: 'Kết quả kiểm thử của bạn',
      },
      testRunDetails: {
        howToFix: {
          actionLabel__viewDocumentation: 'Xem tài liệu',
          oauth_access_denied: {
            description:
              'Lỗi này xảy ra khi người dùng nhấp Hủy hoặc Từ chối trên màn hình ủy quyền của nhà cung cấp OAuth, hoặc nhà cung cấp đã từ chối yêu cầu ủy quyền. Vui lòng xác minh rằng thông tin xác thực ứng dụng OAuth (Client ID và Client secret) đã được cấu hình đúng.',
          },
          oauth_fetch_user_error: {
            intro: 'Để khắc phục lỗi này, vui lòng thực hiện các bước sau:',
            step1:
              'Xác minh rằng các phạm vi OAuth được cấu hình trong cài đặt kết nối của bạn bao gồm các quyền cần thiết để đọc thông tin hồ sơ người dùng.',
            step2: 'Đảm bảo rằng URL điểm cuối thông tin người dùng đã được cấu hình đúng.',
          },
          oauth_token_exchange_error: {
            description:
              'Vui lòng xác minh rằng Client ID và Client secret của ứng dụng OAuth của bạn đã được cấu hình đúng và khớp với thông tin xác thực từ bảng điều khiển của nhà cung cấp OAuth.',
          },
          saml_email_address_domain_mismatch: {
            description:
              'Vui lòng xác minh rằng người dùng đang đăng nhập bằng địa chỉ email khớp với một trong các tên miền được phép cho kết nối này. Nếu cần thêm tên miền, hãy cập nhật các tên miền được phép trong cài đặt kết nối của bạn.',
          },
          saml_response_relaystate_missing: {
            description:
              'Vui lòng kiểm tra rằng nhà cung cấp danh tính của bạn trả về đúng tham số RelayState đã được gửi trong yêu cầu ban đầu.',
          },
          saml_user_attribute_missing: {
            intro: 'Để khắc phục lỗi này, vui lòng thực hiện các bước sau:',
            step1: 'Truy cập bảng điều khiển cấu hình của nhà cung cấp danh tính của bạn.',
            step2: 'Điều hướng đến cài đặt SAML của ứng dụng hoặc cấu hình ánh xạ thuộc tính.',
            step3: "Đảm bảo rằng thuộc tính 'mail' được ánh xạ đúng tới trường địa chỉ email của người dùng.",
          },
          sectionTitle: 'Cách khắc phục',
        },
        parsedUserInfo: {
          email: 'Email',
          firstName: 'Tên',
          sectionTitle: 'Thông tin người dùng đã phân tích',
        },
        runDetails: {
          actionLabel__copied: 'Đã sao chép',
          actionLabel__copy: 'Sao chép thông báo',
          errorCode: 'Mã lỗi',
          fullMessage: 'Thông báo đầy đủ',
          sectionTitle: 'Chi tiết lần chạy',
          status: 'Trạng thái',
          timestamp: 'Dấu thời gian',
        },
        title: 'Lần chạy thử',
      },
      testUrl: {
        actionLabel__open: 'Mở URL thử nghiệm',
      },
      title: 'Kiểm thử kết nối SSO của bạn',
    },
  },
  createOrganization: {
    formButtonSubmit: 'Tạo tổ chức',
    invitePage: {
      formButtonReset: 'Bỏ qua',
    },
    title: 'Tạo tổ chức',
  },
  dates: {
    lastDay: "Hôm qua lúc {{ date | timeString('vi-VN') }}",
    next6Days: "{{ date | weekday('vi-VN','long') }} lúc {{ date | timeString('vi-VN') }}",
    nextDay: "Ngày mai lúc {{ date | timeString('vi-VN') }}",
    numeric: "{{ date | numeric('vi-VN') }}",
    previous6Days: "{{ date | weekday('vi-VN','long') }} lúc {{ date | timeString('vi-VN') }}",
    sameDay: "Hôm nay lúc {{ date | timeString('vi-VN') }}",
  },
  dividerText: 'hoặc',
  footerActionLink__alternativePhoneCodeProvider: 'Gửi mã qua SMS thay vì email',
  footerActionLink__useAnotherMethod: 'Sử dụng phương thức khác',
  footerPageLink__help: 'Trợ giúp',
  footerPageLink__privacy: 'Quyền riêng tư',
  footerPageLink__terms: 'Điều khoản',
  formButtonPrimary: 'Tiếp tục',
  formButtonPrimary__verify: 'Xác minh',
  formFieldAction__forgotPassword: 'Quên mật khẩu?',
  formFieldAction__hidePassword: 'Ẩn mật khẩu',
  formFieldAction__showPassword: 'Hiện mật khẩu',
  formFieldError__matchingPasswords: 'Mật khẩu trùng khớp.',
  formFieldError__notMatchingPasswords: 'Mật khẩu không trùng khớp.',
  formFieldError__verificationLinkExpired: 'Liên kết xác minh đã hết hạn. Vui lòng yêu cầu liên kết mới.',
  formFieldHintText__optional: 'Tùy chọn',
  formFieldHintText__slug:
    'Một slug là một ID dễ đọc bởi con người mà phải độc nhất. Nó thường được sử dụng trong URL.',
  formFieldInputPlaceholder__apiKeyDescription: 'Giải thích tại sao bạn đang tạo khoá này',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Chọn ngày',
  formFieldInputPlaceholder__apiKeyName: 'Nhập tên khoá bí mật',
  formFieldInputPlaceholder__backupCode: 'Nhập mã dự phòng',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Xóa tài khoản',
  formFieldInputPlaceholder__emailAddress: 'Nhập địa chỉ email của bạn',
  formFieldInputPlaceholder__emailAddress_username: 'Nhập email hoặc tên người dùng',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: 'Tên',
  formFieldInputPlaceholder__lastName: 'Họ',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'you@example.com',
  formFieldInputPlaceholder__organizationName: 'Tên tổ chức',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: 'Nhập mật khẩu của bạn',
  formFieldInputPlaceholder__phoneNumber: 'Nhập số điện thoại của bạn',
  formFieldInputPlaceholder__signUpPassword: 'Tạo mật khẩu',
  formFieldInputPlaceholder__username: 'Nhập tên người dùng của bạn',
  formFieldInput__emailAddress_format: 'Định dạng ví dụ: name@example.com',
  formFieldLabel__apiKey: 'Khóa API',
  formFieldLabel__apiKeyDescription: 'Mô tả',
  formFieldLabel__apiKeyExpiration: 'Hết hạn',
  formFieldLabel__apiKeyName: 'Tên khoá bí mật',
  formFieldLabel__automaticInvitations: 'Cho phép tự động mời cho tên miền này',
  formFieldLabel__backupCode: 'Mã dự phòng',
  formFieldLabel__confirmDeletion: 'Xác nhận',
  formFieldLabel__confirmPassword: 'Xác nhận mật khẩu',
  formFieldLabel__currentPassword: 'Mật khẩu hiện tại',
  formFieldLabel__emailAddress: 'Địa chỉ email',
  formFieldLabel__emailAddress_username: 'Email hoặc tên người dùng',
  formFieldLabel__emailAddresses: 'Địa chỉ email',
  formFieldLabel__firstName: 'Tên',
  formFieldLabel__lastName: 'Họ',
  formFieldLabel__newPassword: 'Mật khẩu mới',
  formFieldLabel__organizationDomain: 'Tên miền',
  formFieldLabel__organizationDomainDeletePending: 'Xóa mời và gợi ý đang chờ',
  formFieldLabel__organizationDomainEmailAddress: 'Địa chỉ email xác minh',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Nhập địa chỉ email dưới tên miền này để nhận mã và xác minh tên miền này.',
  formFieldLabel__organizationName: 'Tên',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Tên của passkey',
  formFieldLabel__password: 'Mật khẩu',
  formFieldLabel__phoneNumber: 'Số điện thoại',
  formFieldLabel__role: 'Vai trò',
  formFieldLabel__signOutOfOtherSessions: 'Đăng xuất khỏi tất cả thiết bị khác',
  formFieldLabel__username: 'Tên người dùng',
  identityPreviewEditButton__emailAddress: 'Chỉnh sửa địa chỉ email',
  identityPreviewEditButton__identifier: 'Chỉnh sửa định danh',
  identityPreviewEditButton__phoneNumber: 'Chỉnh sửa số điện thoại',
  impersonationFab: {
    action__signOut: 'Đăng xuất',
    title: 'Đăng nhập với {{identifier}}',
  },
  lastAuthenticationStrategy: 'Lần sử dụng cuối cùng',
  maintenanceMode: 'Chúng tôi đang trong quá trình bảo trì, nhưng đừng lo lắng, nó không nên mất quá nhiều thời gian.',
  membershipRole__admin: 'Quản trị viên',
  membershipRole__basicMember: 'Thành viên',
  membershipRole__guestMember: 'Khách',
  oauthConsent: {
    action__allow: 'Cho phép',
    action__deny: 'Từ chối',
    offlineAccessNotice: 'Bạn sẽ vẫn đăng nhập cho đến khi bạn đăng xuất hoặc thu hồi quyền truy cập.',
    redirectNotice: 'Nếu bạn cho phép truy cập, ứng dụng này sẽ chuyển hướng bạn đến {{domainAction}}.',
    redirectUriModal: {
      subtitle: 'Hãy đảm bảo bạn tin tưởng {{applicationName}} và URL này thuộc về {{applicationName}}.',
      title: 'URL chuyển hướng',
    },
    scopeList: {
      privateMetadata:
        'Siêu dữ liệu riêng tư của bạn do {{applicationName}} thiết lập, có thể bao gồm thông tin nhạy cảm',
      title: 'Điều này sẽ cho phép {{applicationName}} truy cập vào:',
    },
    subtitle: 'muốn truy cập {{applicationName}} thay mặt cho {{identifier}}',
    viewFullUrl: 'Xem URL đầy đủ',
    warning:
      'Hãy đảm bảo bạn tin tưởng {{applicationName}} ({{domainAction}}). Bạn có thể đang chia sẻ dữ liệu nhạy cảm với trang web hoặc ứng dụng này.',
  },
  oauthDeviceVerification: {
    action__tryAnotherCode: 'Nhập mã khác',
    confirmation: {
      action__approve: 'Phê duyệt',
      action__deny: 'Từ chối',
      scopeListTitle: 'Điều này sẽ cho phép {{applicationName}} truy cập vào:',
      subtitle: 'Xác nhận yêu cầu này cho {{identifier}}',
      title: 'Cho phép {{applicationName}} truy cập tài khoản của bạn?',
      warning: 'Chỉ phê duyệt yêu cầu này nếu bạn đã bắt đầu nó trên thiết bị khác của mình.',
    },
    error: {
      expiredSubtitle: 'Hãy bắt đầu lại trên thiết bị của bạn.',
      expiredTitle: 'Mã này đã hết hạn',
      genericSubtitle: 'Kiểm tra kết nối của bạn và thử lại.',
      genericTitle: 'Chúng tôi không thể xác minh mã này',
      invalidCode: 'Nhập mã hợp lệ gồm 8 ký tự.',
      rateLimitedSubtitle: 'Vui lòng chờ trước khi thử mã khác.',
      rateLimitedTitle: 'Quá nhiều lần thử',
      unknownCode: 'Chúng tôi không tìm thấy mã đó. Hãy kiểm tra và thử lại.',
    },
    start: {
      action__continue: 'Tiếp tục',
      subtitle: 'Nhập mã hiển thị trên thiết bị hoặc ứng dụng bạn muốn ủy quyền.',
      title: 'Xác minh thiết bị',
      userCodeLabel: 'Mã thiết bị',
    },
    status: {
      alreadyApprovedSubtitle: 'Quay lại thiết bị của bạn để tiếp tục.',
      alreadyApprovedTitle: 'Bạn đã phê duyệt yêu cầu này',
      alreadyDecidedSubtitle: 'Yêu cầu đã được quyết định ở nơi khác. Quay lại thiết bị của bạn.',
      alreadyDecidedTitle: 'Yêu cầu này đã được hoàn tất',
      alreadyDeniedSubtitle: 'Bắt đầu lại trên thiết bị của bạn nếu bạn muốn thử lại.',
      alreadyDeniedTitle: 'Yêu cầu này đã bị từ chối',
      approvedSubtitle: 'Bạn đã phê duyệt yêu cầu này. Quay lại thiết bị của bạn để tiếp tục.',
      approvedTitle: 'Thiết bị đã được phê duyệt',
      consumedSubtitle: 'Thiết bị của bạn đã được ủy quyền. Bạn có thể đóng cửa sổ này.',
      consumedTitle: 'Mã này đã được sử dụng',
      deniedSubtitle: 'Bạn đã từ chối yêu cầu này. Quay lại thiết bị của bạn.',
      deniedTitle: 'Quyền truy cập bị từ chối',
    },
  },
  organizationList: {
    action__createOrganization: 'Tạo tổ chức',
    action__invitationAccept: 'Tham gia',
    action__suggestionsAccept: 'Yêu cầu tham gia',
    createOrganization: 'Tạo tổ chức',
    invitationAcceptedLabel: 'Tham gia',
    subtitle: 'để tiếp tục đến {{applicationName}}',
    suggestionsAcceptedLabel: 'Đang chờ phê duyệt',
    title: 'Chọn tài khoản',
    titleWithoutPersonal: 'Chọn tổ chức',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'Khoá API',
    },
    badge__automaticInvitation: 'Tự động mời',
    badge__automaticSuggestion: 'Tự động gợi ý',
    badge__enterpriseSso: 'SSO doanh nghiệp',
    badge__manualInvitation: 'Không tự động đăng ký',
    badge__unverified: 'Chưa xác minh',
    billingPage: {
      accountCreditsSection: {
        title: 'Tín dụng tài khoản',
        viewHistory: 'Xem lịch sử tín dụng',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Số tiền',
        tableHeader__date: 'Ngày',
        title: 'Lịch sử tín dụng tài khoản',
      },
      paymentHistorySection: {
        empty: 'Không có lịch sử thanh toán',
        notFound: 'Không tìm thấy lịch sử thanh toán',
        tableHeader__amount: 'Số tiền',
        tableHeader__date: 'Ngày',
        tableHeader__status: 'Trạng thái',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Làm mặc định',
        actionLabel__remove: 'Xóa',
        add: 'Thêm phương thức thanh toán mới',
        addSubtitle: 'Thêm phương thức thanh toán mới vào tài khoản của bạn.',
        cancelButton: 'Hủy',
        formButtonPrimary__add: 'Thêm phương thức thanh toán',
        formButtonPrimary__pay: 'Thanh toán {{amount}}',
        payWithTestCardButton: 'Thanh toán với thẻ thử nghiệm',
        removeMethod: {
          messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
          messageLine2:
            'Bạn sẽ không còn thể sử dụng nguồn thanh toán này và bất kỳ đăng ký lặp lại nào phụ thuộc vào nó sẽ không còn hoạt động.',
          successMessage: '{{paymentMethod}} đã bị xóa khỏi tài khoản của bạn.',
          title: 'Xóa phương thức thanh toán',
        },
        title: 'Phương thức thanh toán',
      },
      start: {
        headerTitle__payments: 'Thanh toán',
        headerTitle__plans: 'Gói',
        headerTitle__statements: 'Hóa đơn',
        headerTitle__subscriptions: 'Đăng ký',
      },
      statementsSection: {
        empty: 'Không có hóa đơn để hiển thị',
        itemCaption__paidForPlan: 'Thanh toán cho gói {{plan}} {{period}}',
        itemCaption__payerCredit: 'Tín dụng từ số dư tài khoản',
        itemCaption__proratedCredit: 'Tín dụng phân chia cho sử dụng một phần của đăng ký trước',
        itemCaption__subscribedAndPaidForPlan: 'Đăng ký và thanh toán cho gói {{plan}} {{period}}',
        notFound: 'Không tìm thấy hóa đơn',
        tableHeader__amount: 'Số tiền',
        tableHeader__date: 'Ngày',
        title: 'Hóa đơn',
        totalPaid: 'Tổng thanh toán',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Quản lý',
        actionLabel__newSubscription: 'Đăng ký gói',
        actionLabel__switchPlan: 'Chuyển gói',
        includedSeatsUsage: '{{includedSeats}} người dùng đã bao gồm',
        overview: 'Tổng quan',
        paidSeatsUsage: '{{seatsQuantity}} người dùng x {{amount}}',
        seatLimit: 'Tối đa {{seatLimit}} người dùng',
        seatLimitAndIncludedSeats: 'Tối đa {{seatLimit}} người dùng ({{includedSeats}} đã bao gồm)',
        tableHeader__edit: 'Sửa',
        tableHeader__plan: 'Gói',
        tableHeader__startDate: 'Ngày bắt đầu',
        title: 'Đăng ký',
      },
      subscriptionsSection: {
        actionLabel__default: 'Quản lý',
      },
      switchPlansSection: {
        title: 'Chuyển gói',
      },
      title: 'Thanh toán',
    },
    createDomainPage: {
      subtitle:
        'Thêm tên miền để xác minh. Người dùng với địa chỉ email ở tên miền này có thể tham gia tổ chức tự động hoặc yêu cầu tham gia.',
      title: 'Thêm tên miền',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Mời không thể được gửi. Đã có mời đang chờ cho các địa chỉ email sau: {{email_addresses}}.',
      formButtonPrimary__continue: 'Gửi mời',
      formButtonPrimary__purchaseSeats: 'Mua thêm người dùng',
      selectDropdown__role: 'Chọn vai trò',
      subtitle: 'Nhập hoặc dán một hoặc nhiều địa chỉ email, cách nhau bằng dấu cách hoặc dấu phẩy.',
      successMessage: 'Mời đã được gửi thành công',
      title: 'Mời thành viên mới',
    },
    membersPage: {
      action__invite: 'Mời',
      action__search: 'Tìm kiếm',
      activeMembersTab: {
        menuAction__remove: 'Xóa thành viên',
        tableHeader__actions: 'Hành động',
        tableHeader__joined: 'Tham gia',
        tableHeader__role: 'Vai trò',
        tableHeader__user: 'Người dùng',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle: 'Chúng tôi đang cập nhật các vai trò có sẵn. Sau khi hoàn tất, bạn sẽ có thể cập nhật vai trò lại.',
          title: 'Các vai trò tạm thời bị khóa',
        },
      },
      detailsTitle__emptyRow: 'Không có thành viên để hiển thị',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Mời người dùng bằng cách kết nối tên miền email với tổ chức của bạn. Bất kỳ ai đăng ký với tên miền email khớp sẽ có thể tham gia tổ chức bất cứ lúc nào.',
          headerTitle: 'Tự động mời',
          primaryButton: 'Quản lý tên miền đã xác minh',
        },
        table__emptyRow: 'Không có mời để hiển thị',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Hủy mời',
        tableHeader__invited: 'Đã mời',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Người dùng đăng ký với tên miền email khớp sẽ có thể thấy gợi ý để yêu cầu tham gia tổ chức của bạn.',
          headerTitle: 'Tự động gợi ý',
          primaryButton: 'Quản lý tên miền đã xác minh',
        },
        menuAction__approve: 'Phê duyệt',
        menuAction__reject: 'Từ chối',
        tableHeader__requested: 'Yêu cầu truy cập',
        table__emptyRow: 'Không có yêu cầu để hiển thị',
      },
      start: {
        headerTitle__invitations: 'Mời',
        headerTitle__members: 'Thành viên',
        headerTitle__requests: 'Yêu cầu',
      },
    },
    navbar: {
      apiKeys: 'Khoá API',
      billing: 'Thanh toán',
      description: 'Quản lý tổ chức của bạn.',
      general: 'Tổng quan',
      members: 'Thành viên',
      security: 'Bảo mật',
      title: 'Tổ chức',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'Bạn không có quyền quản lý thanh toán cho tổ chức này.',
        planMembershipLimitExceeded:
          'Tổ chức của bạn có {{count}} thành viên (bao gồm lời mời đang chờ). Gói này chỉ cho phép {{limit}} thành viên.',
      },
      title: 'Gói',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Nhập "{{organizationName}}" dưới để tiếp tục.',
          messageLine1: 'Bạn có chắc chắn muốn xóa tổ chức này?',
          messageLine2: 'Hành động này là vĩnh viễn và không thể hoàn tác.',
          successMessage: 'Bạn đã xóa tổ chức.',
          title: 'Xóa tổ chức',
        },
        leaveOrganization: {
          actionDescription: 'Nhập "{{organizationName}}" dưới để tiếp tục.',
          messageLine1:
            'Bạn có chắc chắn muốn rời khỏi tổ chức này? Bạn sẽ mất quyền truy cập vào tổ chức này và ứng dụng của nó.',
          messageLine2: 'Hành động này là vĩnh viễn và không thể hoàn tác.',
          successMessage: 'Bạn đã rời khỏi tổ chức.',
          title: 'Rời khỏi tổ chức',
        },
        title: 'Nguy hiểm',
      },
      domainSection: {
        menuAction__manage: 'Quản lý',
        menuAction__remove: 'Xóa',
        menuAction__verify: 'Xác minh',
        primaryButton: 'Thêm tên miền',
        subtitle:
          'Cho phép người dùng tham gia tổ chức tự động hoặc yêu cầu tham gia dựa trên tên miền email đã xác minh.',
        title: 'Tên miền đã xác minh',
      },
      successMessage: 'Tổ chức đã được cập nhật.',
      title: 'Cập nhật hồ sơ',
    },
    removeDomainPage: {
      messageLine1: 'Tên miền email {{domain}} sẽ bị xóa.',
      messageLine2: 'Người dùng sẽ không thể tham gia tổ chức tự động sau đây.',
      successMessage: '{{domain}} đã bị xóa.',
      title: 'Xóa tên miền',
    },
    securityPage: {
      connectionPage: {
        actions: {
          activate: 'Kích hoạt',
          continueSetup: 'Tiếp tục thiết lập',
        },
        dangerZone: {
          deactivateButton: 'Hủy kích hoạt kết nối',
          removeButton: 'Xóa kết nối',
          title: 'Vùng nguy hiểm',
        },
        domains: {
          title: 'Tên miền',
        },
        identityProvider: {
          certificateExpires: 'Chứng chỉ hết hạn',
          certificates: 'Chứng chỉ',
          certificatesCount: '{{count}} chứng chỉ',
          certificatesSummary: '{{count}} chứng chỉ, hết hạn sớm nhất vào {{date}}',
          certificatesSummaryExpired: '{{count}} chứng chỉ, một chứng chỉ đã hết hạn vào {{date}}',
          clientSecret: {
            placeholder: 'Để trống để giữ bí mật hiện tại',
          },
          editButton: 'Chỉnh sửa',
          form: {
            title: 'Chỉnh sửa nhà cung cấp danh tính',
          },
          title: 'Nhà cung cấp danh tính',
        },
        name: {
          editButton: 'Chỉnh sửa',
          form: {
            title: 'Đổi tên kết nối',
          },
          title: 'Tên',
        },
        serviceProvider: {
          acsUrl: 'Assertion consumer service (ACS) URL',
          entityId: 'Entity ID',
          metadataUrl: 'Metadata URL',
          redirectUri: 'Redirect URI',
          title: 'Nhà cung cấp dịch vụ',
        },
        settings: {
          allowAdditionalIdentifiers: {
            description: 'Thành viên có thể giữ các phương thức đăng nhập khác.',
            label: 'Cho phép định danh bổ sung',
          },
          allowIdpInitiated: {
            description: 'Đăng nhập có thể bắt đầu từ nhà cung cấp danh tính.',
            label: 'Cho phép luồng khởi tạo từ IdP',
          },
          allowSubdomains: {
            description: 'Đồng thời khớp các tên miền phụ của các tên miền trong kết nối.',
            label: 'Cho phép tên miền phụ',
          },
          forceAuthn: {
            description: 'Yêu cầu xác thực lại tại nhà cung cấp danh tính mỗi lần đăng nhập.',
            label: 'Bắt buộc xác thực lại',
          },
          syncUserAttributes: {
            description: 'Làm mới tên và email từ nhà cung cấp danh tính mỗi lần đăng nhập.',
            label: 'Đồng bộ thuộc tính người dùng',
          },
          title: 'Cài đặt',
        },
      },
      directorySyncSection: {
        badge__active: 'Đang hoạt động',
        badge__inactive: 'Không hoạt động',
        badge__ssoRequired: 'Yêu cầu SSO',
        description: 'Giữ đồng bộ thành viên tổ chức với nhà cung cấp danh tính của bạn. Yêu cầu kết nối SSO.',
        error__load: 'Không thể tải Đồng bộ thư mục',
        menuAction__activate: 'Kích hoạt',
        menuAction__deactivate: 'Hủy kích hoạt',
        menuAction__edit: 'Chỉnh sửa',
        menuAction__remove: 'Xóa',
        primaryButton__configure: 'Cấu hình',
        removeDialog: {
          confirmButton: 'Xóa Đồng bộ thư mục',
          subtitle:
            'Bạn có chắc chắn muốn xóa Đồng bộ thư mục không? Hành động này không thể hoàn tác: thư mục và bearer token của nó sẽ bị xóa và nhà cung cấp danh tính của bạn sẽ không còn khả năng cấp phát thành viên. Các thành viên hiện tại vẫn giữ tư cách thành viên.',
          title: 'Xóa Đồng bộ thư mục',
        },
        title: 'Đồng bộ thư mục',
      },
      removeDialog: {
        confirmButton: 'Xóa kết nối',
        subtitle:
          'Bạn có chắc chắn muốn xóa kết nối "{{name}}"? Hành động này không thể hoàn tác và sẽ xóa kết nối cùng toàn bộ cấu hình của nó.',
        title: 'Xóa kết nối SSO',
      },
      ssoBypassPage: {
        action__add: 'Thêm',
        action__search: 'Tìm kiếm người dùng',
        addForm: {
          emailPlaceholder: 'Nhập địa chỉ email của thành viên',
          error__allAlreadyAdded: 'Mọi người có vai trò đó đã có trong danh sách cho phép.',
          error__alreadyAdded: 'Thành viên này đã có trong danh sách cho phép.',
          error__memberNotFound: 'Không có thành viên nào của tổ chức này có địa chỉ email đó.',
          modeLabel: 'Thêm theo',
          mode__email: 'Email',
          mode__role: 'Vai trò',
          roleOption: '{{role}} ({{count}})',
          roleWarning: 'Danh sách này không đồng bộ, thành viên được quản lý thủ công.',
          submitButton: 'Thêm thành viên',
          subtitle: 'Các thành viên trong danh sách này có thể đăng nhập bằng mã email khi SSO không khả dụng.',
          title: 'Thêm thành viên',
        },
        bulkResult: {
          added: 'Đã thêm {{count}} thành viên',
          addedMember: 'Đã thêm thành viên thành công',
          added__one: 'Đã thêm 1 thành viên',
          domainNotServed:
            '{{count}} thành viên không thể thêm vì địa chỉ email của họ không thuộc phạm vi của kết nối.',
          domainNotServed__one: '1 thành viên không thể thêm vì địa chỉ email không thuộc phạm vi của kết nối.',
          notMember: '{{count}} thành viên không thể thêm vì họ không còn trong tổ chức.',
          notMember__one: '1 thành viên không thể thêm vì họ không còn trong tổ chức.',
          unknown: '{{count}} thành viên không thể thêm.',
          unknown__one: '1 thành viên không thể thêm.',
        },
        table: {
          emptyState: 'Không có thành viên nào trong danh sách cho phép',
          emptyState__search: 'Không có thành viên nào khớp với tìm kiếm của bạn',
          header__actions: 'Hành động',
          header__user: 'Người dùng',
          menuAction__remove: 'Xóa',
        },
        title: 'Bỏ qua SSO',
      },
      ssoBypassSection: {
        allowlistCount: '{{count}} thành viên',
        allowlistCount__one: '1 thành viên',
        allowlistLabel: 'Danh sách cho phép:',
        description: 'Các thành viên trong danh sách này có thể đăng nhập bằng mã email khi SSO không khả dụng.',
        error__load: 'Không thể tải danh sách cho phép SSO',
        menuAction__manage: 'Quản lý',
        title: 'Bỏ qua SSO',
      },
      ssoSection: {
        badge__active: 'Đang hoạt động',
        badge__inProgress: 'Đang tiến hành',
        badge__inactive: 'Không hoạt động',
        badge__unconfigured: 'Chưa cấu hình',
        descriptionLine1: 'Yêu cầu thành viên có tên miền email khớp đăng nhập qua nhà cung cấp danh tính của bạn.',
        domainLabel: 'Tên miền:',
        menuAction__activate: 'Kích hoạt',
        menuAction__continue: 'Tiếp tục cấu hình',
        menuAction__deactivate: 'Hủy kích hoạt',
        menuAction__edit: 'Chỉnh sửa',
        menuAction__remove: 'Xóa',
        primaryButton__addConnection: 'Thêm kết nối',
        primaryButton__configure: 'Cấu hình',
        primaryButton__continueConfiguration: 'Tiếp tục cấu hình',
        primaryButton__startConfiguration: 'Bắt đầu cấu hình',
        title: 'SSO',
        tooltip:
          'Thành viên không có tên miền khớp vẫn có thể đăng nhập bằng các phương thức xác thực hiện có. Thành viên mới sẽ được gán vào {{role}} trong tổ chức này.',
        tooltipLabel: 'Thêm thông tin',
        tooltip__noRole:
          'Thành viên không có tên miền khớp vẫn có thể đăng nhập bằng các phương thức xác thực hiện có.',
      },
      title: 'Bảo mật',
    },
    start: {
      headerTitle__general: 'Tổng quan',
      headerTitle__members: 'Thành viên',
      membershipSeatUsageLabel: 'Đã dùng {{count}} trên {{limit}} người dùng',
      profileSection: {
        primaryButton: 'Cập nhật hồ sơ',
        title: 'Hồ sơ tổ chức',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Xóa tên miền này sẽ ảnh hưởng đến người dùng đã mời.',
        removeDomainActionLabel__remove: 'Xóa tên miền',
        removeDomainSubtitle: 'Xóa tên miền này khỏi tên miền đã xác minh',
        removeDomainTitle: 'Xóa tên miền',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Người dùng sẽ tự động được mời tham gia tổ chức khi đăng ký và có thể tham gia bất cứ lúc nào.',
        automaticInvitationOption__label: 'Tự động mời',
        automaticSuggestionOption__description:
          'Người dùng sẽ nhận được gợi ý để yêu cầu tham gia, nhưng phải được phê duyệt bởi quản trị viên trước khi họ có thể tham gia tổ chức.',
        automaticSuggestionOption__label: 'Tự động gợi ý',
        calloutInfoLabel: 'Thay đổi chế độ đăng ký sẽ chỉ ảnh hưởng đến người dùng mới.',
        calloutInvitationCountLabel: 'Mời đang chờ gửi đến người dùng: {{count}}',
        calloutSuggestionCountLabel: 'Gợi ý đang chờ gửi đến người dùng: {{count}}',
        manualInvitationOption__description: 'Người dùng chỉ có thể được mời thủ công đến tổ chức.',
        manualInvitationOption__label: 'Không tự động đăng ký',
        subtitle: 'Chọn cách người dùng từ tên miền này có thể tham gia tổ chức.',
      },
      start: {
        headerTitle__danger: 'Nguy hiểm',
        headerTitle__enrollment: 'Chế độ đăng ký',
      },
      subtitle: 'Tên miền {{domain}} đã được xác minh. Tiếp tục bằng cách chọn chế độ đăng ký.',
      title: 'Cập nhật {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Nhập mã xác minh đã gửi đến địa chỉ email của bạn',
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Tên miền {{domainName}} cần được xác minh qua email.',
      subtitleVerificationCodeScreen: 'Một mã xác minh đã được gửi đến {{emailAddress}}. Nhập mã để tiếp tục.',
      title: 'Xác minh tên miền',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'Đóng menu chuyển đổi tổ chức',
    action__createOrganization: 'Tạo tổ chức',
    action__invitationAccept: 'Tham gia',
    action__manageOrganization: 'Quản lý',
    action__openOrganizationSwitcher: 'Mở menu chuyển đổi tổ chức',
    action__suggestionsAccept: 'Yêu cầu tham gia',
    notSelected: 'Không có tổ chức được chọn',
    personalWorkspace: 'Tài khoản cá nhân',
    suggestionsAcceptedLabel: 'Đang chờ phê duyệt',
  },
  paginationButton__next: 'Tiếp',
  paginationButton__previous: 'Trước',
  paginationRowText__displaying: 'Hiển thị',
  paginationRowText__of: 'của',
  reverification: {
    alternativeMethods: {
      actionLink: 'Liên hệ hỗ trợ',
      actionText: 'Không có bất kỳ phương thức nào?',
      blockButton__backupCode: 'Sử dụng mã dự phòng',
      blockButton__emailCode: 'Email mã đến {{identifier}}',
      blockButton__passkey: 'Đăng nhập với mã passkey',
      blockButton__password: 'Tiếp tục với mật khẩu của bạn',
      blockButton__phoneCode: 'Gửi mã SMS đến {{identifier}}',
      blockButton__totp: 'Sử dụng ứng dụng xác thực',
      getHelp: {
        blockButton__emailSupport: 'Email hỗ trợ',
        content:
          'Nếu bạn gặp vấn đề khi xác minh tài khoản của mình, email chúng tôi và chúng tôi sẽ hỗ trợ bạn khôi phục quyền truy cập sớm nhất có thể.',
        title: 'Liên hệ hỗ trợ',
      },
      subtitle: 'Gặp vấn đề? Bạn có thể sử dụng bất kỳ phương thức nào để xác minh.',
      title: 'Sử dụng phương thức khác',
    },
    backupCodeMfa: {
      subtitle: 'Nhập mã dự phòng bạn nhận được khi thiết lập xác thực hai bước',
      title: 'Nhập mã dự phòng',
    },
    emailCode: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Nhập mã đã gửi đến email của bạn để tiếp tục',
      title: 'Xác minh yêu cầu',
    },
    noAvailableMethods: {
      message: 'Không thể tiếp tục với xác minh. Không có yếu tố xác thực phù hợp được cấu hình',
      subtitle: 'Đã xảy ra lỗi',
      title: 'Không thể xác minh tài khoản của bạn',
    },
    passkey: {
      blockButton__passkey: 'Sử dụng mã passkey',
      subtitle:
        'Sử dụng mã passkey xác minh danh tính của bạn. Thiết bị của bạn có thể yêu cầu vân tay, khuôn mặt hoặc khóa màn hình.',
      title: 'Sử dụng mã passkey',
    },
    password: {
      actionLink: 'Sử dụng phương thức khác',
      subtitle: 'Nhập mật khẩu hiện tại để tiếp tục',
      title: 'Xác minh yêu cầu',
    },
    phoneCode: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Nhập mã đã gửi đến điện thoại của bạn để tiếp tục',
      title: 'Xác minh yêu cầu',
    },
    phoneCodeMfa: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Nhập mã đã gửi đến điện thoại của bạn để tiếp tục',
      title: 'Xác minh yêu cầu',
    },
    totpMfa: {
      formTitle: 'Mã xác minh',
      subtitle: 'Nhập mã đã được tạo bởi ứng dụng xác thực của bạn để tiếp tục',
      title: 'Xác minh yêu cầu',
    },
  },
  searchInput: {
    action__clear: 'Xóa tìm kiếm',
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Thêm tài khoản',
      action__signOutAll: 'Đăng xuất khỏi tất cả tài khoản',
      subtitle: 'Chọn tài khoản với đó bạn muốn tiếp tục.',
      title: 'Chọn tài khoản',
    },
    alternativeMethods: {
      actionLink: 'Liên hệ hỗ trợ',
      actionText: 'Không có bất kỳ phương thức nào?',
      blockButton__backupCode: 'Sử dụng mã dự phòng',
      blockButton__emailCode: 'Email mã đến {{identifier}}',
      blockButton__emailLink: 'Email liên kết đến {{identifier}}',
      blockButton__passkey: 'Đăng nhập với mã passkey',
      blockButton__password: 'Đăng nhập với mật khẩu',
      blockButton__phoneCode: 'Gửi mã SMS đến {{identifier}}',
      blockButton__totp: 'Sử dụng ứng dụng xác thực',
      getHelp: {
        blockButton__emailSupport: 'Email hỗ trợ',
        content:
          'Nếu bạn gặp vấn đề khi đăng nhập vào tài khoản của mình, email chúng tôi và chúng tôi sẽ hỗ trợ bạn khôi phục quyền truy cập sớm nhất có thể.',
        title: 'Liên hệ hỗ trợ',
      },
      subtitle: 'Gặp vấn đề? Bạn có thể sử dụng bất kỳ phương thức nào để đăng nhập.',
      title: 'Sử dụng phương thức khác',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra {{provider}}',
    },
    backupCodeMfa: {
      subtitle: 'Mã dự phòng của bạn là mã bạn nhận được khi thiết lập xác thực hai bước.',
      title: 'Nhập mã dự phòng',
    },
    emailCode: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra email',
    },
    emailCodeMfa: {
      formTitle: 'Kiểm tra email',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra email',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Để tiếp tục, mở liên kết xác minh trên thiết bị và trình duyệt từ đó bạn đã khởi động đăng nhập',
        title: 'Liên kết xác minh không hợp lệ cho thiết bị này',
      },
      expired: {
        subtitle: 'Quay lại tab gốc để tiếp tục.',
        title: 'Liên kết xác minh đã hết hạn',
      },
      failed: {
        subtitle: 'Quay lại tab gốc để tiếp tục.',
        title: 'Liên kết xác minh không hợp lệ',
      },
      formSubtitle: 'Sử dụng liên kết xác minh đã gửi đến email của bạn',
      formTitle: 'Liên kết xác minh',
      loading: {
        subtitle: 'Bạn sẽ được chuyển hướng sớm',
        title: 'Đang đăng nhập...',
      },
      resendButton: 'Không nhận được liên kết? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra email',
      unusedTab: {
        title: 'Bạn có thể đóng tab này',
      },
      verified: {
        subtitle: 'Bạn sẽ được chuyển hướng sớm',
        title: 'Đăng nhập thành công',
      },
      verifiedSwitchTab: {
        subtitle: 'Quay lại tab gốc để tiếp tục',
        subtitleNewTab: 'Quay lại tab mới được mở để tiếp tục',
        titleNewTab: 'Đăng nhập trên tab khác',
      },
      verifiedTransferable: {
        subtitle: 'Quay lại tab gốc để tiếp tục',
        title: 'Email đã được xác minh',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'Sử dụng liên kết xác minh được gửi đến email của bạn',
      resendButton: 'Không nhận được liên kết? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra email của bạn',
    },
    enterpriseConnections: {
      subtitle: 'Chọn tài khoản doanh nghiệp bạn muốn dùng để tiếp tục.',
      title: 'Chọn tài khoản doanh nghiệp của bạn',
    },
    enterpriseSSO: {
      formButtonPrimary: 'Tiếp tục với SSO',
    },
    forgotPassword: {
      formTitle: 'Mã xác minh mật khẩu',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để đặt lại mật khẩu của bạn',
      subtitle_email: 'Đầu tiên, nhập mã đã gửi đến email của bạn',
      subtitle_phone: 'Đầu tiên, nhập mã đã gửi đến điện thoại của bạn',
      title: 'Đặt lại mật khẩu',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Đặt lại mật khẩu',
      label__alternativeMethods: 'Hoặc, đăng nhập với phương thức khác',
      title: 'Quên mật khẩu?',
    },
    newDeviceVerificationNotice:
      'Bạn đang đăng nhập từ thiết bị mới. Chúng tôi yêu cầu xác minh để giữ tài khoản của bạn an toàn.',
    noAvailableMethods: {
      message: 'Không thể tiếp tục đăng nhập. Không có yếu tố xác thực phù hợp được cấu hình',
      subtitle: 'Đã xảy ra lỗi',
      title: 'Không thể đăng nhập',
    },
    passkey: {
      subtitle:
        'Sử dụng mã passkey xác minh danh tính của bạn. Thiết bị của bạn có thể yêu cầu vân tay, khuôn mặt hoặc khóa màn hình.',
      title: 'Sử dụng mã passkey',
    },
    password: {
      actionLink: 'Sử dụng phương thức khác',
      subtitle: 'Nhập mật khẩu được liên kết với tài khoản của bạn',
      title: 'Nhập mật khẩu',
    },
    passwordCompromised: {
      title: 'Mật khẩu đã bị xâm phạm',
    },
    passwordPwned: {
      title: 'Mật khẩu bị rò rỉ',
    },
    passwordUntrusted: {
      title: 'Mật khẩu không đáng tin cậy',
    },
    phoneCode: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra điện thoại',
    },
    phoneCodeMfa: {
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Kiểm tra điện thoại',
    },
    protectCheck: {
      loading: 'Đang tải…',
      retryButton: 'Thử lại',
      subtitle: 'Vui lòng chờ trong khi chúng tôi xác minh yêu cầu của bạn.',
      title: 'Đang xác minh yêu cầu của bạn',
    },
    resetPassword: {
      formButtonPrimary: 'Đặt lại mật khẩu',
      requiredMessage: 'Vì lý do bảo mật, việc đặt lại mật khẩu là bắt buộc.',
      successMessage: 'Mật khẩu của bạn đã được thay đổi thành công. Đang đăng nhập, vui lòng chờ một lát.',
      title: 'Đặt mật khẩu mới',
    },
    resetPasswordMfa: {
      detailsLabel: 'Chúng tôi cần xác minh danh tính của bạn trước khi đặt lại mật khẩu.',
    },
    ssoBypass: {
      actionLink: 'Không thể dùng SSO?',
      code: {
        resendButton: 'Không nhận được mã? Gửi lại',
        subtitle: 'để tiếp tục đến {{applicationName}}',
        title: 'Kiểm tra email',
      },
      notice: 'Tổ chức của bạn yêu cầu đăng nhập một lần. Việc tiếp tục mà không sử dụng sẽ được ghi lại.',
    },
    start: {
      actionLink: 'Đăng ký',
      actionLink__join_waitlist: 'Tham gia danh sách chờ',
      actionLink__use_email: 'Sử dụng email',
      actionLink__use_email_username: 'Sử dụng email hoặc tên người dùng',
      actionLink__use_passkey: 'Sử dụng mã passkey thay vì',
      actionLink__use_phone: 'Sử dụng điện thoại',
      actionLink__use_username: 'Sử dụng tên người dùng',
      actionText: 'Không có tài khoản?',
      actionText__join_waitlist: 'Muốn trải nghiệm sớm?',
      alternativePhoneCodeProvider: {
        actionLink: 'Sử dụng phương thức khác',
        label: '{{provider}} số điện thoại',
        subtitle: 'Nhập số điện thoại của bạn để nhận mã xác minh trên {{provider}}.',
        title: 'Đăng nhập vào {{applicationName}} với {{provider}}',
      },
      subtitle: 'Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục',
      subtitleCombined: undefined,
      title: 'Đăng nhập vào {{applicationName}}',
      titleCombined: 'Tiếp tục đến {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Mã xác minh',
      subtitle: 'Để tiếp tục, vui lòng nhập mã xác minh được tạo bởi ứng dụng xác thực của bạn',
      title: 'Xác thực hai bước',
    },
    web3Solana: {
      subtitle: 'Chọn ví bên dưới để đăng nhập',
      title: 'Đăng nhập với Solana',
    },
  },
  signInEnterPasswordTitle: 'Nhập mật khẩu',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Nhập mã xác minh đã gửi đến {{provider}}',
      title: 'Xác minh {{provider}}',
    },
    continue: {
      actionLink: 'Đăng nhập',
      actionText: 'Đã có tài khoản?',
      subtitle: 'Vui lòng điền các chi tiết còn lại để tiếp tục.',
      title: 'Điền các trường còn thiếu',
    },
    emailCode: {
      formSubtitle: 'Nhập mã xác minh đã gửi đến email của bạn',
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Nhập mã xác minh đã gửi đến email của bạn',
      title: 'Xác minh email',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Để tiếp tục, mở liên kết xác minh trên thiết bị và trình duyệt từ đó bạn đã khởi động đăng ký',
        title: 'Liên kết xác minh không hợp lệ cho thiết bị này',
      },
      formSubtitle: 'Sử dụng liên kết xác minh đã gửi đến email của bạn',
      formTitle: 'Liên kết xác minh',
      loading: {
        title: 'Đang đăng ký...',
      },
      resendButton: 'Không nhận được liên kết? Gửi lại',
      subtitle: 'để tiếp tục đến {{applicationName}}',
      title: 'Xác minh email',
      verified: {
        title: 'Đăng ký thành công',
      },
      verifiedSwitchTab: {
        subtitle: 'Quay lại tab mới được mở để tiếp tục',
        subtitleNewTab: 'Quay lại tab trước để tiếp tục',
        title: 'Xác minh email thành công',
      },
    },
    enterpriseConnections: {
      subtitle: 'Chọn tài khoản doanh nghiệp bạn muốn dùng để tiếp tục.',
      title: 'Chọn tài khoản doanh nghiệp của bạn',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Tôi đồng ý với {{ privacyPolicyLink || link("Chính sách bảo mật") }}',
        label__onlyTermsOfService: 'Tôi đồng ý với {{ termsOfServiceLink || link("Điều khoản dịch vụ") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Tôi đồng ý với {{ termsOfServiceLink || link("Điều khoản dịch vụ") }} và {{ privacyPolicyLink || link("Chính sách bảo mật") }}',
      },
      continue: {
        subtitle: 'Vui lòng đọc và đồng ý với các điều khoản để tiếp tục',
        title: 'Đồng ý với điều khoản',
      },
    },
    phoneCode: {
      formSubtitle: 'Nhập mã xác minh đã gửi đến số điện thoại của bạn',
      formTitle: 'Mã xác minh',
      resendButton: 'Không nhận được mã? Gửi lại',
      subtitle: 'Nhập mã xác minh đã gửi đến số điện thoại của bạn',
      title: 'Xác minh điện thoại',
    },
    protectCheck: {
      loading: 'Đang tải…',
      retryButton: 'Thử lại',
      subtitle: 'Vui lòng chờ trong khi chúng tôi xác minh yêu cầu của bạn.',
      title: 'Đang xác minh yêu cầu của bạn',
    },
    restrictedAccess: {
      actionLink: 'Đăng nhập',
      actionText: 'Đã có tài khoản?',
      blockButton__emailSupport: 'Email hỗ trợ',
      blockButton__joinWaitlist: 'Tham gia danh sách chờ',
      subtitle: 'Đăng ký hiện không khả dụng. Nếu bạn tin rằng bạn có quyền truy cập, vui lòng liên hệ hỗ trợ.',
      subtitleWaitlist:
        'Đăng ký hiện không khả dụng. Để biết thông tin sớm nhất khi chúng tôi khởi chạy, hãy tham gia danh sách chờ.',
      title: 'Quyền truy cập bị giới hạn',
    },
    start: {
      actionLink: 'Đăng nhập',
      actionLink__use_email: 'Sử dụng email thay vì',
      actionLink__use_phone: 'Sử dụng điện thoại thay vì',
      actionText: 'Đã có tài khoản?',
      alternativePhoneCodeProvider: {
        actionLink: 'Sử dụng phương thức khác',
        label: '{{provider}} số điện thoại',
        subtitle: 'Nhập số điện thoại của bạn để nhận mã xác minh trên {{provider}}.',
        title: 'Đăng ký vào {{applicationName}} với {{provider}}',
      },
      subtitle: 'Chào mừng! Vui lòng điền các chi tiết để bắt đầu.',
      subtitleCombined: 'Chào mừng! Vui lòng điền các chi tiết để bắt đầu.',
      title: 'Tạo tài khoản của bạn',
      titleCombined: 'Tạo tài khoản của bạn',
    },
    web3Solana: {
      subtitle: 'Chọn ví bên dưới để đăng ký',
      title: 'Đăng ký với Solana',
    },
  },
  socialButtonsBlockButton: 'Tiếp tục với {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'Một tổ chức đã tồn tại cho tên công ty được phát hiện ({{organizationName}}) và {{organizationDomain}}. Tham gia bằng lời mời.',
    },
    chooseOrganization: {
      action__createOrganization: 'Tạo tổ chức mới',
      action__invitationAccept: 'Tham gia',
      action__suggestionsAccept: 'Yêu cầu tham gia',
      subtitle: 'Tham gia một tổ chức hiện có hoặc tạo mới',
      subtitle__createOrganizationDisabled: 'Tham gia một tổ chức hiện có',
      suggestionsAcceptedLabel: 'Đang chờ phê duyệt',
      title: 'Chọn tổ chức',
    },
    createOrganization: {
      formButtonReset: 'Hủy',
      formButtonSubmit: 'Tiếp tục',
      formFieldInputPlaceholder__name: 'Tổ chức của tôi',
      formFieldInputPlaceholder__slug: 'to-chuc-cua-toi',
      formFieldLabel__name: 'Tên',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Nhập thông tin chi tiết tổ chức của bạn để tiếp tục',
      title: 'Thiết lập tổ chức của bạn',
    },
    organizationCreationDisabled: {
      subtitle: 'Liên hệ với quản trị viên tổ chức của bạn để nhận lời mời.',
      title: 'Bạn phải thuộc về một tổ chức',
    },
    signOut: {
      actionLink: 'Đăng xuất',
      actionText: 'Đã đăng nhập với {{identifier}}',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'Đặt lại mật khẩu',
    signOut: {
      actionLink: 'Đăng xuất',
      actionText: 'Đã đăng nhập với tư cách {{identifier}}',
    },
    subtitle: 'Tài khoản của bạn yêu cầu mật khẩu mới trước khi bạn có thể tiếp tục',
    title: 'Đặt lại mật khẩu của bạn',
  },
  taskSetupMfa: {
    badge: 'Thiết lập xác minh hai bước',
    signOut: {
      actionLink: 'Đăng xuất',
      actionText: 'Đã đăng nhập với tư cách {{identifier}}',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'Tiếp tục',
        infoText:
          'Một tin nhắn văn bản chứa mã xác minh sẽ được gửi đến số điện thoại này. Có thể áp dụng cước phí tin nhắn và dữ liệu.',
      },
      addPhoneNumber: 'Thêm số điện thoại',
      cancel: 'Hủy',
      subtitle: 'Chọn số điện thoại bạn muốn sử dụng để xác minh hai bước bằng mã SMS',
      success: {
        finishButton: 'Tiếp tục',
        message1:
          'Xác minh hai bước hiện đã được bật. Khi đăng nhập, bạn sẽ cần nhập mã xác minh được gửi đến số điện thoại này như một bước bổ sung.',
        message2:
          'Lưu các mã dự phòng này và cất giữ ở nơi an toàn. Nếu bạn mất quyền truy cập vào thiết bị xác thực, bạn có thể sử dụng mã dự phòng để đăng nhập.',
        title: 'Đã bật xác minh bằng mã SMS',
      },
      title: 'Thêm xác minh bằng mã SMS',
      verifyPhone: {
        formButtonPrimary: 'Tiếp tục',
        formTitle: 'Mã xác minh',
        resendButton: 'Không nhận được mã? Gửi lại',
        subtitle: 'Nhập mã xác minh được gửi đến',
        title: 'Xác minh số điện thoại của bạn',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'Mã SMS',
        totp: 'Ứng dụng xác thực',
      },
      subtitle: 'Chọn phương thức bạn muốn sử dụng để bảo vệ tài khoản của mình bằng một lớp bảo mật bổ sung',
      title: 'Thiết lập xác minh hai bước',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Thay vào đó, quét mã QR',
        buttonUnableToScan__nonPrimary: 'Không thể quét mã QR?',
        formButtonPrimary: 'Tiếp tục',
        formButtonReset: 'Hủy',
        infoText__ableToScan:
          'Thiết lập một phương thức đăng nhập mới trong ứng dụng xác thực của bạn và quét mã QR sau đây để liên kết nó với tài khoản của bạn.',
        infoText__unableToScan:
          'Thiết lập một phương thức đăng nhập mới trong ứng dụng xác thực của bạn và nhập Khóa được cung cấp bên dưới.',
        inputLabel__unableToScan1:
          'Đảm bảo rằng Mã dựa trên thời gian hoặc Mã một lần đã được bật, sau đó hoàn tất việc liên kết tài khoản của bạn.',
      },
      success: {
        finishButton: 'Tiếp tục',
        message1:
          'Xác minh hai bước hiện đã được bật. Khi đăng nhập, bạn sẽ cần nhập mã xác minh từ ứng dụng xác thực này như một bước bổ sung.',
        message2:
          'Lưu các mã dự phòng này và cất giữ ở nơi an toàn. Nếu bạn mất quyền truy cập vào thiết bị xác thực, bạn có thể sử dụng mã dự phòng để đăng nhập.',
        title: 'Đã bật xác minh bằng ứng dụng xác thực',
      },
      title: 'Thêm ứng dụng xác thực',
      verifyTotp: {
        formButtonPrimary: 'Tiếp tục',
        formButtonReset: 'Hủy',
        formTitle: 'Mã xác minh',
        subtitle: 'Nhập mã xác minh được tạo bởi ứng dụng xác thực của bạn',
        title: 'Thêm ứng dụng xác thực',
      },
    },
  },
  unstable__errors: {
    action_blocked:
      'Không thể hoàn tất hành động này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu sự cố vẫn tiếp diễn.',
    already_a_member_in_organization: '{{email}} đã là thành viên của tổ chức.',
    api_key_name_already_exists: 'Tên khóa API đã tồn tại.',
    api_key_usage_exceeded:
      'Bạn đã đạt đến giới hạn sử dụng. Bạn có thể gỡ bỏ giới hạn bằng cách nâng cấp lên gói trả phí.',
    avatar_file_size_exceeded: 'Kích thước tệp vượt quá giới hạn tối đa 10MB. Vui lòng chọn tệp nhỏ hơn.',
    avatar_file_type_invalid: 'Loại tệp không được hỗ trợ. Vui lòng tải lên hình ảnh JPG, PNG, GIF hoặc WEBP.',
    captcha_invalid: undefined,
    captcha_unavailable:
      'Đăng ký không thành công do lỗi bot. Vui lòng tải lại trang để thử lại hoặc liên hệ hỗ trợ để được hỗ trợ.',
    form_code_incorrect: undefined,
    form_email_address_blocked:
      'Các dịch vụ email tạm thời không được hỗ trợ. Vui lòng sử dụng địa chỉ email thông thường của bạn để tạo tài khoản.',
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_new_password_matches_current: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: undefined,
    form_param_format_invalid__phone_number: undefined,
    form_param_max_length_exceeded__first_name: undefined,
    form_param_max_length_exceeded__last_name: undefined,
    form_param_max_length_exceeded__name: undefined,
    form_param_nil: undefined,
    form_param_type_invalid: undefined,
    form_param_type_invalid__email_address: undefined,
    form_param_type_invalid__phone_number: undefined,
    form_param_value_invalid: undefined,
    form_password_compromised__sign_in: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: 'Mật khẩu của bạn quá ngắn. Nó phải có ít nhất 8 ký tự.',
    form_password_matches_identifier:
      'Mật khẩu không được trùng với địa chỉ email, số điện thoại hoặc tên người dùng của bạn. Để đảm bảo an toàn tài khoản, vui lòng sử dụng mật khẩu khác.',
    form_password_not_strong_enough: 'Mật khẩu của bạn không đủ mạnh.',
    form_password_or_identifier_incorrect:
      'Mật khẩu hoặc địa chỉ email không đúng. Vui lòng thử lại hoặc sử dụng phương thức khác.',
    form_password_pwned:
      'Mật khẩu này đã được tìm thấy trong một rò rỉ và không thể được sử dụng, vui lòng thử một mật khẩu khác.',
    form_password_pwned__sign_in:
      'Mật khẩu này đã được tìm thấy trong một rò rỉ và không thể được sử dụng, vui lòng đặt lại mật khẩu của bạn.',
    form_password_size_in_bytes_exceeded: undefined,
    form_password_untrusted__sign_in:
      'Mật khẩu của bạn có thể đã bị xâm phạm. Để bảo vệ tài khoản, vui lòng tiếp tục bằng một phương thức đăng nhập khác. Bạn sẽ được yêu cầu đặt lại mật khẩu sau khi đăng nhập.',
    form_password_validation_failed: undefined,
    form_username_invalid_character: undefined,
    form_username_invalid_length: 'Tên người dùng của bạn phải có giữa {{min_length}} và {{max_length}} ký tự.',
    form_username_needs_non_number_char: 'Tên người dùng của bạn phải chứa ít nhất một ký tự không phải là số.',
    identification_deletion_failed: undefined,
    insufficient_seats_change_plan:
      'Tổ chức của bạn không có đủ số người dùng để mời số lượng thành viên mong muốn. Vui lòng chuyển sang gói hỗ trợ số lượng thành viên bạn đang cố gắng mời.',
    insufficient_seats_contact_support:
      'Tổ chức của bạn không có đủ số người dùng để mời số lượng thành viên mong muốn. Vui lòng liên hệ hỗ trợ.',
    not_allowed_access: undefined,
    oauth_access_denied: 'Bạn đã không cấp quyền truy cập vào tài khoản của mình.',
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Bạn đã đạt đến giới hạn {{maxAllowed}} thành viên tổ chức, bao gồm cả các lời mời đang chờ xử lý.',
    organization_minimum_permissions_needed: undefined,
    organization_not_found_or_unauthorized:
      'Bạn không còn là thành viên của tổ chức này. Vui lòng chọn hoặc tạo một tổ chức khác.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Bạn không còn là thành viên của tổ chức này. Vui lòng chọn một tổ chức khác.',
    passkey_already_exists: 'Mã passkey đã được đăng ký với thiết bị này.',
    passkey_not_supported: 'Mã passkey không được hỗ trợ trên thiết bị này.',
    passkey_pa_not_supported: 'Đăng ký yêu cầu một bộ xác thực nền tảng nhưng thiết bị không hỗ trợ nó.',
    passkey_registration_cancelled: 'Đăng ký mã passkey đã bị hủy hoặc hết hạn.',
    passkey_retrieval_cancelled: 'Xác minh mã passkey đã bị hủy hoặc hết hạn.',
    passwordComplexity: {
      maximumLength: 'ít hơn {{length}} ký tự',
      minimumLength: '{{length}} hoặc nhiều hơn ký tự',
      requireLowercase: 'một chữ cái viết thường',
      requireNumbers: 'một số',
      requireSpecialCharacter: 'một ký tự đặc biệt',
      requireUppercase: 'một chữ cái viết hoa',
      sentencePrefix: 'Mật khẩu của bạn phải chứa',
    },
    phone_number_exists: undefined,
    protect_check_aborted: undefined,
    protect_check_already_resolved: undefined,
    protect_check_execution_failed: 'Quá trình xác minh chưa hoàn tất. Vui lòng thử lại.',
    protect_check_invalid_script: 'Không thể tải quá trình xác minh. Vui lòng liên hệ hỗ trợ nếu sự cố vẫn tiếp diễn.',
    protect_check_invalid_sdk_url: 'Quá trình xác minh không thể bắt đầu. Vui lòng liên hệ hỗ trợ.',
    protect_check_required:
      'Lần đăng nhập này cần thêm một bước xác minh không thể hiển thị tại đây. Vui lòng thử lại hoặc sử dụng phương thức đăng nhập khác.',
    protect_check_script_load_failed:
      'Không thể tải quá trình xác minh. Điều này có thể do sự cố mạng hoặc Chính sách bảo mật nội dung chặn tập lệnh xác minh. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
    protect_check_timed_out: 'Quá trình xác minh không hoàn tất kịp thời. Vui lòng thử lại.',
    protect_check_unsupported_environment:
      'Quá trình xác minh không được hỗ trợ trong môi trường này. Vui lòng tiếp tục trong trình duyệt tiêu chuẩn hoặc liên hệ hỗ trợ.',
    session_exists: undefined,
    sso_bypass_domain_not_served:
      'Không thể thêm thành viên này vì địa chỉ email của họ không thuộc phạm vi của kết nối nào.',
    ticket_expired_code: 'Liên kết này đã hết hạn. Vui lòng bắt đầu lại hoặc yêu cầu liên kết mới.',
    ticket_invalid_code:
      'Liên kết này không còn hợp lệ hoặc đã được sử dụng. Vui lòng bắt đầu lại hoặc yêu cầu liên kết mới.',
    too_many_unverified_identifications:
      'Có quá nhiều xác minh đang chờ xử lý trên tài khoản này. Hãy xóa địa chỉ email, số điện thoại hoặc ví chưa xác minh mà bạn không còn cần, hoặc chờ vài phút để quá trình thiết lập passkey chưa hoàn tất hết hạn, sau đó thử lại.',
    web3_missing_identifier: 'Không tìm thấy phần mở rộng Web3 Wallet. Vui lòng cài đặt một phần mở rộng để tiếp tục.',
    web3_signature_request_rejected: 'Bạn đã từ chối yêu cầu ký. Vui lòng thử lại để tiếp tục.',
    web3_solana_signature_generation_failed: 'Đã xảy ra lỗi khi tạo chữ ký. Vui lòng thử lại để tiếp tục.',
    zxcvbn: {
      couldBeStronger: 'Mật khẩu của bạn hoạt động, nhưng có thể mạnh hơn. Hãy thử thêm nhiều ký tự.',
      goodPassword: 'Mật khẩu của bạn đáp ứng tất cả các yêu cầu cần thiết.',
      notEnough: 'Mật khẩu của bạn không đủ mạnh.',
      suggestions: {
        allUppercase: 'Viết hoa một số chữ cái, nhưng không phải tất cả.',
        anotherWord: 'Thêm nhiều từ khác nhau hơn.',
        associatedYears: 'Tránh năm mà bạn liên quan đến.',
        capitalization: 'Viết hoa nhiều hơn chữ cái đầu tiên.',
        dates: 'Tránh ngày và năm mà bạn liên quan đến.',
        l33t: "Tránh các thay thế chữ cái dễ dự đoán như '@' thay vì 'a'.",
        longerKeyboardPattern: 'Sử dụng các khuôn mẫu bàn phím dài hơn và thay đổi hướng gõ nhiều lần.',
        noNeed: 'Bạn có thể tạo mật khẩu mạnh mà không sử dụng các ký tự đặc biệt, số hoặc chữ cái viết hoa.',
        pwned: 'Nếu bạn sử dụng mật khẩu này ở nơi khác, bạn nên thay đổi nó.',
        recentYears: 'Tránh năm gần đây.',
        repeated: 'Tránh các từ và ký tự lặp lại.',
        reverseWords: 'Tránh các từ viết ngược của các từ thông dụng.',
        sequences: 'Tránh các chuỗi ký tự thông dụng.',
        useWords: 'Sử dụng nhiều từ, nhưng tránh các cụm từ thông dụng.',
      },
      warnings: {
        common: 'Đây là một mật khẩu thường được sử dụng.',
        commonNames: 'Tên và họ thường được sử dụng.',
        dates: 'Ngày thường được sử dụng.',
        extendedRepeat: 'Các mẫu ký tự lặp lại như "abcabcabc" dễ dự đoán.',
        keyPattern: 'Các mẫu bàn phím ngắn dễ dự đoán.',
        namesByThemselves: 'Tên hoặc họ dễ dự đoán.',
        pwned: 'Mật khẩu của bạn đã bị rò rỉ qua một rò rỉ dữ liệu trên Internet.',
        recentYears: 'Năm gần đây dễ dự đoán.',
        sequences: 'Các chuỗi ký tự thông dụng như "abc" dễ dự đoán.',
        similarToCommon: 'Đây là tương tự như một mật khẩu thường được sử dụng.',
        simpleRepeat: 'Các ký tự lặp lại như "aaa" dễ dự đoán.',
        straightRow: 'Các hàng ký tự trên bàn phím của bạn dễ dự đoán.',
        topHundred: 'Đây là một mật khẩu thường được sử dụng.',
        topTen: 'Đây là một mật khẩu thường được sử dụng.',
        userInputs: 'Không nên có bất kỳ dữ liệu cá nhân hoặc liên quan đến trang nào.',
        wordByItself: 'Các từ đơn dễ dự đoán.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Thêm tài khoản',
    action__closeUserMenu: 'Đóng menu người dùng',
    action__manageAccount: 'Quản lý tài khoản',
    action__openUserMenu: 'Mở menu người dùng',
    action__signOut: 'Đăng xuất',
    action__signOutAll: 'Đăng xuất tất cả tài khoản',
    label__accountActions: 'Hành động tài khoản',
    label__activeSessions: 'Phiên hoạt động',
    label__userButtonPopover: 'Bảng điều khiển tài khoản',
  },
  userProfile: {
    apiKeysPage: {
      title: 'Khoá API',
    },
    backupCodePage: {
      actionLabel__copied: 'Đã sao chép!',
      actionLabel__copy: 'Sao chép tất cả',
      actionLabel__download: 'Tải xuống .txt',
      actionLabel__print: 'In',
      infoText1: 'Mã sao lưu sẽ được bật cho tài khoản này.',
      infoText2:
        'Giữ mã sao lưu bí mật và lưu trữ chúng một cách an toàn. Bạn có thể tạo lại mã sao lưu nếu bạn nghi ngờ chúng đã bị rò rỉ.',
      subtitle__codelist: 'Lưu trữ chúng một cách an toàn và giữ bí mật.',
      successMessage:
        'Mã sao lưu đã được bật. Bạn có thể sử dụng một trong số chúng để đăng nhập vào tài khoản của bạn, nếu bạn mất quyền truy cập vào thiết bị xác thực của bạn. Mỗi mã chỉ có thể được sử dụng một lần.',
      successSubtitle:
        'Bạn có thể sử dụng một trong số chúng để đăng nhập vào tài khoản của bạn, nếu bạn mất quyền truy cập vào thiết bị xác thực của bạn.',
      title: 'Thêm xác minh mã sao lưu',
      title__codelist: 'Mã sao lưu',
    },
    billingPage: {
      accountCreditsSection: {
        title: 'Tín dụng tài khoản',
        viewHistory: 'Xem lịch sử tín dụng',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Số tiền',
        tableHeader__date: 'Ngày',
        title: 'Lịch sử tín dụng tài khoản',
      },
      paymentHistorySection: {
        empty: 'Không có lịch sử thanh toán',
        notFound: 'Không tìm thấy lịch sử thanh toán',
        tableHeader__amount: 'Số tiền',
        tableHeader__date: 'Ngày',
        tableHeader__status: 'Trạng thái',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Làm mặc định',
        actionLabel__remove: 'Xóa',
        add: 'Thêm phương thức thanh toán mới',
        addSubtitle: 'Thêm một phương thức thanh toán mới vào tài khoản của bạn.',
        cancelButton: 'Hủy',
        formButtonPrimary__add: 'Thêm phương thức thanh toán',
        formButtonPrimary__pay: 'Thanh toán {{amount}}',
        payWithTestCardButton: 'Thanh toán với thẻ thử',
        removeMethod: {
          messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
          messageLine2:
            'Bạn sẽ không còn thể sử dụng nguồn thanh toán này và bất kỳ đăng ký lặp lại nào phụ thuộc vào nó sẽ không còn hoạt động.',
          successMessage: '{{paymentMethod}} đã bị xóa khỏi tài khoản của bạn.',
          title: 'Xóa phương thức thanh toán',
        },
        title: 'Phương thức thanh toán',
      },
      start: {
        headerTitle__payments: 'Thanh toán',
        headerTitle__plans: 'Gói',
        headerTitle__statements: 'Báo cáo',
        headerTitle__subscriptions: 'Đăng ký',
      },
      statementsSection: {
        empty: 'Không có báo cáo để hiển thị',
        itemCaption__paidForPlan: 'Thanh toán cho {{plan}} {{period}} gói',
        itemCaption__payerCredit: 'Tín dụng từ số dư tài khoản',
        itemCaption__proratedCredit: 'Tín dụng phân chia cho sử dụng một phần của đăng ký trước',
        itemCaption__subscribedAndPaidForPlan: 'Đăng ký và thanh toán cho {{plan}} {{period}} gói',
        notFound: 'Không tìm thấy báo cáo',
        tableHeader__amount: 'Số tiền',
        tableHeader__date: 'Ngày',
        title: 'Báo cáo',
        totalPaid: 'Tổng thanh toán',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Quản lý',
        actionLabel__newSubscription: 'Đăng ký gói',
        actionLabel__switchPlan: 'Chuyển gói',
        overview: 'Tổng quan',
        tableHeader__edit: 'Sửa',
        tableHeader__plan: 'Gói',
        tableHeader__startDate: 'Ngày bắt đầu',
        title: 'Đăng ký',
      },
      subscriptionsSection: {
        actionLabel__default: 'Quản lý',
      },
      switchPlansSection: {
        title: 'Chuyển gói',
      },
      title: 'Thanh toán',
    },
    connectedAccountPage: {
      formHint: 'Chọn nhà cung cấp để kết nối tài khoản của bạn.',
      formHint__noAccounts: 'Không có nhà cung cấp tài khoản bên ngoài.',
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2:
          'Bạn sẽ không còn thể sử dụng tài khoản kết nối này và bất kỳ tính năng phụ thuộc nào sẽ không còn hoạt động.',
        successMessage: '{{connectedAccount}} đã bị xóa khỏi tài khoản của bạn.',
        title: 'Xóa tài khoản kết nối',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Nhà cung cấp đã được thêm vào tài khoản của bạn',
      title: 'Thêm tài khoản kết nối',
    },
    deletePage: {
      actionDescription: 'Nhập "Xóa tài khoản" dưới đây để tiếp tục.',
      confirm: 'Xóa tài khoản',
      messageLine1:
        'Bạn có chắc chắn muốn xóa tài khoản của mình không? Một số dữ liệu liên quan có thể được giữ lại. Để yêu cầu xóa dữ liệu hoàn toàn, vui lòng liên hệ bộ phận hỗ trợ.',
      messageLine2: 'Hành động này là vĩnh viễn và không thể hoàn tác.',
      title: 'Xóa tài khoản',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Một email chứa mã xác thực sẽ được gửi đến địa chỉ email này.',
        formSubtitle: 'Nhập mã xác thực được gửi đến {{identifier}}',
        formTitle: 'Mã xác thực',
        resendButton: 'Không nhận được mã? Gửi lại',
        successMessage: 'Email {{identifier}} đã được thêm vào tài khoản của bạn.',
      },
      emailLink: {
        formHint: 'Một email chứa liên kết xác thực sẽ được gửi đến địa chỉ email này.',
        formSubtitle: 'Nhấp vào liên kết xác thực trong email được gửi đến {{identifier}}',
        formTitle: 'Liên kết xác thực',
        resendButton: 'Không nhận được liên kết? Gửi lại',
        successMessage: 'Email {{identifier}} đã được thêm vào tài khoản của bạn.',
      },
      enterpriseSSOLink: {
        formButton: 'Nhấp để đăng nhập',
        formSubtitle: 'Hoàn thành đăng nhập với {{identifier}}',
      },
      formHint: 'Bạn cần xác thực địa chỉ email này trước khi nó có thể được thêm vào tài khoản của bạn.',
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2: 'Bạn sẽ không còn thể đăng nhập bằng địa chỉ email này.',
        successMessage: '{{emailAddress}} đã bị xóa khỏi tài khoản của bạn.',
        title: 'Xóa địa chỉ email',
      },
      title: 'Thêm địa chỉ email',
      verifyTitle: 'Xác thực địa chỉ email',
    },
    formButtonPrimary__add: 'Thêm',
    formButtonPrimary__continue: 'Tiếp tục',
    formButtonPrimary__finish: 'Hoàn thành',
    formButtonPrimary__remove: 'Xóa',
    formButtonPrimary__save: 'Lưu',
    formButtonReset: 'Hủy',
    mfaPage: {
      formHint: 'Chọn phương thức để thêm.',
      title: 'Thêm xác thực hai bước',
    },
    mfaPhoneCodePage: {
      backButton: 'Sử dụng số điện thoại hiện có',
      primaryButton__addPhoneNumber: 'Thêm số điện thoại',
      removeResource: {
        messageLine1: '{{identifier}} sẽ không còn nhận được mã xác thực khi đăng nhập.',
        messageLine2: 'Tài khoản của bạn có thể không an toàn hơn. Bạn có chắc chắn muốn tiếp tục?',
        successMessage: 'Xác thực mã SMS hai bước đã bị xóa cho {{mfaPhoneCode}}',
        title: 'Xóa xác thực hai bước',
      },
      subtitle__availablePhoneNumbers:
        'Chọn số điện thoại hiện có để đăng ký xác thực mã SMS hai bước hoặc thêm số điện thoại mới.',
      subtitle__unavailablePhoneNumbers:
        'Không có số điện thoại nào để đăng ký xác thực mã SMS hai bước, vui lòng thêm số điện thoại mới.',
      successMessage1: 'Khi đăng nhập, bạn sẽ cần nhập mã xác thực được gửi đến số điện thoại này làm bước thêm.',
      successMessage2:
        'Lưu các mã sao lưu này và lưu trữ chúng ở một nơi an toàn. Nếu bạn mất quyền truy cập vào thiết bị xác thực của bạn, bạn có thể sử dụng mã sao lưu để đăng nhập.',
      successTitle: 'Xác thực mã SMS đã được bật',
      title: 'Thêm xác thực mã SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Quét mã QR thay vì',
        buttonUnableToScan__nonPrimary: 'Không thể quét mã QR?',
        infoText__ableToScan:
          'Thiết lập phương thức đăng nhập mới trong ứng dụng xác thực của bạn và quét mã QR sau để kết nối với tài khoản của bạn.',
        infoText__unableToScan:
          'Thiết lập phương thức đăng nhập mới trong ứng dụng xác thực của bạn và nhập khóa được cung cấp dưới đây.',
        inputLabel__unableToScan1:
          'Đảm bảo mã thời gian hoặc mã một lần đã được bật, sau đó hoàn thành việc kết nối tài khoản của bạn.',
        inputLabel__unableToScan2:
          'Ngoài ra, nếu ứng dụng xác thực của bạn hỗ trợ TOTP URIs, bạn cũng có thể sao chép URI đầy đủ.',
      },
      removeResource: {
        messageLine1: 'Mã xác thực từ ứng dụng xác thực này sẽ không còn được yêu cầu khi đăng nhập.',
        messageLine2: 'Tài khoản của bạn có thể không an toàn hơn. Bạn có chắc chắn muốn tiếp tục?',
        successMessage: 'Xác thực hai bước qua ứng dụng xác thực đã bị xóa.',
        title: 'Xóa xác thực hai bước',
      },
      successMessage:
        'Xác thực hai bước đã được bật. Khi đăng nhập, bạn sẽ cần nhập mã xác thực từ ứng dụng xác thực này làm bước thêm.',
      title: 'Thêm ứng dụng xác thực',
      verifySubtitle: 'Nhập mã xác thực được tạo bởi ứng dụng xác thực của bạn',
      verifyTitle: 'Mã xác thực',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Tài khoản',
      apiKeys: 'Khoá API',
      billing: 'Thanh toán',
      description: 'Quản lý thông tin tài khoản của bạn.',
      security: 'Bảo mật',
      title: 'Tài khoản',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} sẽ bị xóa khỏi tài khoản này.',
        title: 'Xóa passkey',
      },
      subtitle__rename: 'Bạn có thể thay đổi tên passkey để dễ dàng tìm kiếm.',
      title__rename: 'Đổi tên Passkey',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Được khuyến nghị đăng xuất khỏi tất cả các thiết bị khác có thể đã sử dụng mật khẩu cũ của bạn.',
      readonly:
        'Mật khẩu của bạn hiện không thể được chỉnh sửa vì bạn chỉ có thể đăng nhập thông qua kết nối doanh nghiệp.',
      successMessage__set: 'Mật khẩu của bạn đã được thiết lập.',
      successMessage__signOutOfOtherSessions: 'Tất cả các thiết bị khác đã được đăng xuất.',
      successMessage__update: 'Mật khẩu của bạn đã được cập nhật.',
      title__set: 'Thiết lập mật khẩu',
      title__update: 'Cập nhật mật khẩu',
    },
    phoneNumberPage: {
      infoText:
        'Một tin nhắn văn bản chứa mã xác thực sẽ được gửi đến số điện thoại này. Có thể áp dụng tỷ lệ phí tin nhắn và dữ liệu.',
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2: 'Bạn sẽ không còn thể đăng nhập bằng số điện thoại này.',
        successMessage: '{{phoneNumber}} đã bị xóa khỏi tài khoản của bạn.',
        title: 'Xóa số điện thoại',
      },
      successMessage: '{{identifier}} đã được thêm vào tài khoản của bạn.',
      title: 'Thêm số điện thoại',
      verifySubtitle: 'Nhập mã xác thực được gửi đến {{identifier}}',
      verifyTitle: 'Xác thực số điện thoại',
    },
    plansPage: {
      title: 'Gói',
    },
    profilePage: {
      fileDropAreaHint: 'Kích thước khuyến nghị 1:1, tối đa 10MB.',
      imageFormDestructiveActionSubtitle: 'Xóa',
      imageFormSubtitle: 'Tải lên',
      imageFormTitle: 'Ảnh hồ sơ',
      readonly: 'Thông tin hồ sơ của bạn đã được cung cấp thông qua kết nối doanh nghiệp và không thể được chỉnh sửa.',
      successMessage: 'Hồ sơ của bạn đã được cập nhật.',
      title: 'Cập nhật hồ sơ',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Đăng xuất khỏi thiết bị',
        title: 'Thiết bị hoạt động',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Kết nối lại',
        actionLabel__reauthorize: 'Xác thực ngay',
        destructiveActionTitle: 'Xóa',
        primaryButton: 'Kết nối tài khoản',
        subtitle__disconnected: 'Tài khoản này đã bị ngắt kết nối.',
        subtitle__reauthorize:
          'Các phạm vi được yêu cầu đã được cập nhật, và bạn có thể đang gặp phải chức năng giới hạn. Vui lòng xác thực lại ứng dụng này để tránh bất kỳ vấn đề nào',
        title: 'Tài khoản kết nối',
      },
      dangerSection: {
        deleteAccountButton: 'Xóa tài khoản',
        title: 'Xóa tài khoản',
      },
      emailAddressesSection: {
        destructiveAction: 'Xóa email',
        detailsAction__nonPrimary: 'Đặt làm chính',
        detailsAction__primary: 'Hoàn thành xác thực',
        detailsAction__unverified: 'Xác thực',
        primaryButton: 'Thêm địa chỉ email',
        title: 'Địa chỉ email',
      },
      enterpriseAccountsSection: {
        primaryButton: 'Kết nối tài khoản',
        title: 'Tài khoản doanh nghiệp',
      },
      headerTitle__account: 'Chi tiết hồ sơ',
      headerTitle__security: 'Bảo mật',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Tạo lại',
          headerTitle: 'Mã sao lưu',
          subtitle__regenerate:
            'Lấy một bộ mã sao lưu mới và an toàn. Các mã sao lưu trước đó sẽ bị xóa và không thể được sử dụng.',
          title__regenerate: 'Tạo lại mã sao lưu',
        },
        phoneCode: {
          actionLabel__setDefault: 'Đặt làm chính',
          destructiveActionLabel: 'Xóa',
        },
        primaryButton: 'Thêm xác thực hai bước',
        title: 'Xác thực hai bước',
        totp: {
          destructiveActionTitle: 'Xóa',
          headerTitle: 'Ứng dụng xác thực',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Xóa',
        menuAction__rename: 'Đổi tên',
        primaryButton: 'Thêm passkey',
        title: 'Passkeys',
      },
      passwordSection: {
        primaryButton__setPassword: 'Thiết lập mật khẩu',
        primaryButton__updatePassword: 'Cập nhật mật khẩu',
        title: 'Mật khẩu',
      },
      phoneNumbersSection: {
        destructiveAction: 'Xóa số điện thoại',
        detailsAction__nonPrimary: 'Đặt làm chính',
        detailsAction__primary: 'Hoàn thành xác thực',
        detailsAction__unverified: 'Xác thực số điện thoại',
        primaryButton: 'Thêm số điện thoại',
        title: 'Số điện thoại',
      },
      profileSection: {
        primaryButton: 'Cập nhật hồ sơ',
        title: 'Hồ sơ',
      },
      usernameSection: {
        primaryButton__setUsername: 'Thiết lập tên người dùng',
        primaryButton__updateUsername: 'Cập nhật tên người dùng',
        title: 'Tên người dùng',
      },
      web3WalletsSection: {
        destructiveAction: 'Xóa ví',
        detailsAction__nonPrimary: 'Đặt làm chính',
        primaryButton: 'Kết nối ví',
        title: 'Ví Web3',
        web3SelectSolanaWalletScreen: {
          subtitle: 'Chọn một ví Solana để kết nối với tài khoản của bạn.',
          title: 'Thêm ví Solana',
        },
      },
    },
    usernamePage: {
      successMessage: 'Tên người dùng của bạn đã được cập nhật.',
      title__set: 'Thiết lập tên người dùng',
      title__update: 'Cập nhật tên người dùng',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} sẽ bị xóa khỏi tài khoản này.',
        messageLine2: 'Bạn sẽ không còn thể đăng nhập bằng ví web3 này.',
        successMessage: '{{web3Wallet}} đã bị xóa khỏi tài khoản của bạn.',
        title: 'Xóa ví web3',
      },
      subtitle__availableWallets: 'Chọn một ví web3 để kết nối với tài khoản của bạn.',
      subtitle__unavailableWallets: 'Không có ví web3 nào có sẵn.',
      successMessage: 'Ví đã được thêm vào tài khoản của bạn.',
      title: 'Thêm ví web3',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Đăng nhập',
      actionText: 'Đã có quyền truy cập?',
      formButton: 'Tham gia danh sách chờ',
      subtitle: 'Nhập địa chỉ email của bạn và chúng tôi sẽ thông báo khi vị trí của bạn đã sẵn sàng',
      title: 'Tham gia danh sách chờ',
    },
    success: {
      message: 'Bạn sẽ được chuyển hướng sớm...',
      subtitle: 'Chúng tôi sẽ liên hệ khi vị trí của bạn đã sẵn sàng',
      title: 'Cảm ơn bạn đã tham gia danh sách chờ!',
    },
  },
  web3SolanaWalletButtons: {
    connect: 'Kết nối với {{walletName}}',
    continue: 'Tiếp tục với {{walletName}}',
    noneAvailable:
      'Không phát hiện ví Solana Web3 nào. Vui lòng cài đặt {{ solanaWalletsLink || link("wallet extension") }} hỗ trợ Web3.',
  },
} as const;
