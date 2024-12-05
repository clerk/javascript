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

import type { LocalizationResource } from "@clerk/types";

export const idID: LocalizationResource = {
  locale: "id-ID",
  backButton: "Kembali",
  badge__default: "Default",
  badge__otherImpersonatorDevice: "Perangkat impersonator lain",
  badge__primary: "Utama",
  badge__requiresAction: "Memerlukan tindakan",
  badge__thisDevice: "Perangkat ini",
  badge__unverified: "Belum diverifikasi",
  badge__userDevice: "Perangkat pengguna",
  badge__you: "Anda",
  createOrganization: {
    formButtonSubmit: "Buat organisasi",
    invitePage: {
      formButtonReset: "Lewati",
    },
    title: "Buat organisasi",
  },
  dates: {
    lastDay: "Kemarin pada {{ date | timeString('id-ID') }}",
    next6Days:
      "{{ date | weekday('id-ID','long') }} pada {{ date | timeString('id-ID') }}",
    nextDay: "Besok pada {{ date | timeString('id-ID') }}",
    numeric: "{{ date | numeric('id-ID') }}",
    previous6Days:
      "{{ date | weekday('id-ID','long') }} lalu pada {{ date | timeString('id-ID') }}",
    sameDay: "Hari ini pada {{ date | timeString('id-ID') }}",
  },
  dividerText: "atau",
  footerActionLink__useAnotherMethod: "Gunakan metode lain",
  footerPageLink__help: "Bantuan",
  footerPageLink__privacy: "Privasi",
  footerPageLink__terms: "Ketentuan",
  formButtonPrimary: "Lanjutkan",
  formButtonPrimary__verify: "Verifikasi",
  formFieldAction__forgotPassword: "Lupa kata sandi?",
  formFieldError__matchingPasswords: "Kata sandi cocok.",
  formFieldError__notMatchingPasswords: "Kata sandi tidak cocok.",
  formFieldError__verificationLinkExpired:
    "Tautan verifikasi telah kedaluwarsa. Silakan minta tautan baru.",
  formFieldHintText__optional: "Opsional",
  formFieldHintText__slug:
    "Slug adalah ID yang mudah dibaca dan harus unik. Biasanya digunakan dalam URL.",
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: "Hapus akun",
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses:
    "contoh@email.com, contoh2@email.com",
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: "organisasi-saya",
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations:
    "Aktifkan undangan otomatis untuk domain ini",
  formFieldLabel__backupCode: "Kode cadangan",
  formFieldLabel__confirmDeletion: "Konfirmasi",
  formFieldLabel__confirmPassword: "Konfirmasi kata sandi",
  formFieldLabel__currentPassword: "Kata sandi saat ini",
  formFieldLabel__emailAddress: "Alamat email",
  formFieldLabel__emailAddress_username: "Alamat email atau nama pengguna",
  formFieldLabel__emailAddresses: "Alamat email",
  formFieldLabel__firstName: "Nama depan",
  formFieldLabel__lastName: "Nama belakang",
  formFieldLabel__newPassword: "Kata sandi baru",
  formFieldLabel__organizationDomain: "Domain",
  formFieldLabel__organizationDomainDeletePending:
    "Hapus undangan dan saran yang tertunda",
  formFieldLabel__organizationDomainEmailAddress: "Alamat email verifikasi",
  formFieldLabel__organizationDomainEmailAddressDescription:
    "Masukkan alamat email dengan domain ini untuk menerima kode dan memverifikasi domain ini.",
  formFieldLabel__organizationName: "Nama",
  formFieldLabel__organizationSlug: "Slug",
  formFieldLabel__passkeyName: "Nama passkey",
  formFieldLabel__password: "Kata sandi",
  formFieldLabel__phoneNumber: "Nomor telepon",
  formFieldLabel__role: "Peran",
  formFieldLabel__signOutOfOtherSessions: "Keluar dari semua perangkat lain",
  formFieldLabel__username: "Nama pengguna",
  impersonationFab: {
    action__signOut: "Keluar",
    title: "Masuk sebagai {{identifier}}",
  },
  maintenanceMode:
    "Kami sedang dalam pemeliharaan sistem, tapi jangan khawatir, ini tidak akan memakan waktu lebih dari beberapa menit.",
  membershipRole__admin: "Admin",
  membershipRole__basicMember: "Anggota",
  membershipRole__guestMember: "Tamu",
  organizationList: {
    action__createOrganization: "Buat organisasi",
    action__invitationAccept: "Gabung",
    action__suggestionsAccept: "Minta bergabung",
    createOrganization: "Buat Organisasi",
    invitationAcceptedLabel: "Bergabung",
    subtitle: "untuk melanjutkan ke {{applicationName}}",
    suggestionsAcceptedLabel: "Menunggu persetujuan",
    title: "Pilih akun",
    titleWithoutPersonal: "Pilih organisasi",
  },
  organizationProfile: {
    badge__automaticInvitation: "Undangan otomatis",
    badge__automaticSuggestion: "Saran otomatis",
    badge__manualInvitation: "Tanpa pendaftaran otomatis",
    badge__unverified: "Belum diverifikasi",
    createDomainPage: {
      subtitle:
        "Tambahkan domain untuk verifikasi. Pengguna dengan alamat email di domain ini dapat bergabung dengan organisasi secara otomatis atau meminta untuk bergabung.",
      title: "Tambah domain",
    },
    invitePage: {
      detailsTitle__inviteFailed:
        "Undangan tidak dapat dikirim. Sudah ada undangan tertunda untuk alamat email berikut: {{email_addresses}}.",
      formButtonPrimary__continue: "Kirim undangan",
      selectDropdown__role: "Pilih peran",
      subtitle:
        "Masukkan atau tempel satu atau lebih alamat email, dipisahkan dengan spasi atau koma.",
      successMessage: "Undangan berhasil dikirim",
      title: "Undang anggota baru",
    },
    membersPage: {
      action__invite: "Undang",
      activeMembersTab: {
        menuAction__remove: "Hapus anggota",
        tableHeader__actions: undefined,
        tableHeader__joined: "Bergabung",
        tableHeader__role: "Peran",
        tableHeader__user: "Pengguna",
      },
      detailsTitle__emptyRow: "Tidak ada anggota untuk ditampilkan",
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            "Undang pengguna dengan menghubungkan domain email ke organisasi Anda. Siapa pun yang mendaftar dengan domain email yang cocok akan dapat bergabung dengan organisasi kapan saja.",
          headerTitle: "Undangan otomatis",
          primaryButton: "Kelola domain terverifikasi",
        },
        table__emptyRow: "Tidak ada undangan untuk ditampilkan",
      },
      invitedMembersTab: {
        menuAction__revoke: "Batalkan undangan",
        tableHeader__invited: "Diundang",
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            "Pengguna yang mendaftar dengan domain email yang cocok akan dapat melihat saran untuk meminta bergabung dengan organisasi Anda.",
          headerTitle: "Saran otomatis",
          primaryButton: "Kelola domain terverifikasi",
        },
        menuAction__approve: "Setujui",
        menuAction__reject: "Tolak",
        tableHeader__requested: "Meminta akses",
        table__emptyRow: "Tidak ada permintaan untuk ditampilkan",
      },
      start: {
        headerTitle__invitations: "Undangan",
        headerTitle__members: "Anggota",
        headerTitle__requests: "Permintaan",
      },
    },
    navbar: {
      description: "Kelola organisasi Anda.",
      general: "Umum",
      members: "Anggota",
      title: "Organisasi",
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription:
            'Ketik "{{organizationName}}" di bawah untuk melanjutkan.',
          messageLine1: "Anda yakin ingin menghapus organisasi ini?",
          messageLine2: "Tindakan ini permanen dan tidak dapat dibatalkan.",
          successMessage: "Anda telah menghapus organisasi.",
          title: "Hapus organisasi",
        },
        leaveOrganization: {
          actionDescription:
            'Ketik "{{organizationName}}" di bawah untuk melanjutkan.',
          messageLine1:
            "Anda yakin ingin meninggalkan organisasi ini? Anda akan kehilangan akses ke organisasi ini dan aplikasinya.",
          messageLine2: "Tindakan ini permanen dan tidak dapat dibatalkan.",
          successMessage: "Anda telah meninggalkan organisasi.",
          title: "Tinggalkan organisasi",
        },
        title: "Bahaya",
      },
      domainSection: {
        menuAction__manage: "Kelola",
        menuAction__remove: "Hapus",
        menuAction__verify: "Verifikasi",
        primaryButton: "Tambah domain",
        subtitle:
          "Izinkan pengguna untuk bergabung dengan organisasi secara otomatis atau meminta bergabung berdasarkan domain email terverifikasi.",
        title: "Domain terverifikasi",
      },
      successMessage: "Organisasi telah diperbarui.",
      title: "Perbarui profil",
    },
    removeDomainPage: {
      messageLine1: "Domain email {{domain}} akan dihapus.",
      messageLine2:
        "Pengguna tidak akan dapat bergabung dengan organisasi secara otomatis setelah ini.",
      successMessage: "{{domain}} telah dihapus.",
      title: "Hapus domain",
    },
    start: {
      headerTitle__general: "Umum",
      headerTitle__members: "Anggota",
      profileSection: {
        primaryButton: "Perbarui profil",
        title: "Profil Organisasi",
        uploadAction__title: "Logo",
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel:
          "Menghapus domain ini akan mempengaruhi pengguna yang diundang.",
        removeDomainActionLabel__remove: "Hapus domain",
        removeDomainSubtitle: "Hapus domain ini dari domain terverifikasi Anda",
        removeDomainTitle: "Hapus domain",
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          "Pengguna otomatis diundang untuk bergabung dengan organisasi saat mereka mendaftar dan dapat bergabung kapan saja.",
        automaticInvitationOption__label: "Undangan otomatis",
        automaticSuggestionOption__description:
          "Pengguna menerima saran untuk meminta bergabung, tetapi harus disetujui oleh admin sebelum mereka dapat bergabung dengan organisasi.",
        automaticSuggestionOption__label: "Saran otomatis",
        calloutInfoLabel:
          "Mengubah mode pendaftaran hanya akan mempengaruhi pengguna baru.",
        calloutInvitationCountLabel:
          "Undangan tertunda yang dikirim ke pengguna: {{count}}",
        calloutSuggestionCountLabel:
          "Saran tertunda yang dikirim ke pengguna: {{count}}",
        manualInvitationOption__description:
          "Pengguna hanya dapat diundang secara manual ke organisasi.",
        manualInvitationOption__label: "Tanpa pendaftaran otomatis",
        subtitle:
          "Pilih bagaimana pengguna dari domain ini dapat bergabung dengan organisasi.",
      },
      start: {
        headerTitle__danger: "Bahaya",
        headerTitle__enrollment: "Opsi pendaftaran",
      },
      subtitle:
        "Domain {{domain}} sekarang terverifikasi. Lanjutkan dengan memilih mode pendaftaran.",
      title: "Perbarui {{domain}}",
    },
    verifyDomainPage: {
      formSubtitle:
        "Masukkan kode verifikasi yang dikirim ke alamat email Anda",
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "Domain {{domainName}} perlu diverifikasi melalui email.",
      subtitleVerificationCodeScreen:
        "Kode verifikasi telah dikirim ke {{emailAddress}}. Masukkan kode untuk melanjutkan.",
      title: "Verifikasi domain",
    },
  },
  organizationSwitcher: {
    action__createOrganization: "Buat organisasi",
    action__invitationAccept: "Gabung",
    action__manageOrganization: "Kelola",
    action__suggestionsAccept: "Minta bergabung",
    notSelected: "Tidak ada organisasi dipilih",
    personalWorkspace: "Akun pribadi",
    suggestionsAcceptedLabel: "Menunggu persetujuan",
  },
  paginationButton__next: "Berikutnya",
  paginationButton__previous: "Sebelumnya",
  paginationRowText__displaying: "Menampilkan",
  paginationRowText__of: "dari",
  signIn: {
    accountSwitcher: {
      action__addAccount: "Tambah akun",
      action__signOutAll: "Keluar dari semua akun",
      subtitle: "Pilih akun yang ingin Anda gunakan untuk melanjutkan.",
      title: "Pilih akun",
    },
    alternativeMethods: {
      actionLink: "Dapatkan bantuan",
      actionText: "Tidak memiliki metode ini?",
      blockButton__backupCode: "Gunakan kode cadangan",
      blockButton__emailCode: "Kirim kode ke {{identifier}}",
      blockButton__emailLink: "Kirim tautan ke {{identifier}}",
      blockButton__passkey: "Masuk dengan passkey Anda",
      blockButton__password: "Masuk dengan kata sandi",
      blockButton__phoneCode: "Kirim kode SMS ke {{identifier}}",
      blockButton__totp: "Gunakan aplikasi autentikator",
      getHelp: {
        blockButton__emailSupport: "Email dukungan",
        content:
          "Jika Anda kesulitan masuk ke akun, email kami dan kami akan membantu memulihkan akses secepat mungkin.",
        title: "Dapatkan bantuan",
      },
      subtitle:
        "Mengalami masalah? Anda dapat menggunakan salah satu metode ini untuk masuk.",
      title: "Gunakan metode lain",
    },
    backupCodeMfa: {
      subtitle:
        "Kode cadangan Anda adalah yang Anda dapatkan saat menyiapkan verifikasi dua langkah.",
      title: "Masukkan kode cadangan",
    },
    emailCode: {
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "untuk melanjutkan ke {{applicationName}}",
      title: "Periksa email Anda",
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          "Untuk melanjutkan, buka tautan verifikasi di perangkat dan browser yang Anda gunakan untuk memulai masuk",
        title: "Tautan verifikasi tidak valid untuk perangkat ini",
      },
      expired: {
        subtitle: "Kembali ke tab asal untuk melanjutkan.",
        title: "Tautan verifikasi ini telah kedaluwarsa",
      },
      failed: {
        subtitle: "Kembali ke tab asal untuk melanjutkan.",
        title: "Tautan verifikasi ini tidak valid",
      },
      formSubtitle: "Gunakan tautan verifikasi yang dikirim ke email Anda",
      formTitle: "Tautan verifikasi",
      loading: {
        subtitle: "Anda akan segera dialihkan",
        title: "Sedang masuk...",
      },
      resendButton: "Tidak menerima tautan? Kirim ulang",
      subtitle: "untuk melanjutkan ke {{applicationName}}",
      title: "Periksa email Anda",
      unusedTab: {
        title: "Anda dapat menutup tab ini",
      },
      verified: {
        subtitle: "Anda akan segera dialihkan",
        title: "Berhasil masuk",
      },
      verifiedSwitchTab: {
        subtitle: "Kembali ke tab asal untuk melanjutkan",
        subtitleNewTab: "Kembali ke tab yang baru dibuka untuk melanjutkan",
        titleNewTab: "Masuk di tab lain",
      },
    },
    forgotPassword: {
      formTitle: "Kode reset kata sandi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "untuk mereset kata sandi Anda",
      subtitle_email:
        "Pertama, masukkan kode yang dikirim ke alamat email Anda",
      subtitle_phone: "Pertama, masukkan kode yang dikirim ke telepon Anda",
      title: "Reset kata sandi",
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: "Reset kata sandi Anda",
      label__alternativeMethods: "Atau, masuk dengan metode lain",
      title: "Lupa Kata Sandi?",
    },
    noAvailableMethods: {
      message:
        "Tidak dapat melanjutkan masuk. Tidak ada faktor autentikasi yang tersedia.",
      subtitle: "Terjadi kesalahan",
      title: "Tidak dapat masuk",
    },
    passkey: {
      subtitle:
        "Menggunakan passkey mengonfirmasi bahwa ini adalah Anda. Perangkat Anda mungkin meminta sidik jari, wajah, atau kunci layar.",
      title: "Gunakan passkey Anda",
    },
    password: {
      actionLink: "Gunakan metode lain",
      subtitle: "Masukkan kata sandi yang terkait dengan akun Anda",
      title: "Masukkan kata sandi Anda",
    },
    passwordPwned: {
      title: "Kata sandi terkompromi",
    },
    phoneCode: {
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "untuk melanjutkan ke {{applicationName}}",
      title: "Periksa telepon Anda",
    },
    phoneCodeMfa: {
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle:
        "Untuk melanjutkan, masukkan kode verifikasi yang dikirim ke telepon Anda",
      title: "Periksa telepon Anda",
    },
    resetPassword: {
      formButtonPrimary: "Reset Kata Sandi",
      requiredMessage: "Untuk alasan keamanan, Anda harus mereset kata sandi.",
      successMessage:
        "Kata sandi Anda berhasil diubah. Sedang memasukkan Anda, mohon tunggu sebentar.",
      title: "Atur kata sandi baru",
    },
    resetPasswordMfa: {
      detailsLabel:
        "Kami perlu memverifikasi identitas Anda sebelum mereset kata sandi.",
    },
    start: {
      actionLink: "Daftar",
      actionLink__join_waitlist: "Gabung daftar tunggu",
      actionLink__use_email: "Gunakan email",
      actionLink__use_email_username: "Gunakan email atau nama pengguna",
      actionLink__use_passkey: "Gunakan passkey sebagai gantinya",
      actionLink__use_phone: "Gunakan telepon",
      actionLink__use_username: "Gunakan nama pengguna",
      actionText: "Belum punya akun?",
      actionText__join_waitlist: "Ingin akses awal?",
      subtitle: "Selamat datang kembali! Silakan masuk untuk melanjutkan",
      title: "Masuk ke {{applicationName}}",
    },
    totpMfa: {
      formTitle: "Kode verifikasi",
      subtitle:
        "Untuk melanjutkan, masukkan kode verifikasi yang dihasilkan oleh aplikasi autentikator Anda",
      title: "Verifikasi dua langkah",
    },
  },
  signInEnterPasswordTitle: "Masukkan kata sandi Anda",
  signUp: {
    continue: {
      actionLink: "Masuk",
      actionText: "Sudah punya akun?",
      subtitle: "Silakan isi detail yang tersisa untuk melanjutkan.",
      title: "Isi kolom yang kosong",
    },
    emailCode: {
      formSubtitle:
        "Masukkan kode verifikasi yang dikirim ke alamat email Anda",
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "Masukkan kode verifikasi yang dikirim ke email Anda",
      title: "Verifikasi email Anda",
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          "Untuk melanjutkan, buka tautan verifikasi di perangkat dan browser yang Anda gunakan untuk memulai pendaftaran",
        title: "Tautan verifikasi tidak valid untuk perangkat ini",
      },
      formSubtitle:
        "Gunakan tautan verifikasi yang dikirim ke alamat email Anda",
      formTitle: "Tautan verifikasi",
      loading: {
        title: "Sedang mendaftar...",
      },
      resendButton: "Tidak menerima tautan? Kirim ulang",
      subtitle: "untuk melanjutkan ke {{applicationName}}",
      title: "Verifikasi email Anda",
      verified: {
        title: "Berhasil mendaftar",
      },
      verifiedSwitchTab: {
        subtitle: "Kembali ke tab yang baru dibuka untuk melanjutkan",
        subtitleNewTab: "Kembali ke tab sebelumnya untuk melanjutkan",
        title: "Berhasil memverifikasi email",
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy:
          'Saya menyetujui {{ privacyPolicyLink || link("Kebijakan Privasi") }}',
        label__onlyTermsOfService:
          'Saya menyetujui {{ termsOfServiceLink || link("Ketentuan Layanan") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Saya menyetujui {{ termsOfServiceLink || link("Ketentuan Layanan") }} dan {{ privacyPolicyLink || link("Kebijakan Privasi") }}',
      },
      continue: {
        subtitle: "Silakan baca dan setujui ketentuan untuk melanjutkan",
        title: "Persetujuan hukum",
      },
    },
    phoneCode: {
      formSubtitle:
        "Masukkan kode verifikasi yang dikirim ke nomor telepon Anda",
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "Masukkan kode verifikasi yang dikirim ke telepon Anda",
      title: "Verifikasi telepon Anda",
    },
    restrictedAccess: {
      actionLink: "Masuk",
      actionText: "Sudah punya akun?",
      blockButton__emailSupport: "Email dukungan",
      blockButton__joinWaitlist: "Gabung daftar tunggu",
      subtitle:
        "Pendaftaran saat ini dinonaktifkan. Jika Anda yakin seharusnya memiliki akses, silakan hubungi dukungan.",
      subtitleWaitlist:
        "Pendaftaran saat ini dinonaktifkan. Untuk menjadi yang pertama tahu saat kami meluncur, bergabunglah dengan daftar tunggu.",
      title: "Akses dibatasi",
    },
    start: {
      actionLink: "Masuk",
      actionLink__use_email: "Gunakan email sebagai gantinya",
      actionLink__use_phone: "Gunakan telepon sebagai gantinya",
      actionText: "Sudah punya akun?",
      subtitle: "Selamat datang! Silakan isi detail untuk memulai.",
      title: "Buat akun Anda",
    },
  },
  socialButtonsBlockButton: "Lanjutkan dengan {{provider|titleize}}",
  socialButtonsBlockButtonManyInView: "{{provider|titleize}}",
  unstable__errors: {
    already_a_member_in_organization:
      "{{email}} sudah menjadi anggota organisasi.",
    captcha_invalid:
      "Pendaftaran gagal karena validasi keamanan gagal. Silakan muat ulang halaman untuk mencoba lagi atau hubungi dukungan untuk bantuan lebih lanjut.",
    captcha_unavailable:
      "Pendaftaran gagal karena validasi bot gagal. Silakan muat ulang halaman untuk mencoba lagi atau hubungi dukungan untuk bantuan lebih lanjut.",
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address:
      "Alamat email ini sudah digunakan. Silakan coba yang lain.",
    form_identifier_exists__phone_number:
      "Nomor telepon ini sudah digunakan. Silakan coba yang lain.",
    form_identifier_exists__username:
      "Nama pengguna ini sudah digunakan. Silakan coba yang lain.",
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address:
      "Alamat email harus berupa alamat email yang valid.",
    form_param_format_invalid__phone_number:
      "Nomor telepon harus dalam format internasional yang valid",
    form_param_max_length_exceeded__first_name:
      "Nama depan tidak boleh lebih dari 256 karakter.",
    form_param_max_length_exceeded__last_name:
      "Nama belakang tidak boleh lebih dari 256 karakter.",
    form_param_max_length_exceeded__name:
      "Nama tidak boleh lebih dari 256 karakter.",
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: "Kata sandi Anda tidak cukup kuat.",
    form_password_pwned:
      "Kata sandi ini telah ditemukan sebagai bagian dari kebocoran data dan tidak dapat digunakan, silakan coba kata sandi lain.",
    form_password_pwned__sign_in:
      "Kata sandi ini telah ditemukan sebagai bagian dari kebocoran data dan tidak dapat digunakan, silakan reset kata sandi Anda.",
    form_password_size_in_bytes_exceeded:
      "Kata sandi Anda telah melebihi jumlah byte maksimum yang diizinkan, silakan persingkat atau hapus beberapa karakter khusus.",
    form_password_validation_failed: "Kata Sandi Salah",
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed:
      "Anda tidak dapat menghapus identifikasi terakhir Anda.",
    not_allowed_access: undefined,
    organization_domain_blocked:
      "Ini adalah domain penyedia email yang diblokir. Silakan gunakan yang lain.",
    organization_domain_common:
      "Ini adalah domain penyedia email umum. Silakan gunakan yang lain.",
    organization_membership_quota_exceeded:
      "Anda telah mencapai batas keanggotaan organisasi, termasuk undangan yang belum selesai.",
    organization_minimum_permissions_needed:
      "Harus ada setidaknya satu anggota organisasi dengan izin minimum yang diperlukan.",
    passkey_already_exists: "Passkey sudah terdaftar di perangkat ini.",
    passkey_not_supported: "Passkey tidak didukung di perangkat ini.",
    passkey_pa_not_supported:
      "Pendaftaran memerlukan platform autentikator tetapi perangkat tidak mendukungnya.",
    passkey_registration_cancelled:
      "Pendaftaran passkey dibatalkan atau waktu habis.",
    passkey_retrieval_cancelled:
      "Verifikasi passkey dibatalkan atau waktu habis.",
    passwordComplexity: {
      maximumLength: "kurang dari {{length}} karakter",
      minimumLength: "{{length}} karakter atau lebih",
      requireLowercase: "huruf kecil",
      requireNumbers: "angka",
      requireSpecialCharacter: "karakter khusus",
      requireUppercase: "huruf besar",
      sentencePrefix: "Kata sandi Anda harus mengandung",
    },
    phone_number_exists:
      "Nomor telepon ini sudah digunakan. Silakan coba yang lain.",
    zxcvbn: {
      couldBeStronger:
        "Kata sandi Anda berfungsi, tapi bisa lebih kuat. Coba tambahkan lebih banyak karakter.",
      goodPassword:
        "Kata sandi Anda memenuhi semua persyaratan yang diperlukan.",
      notEnough: "Kata sandi Anda tidak cukup kuat.",
      suggestions: {
        allUppercase: "Kapitalisasi beberapa, tapi tidak semua huruf.",
        anotherWord: "Tambahkan lebih banyak kata yang kurang umum.",
        associatedYears: "Hindari tahun yang terkait dengan Anda.",
        capitalization: "Kapitalisasi lebih dari huruf pertama.",
        dates: "Hindari tanggal dan tahun yang terkait dengan Anda.",
        l33t: "Hindari penggantian huruf yang dapat diprediksi seperti '@' untuk 'a'.",
        longerKeyboardPattern:
          "Gunakan pola keyboard yang lebih panjang dan ubah arah pengetikan beberapa kali.",
        noNeed:
          "Anda dapat membuat kata sandi yang kuat tanpa menggunakan simbol, angka, atau huruf besar.",
        pwned:
          "Jika Anda menggunakan kata sandi ini di tempat lain, Anda harus mengubahnya.",
        recentYears: "Hindari tahun-tahun terakhir.",
        repeated: "Hindari kata dan karakter yang berulang.",
        reverseWords: "Hindari ejaan terbalik dari kata-kata umum.",
        sequences: "Hindari urutan karakter umum.",
        useWords: "Gunakan beberapa kata, tapi hindari frasa umum.",
      },
      warnings: {
        common: "Ini adalah kata sandi yang umum digunakan.",
        commonNames: "Nama dan nama keluarga yang umum mudah ditebak.",
        dates: "Tanggal mudah ditebak.",
        extendedRepeat:
          'Pola karakter berulang seperti "abcabcabc" mudah ditebak.',
        keyPattern: "Pola keyboard pendek mudah ditebak.",
        namesByThemselves: "Nama tunggal atau nama keluarga mudah ditebak.",
        pwned:
          "Kata sandi Anda telah terekspos oleh kebocoran data di Internet.",
        recentYears: "Tahun-tahun terakhir mudah ditebak.",
        sequences: 'Urutan karakter umum seperti "abc" mudah ditebak.',
        similarToCommon: "Ini mirip dengan kata sandi yang umum digunakan.",
        simpleRepeat: 'Karakter berulang seperti "aaa" mudah ditebak.',
        straightRow: "Baris lurus tombol di keyboard Anda mudah ditebak.",
        topHundred: "Ini adalah kata sandi yang sering digunakan.",
        topTen: "Ini adalah kata sandi yang sangat sering digunakan.",
        userInputs: "Seharusnya tidak ada data pribadi atau terkait halaman.",
        wordByItself: "Kata tunggal mudah ditebak.",
      },
    },
  },
  userButton: {
    action__addAccount: "Tambah akun",
    action__manageAccount: "Kelola akun",
    action__signOut: "Keluar",
    action__signOutAll: "Keluar dari semua akun",
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: "Disalin!",
      actionLabel__copy: "Salin semua",
      actionLabel__download: "Unduh .txt",
      actionLabel__print: "Cetak",
      infoText1: "Kode cadangan akan diaktifkan untuk akun ini.",
      infoText2:
        "Jaga kerahasiaan kode cadangan dan simpan dengan aman. Anda dapat membuat ulang kode cadangan jika mencurigai telah disusupi.",
      subtitle__codelist: "Simpan dengan aman dan jaga kerahasiaannya.",
      successMessage:
        "Kode cadangan sekarang diaktifkan. Anda dapat menggunakan salah satu dari ini untuk masuk ke akun Anda, jika kehilangan akses ke perangkat autentikasi. Setiap kode hanya dapat digunakan sekali.",
      successSubtitle:
        "Anda dapat menggunakan salah satu dari ini untuk masuk ke akun Anda, jika kehilangan akses ke perangkat autentikasi.",
      title: "Tambah verifikasi kode cadangan",
      title__codelist: "Kode cadangan",
    },
    connectedAccountPage: {
      formHint: "Pilih penyedia untuk menghubungkan akun Anda.",
      formHint__noAccounts: "Tidak ada penyedia akun eksternal yang tersedia.",
      removeResource: {
        messageLine1: "{{identifier}} akan dihapus dari akun ini.",
        messageLine2:
          "Anda tidak akan dapat menggunakan akun terhubung ini dan fitur terkait tidak akan berfungsi lagi.",
        successMessage: "{{connectedAccount}} telah dihapus dari akun Anda.",
        title: "Hapus akun terhubung",
      },
      socialButtonsBlockButton: "{{provider|titleize}}",
      successMessage: "Penyedia telah ditambahkan ke akun Anda",
      title: "Tambah akun terhubung",
    },
    deletePage: {
      actionDescription: 'Ketik "Delete account" di bawah untuk melanjutkan.',
      confirm: "Hapus akun",
      messageLine1: "Anda yakin ingin menghapus akun Anda?",
      messageLine2: "Tindakan ini permanen dan tidak dapat dibatalkan.",
      title: "Hapus akun",
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          "Email berisi kode verifikasi akan dikirim ke alamat email ini.",
        formSubtitle: "Masukkan kode verifikasi yang dikirim ke {{identifier}}",
        formTitle: "Kode verifikasi",
        resendButton: "Tidak menerima kode? Kirim ulang",
        successMessage: "Email {{identifier}} telah ditambahkan ke akun Anda.",
      },
      emailLink: {
        formHint:
          "Email berisi tautan verifikasi akan dikirim ke alamat email ini.",
        formSubtitle:
          "Klik tautan verifikasi di email yang dikirim ke {{identifier}}",
        formTitle: "Tautan verifikasi",
        resendButton: "Tidak menerima tautan? Kirim ulang",
        successMessage: "Email {{identifier}} telah ditambahkan ke akun Anda.",
      },
      removeResource: {
        messageLine1: "{{identifier}} akan dihapus dari akun ini.",
        messageLine2:
          "Anda tidak akan dapat masuk menggunakan alamat email ini.",
        successMessage: "{{emailAddress}} telah dihapus dari akun Anda.",
        title: "Hapus alamat email",
      },
      title: "Tambah alamat email",
      verifyTitle: "Verifikasi alamat email",
    },
    formButtonPrimary__add: "Tambah",
    formButtonPrimary__continue: "Lanjutkan",
    formButtonPrimary__finish: "Selesai",
    formButtonPrimary__remove: "Hapus",
    formButtonPrimary__save: "Simpan",
    formButtonReset: "Batal",
    mfaPage: {
      formHint: "Pilih metode untuk ditambahkan.",
      title: "Tambah verifikasi dua langkah",
    },
    navbar: {
      account: "Profil",
      description: "Kelola info akun Anda.",
      security: "Keamanan",
      title: "Akun",
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        "Disarankan untuk keluar dari semua perangkat lain yang mungkin menggunakan kata sandi lama Anda.",
      readonly:
        "Kata sandi Anda saat ini tidak dapat diedit karena Anda hanya dapat masuk melalui koneksi enterprise.",
      successMessage__set: "Kata sandi Anda telah diatur.",
      successMessage__signOutOfOtherSessions:
        "Semua perangkat lain telah dikeluarkan.",
      successMessage__update: "Kata sandi Anda telah diperbarui.",
      title__set: "Atur kata sandi",
      title__update: "Perbarui kata sandi",
    },
    phoneNumberPage: {
      infoText:
        "Pesan teks berisi kode verifikasi akan dikirim ke nomor telepon ini. Biaya pesan dan data mungkin berlaku.",
      removeResource: {
        messageLine1: "{{identifier}} akan dihapus dari akun ini.",
        messageLine2:
          "Anda tidak akan dapat masuk menggunakan nomor telepon ini.",
        successMessage: "{{phoneNumber}} telah dihapus dari akun Anda.",
        title: "Hapus nomor telepon",
      },
      successMessage: "{{identifier}} telah ditambahkan ke akun Anda.",
      title: "Tambah nomor telepon",
      verifySubtitle: "Masukkan kode verifikasi yang dikirim ke {{identifier}}",
      verifyTitle: "Verifikasi nomor telepon",
    },
    profilePage: {
      fileDropAreaHint: "Ukuran yang disarankan 1:1, hingga 10MB.",
      imageFormDestructiveActionSubtitle: "Hapus",
      imageFormSubtitle: "Unggah",
      imageFormTitle: "Gambar profil",
      readonly:
        "Informasi profil Anda telah disediakan oleh koneksi enterprise dan tidak dapat diedit.",
      successMessage: "Profil Anda telah diperbarui.",
      title: "Perbarui profil",
    },
  },
  reverification: {
    alternativeMethods: {
      actionLink: "Dapatkan bantuan",
      actionText: "Tidak memiliki salah satu dari ini?",
      blockButton__backupCode: "Gunakan kode cadangan",
      blockButton__emailCode: "Kirim kode ke {{identifier}}",
      blockButton__password: "Lanjutkan dengan kata sandi Anda",
      blockButton__phoneCode: "Kirim kode SMS ke {{identifier}}",
      blockButton__totp: "Gunakan aplikasi autentikator Anda",
      getHelp: {
        blockButton__emailSupport: "Email dukungan",
        content:
          "Jika Anda kesulitan memverifikasi akun, email kami dan kami akan membantu memulihkan akses secepat mungkin.",
        title: "Dapatkan bantuan",
      },
      subtitle:
        "Mengalami masalah? Anda dapat menggunakan salah satu metode ini untuk verifikasi.",
      title: "Gunakan metode lain",
    },
    backupCodeMfa: {
      subtitle:
        "Masukkan kode cadangan yang Anda terima saat menyiapkan autentikasi dua langkah",
      title: "Masukkan kode cadangan",
    },
    emailCode: {
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "Masukkan kode yang dikirim ke email Anda untuk melanjutkan",
      title: "Verifikasi diperlukan",
    },
    noAvailableMethods: {
      message:
        "Tidak dapat melanjutkan verifikasi. Tidak ada faktor autentikasi yang sesuai dikonfigurasi",
      subtitle: "Terjadi kesalahan",
      title: "Tidak dapat memverifikasi akun Anda",
    },
    password: {
      actionLink: "Gunakan metode lain",
      subtitle: "Masukkan kata sandi Anda untuk melanjutkan",
      title: "Verifikasi diperlukan",
    },
    phoneCode: {
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "Masukkan kode yang dikirim ke telepon Anda untuk melanjutkan",
      title: "Verifikasi diperlukan",
    },
    phoneCodeMfa: {
      formTitle: "Kode verifikasi",
      resendButton: "Tidak menerima kode? Kirim ulang",
      subtitle: "Masukkan kode yang dikirim ke telepon Anda untuk melanjutkan",
      title: "Verifikasi diperlukan",
    },
    totpMfa: {
      formTitle: "Kode verifikasi",
      subtitle:
        "Masukkan kode yang dihasilkan oleh aplikasi autentikator Anda untuk melanjutkan",
      title: "Verifikasi diperlukan",
    },
  },
  waitlist: {
    start: {
      actionLink: "Masuk",
      actionText: "Sudah punya akses?",
      formButton: "Gabung daftar tunggu",
      subtitle:
        "Masukkan alamat email Anda dan kami akan memberi tahu ketika tempat Anda siap",
      title: "Gabung daftar tunggu",
    },
    success: {
      message: "Anda akan segera dialihkan...",
      subtitle: "Kami akan menghubungi ketika tempat Anda siap",
      title: "Terima kasih telah bergabung dengan daftar tunggu!",
    },
  },
} as const;
