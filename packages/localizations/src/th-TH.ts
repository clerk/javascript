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

export const thTH: LocalizationResource = {
  locale: 'th-TH',
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
  backButton: 'กลับ',
  badge__default: 'ค่าเริ่มต้น',
  badge__otherImpersonatorDevice: 'อุปกรณ์ปลอมตัวอื่น',
  badge__primary: 'หลัก',
  badge__requiresAction: 'ต้องการการดำเนินการ',
  badge__thisDevice: 'อุปกรณ์นี้',
  badge__unverified: 'ยังไม่ได้ตรวจสอบ',
  badge__userDevice: 'อุปกรณ์ผู้ใช้',
  badge__you: 'คุณ',
  createOrganization: {
    formButtonSubmit: 'สร้างองค์กร',
    invitePage: {
      formButtonReset: 'ข้าม',
    },
    title: 'สร้างองค์กร',
  },
  dates: {
    lastDay: "เมื่อวานนี้ เวลา {{ date | timeString('th-TH') }} น.",
    next6Days: "{{ date | weekday('th-TH','long') }} เวลา {{ date | timeString('th-TH') }} น.",
    nextDay: "พรุ่งนี้ เวลา {{ date | timeString('th-TH') }}",
    numeric: "{{ date | numeric('th-TH') }}",
    previous6Days: "{{ date | weekday('th-TH','long') }}ที่ผ่านมา เวลา {{ date | timeString('th-TH') }} น.",
    sameDay: "วันนี้ เวลา {{ date | timeString('th-TH') }} น.",
  },
  dividerText: 'หรือ',
  footerActionLink__useAnotherMethod: 'ใช้วิธีอื่น',
  footerPageLink__help: 'ช่วยเหลือ',
  footerPageLink__privacy: 'ความเป็นส่วนตัว',
  footerPageLink__terms: 'ข้อกำหนด',
  formButtonPrimary: 'ดำเนินการต่อ',
  formButtonPrimary__verify: 'ตรวจสอบ',
  formFieldAction__forgotPassword: 'ลืมรหัสผ่าน?',
  formFieldError__matchingPasswords: 'รหัสผ่านตรงกัน',
  formFieldError__notMatchingPasswords: 'รหัสผ่านไม่ตรงกัน',
  formFieldError__verificationLinkExpired: 'ลิงก์การตรวจสอบหมดอายุแล้ว กรุณาขอลิงก์ใหม่',
  formFieldHintText__optional: 'ไม่จำเป็น',
  formFieldHintText__slug: 'Slug เป็น ID ที่อ่านได้และต้องไม่ซ้ำกัน มักใช้ใน URLs',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'ลบบัญชี',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'เปิดใช้งานคำเชิญอัตโนมัติสำหรับโดเมนนี้',
  formFieldLabel__backupCode: 'รหัสสำรอง',
  formFieldLabel__confirmDeletion: 'การยืนยัน',
  formFieldLabel__confirmPassword: 'ยืนยันรหัสผ่าน',
  formFieldLabel__currentPassword: 'รหัสผ่านปัจจุบัน',
  formFieldLabel__emailAddress: 'ที่อยู่อีเมล',
  formFieldLabel__emailAddress_username: 'ที่อยู่อีเมลหรือชื่อผู้ใช้',
  formFieldLabel__emailAddresses: 'ที่อยู่อีเมล',
  formFieldLabel__firstName: 'ชื่อ',
  formFieldLabel__lastName: 'นามสกุล',
  formFieldLabel__newPassword: 'รหัสผ่านใหม่',
  formFieldLabel__organizationDomain: 'โดเมน',
  formFieldLabel__organizationDomainDeletePending: 'ลบคำเชิญและข้อเสนอที่รอดำเนินการ',
  formFieldLabel__organizationDomainEmailAddress: 'ที่อยู่อีเมลสำหรับการตรวจสอบ',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'กรอกที่อยู่อีเมลภายใต้โดเมนนี้เพื่อรับรหัสและตรวจสอบโดเมน',
  formFieldLabel__organizationName: 'ชื่อ',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'ชื่อของพาสคีย์',
  formFieldLabel__password: 'รหัสผ่าน',
  formFieldLabel__phoneNumber: 'หมายเลขโทรศัพท์',
  formFieldLabel__role: 'บทบาท',
  formFieldLabel__signOutOfOtherSessions: 'ออกจากระบบจากทุกอุปกรณ์',
  formFieldLabel__username: 'ชื่อผู้ใช้',
  impersonationFab: {
    action__signOut: 'ออกจากระบบ',
    title: 'เข้าสู่ระบบในฐานะ {{identifier}}',
  },
  maintenanceMode: 'ขณะนี้เรากำลังปรับปรุงระบบ แต่ไม่ต้องกังวลไป เพราะไม่น่าจะใช้เวลานานเกินกว่าสองสามนาที',
  membershipRole__admin: 'ผู้ดูแลระบบ',
  membershipRole__basicMember: 'สมาชิก',
  membershipRole__guestMember: 'ผู้เยี่ยมชม',
  organizationList: {
    action__createOrganization: 'สร้างองค์กร',
    action__invitationAccept: 'เข้าร่วม',
    action__suggestionsAccept: 'ขอเข้าร่วม',
    createOrganization: 'สร้างองค์กร',
    invitationAcceptedLabel: 'ได้เข้าร่วมแล้ว',
    subtitle: 'เพื่อดำเนินการต่อไปยัง {{applicationName}}',
    suggestionsAcceptedLabel: 'รอการอนุมัติ',
    title: 'เลือกบัญชี',
    titleWithoutPersonal: 'เลือกองค์กร',
  },
  organizationProfile: {
    badge__automaticInvitation: 'คำเชิญอัตโนมัติ',
    badge__automaticSuggestion: 'ข้อเสนอแนะอัตโนมัติ',
    badge__manualInvitation: 'ไม่มีการลงทะเบียนอัตโนมัติ',
    badge__unverified: 'ยังไม่ได้ยืนยัน',
    createDomainPage: {
      subtitle:
        'เพิ่มโดเมนเพื่อยืนยัน ผู้ใช้ที่มีที่อยู่อีเมลในโดเมนนี้สามารถเข้าร่วมองค์กรโดยอัตโนมัติหรือขอเข้าร่วมได้',
      title: 'เพิ่มโดเมน',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'ไม่สามารถส่งคำเชิญได้ มีคำเชิญที่กำลังรอดำเนินการสำหรับที่อยู่อีเมลต่อไปนี้: {{email_addresses}}',
      formButtonPrimary__continue: 'ส่งคำเชิญ',
      selectDropdown__role: 'เลือกบทบาท',
      subtitle: 'ใส่หรือวางที่อยู่อีเมลหนึ่งหรือมากกว่า แยกด้วยช่องว่างหรือเครื่องหมายจุลภาค',
      successMessage: 'คำเชิญถูกส่งเรียบร้อยแล้ว',
      title: 'เชิญสมาชิกใหม่',
    },
    membersPage: {
      action__invite: 'เชิญ',
      activeMembersTab: {
        menuAction__remove: 'ลบสมาชิก',
        tableHeader__actions: undefined,
        tableHeader__joined: 'เข้าร่วม',
        tableHeader__role: 'บทบาท',
        tableHeader__user: 'ผู้ใช้',
      },
      detailsTitle__emptyRow: 'ไม่มีสมาชิกที่แสดง',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'เชิญผู้ใช้โดยเชื่อมต่อโดเมนอีเมลกับองค์กรของคุณ ทุกคนที่สมัครสมาชิกด้วยโดเมนอีเมลที่ตรงกันจะสามารถเข้าร่วมองค์กรได้ทุกเมื่อ',
          headerTitle: 'คำเชิญอัตโนมัติ',
          primaryButton: 'จัดการโดเมนที่ได้รับการยืนยัน',
        },
        table__emptyRow: 'ไม่มีคำเชิญที่แสดง',
      },
      invitedMembersTab: {
        menuAction__revoke: 'ยกเลิกคำเชิญ',
        tableHeader__invited: 'ได้รับเชิญ',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'ผู้ใช้ที่สมัครสมาชิกด้วยโดเมนอีเมลที่ตรงกัน จะสามารถเห็นข้อเสนอแนะในการขอเข้าร่วมองค์กรของคุณ',
          headerTitle: 'ข้อเสนอแนะอัตโนมัติ',
          primaryButton: 'จัดการโดเมนที่ได้รับการยืนยัน',
        },
        menuAction__approve: 'อนุมัติ',
        menuAction__reject: 'ปฏิเสธ',
        tableHeader__requested: 'ขอเข้าถึง',
        table__emptyRow: 'ไม่มีคำขอที่แสดง',
      },
      start: {
        headerTitle__invitations: 'คำเชิญ',
        headerTitle__members: 'สมาชิก',
        headerTitle__requests: 'คำขอ',
      },
    },
    navbar: {
      description: 'จัดการองค์กรของคุณ',
      general: 'ทั่วไป',
      members: 'สมาชิก',
      title: 'องค์กร',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'พิมพ์ "{{organizationName}}" ด้านล่างเพื่อดำเนินการต่อ',
          messageLine1: 'คุณแน่ใจหรือไม่ว่าต้องการลบองค์กรนี้',
          messageLine2: 'การกระทำนี้ถาวรและไม่สามารถย้อนกลับได้',
          successMessage: 'คุณได้ลบองค์กรแล้ว',
          title: 'ลบองค์กร',
        },
        leaveOrganization: {
          actionDescription: 'พิมพ์ "{{organizationName}}" ด้านล่างเพื่อดำเนินการต่อ',
          messageLine1: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากองค์กรนี้ คุณจะสูญเสียการเข้าถึงองค์กรและแอปพลิเคชันของมัน',
          messageLine2: 'การกระทำนี้ถาวรและไม่สามารถย้อนกลับได้',
          successMessage: 'คุณได้ออกจากองค์กรแล้ว',
          title: 'ออกจากองค์กร',
        },
        title: 'คำเตือน',
      },
      domainSection: {
        menuAction__manage: 'จัดการ',
        menuAction__remove: 'ลบ',
        menuAction__verify: 'ตรวจสอบ',
        primaryButton: 'เพิ่มโดเมน',
        subtitle: 'อนุญาตให้ผู้ใช้เข้าร่วมองค์กรโดยอัตโนมัติหรือขอเข้าร่วมตามโดเมนอีเมลที่ได้รับการตรวจสอบแล้ว',
        title: 'โดเมนที่ได้รับการตรวจสอบ',
      },
      successMessage: 'องค์กรได้รับการอัปเดตแล้ว',
      title: 'อัปเดตโปรไฟล์',
    },
    removeDomainPage: {
      messageLine1: 'โดเมนอีเมล {{domain}} จะถูกลบออก',
      messageLine2: 'ผู้ใช้จะไม่สามารถเข้าร่วมองค์กรโดยอัตโนมัติหลังจากนี้',
      successMessage: '{{domain}} ได้ถูกลบออกแล้ว',
      title: 'ลบโดเมน',
    },
    start: {
      headerTitle__general: 'ทั่วไป',
      headerTitle__members: 'สมาชิก',
      profileSection: {
        primaryButton: 'อัปเดตโปรไฟล์',
        title: 'โปรไฟล์องค์กร',
        uploadAction__title: 'โลโก้',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'การลบโดเมนนี้จะส่งผลกระทบต่อผู้ใช้ที่ได้รับเชิญ',
        removeDomainActionLabel__remove: 'ลบโดเมน',
        removeDomainSubtitle: 'ลบโดเมนนี้ออกจากโดเมนที่ได้รับการตรวจสอบของคุณ',
        removeDomainTitle: 'ลบโดเมน',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'ผู้ใช้จะได้รับเชิญโดยอัตโนมัติเมื่อสมัครสมาชิกและสามารถเข้าร่วมได้ทุกเมื่อ',
        automaticInvitationOption__label: 'เชิญอัตโนมัติ',
        automaticSuggestionOption__description:
          'ผู้ใช้จะได้รับข้อเสนอแนะให้ขอเข้าร่วม แต่ต้องได้รับการอนุมัติจากผู้ดูแลระบบก่อนที่จะสามารถเข้าร่วมองค์กรได้',
        automaticSuggestionOption__label: 'ข้อเสนอแนะอัตโนมัติ',
        calloutInfoLabel: 'การเปลี่ยนโหมดการเข้าร่วมจะส่งผลเฉพาะผู้ใช้ใหม่เท่านั้น',
        calloutInvitationCountLabel: 'คำเชิญที่รอดำเนินการส่งไปยังผู้ใช้: {{count}}',
        calloutSuggestionCountLabel: 'ข้อเสนอแนะที่รอดำเนินการส่งไปยังผู้ใช้: {{count}}',
        manualInvitationOption__description: 'ผู้ใช้สามารถได้รับเชิญเข้าร่วมองค์กรได้โดยต้องผ่านการเชิญเท่านั้น',
        manualInvitationOption__label: 'ไม่มีการเข้าร่วมอัตโนมัติ',
        subtitle: 'เลือกวิธีที่ผู้ใช้จากโดเมนนี้สามารถเข้าร่วมองค์กรได้',
      },
      start: {
        headerTitle__danger: 'อันตราย',
        headerTitle__enrollment: 'ตัวเลือกการเข้าร่วม',
      },
      subtitle: 'โดเมน {{domain}} ได้รับการตรวจสอบแล้ว ดำเนินการต่อโดยการเลือกโหมดการเข้าร่วม',
      title: 'อัปเดต {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'ป้อนรหัสการตรวจสอบที่ส่งไปยังที่อยู่อีเมลของคุณ',
      formTitle: 'รหัสการตรวจสอบ',
      resendButton: 'ไม่ได้รับรหัสใช่หรือไม่ ส่งรหัสใหม่อีกครั้ง',
      subtitle: 'โดเมน {{domainName}} ต้องได้รับการตรวจสอบผ่านทางอีเมล',
      subtitleVerificationCodeScreen: 'รหัสการตรวจสอบถูกส่งไปยัง {{emailAddress}} ป้อนรหัสเพื่อดำเนินการต่อ',
      title: 'ตรวจสอบโดเมน',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'สร้างองค์กร',
    action__invitationAccept: 'เข้าร่วม',
    action__manageOrganization: 'จัดการ',
    action__suggestionsAccept: 'ขอเข้าร่วม',
    notSelected: 'ไม่มีองค์กรที่เลือก',
    personalWorkspace: 'บัญชีส่วนบุคคล',
    suggestionsAcceptedLabel: 'รอการอนุมัติ',
  },
  paginationButton__next: 'ถัดไป',
  paginationButton__previous: 'ก่อนหน้า',
  paginationRowText__displaying: 'แสดง',
  paginationRowText__of: 'จาก',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'เพิ่มบัญชี',
      action__signOutAll: 'ออกจากบัญชีทั้งหมด',
      subtitle: 'เลือกบัญชีที่คุณต้องการดำเนินการต่อ',
      title: 'เลือกบัญชี',
    },
    alternativeMethods: {
      actionLink: 'ขอรับความช่วยเหลือ',
      actionText: 'ไม่มีวิธีใดที่กล่าวมาหรือ?',
      blockButton__backupCode: 'ใช้รหัสสำรอง',
      blockButton__emailCode: 'ส่งรหัสไปที่อีเมล {{identifier}}',
      blockButton__emailLink: 'ส่งลิงก์ไปที่อีเมล {{identifier}}',
      blockButton__passkey: 'ลงชื่อเข้าใช้ด้วยพาสคีย์ของคุณ',
      blockButton__password: 'เข้าสู่ระบบด้วยรหัสผ่านของคุณ',
      blockButton__phoneCode: 'ส่งรหัส SMS ไปยัง {{identifier}}',
      blockButton__totp: 'ใช้แอปยืนยันตัวตน',
      getHelp: {
        blockButton__emailSupport: 'สนับสนุนทางอีเมล',
        content:
          'หากคุณพบปัญหาในการเข้าสู่ระบบบัญชีของคุณ โปรดอีเมลถึงเราและเราจะช่วยคุณเรียกคืนการเข้าถึงโดยเร็วที่สุด',
        title: 'ขอรับความช่วยเหลือ',
      },
      subtitle: 'มีปัญหาหรือ? คุณสามารถใช้วิธีใดวิธีหนึ่งนี้เพื่อเข้าสู่ระบบได้',
      title: 'ใช้วิธีอื่น',
    },
    backupCodeMfa: {
      subtitle: 'รหัสสำรองของคุณคือรหัสที่คุณได้รับเมื่อตั้งค่าการยืนยันสองขั้นตอน',
      title: 'ใส่รหัสสำรอง',
    },
    emailCode: {
      formTitle: 'รหัสการตรวจสอบ',
      resendButton: 'ไม่ได้รับรหัสใช่หรือไม่ ส่งรหัสใหม่อีกครั้ง',
      subtitle: 'เพื่อดำเนินการต่อไปยัง {{applicationName}}',
      title: 'ตรวจสอบอีเมลของคุณ',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'หากต้องการดำเนินการต่อ ให้เปิดลิงก์การยืนยันบนอุปกรณ์และเบราว์เซอร์ที่คุณใช้ในการเริ่มลงชื่อเข้าใช้',
        title: 'ลิงก์ตรวจสอบไม่ถูกต้องสำหรับอุปกรณ์นี้',
      },
      expired: {
        subtitle: 'กลับไปที่แท็บเดิมเพื่อดำเนินการต่อ',
        title: 'ลิงก์การตรวจสอบนี้หมดอายุ',
      },
      failed: {
        subtitle: 'กลับไปที่แท็บเดิมเพื่อดำเนินการต่อ',
        title: 'ลิงก์การตรวจสอบนี้ไม่ถูกต้อง',
      },
      formSubtitle: 'ใช้ลิงก์การตรวจสอบที่ส่งไปยังอีเมลของคุณ',
      formTitle: 'ลิงก์การตรวจสอบ',
      loading: {
        subtitle: 'คุณจะถูกเปลี่ยนเส้นทางเร็ว ๆ นี้',
        title: 'กำลังเข้าสู่ระบบ...',
      },
      resendButton: 'ไม่ได้รับลิงก์ใช่หรือไม่ ส่งลิงก์ใหม่อีกครั้ง',
      subtitle: 'เพื่อดำเนินการต่อไปยัง {{applicationName}}',
      title: 'ตรวจสอบอีเมลของคุณ',
      unusedTab: {
        title: 'คุณอาจปิดแท็บนี้ได้',
      },
      verified: {
        subtitle: 'คุณจะถูกเปลี่ยนเส้นทางเร็ว ๆ นี้',
        title: 'เข้าสู่ระบบสำเร็จ',
      },
      verifiedSwitchTab: {
        subtitle: 'กลับไปที่แท็บเดิมเพื่อดำเนินการต่อ',
        subtitleNewTab: 'กลับไปที่แท็บที่เปิดใหม่เพื่อดำเนินการต่อ',
        titleNewTab: 'เข้าสู่ระบบในแท็บอื่น',
      },
    },
    forgotPassword: {
      formTitle: 'รหัสรีเซ็ตรหัสผ่าน',
      resendButton: 'ไม่ได้รับรหัสใช่หรือไม่ ส่งรหัสใหม่อีกครั้ง',
      subtitle: 'เพื่อรีเซ็ตรหัสผ่านของคุณ',
      subtitle_email: 'ขั้นแรก ใส่รหัสที่ส่งไปยัง ID อีเมลของคุณ',
      subtitle_phone: 'ขั้นแรก ใส่รหัสที่ส่งไปยังโทรศัพท์ของคุณ',
      title: 'รีเซ็ตรหัสผ่าน',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'รีเซ็ตรหัสผ่านของคุณ',
      label__alternativeMethods: 'หรือ เข้าสู่ระบบด้วยวิธีอื่น',
      title: 'ลืมรหัสผ่าน?',
    },
    noAvailableMethods: {
      message: 'ไม่สามารถดำเนินการเข้าสู่ระบบได้ ไม่มีปัจจัยการตรวจสอบที่ใช้งานได้',
      subtitle: 'เกิดข้อผิดพลาด',
      title: 'ไม่สามารถเข้าสู่ระบบได้',
    },
    passkey: {
      subtitle: 'การใช้พาสคีย์ของคุณเพื่อยืนยันว่าเป็นคุณ อุปกรณ์ของคุณอาจขอลายนิ้วมือ ใบหน้า หรือการล็อกหน้าจอ',
      title: 'ใช้พาสคีย์ของคุณ',
    },
    password: {
      actionLink: 'ใช้วิธีอื่น',
      subtitle: 'ใส่รหัสผ่านที่เชื่อมโยงกับบัญชีของคุณ',
      title: 'ใส่รหัสผ่านของคุณ',
    },
    passwordPwned: {
      title: 'รหัสผ่านเคยถูกโจรกรรม',
    },
    phoneCode: {
      formTitle: 'รหัสการตรวจสอบ',
      resendButton: 'ไม่ได้รับรหัสใช่หรือไม่ ส่งรหัสใหม่อีกครั้ง',
      subtitle: 'เพื่อดำเนินการต่อไปยัง {{applicationName}}',
      title: 'ตรวจสอบโทรศัพท์ของคุณ',
    },
    phoneCodeMfa: {
      formTitle: 'รหัสการตรวจสอบ',
      resendButton: 'ไม่ได้รับรหัสใช่หรือไม่ ส่งรหัสใหม่อีกครั้ง',
      subtitle: 'เพื่อดำเนินการต่อ กรุณาใส่รหัสการตรวจสอบที่ส่งไปยังโทรศัพท์ของคุณ',
      title: 'ตรวจสอบโทรศัพท์ของคุณ',
    },
    resetPassword: {
      formButtonPrimary: 'รีเซ็ตรหัสผ่าน',
      requiredMessage: 'มีบัญชีอยู่แล้วที่มีอีเมลที่ยังไม่ได้ยืนยัน กรุณารีเซ็ตรหัสผ่านของคุณเพื่อความปลอดภัย',
      successMessage: 'รหัสผ่านของคุณถูกรีเซ็ตเรียบร้อยแล้ว กำลังเข้าสู่ระบบ กรุณารอสักครู่',
      title: 'ตั้งรหัสผ่านใหม่',
    },
    resetPasswordMfa: {
      detailsLabel: 'เราต้องตรวจสอบตัวตนของคุณก่อนที่จะรีเซ็ตรหัสผ่าน',
    },
    start: {
      actionLink: 'สมัครสมาชิก',
      actionLink__use_email: 'ใช้อีเมล',
      actionLink__use_email_username: 'ใช้อีเมลหรือชื่อผู้ใช้',
      actionLink__use_passkey: 'ใช้พาสคีย์แทน',
      actionLink__use_phone: 'ใช้โทรศัพท์',
      actionLink__use_username: 'ใช้ชื่อผู้ใช้',
      actionText: 'ไม่มีบัญชีหรือ?',
      subtitle: 'ยินดีต้อนรับกลับ! กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ',
      title: 'เข้าสู่ระบบ {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'รหัสการตรวจสอบ',
      subtitle: 'เพื่อดำเนินการต่อ กรุณาใส่รหัสการตรวจสอบที่สร้างโดยแอปยืนยันตัวตนของคุณ',
      title: 'การตรวจสอบสองขั้นตอน',
    },
  },
  signInEnterPasswordTitle: 'ใส่รหัสผ่านของคุณ',
  signUp: {
    continue: {
      actionLink: 'เข้าสู่ระบบ',
      actionText: 'มีบัญชีอยู่แล้วใช่หรือไม่?',
      subtitle: 'กรุณากรอกข้อมูลที่เหลือเพื่อดำเนินการต่อ',
      title: 'กรอกข้อมูลที่ขาดหาย',
    },
    emailCode: {
      formSubtitle: 'ใส่รหัสยืนยันที่ส่งไปยังที่อยู่อีเมลของคุณ',
      formTitle: 'รหัสยืนยัน',
      resendButton: 'ไม่ได้รับรหัส? ส่งใหม่',
      subtitle: 'ใส่รหัสยืนยันที่ส่งไปยังอีเมลของคุณ',
      title: 'ยืนยันอีเมลของคุณ',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'หากต้องการดำเนินการต่อ ให้เปิดลิงก์ยืนยันบนอุปกรณ์และเบราว์เซอร์ที่คุณใช้เริ่มต้นการสมัคร',
        title: 'ลิงก์ตรวจสอบไม่ถูกต้องสำหรับอุปกรณ์นี้',
      },
      formSubtitle: 'ใช้ลิงก์ยืนยันที่ส่งไปยังที่อยู่อีเมลของคุณ',
      formTitle: 'ลิงก์ยืนยัน',
      loading: {
        title: 'กำลังสมัครสมาชิก...',
      },
      resendButton: 'ไม่ได้รับลิงก์? ส่งใหม่',
      subtitle: 'เพื่อดำเนินการต่อไปยัง {{applicationName}}',
      title: 'ยืนยันอีเมลของคุณ',
      verified: {
        title: 'สมัครสมาชิกสำเร็จ',
      },
      verifiedSwitchTab: {
        subtitle: 'กลับไปยังแท็บที่เปิดใหม่เพื่อดำเนินการต่อ',
        subtitleNewTab: 'กลับไปยังแท็บก่อนหน้าเพื่อดำเนินการต่อ',
        title: 'ยืนยันอีเมลสำเร็จ',
      },
    },
    phoneCode: {
      formSubtitle: 'ใส่รหัสยืนยันที่ส่งไปยังหมายเลขโทรศัพท์ของคุณ',
      formTitle: 'รหัสยืนยัน',
      resendButton: 'ไม่ได้รับรหัส? ส่งใหม่',
      subtitle: 'ใส่รหัสยืนยันที่ส่งไปยังโทรศัพท์ของคุณ',
      title: 'ยืนยันโทรศัพท์ของคุณ',
    },
    start: {
      actionLink: 'เข้าสู่ระบบ',
      actionLink__use_email: 'ใช้อีเมลแทน',
      actionLink__use_phone: 'ใช้โทรศัพท์แทน',
      actionText: 'มีบัญชีอยู่แล้วใช่หรือไม่?',
      subtitle: 'ยินดีต้อนรับ! กรุณากรอกข้อมูลเพื่อเริ่มต้น',
      title: 'สร้างบัญชีของคุณ',
    },
  },
  socialButtonsBlockButton: 'ดำเนินการต่อด้วย {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'การสมัครไม่สำเร็จเนื่องจากการตรวจสอบความปลอดภัยไม่ผ่าน กรุณารีเฟรชหน้าเว็บเพื่อลองใหม่หรือติดต่อสนับสนุนเพื่อขอความช่วยเหลือเพิ่มเติม',
    captcha_unavailable:
      'การสมัครไม่สำเร็จเนื่องจากการตรวจสอบบอทไม่ผ่าน กรุณารีเฟรชหน้าเว็บเพื่อลองใหม่หรือติดต่อสนับสนุนเพื่อขอความช่วยเหลือเพิ่มเติม',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: 'ที่อยู่อีเมลนี้ถูกนำไปใช้แล้ว โปรดลองอันอื่น',
    form_identifier_exists__phone_number: 'หมายเลขโทรศัพท์นี้ถูกนำไปใช้แล้ว โปรดลองอันอื่น',
    form_identifier_exists__username: 'ชื่อผู้ใช้นี้ถูกนำไปใช้แล้ว โปรดลองอันอื่น',
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'ที่อยู่อีเมลต้องเป็นที่อยู่อีเมลที่ถูกต้อง',
    form_param_format_invalid__phone_number: 'หมายเลขโทรศัพท์ต้องอยู่ในรูปแบบสากลที่ถูกต้อง',
    form_param_max_length_exceeded__first_name: 'ชื่อต้นไม่ควรเกิน 256 ตัวอักษร',
    form_param_max_length_exceeded__last_name: 'นามสกุลไม่ควรเกิน 256 ตัวอักษร',
    form_param_max_length_exceeded__name: 'ชื่อไม่ควรเกิน 256 ตัวอักษร',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'รหัสผ่านของคุณไม่เพียงพอต่อความปลอดภัย',
    form_password_pwned:
      'รหัสผ่านนี้ถูกพบว่าเป็นส่วนหนึ่งของข้อมูลที่รั่วไหลและไม่สามารถใช้ได้ กรุณาลองรหัสผ่านอื่นแทน',
    form_password_pwned__sign_in:
      'รหัสผ่านนี้ถูกพบว่าเป็นส่วนหนึ่งของข้อมูลที่รั่วไหลและไม่สามารถใช้งานได้ โปรดรีเซ็ตรหัสผ่านของคุณ',
    form_password_size_in_bytes_exceeded:
      'รหัสผ่านของคุณเกินจำนวนไบต์สูงสุดที่อนุญาต กรุณาลดความยาวหรือลบอักขระพิเศษบางตัว',
    form_password_validation_failed: 'รหัสผ่านไม่ถูกต้อง',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'คุณไม่สามารถลบรูปแบบการยืนยันตัวตนสุดท้ายของคุณได้',
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: 'พาสคีย์ถูกลงทะเบียนกับอุปกรณ์นี้แล้ว',
    passkey_not_supported: 'อุปกรณ์นี้ไม่รองรับพาสคีย์',
    passkey_pa_not_supported: 'การลงทะเบียนต้องใช้ระบบยืนยันตัวตนของแพลตฟอร์ม แต่อุปกรณ์ไม่รองรับ',
    passkey_registration_cancelled: 'การลงทะเบียนพาสคีย์ถูกยกเลิกหรือหมดเวลา',
    passkey_retrieval_cancelled: 'การยืนยันพาสคีย์ถูกยกเลิกหรือหมดเวลา',
    passwordComplexity: {
      maximumLength: 'น้อยกว่า {{length}} ตัวอักษร',
      minimumLength: '{{length}} ตัวอักษรหรือมากกว่า',
      requireLowercase: 'ตัวอักษรพิมพ์เล็ก',
      requireNumbers: 'ตัวเลข',
      requireSpecialCharacter: 'อักขระพิเศษ',
      requireUppercase: 'ตัวอักษรพิมพ์ใหญ่',
      sentencePrefix: 'รหัสผ่านของคุณต้องมี',
    },
    phone_number_exists: 'หมายเลขโทรศัพท์นี้ถูกใช้แล้ว กรุณาลองหมายเลขอื่น',
    zxcvbn: {
      couldBeStronger: 'รหัสผ่านของคุณใช้งานได้ แต่ควรจะแข็งแกร่งกว่านี้ ลองเพิ่มอักขระเพิ่มเติม',
      goodPassword: 'รหัสผ่านของคุณตรงตามข้อกำหนดที่จำเป็นทั้งหมด',
      notEnough: 'รหัสผ่านของคุณไม่เพียงพอต่อความปลอดภัย',
      suggestions: {
        allUppercase: 'ใช้ตัวพิมพ์ใหญ่บางตัว แต่ไม่ใช่ทั้งหมด',
        anotherWord: 'เพิ่มคำที่ไม่ค่อยมีคนใช้มากขึ้น',
        associatedYears: 'หลีกเลี่ยงปีที่เกี่ยวข้องกับคุณ',
        capitalization: 'ใช้ตัวพิมพ์ใหญ่มากกว่าตัวแรก',
        dates: 'หลีกเลี่ยงวันที่และปีที่เกี่ยวข้องกับคุณ',
        l33t: "หลีกเลี่ยงการใช้ตัวแทนอักขระที่คาดเดาได้ง่าย เช่น '@' แทน 'a'",
        longerKeyboardPattern: 'ใช้รูปแบบการกดคีย์บอร์ดที่ยาวขึ้นและเปลี่ยนทิศทางการพิมพ์หลายครั้ง',
        noNeed: 'คุณสามารถสร้างรหัสผ่านที่แข็งแกร่งได้โดยไม่ต้องใช้อักขระพิเศษ ตัวเลข หรือตัวพิมพ์ใหญ่',
        pwned: 'หากคุณใช้รหัสผ่านนี้ที่อื่น คุณควรเปลี่ยนมัน',
        recentYears: 'หลีกเลี่ยงปีที่ใกล้เคียง',
        repeated: 'หลีกเลี่ยงคำและอักขระที่ซ้ำกัน',
        reverseWords: 'หลีกเลี่ยงการสะกดคำทั่วไปในทางกลับกัน',
        sequences: 'หลีกเลี่ยงลำดับอักขระทั่วไป',
        useWords: 'ใช้หลายคำ แต่หลีกเลี่ยงวลีทั่วไป',
      },
      warnings: {
        common: 'นี่เป็นรหัสผ่านที่ใช้กันอย่างแพร่หลาย',
        commonNames: 'ชื่อทั่วไปและนามสกุลเดาได้ง่าย',
        dates: 'วันที่เดาได้ง่าย',
        extendedRepeat: 'รูปแบบการซ้ำอักขระเช่น "abcabcabc" เดาได้ง่าย',
        keyPattern: 'รูปแบบการกดคีย์บอร์ดสั้น ๆ เดาได้ง่าย',
        namesByThemselves: 'ชื่อเดี่ยวหรือนามสกุลเดาได้ง่าย',
        pwned: 'รหัสผ่านของคุณถูกเปิดเผยโดยการรั่วไหลข้อมูลบนอินเทอร์เน็ต',
        recentYears: 'ปีที่ใกล้เคียงเดาได้ง่าย',
        sequences: 'ลำดับอักขระทั่วไปเช่น "abc" เดาได้ง่าย',
        similarToCommon: 'นี้คล้ายกับรหัสผ่านที่ใช้กันอย่างแพร่หลาย',
        simpleRepeat: 'อักขระที่ซ้ำเช่น "aaa" เดาได้ง่าย',
        straightRow: 'แถวตรงของคีย์บนคีย์บอร์ดของคุณเดาได้ง่าย',
        topHundred: 'นี่เป็นรหัสผ่านที่ใช้บ่อย',
        topTen: 'นี่เป็นรหัสผ่านที่ใช้มาก',
        userInputs: 'ไม่ควรมีข้อมูลส่วนบุคคลหรือข้อมูลที่เกี่ยวข้องกับหน้า',
        wordByItself: 'คำเดียวเดาได้ง่าย',
      },
    },
  },
  userButton: {
    action__addAccount: 'เพิ่มบัญชี',
    action__manageAccount: 'จัดการบัญชี',
    action__signOut: 'ออกจากระบบ',
    action__signOutAll: 'ออกจากระบบทุกบัญชี',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'คัดลอกแล้ว!',
      actionLabel__copy: 'คัดลอกทั้งหมด',
      actionLabel__download: 'ดาวน์โหลด .txt',
      actionLabel__print: 'พิมพ์',
      infoText1: 'จะเปิดใช้งานรหัสสำรองสำหรับบัญชีนี้',
      infoText2: 'เก็บรหัสสำรองไว้เป็นความลับและเก็บไว้อย่างปลอดภัย คุณอาจสร้างรหัสสำรองใหม่หากคุณสงสัยว่ามีการเปิดเผย',
      subtitle__codelist: 'เก็บไว้อย่างปลอดภัยและเก็บไว้เป็นความลับ',
      successMessage:
        'ตอนนี้ได้เปิดใช้งานรหัสสำรองแล้ว คุณสามารถใช้หนึ่งในรหัสเหล่านี้เพื่อเข้าสู่บัญชีของคุณหากคุณไม่สามารถเข้าถึงอุปกรณ์ตรวจสอบสิทธิ์ได้ แต่ละรหัสสามารถใช้ได้เพียงครั้งเดียว',
      successSubtitle:
        'คุณสามารถใช้หนึ่งในรหัสเหล่านี้เพื่อเข้าสู่บัญชีของคุณหากคุณไม่สามารถเข้าถึงอุปกรณ์ตรวจสอบสิทธิ์ได้',
      title: 'เพิ่มการยืนยันรหัสสำรอง',
      title__codelist: 'รหัสสำรอง',
    },
    connectedAccountPage: {
      formHint: 'เลือกผู้ให้บริการเพื่อเชื่อมต่อบัญชีของคุณ',
      formHint__noAccounts: 'ไม่มีผู้ให้บริการบัญชีภายนอกที่ใช้งานได้',
      removeResource: {
        messageLine1: '{{identifier}} จะถูกนำออกจากบัญชีนี้',
        messageLine2: 'คุณจะไม่สามารถใช้บัญชีที่เชื่อมต่อนี้และฟีเจอร์ที่ขึ้นอยู่กับบัญชีนี้จะไม่สามารถใช้งานได้',
        successMessage: '{{connectedAccount}} ได้ถูกนำออกจากบัญชีของคุณ',
        title: 'นำบัญชีที่เชื่อมต่อออก',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'ผู้ให้บริการได้ถูกเพิ่มเข้าไปในบัญชีของคุณ',
      title: 'เพิ่มบัญชีที่เชื่อมต่อ',
    },
    deletePage: {
      actionDescription: 'พิมพ์ "Delete account" ด้านล่างเพื่อดำเนินการต่อ',
      confirm: 'ลบบัญชี',
      messageLine1: 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณ?',
      messageLine2: 'การกระทำนี้เป็นการถาวรและไม่สามารถย้อนกลับได้',
      title: 'ลบบัญชี',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'อีเมลที่มีรหัสยืนยันจะถูกส่งไปยังที่อยู่อีเมลนี้',
        formSubtitle: 'ป้อนรหัสยืนยันที่ถูกส่งไปยัง {{identifier}}',
        formTitle: 'รหัสยืนยัน',
        resendButton: 'ไม่ได้รับรหัสใช่หรือไม่ ส่งรหัสใหม่อีกครั้ง',
        successMessage: 'อีเมล {{identifier}} ได้ถูกเพิ่มเข้าในบัญชีของคุณแล้ว',
      },
      emailLink: {
        formHint: 'อีเมลที่มีลิงก์ยืนยันจะถูกส่งไปยังที่อยู่อีเมลนี้',
        formSubtitle: 'คลิกที่ลิงก์ยืนยันในอีเมลที่ถูกส่งไปยัง {{identifier}}',
        formTitle: 'ลิงก์ยืนยัน',
        resendButton: 'ไม่ได้รับลิงก์ใช่หรือไม่ ส่งลิงก์ใหม่อีกครั้ง',
        successMessage: 'อีเมล {{identifier}} ได้ถูกเพิ่มเข้าในบัญชีของคุณแล้ว',
      },
      removeResource: {
        messageLine1: '{{identifier}} จะถูกนำออกจากบัญชีนี้',
        messageLine2: 'คุณจะไม่สามารถเข้าสู่ระบบโดยใช้อีเมลที่อยู่นี้ได้อีกต่อไป',
        successMessage: 'อีเมล {{emailAddress}} ได้ถูกนำออกจากบัญชีของคุณแล้ว',
        title: 'นำที่อยู่อีเมลออก',
      },
      title: 'เพิ่มที่อยู่อีเมล',
      verifyTitle: 'ยืนยันที่อยู่อีเมล',
    },
    formButtonPrimary__add: 'เพิ่ม',
    formButtonPrimary__continue: 'ดำเนินการต่อ',
    formButtonPrimary__finish: 'เสร็จสิ้น',
    formButtonPrimary__remove: 'นำออก',
    formButtonPrimary__save: 'บันทึก',
    formButtonReset: 'ยกเลิก',
    mfaPage: {
      formHint: 'เลือกวิธีเพื่อเพิ่ม',
      title: 'เพิ่มการยืนยันสองขั้นตอน',
    },
    mfaPhoneCodePage: {
      backButton: 'ใช้หมายเลขที่มีอยู่',
      primaryButton__addPhoneNumber: 'เพิ่มหมายเลขโทรศัพท์',
      removeResource: {
        messageLine1: '{{identifier}} จะไม่ได้รับรหัสยืนยันเมื่อเข้าสู่ระบบอีกต่อไป',
        messageLine2: 'บัญชีของคุณอาจไม่ปลอดภัยเท่าที่ควร คุณแน่ใจหรือว่าต้องการดำเนินการต่อ',
        successMessage: 'การยืนยันสองขั้นตอนด้วยรหัส SMS ได้ถูกนำออกสำหรับ {{mfaPhoneCode}}',
        title: 'นำการยืนยันสองขั้นตอนออก',
      },
      subtitle__availablePhoneNumbers:
        'เลือกหมายเลขโทรศัพท์ที่มีอยู่เพื่อลงทะเบียนสำหรับการยืนยันสองขั้นตอนด้วยรหัส SMS หรือเพิ่มหมายเลขใหม่',
      subtitle__unavailablePhoneNumbers:
        'ไม่มีหมายเลขโทรศัพท์ที่สามารถใช้ลงทะเบียนสำหรับการยืนยันสองขั้นตอนด้วยรหัส SMS โปรดเพิ่มหมายเลขใหม่',
      successMessage1: 'เมื่อเข้าสู่ระบบ คุณจะต้องป้อนรหัสยืนยันที่ถูกส่งไปยังหมายเลขโทรศัพท์นี้เป็นขั้นตอนเพิ่มเติม',
      successMessage2:
        'บันทึกรหัสสำรองและเก็บไว้ในที่ปลอดภัย หากคุณสูญเสียการเข้าถึงอุปกรณ์การตรวจสอบของคุณ คุณสามารถใช้รหัสสำรองเพื่อเข้าสู่ระบบได้',
      successTitle: 'เปิดใช้งานการยืนยันด้วยรหัส SMS',
      title: 'เพิ่มการยืนยันด้วยรหัส SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'สแกนคิวอาร์โค้ดแทน',
        buttonUnableToScan__nonPrimary: 'ไม่สามารถสแกนคิวอาร์โค้ดใช่หรือไม่',
        infoText__ableToScan:
          'ตั้งค่าวิธีการเข้าสู่ระบบใหม่ในแอปยืนยันตัวตนของคุณและสแกนคิวอาร์โค้ดต่อไปนี้เพื่อเชื่อมโยงกับบัญชีของคุณ',
        infoText__unableToScan: 'ตั้งค่าวิธีการเข้าสู่ระบบใหม่ในตัวตรวจสอบของคุณและป้อนคีย์ที่ให้ไว้ด้านล่าง',
        inputLabel__unableToScan1:
          'ตรวจสอบให้แน่ใจว่าเปิดใช้งานรหัสผ่านตามเวลาหรือรหัสผ่านครั้งเดียว จากนั้นจึงเชื่อมโยงบัญชีของคุณ',
        inputLabel__unableToScan2: 'หรือหากตัวตรวจสอบของคุณรองรับ TOTP URIs คุณยังสามารถคัดลอก URI ทั้งหมดได้',
      },
      removeResource: {
        messageLine1: 'ไม่จำเป็นต้องใช้รหัสยืนยันจากระบบยืนยันตัวตนนี้เมื่อลงชื่อเข้าใช้อีกต่อไป',
        messageLine2: 'บัญชีของคุณอาจไม่ปลอดภัยเท่าที่ควร คุณแน่ใจหรือว่าต้องการดำเนินการต่อ',
        successMessage: 'การยืนยันสองขั้นตอนผ่านแอปพลิเคชันยืนยันตัวตนได้ถูกนำออก',
        title: 'นำการยืนยันสองขั้นตอนออก',
      },
      successMessage:
        'การยืนยันสองขั้นตอนเปิดใช้งานแล้ว เมื่อลงชื่อเข้าใช้ คุณจะต้องป้อนรหัสยืนยันจากระบบยืนยันตัวตนนี้เป็นขั้นตอนเพิ่มเติม',
      title: 'เพิ่มแอปพลิเคชันยืนยันตัวตน',
      verifySubtitle: 'ป้อนรหัสยืนยันที่สร้างโดยระบบยืนยันตัวตนของคุณ',
      verifyTitle: 'รหัสยืนยัน',
    },
    mobileButton__menu: 'เมนู',
    navbar: {
      account: 'โปรไฟล์',
      description: 'จัดการข้อมูลบัญชีของคุณ',
      security: 'ความปลอดภัย',
      title: 'บัญชี',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} จะถูกลบออกจากบัญชีนี้',
        title: 'ลบพาสคีย์',
      },
      subtitle__rename: 'คุณสามารถเปลี่ยนชื่อพาสคีย์เพื่อให้สามารถค้นหาได้ง่ายขึ้น',
      title__rename: 'เปลี่ยนชื่อพาสคีย์',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions: 'ขอแนะนำให้ลงชื่อออกจากอุปกรณ์อื่น ๆ ที่อาจใช้รหัสผ่านเก่าของคุณ',
      readonly:
        'คุณไม่สามารถแก้ไขรหัสผ่านได้ในขณะนี้เนื่องจากคุณสามารถลงชื่อเข้าใช้ได้ผ่านการเชื่อมต่อกับองค์กรเท่านั้น',
      successMessage__set: 'รหัสผ่านของคุณได้รับการตั้งค่า',
      successMessage__signOutOfOtherSessions: 'อุปกรณ์อื่น ๆ ทั้งหมดได้ลงชื่อออก',
      successMessage__update: 'รหัสผ่านของคุณได้รับการอัปเดต',
      title__set: 'ตั้งรหัสผ่าน',
      title__update: 'อัปเดตรหัสผ่าน',
    },
    phoneNumberPage: {
      infoText: 'ข้อความที่มีรหัสยืนยันจะถูกส่งไปยังหมายเลขโทรศัพท์นี้ อาจมีการเรียกเก็บค่าบริการข้อความและข้อมูล',
      removeResource: {
        messageLine1: '{{identifier}} จะถูกนำออกจากบัญชีนี้',
        messageLine2: 'คุณจะไม่สามารถลงชื่อเข้าใช้โดยใช้หมายเลขโทรศัพท์นี้อีกต่อไป',
        successMessage: '{{phoneNumber}} ได้ถูกนำออกจากบัญชีของคุณ',
        title: 'นำหมายเลขโทรศัพท์ออก',
      },
      successMessage: '{{identifier}} ได้ถูกเพิ่มเข้าในบัญชีของคุณ',
      title: 'เพิ่มหมายเลขโทรศัพท์',
      verifySubtitle: 'ป้อนรหัสยืนยันที่ถูกส่งไปยัง {{identifier}}',
      verifyTitle: 'ยืนยันหมายเลขโทรศัพท์',
    },
    profilePage: {
      fileDropAreaHint: 'แนะนำสัดส่วน 1:1 และ สูงสุด 10MB',
      imageFormDestructiveActionSubtitle: 'ลบ',
      imageFormSubtitle: 'อัปโหลด',
      imageFormTitle: 'รูปโปรไฟล์',
      readonly: 'ข้อมูลโปรไฟล์ของคุณได้รับจากการเชื่อมต่อกับองค์กรและไม่สามารถแก้ไขได้',
      successMessage: 'โปรไฟล์ของคุณได้รับการอัปเดตแล้ว',
      title: 'อัปเดตโปรไฟล์',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'ลงชื่อออกจากอุปกรณ์',
        title: 'อุปกรณ์ที่ใช้งานอยู่',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'ลองอีกครั้ง',
        actionLabel__reauthorize: 'อนุญาตตอนนี้',
        destructiveActionTitle: 'ลบ',
        primaryButton: 'เชื่อมต่อบัญชี',
        subtitle__disconnected: 'บัญชีนี้ถูกตัดการเชื่อมต่อแล้ว',
        subtitle__reauthorize:
          'ขอบเขตที่ต้องการได้รับการอัปเดตและคุณอาจประสบปัญหาการใช้งานจำกัด กรุณาอนุญาตแอปพลิเคชันนี้อีกครั้งเพื่อหลีกเลี่ยงปัญหา',
        title: 'บัญชีที่เชื่อมต่อ',
      },
      dangerSection: {
        deleteAccountButton: 'ลบบัญชี',
        title: 'ลบบัญชี',
      },
      emailAddressesSection: {
        destructiveAction: 'ลบอีเมล',
        detailsAction__nonPrimary: 'ตั้งเป็นหลัก',
        detailsAction__primary: 'เสร็จสิ้นการยืนยัน',
        detailsAction__unverified: 'ยืนยัน',
        primaryButton: 'เพิ่มที่อยู่อีเมล',
        title: 'ที่อยู่อีเมล',
      },
      enterpriseAccountsSection: {
        title: 'บัญชีองค์กร',
      },
      headerTitle__account: 'รายละเอียดโปรไฟล์',
      headerTitle__security: 'ความปลอดภัย',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'สร้างใหม่',
          headerTitle: 'รหัสสำรอง',
          subtitle__regenerate: 'รับชุดใหม่ของรหัสสำรองที่ปลอดภัย รหัสสำรองก่อนหน้าจะถูกลบและไม่สามารถใช้งานได้',
          title__regenerate: 'สร้างรหัสสำรองใหม่',
        },
        phoneCode: {
          actionLabel__setDefault: 'ตั้งเป็นค่าเริ่มต้น',
          destructiveActionLabel: 'ลบ',
        },
        primaryButton: 'เพิ่มการยืนยันสองขั้นตอน',
        title: 'การยืนยันสองขั้นตอน',
        totp: {
          destructiveActionTitle: 'ลบ',
          headerTitle: 'แอปพลิเคชันยืนยันตัวตน',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'ลบ',
        menuAction__rename: 'เปลี่ยนชื่อ',
        title: 'พาสคีย์',
      },
      passwordSection: {
        primaryButton__setPassword: 'ตั้งรหัสผ่าน',
        primaryButton__updatePassword: 'อัปเดตรหัสผ่าน',
        title: 'รหัสผ่าน',
      },
      phoneNumbersSection: {
        destructiveAction: 'ลบหมายเลขโทรศัพท์',
        detailsAction__nonPrimary: 'ตั้งเป็นหลัก',
        detailsAction__primary: 'เสร็จสิ้นการยืนยัน',
        detailsAction__unverified: 'ยืนยันหมายเลขโทรศัพท์',
        primaryButton: 'เพิ่มหมายเลขโทรศัพท์',
        title: 'หมายเลขโทรศัพท์',
      },
      profileSection: {
        primaryButton: 'อัปเดตโปรไฟล์',
        title: 'โปรไฟล์',
      },
      usernameSection: {
        primaryButton__setUsername: 'ตั้งชื่อผู้ใช้',
        primaryButton__updateUsername: 'อัปเดตชื่อผู้ใช้',
        title: 'ชื่อผู้ใช้',
      },
      web3WalletsSection: {
        destructiveAction: 'ลบวอลเล็ต',
        primaryButton: 'วอลเล็ต Web3',
        title: 'วอลเล็ต Web3',
      },
    },
    usernamePage: {
      successMessage: 'ชื่อผู้ใช้ของคุณได้รับการอัปเดตแล้ว',
      title__set: 'ตั้งชื่อผู้ใช้',
      title__update: 'อัปเดตชื่อผู้ใช้',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} จะถูกลบออกจากบัญชีนี้',
        messageLine2: 'คุณจะไม่สามารถเข้าสู่ระบบโดยใช้วอลเล็ต Web3 นี้ได้อีก',
        successMessage: '{{web3Wallet}} ได้ถูกลบออกจากบัญชีของคุณแล้ว',
        title: 'ลบวอลเล็ต Web3',
      },
      subtitle__availableWallets: 'เลือกวอลเล็ต Web3 เพื่อเชื่อมต่อกับบัญชีของคุณ',
      subtitle__unavailableWallets: 'ไม่มีวอลเล็ต Web3 ที่พร้อมใช้งาน',
      successMessage: 'วอลเล็ตได้ถูกเพิ่มเข้าไปในบัญชีของคุณแล้ว',
      title: 'เพิ่มวอลเล็ต Web3',
      web3WalletButtonsBlockButton: undefined,
    },
  },
} as const;
