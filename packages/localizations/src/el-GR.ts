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

export const elGR: LocalizationResource = {
  locale: 'el-GR',
  backButton: 'Πίσω',
  badge__default: 'Προεπιλογή',
  badge__otherImpersonatorDevice: 'Άλλη συσκευή υποδυόμενου',
  badge__primary: 'Κύριο',
  badge__requiresAction: 'Απαιτεί ενέργεια',
  badge__thisDevice: 'Αυτή η συσκευή',
  badge__unverified: 'Μη επαληθευμένο',
  badge__userDevice: 'Συσκευή χρήστη',
  badge__you: 'Εσείς',
  createOrganization: {
    formButtonSubmit: 'Δημιουργία οργανισμού',
    invitePage: {
      formButtonReset: 'Παράλειψη',
    },
    title: 'Δημιουργία Οργανισμού',
  },
  dates: {
    lastDay: "Χθες στις {{ date | timeString('el') }}",
    next6Days: "{{ date | weekday('el','long') }} στις {{ date | timeString('el') }}",
    nextDay: "Αύριο στις {{ date | timeString('el') }}",
    numeric: "{{ date | numeric('el') }}",
    previous6Days: "Τελευταία {{ date | weekday('el','long') }} στις {{ date | timeString('el') }}",
    sameDay: "Σήμερα στις {{ date | timeString('el') }}",
  },
  dividerText: 'ή',
  footerActionLink__useAnotherMethod: 'Χρησιμοποιήστε άλλη μέθοδο',
  footerPageLink__help: 'Βοήθεια',
  footerPageLink__privacy: 'Προστασία προσωπικών δεδομένων',
  footerPageLink__terms: 'Όροι',
  formButtonPrimary: 'Συνέχεια',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Ξεχάσατε τον κωδικό;',
  formFieldError__matchingPasswords: 'Οι κωδικοί ταιριάζουν.',
  formFieldError__notMatchingPasswords: 'Οι κωδικοί δεν ταιριάζουν.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Προαιρετικό',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses:
    'Εισαγάγετε ή επικολλήστε μία ή περισσότερες διευθύνσεις email, χωρισμένες με κενά ή κόμματα',
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
  formFieldLabel__backupCode: 'Αντίγραφο ασφαλείας κωδικού',
  formFieldLabel__confirmDeletion: 'Επιβεβαίωση',
  formFieldLabel__confirmPassword: 'Επιβεβαίωση κωδικού πρόσβασης',
  formFieldLabel__currentPassword: 'Τρέχων κωδικός πρόσβασης',
  formFieldLabel__emailAddress: 'Διεύθυνση email',
  formFieldLabel__emailAddress_username: 'Διεύθυνση email ή όνομα χρήστη',
  formFieldLabel__emailAddresses: 'Διευθύνσεις email',
  formFieldLabel__firstName: 'Όνομα',
  formFieldLabel__lastName: 'Επώνυμο',
  formFieldLabel__newPassword: 'Νέος κωδικός πρόσβασης',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Όνομα οργανισμού',
  formFieldLabel__organizationSlug: 'Συντόμευση URL',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Κωδικός πρόσβασης',
  formFieldLabel__phoneNumber: 'Αριθμός τηλεφώνου',
  formFieldLabel__role: 'Ρόλος',
  formFieldLabel__signOutOfOtherSessions: 'Αποσύνδεση από όλες τις άλλες συσκευές',
  formFieldLabel__username: 'Όνομα χρήστη',
  impersonationFab: {
    action__signOut: 'Αποσύνδεση',
    title: 'Είστε συνδεδεμένος ως {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Διαχειριστής',
  membershipRole__basicMember: 'Μέλος',
  membershipRole__guestMember: 'Επισκέπτης',
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
      detailsTitle__inviteFailed:
        'Οι προσκλήσεις δεν μπορούσαν να σταλούν. Διορθώστε τα παρακάτω στοιχεία και δοκιμάστε ξανά:',
      formButtonPrimary__continue: 'Αποστολή προσκλήσεων',
      selectDropdown__role: 'Select role',
      subtitle: 'Προσκαλέστε νέα μέλη σε αυτόν τον οργανισμό',
      successMessage: 'Οι προσκλήσεις εστάλησαν με επιτυχία',
      title: 'Πρόσκληση μελών',
    },
    membersPage: {
      action__invite: 'Πρόσκληση',
      activeMembersTab: {
        menuAction__remove: 'Αφαίρεση μέλους',
        tableHeader__actions: undefined,
        tableHeader__joined: 'Εγγραφήκατε',
        tableHeader__role: 'Ρόλος',
        tableHeader__user: 'Χρήστης',
      },
      detailsTitle__emptyRow: 'Δεν υπάρχουν μέλη για εμφάνιση',
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
        menuAction__revoke: 'Ανάκληση πρόσκλησης',
        tableHeader__invited: 'Προσκεκλημένο',
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
          actionDescription: 'Πληκτρολογήστε το {{organizationName}} παρακάτω για να συνεχίσετε.',
          messageLine1: 'Είστε σίγουρος ότι θέλετε να διαγράψετε αυτόν τον οργανισμό;',
          messageLine2: 'Αυτή η ενέργεια είναι μόνιμη και και μη αναστρέψιμη.',
          successMessage: 'Έχετε διαγράψει τον οργανισμό.',
          title: 'Διαγραφή οργανισμού',
        },
        leaveOrganization: {
          actionDescription: 'Πληκτρολογήστε το {{organizationName}} παρακάτω για να συνεχίσετε.',
          messageLine1:
            'Είστε σίγουρος ότι θέλετε να αποχωρήσετε από αυτόν τον οργανισμό; Θα χάσετε την πρόσβαση σε αυτόν τον οργανισμό και τις εφαρμογές του.',
          messageLine2: 'Αυτή η ενέργεια είναι μόνιμη και και μη αναστρέψιμη.',
          successMessage: 'Έχετε αποχωρήσει από τον οργανισμό.',
          title: 'Αποχώρηση από τον οργανισμό',
        },
        title: 'Κίνδυνος',
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
      successMessage: 'Ο οργανισμός έχει ενημερωθεί.',
      title: 'Προφίλ Οργανισμού',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Μέλη',
      profileSection: {
        primaryButton: 'Ενημέρωση προφίλ',
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
    action__createOrganization: 'Δημιουργία Οργανισμού',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Διαχείριση Οργανισμού',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Δεν έχει επιλεγεί οργανισμός',
    personalWorkspace: 'Προσωπικός Χώρος Εργασίας',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Επόμενο',
  paginationButton__previous: 'Προηγούμενο',
  paginationRowText__displaying: 'Εμφάνιση',
  paginationRowText__of: 'από',
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
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Λήψη βοήθειας',
      actionText: 'Δεν έχετε κανένα από αυτά;',
      blockButton__backupCode: 'Χρήση ενός εφεδρικού κωδικού',
      blockButton__emailCode: 'Αποστολή κωδικού με email στο {{identifier}}',
      blockButton__emailLink: 'Αποστολή συνδέσμου στο {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Σύνδεση με τον κωδικό πρόσβασής σας',
      blockButton__phoneCode: 'Αποστολή κωδικού SMS στο {{identifier}}',
      blockButton__totp: 'Χρήση της εφαρμογής αυθεντικοποίησης',
      getHelp: {
        blockButton__emailSupport: 'Υποστήριξη μέσω email',
        content:
          'Εάν αντιμετωπίζετε δυσκολία στη σύνδεση στον λογαριασμό σας, στείλτε μας email και θα επικοινωνήσουμε μαζί σας για να αποκαταστήσουμε την πρόσβαση το συντομότερο δυνατόν.',
        title: 'Λήψη βοήθειας',
      },
      subtitle:
        'Αντιμετωπίζετε δυσκολίες; Μπορείτε να χρησιμοποιήσετε οποιαδήποτε από αυτές τις μεθόδους για να συνδεθείτε.',
      title: 'Χρήση μιας άλλης μεθόδου',
    },
    backupCodeMfa: {
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Εισαγωγή ενός εφεδρικού κωδικού',
    },
    emailCode: {
      formTitle: 'Κωδικός επαλήθευσης',
      resendButton: 'Δεν λάβατε κωδικό; Αποστολή ξανά',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Ελέγξτε το email σας',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      expired: {
        subtitle: 'Επιστροφή στην αρχική καρτέλα για να συνεχίσετε.',
        title: 'Αυτός ο σύνδεσμος επαλήθευσης έχει λήξει',
      },
      failed: {
        subtitle: 'Επιστροφή στην αρχική καρτέλα για να συνεχίσετε.',
        title: 'Αυτός ο σύνδεσμος επαλήθευσης δεν είναι έγκυρος',
      },
      formSubtitle: 'Χρησιμοποιήστε τον σύνδεσμο επαλήθευσης που απεστάλη στο email σας',
      formTitle: 'Σύνδεσμος επαλήθευσης',
      loading: {
        subtitle: 'Θα ανακατευθυνθείτε σύντομα',
        title: 'Σύνδεση σε εξέλιξη...',
      },
      resendButton: 'Δεν λάβατε σύνδεσμο; Αποστολή ξανά',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Ελέγξτε το email σας',
      unusedTab: {
        title: 'Μπορείτε να κλείσετε αυτήν την καρτέλα',
      },
      verified: {
        subtitle: 'Θα ανακατευθυνθείτε σύντομα',
        title: 'Επιτυχής σύνδεση',
      },
      verifiedSwitchTab: {
        subtitle: 'Επιστροφή στην αρχική καρτέλα για να συνεχίσετε',
        subtitleNewTab: 'Επιστροφή στη νέα καρτέλα που άνοιξε για να συνεχίσετε',
        titleNewTab: 'Έχετε συνδεθεί σε άλλη καρτέλα',
      },
    },
    forgotPassword: {
      formTitle: 'Επαναφορά κωδικού πρόσβασης',
      resendButton: 'Δεν λάβατε κωδικό; Αποστολή ξανά',
      subtitle: 'για να επαναφέρετε τον κωδικό σας',
      subtitle_email: 'Πρώτα, εισάγετε τον κωδικό που στάλθηκε στη διεύθυνση email σας',
      subtitle_phone: 'Πρώτα, εισάγετε τον κωδικό που στάλθηκε στο τηλέφωνό σας',
      title: 'Επαναφορά κωδικού πρόσβασης',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Επαναφορά κωδικού πρόσβασης',
      label__alternativeMethods: 'Ή, συνδεθείτε με μια άλλη μέθοδο.',
      title: 'Ξεχάσατε τον κωδικό πρόσβασης;',
    },
    noAvailableMethods: {
      message: 'Δεν είναι δυνατή η σύνδεση. Δεν υπάρχει διαθέσιμος παράγοντας αυθεντικοποίησης.',
      subtitle: 'Προέκυψε σφάλμα',
      title: 'Δεν είναι δυνατή η σύνδεση',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Χρήση άλλης μεθόδου',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Εισαγωγή κωδικού πρόσβασης',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Κωδικός επαλήθευσης',
      resendButton: 'Δεν λάβατε κωδικό; Αποστολή ξανά',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Ελέγξτε το τηλέφωνό σας',
    },
    phoneCodeMfa: {
      formTitle: 'Κωδικός επαλήθευσης',
      resendButton: 'Δεν λάβατε κωδικό; Αποστολή ξανά',
      subtitle: undefined,
      title: 'Ελέγξτε το τηλέφωνό σας',
    },
    resetPassword: {
      formButtonPrimary: 'Επαναφορά κωδικού πρόσβασης',
      requiredMessage:
        'Υπάρχει ήδη λογαριασμός με μη επαληθευμένη διεύθυνση email. Παρακαλούμε επαναφέρετε τον κωδικό σας για λόγους ασφαλείας.',
      successMessage: 'Ο κωδικός πρόσβασής σας έχει αλλάξει με επιτυχία. Σας συνδέουμε, παρακαλώ περιμένετε.',
      title: 'Επαναφορά κωδικού πρόσβασης',
    },
    resetPasswordMfa: {
      detailsLabel: 'Πρέπει να επαληθεύσουμε την ταυτότητά σας πριν επαναφέρουμε τον κωδικό πρόσβασής σας.',
    },
    start: {
      actionLink: 'Εγγραφή',
      actionLink__join_waitlist: undefined,
      actionLink__use_email: 'Χρήση email',
      actionLink__use_email_username: 'Χρήση email ή ονόματος χρήστη',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Χρήση τηλεφώνου',
      actionLink__use_username: 'Χρήση ονόματος χρήστη',
      actionText: 'Δεν έχετε λογαριασμό;',
      actionText__join_waitlist: undefined,
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Σύνδεση',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Κωδικός επαλήθευσης',
      subtitle: undefined,
      title: 'Aυθεντικοποίηση δύο βημάτων',
    },
  },
  signInEnterPasswordTitle: 'Εισαγωγή κωδικού πρόσβασης',
  signUp: {
    continue: {
      actionLink: 'Σύνδεση',
      actionText: 'Έχετε ήδη λογαριασμό;',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Συμπληρώστε τα απαραίτητα πεδία',
    },
    emailCode: {
      formSubtitle: 'Εισαγάγετε τον κωδικό επαλήθευσης που απεστάλη στο email σας',
      formTitle: 'Κωδικός επαλήθευσης',
      resendButton: 'Δεν λάβατε κωδικό; Αποστολή ξανά',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Επαληθεύστε το email σας',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      formSubtitle: 'Χρησιμοποιήστε τον σύνδεσμο επαλήθευσης που απεστάλη στη διεύθυνση email σας',
      formTitle: 'Σύνδεσμος επαλήθευσης',
      loading: {
        title: 'Εγγραφή σε εξέλιξη...',
      },
      resendButton: 'Δεν λάβατε σύνδεσμο; Αποστολή ξανά',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Επαληθεύστε το email σας',
      verified: {
        title: 'Επιτυχής εγγραφή',
      },
      verifiedSwitchTab: {
        subtitle: 'Επιστροφή στη νέα καρτέλα για να συνεχίσετε',
        subtitleNewTab: 'Επιστροφή στην προηγούμενη καρτέλα για να συνεχίσετε',
        title: 'Επιτυχής επαλήθευση email',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Συμφωνώ με την {{ privacyPolicyLink || link("Πολιτική Απορρήτου") }}',
        label__onlyTermsOfService: 'Συμφωνώ με τους {{ termsOfServiceLink || link("Όρους Χρήσης") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Συμφωνώ με τους {{ termsOfServiceLink || link("Όρους Χρήσης") }} και την {{ privacyPolicyLink || link("Πολιτική Απορρήτου") }}',
      },
      continue: {
        subtitle: 'Παρακαλώ διαβάστε και αποδεχτείτε τους όρους για να συνεχίσετε',
        title: 'Νομική συναίνεση',
      },
    },
    phoneCode: {
      formSubtitle: 'Εισαγάγετε τον κωδικό επαλήθευσης που απεστάλη στον αριθμό τηλεφώνου σας',
      formTitle: 'Κωδικός επαλήθευσης',
      resendButton: 'Δεν λάβατε κωδικό; Αποστολή ξανά',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Επαληθεύστε το τηλέφωνό σας',
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
      actionLink: 'Σύνδεση',
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'Έχετε ήδη λογαριασμό;',
      subtitle: 'για να συνεχίσετε στο {{applicationName}}',
      title: 'Δημιουργήστε τον λογαριασμό σας',
    },
  },
  socialButtonsBlockButton: 'Συνέχεια με {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'Η εγγραφή απέτυχε λόγω αποτυχημένων ελέγχων ασφαλείας. Ανανεώστε τη σελίδα για να δοκιμάσετε ξανά ή επικοινωνήστε με το κέντρο υποστήριξης για περισσότερη βοήθεια.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Η διεύθυνση email πρέπει να είναι μια έγκυρη διεύθυνση email.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'Ο κωδικός πρόσβασής σας δεν είναι αρκετά ισχυρός.',
    form_password_pwned:
      'Αυτός ο κωδικός πρόσβασης έχει διαρρεύσει online στο παρελθόν και δεν μπορεί να χρησιμοποιηθεί. Δοκιμάστε έναν άλλο κωδικό πρόσβασης αντί για αυτόν.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Ο κωδικός πρόσβασής σας έχει υπερβεί το μέγιστο αριθμό bytes που επιτρέπεται. Παρακαλούμε, συντομεύστε τον ή αφαιρέστε μερικούς ειδικούς χαρακτήρες.',
    form_password_validation_failed: 'Λανθασμένος κωδικός',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'Δεν μπορείτε να διαγράψετε το τελευταίο στοιχείο ταυτοποιησής σας.',
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: 'λιγότερους από {{length}} χαρακτήρες',
      minimumLength: '{{length}} ή περισσότερους χαρακτήρες',
      requireLowercase: 'ένα πεζό γράμμα',
      requireNumbers: 'έναν αριθμό',
      requireSpecialCharacter: 'ένα ειδικό χαρακτήρα',
      requireUppercase: 'ένα κεφαλαίο γράμμα',
      sentencePrefix: 'Ο κωδικός πρόσβασής σας πρέπει να περιέχει',
    },
    phone_number_exists: 'Αυτός ο αριθμός τηλεφώνου χρησιμοποιείται ήδη. Δοκιμάστε έναν άλλο.',
    zxcvbn: {
      couldBeStronger:
        'Ο κωδικός πρόσβασής σας είναι αρκετός, αλλά θα μπορούσε να είναι πιο ισχυρός. Δοκιμάστε να προσθέσετε περισσότερους χαρακτήρες.',
      goodPassword: 'Ο κωδικός πρόσβασής σας πληροί όλες τις απαιτούμενες προδιαγραφές.',
      notEnough: 'Ο κωδικός πρόσβασής σας δεν είναι αρκετά ισχυρός.',
      suggestions: {
        allUppercase: 'Έχετε μόνο μερικά κεφαλαία γράμματα.',
        anotherWord: 'Προσθέστε περισσότερες λέξεις που είναι λιγότερο συνηθισμένες.',
        associatedYears: 'Αποφύγετε έτη που σας αφορούν.',
        capitalization: 'Μην έχετε κεφαλαίο μόνο το πρώτο γράμμα.',
        dates: 'Αποφύγετε ημερομηνίες και έτη που σας αφορούν.',
        l33t: "Αποφύγετε προβλέψιμες αντικαταστάσεις γραμμάτων όπως '@' για 'a'.",
        longerKeyboardPattern:
          'Χρησιμοποιήστε μεγαλύτερα μοτίβα πληκτρολογίου και αλλάξτε πολλές φορές την κατεύθυνση πληκτρολόγησης.',
        noNeed:
          'Μπορείτε να δημιουργήσετε ισχυρούς κωδικούς πρόσβασης χωρίς τη χρήση συμβόλων, αριθμών ή κεφαλαίων γραμμάτων.',
        pwned: 'Αν χρησιμοποιείτε αυτόν τον κωδικό πρόσβασης και αλλού, θα πρέπει να τον αλλάξετε.',
        recentYears: 'Αποφύγετε πρόσφατα έτη.',
        repeated: 'Αποφύγετε επαναλαμβανόμενες λέξεις και χαρακτήρες.',
        reverseWords: 'Αποφύγετε αντιστροφές συνηθισμένων λέξεων.',
        sequences: 'Αποφύγετε κοινές ακολουθίες χαρακτήρων.',
        useWords: 'Χρησιμοποιήστε πολλές λέξεις, αλλά αποφύγετε κοινές φράσεις.',
      },
      warnings: {
        common: 'Αυτός είναι ένας κοινός κωδικός πρόσβασης.',
        commonNames: 'Συνηθισμένα ονόματα και επώνυμα είναι εύκολα να μαντευτούν.',
        dates: 'Ημερομηνίες είναι εύκολες να μαντευτούν.',
        extendedRepeat: 'Επαναλαμβανόμενα μοτίβα χαρακτήρων όπως "abcabcabc" είναι εύκολα να μαντευτούν.',
        keyPattern: 'Σύντομα μοτίβα πληκτρολογίου είναι εύκολα να μαντευτούν.',
        namesByThemselves: 'Μεμονωμένα ονόματα ή επώνυμα είναι εύκολα να μαντευτούν.',
        pwned: 'Ο κωδικός πρόσβασής σας αποκαλύφθηκε από παραβίαση δεδομένων στο διαδίκτυο.',
        recentYears: 'Πρόσφατα έτη είναι εύκολα να μαντευτούν.',
        sequences: 'Συνηθισμένες ακολουθίες χαρακτήρων όπως "abc" είναι εύκολα να μαντευτούν.',
        similarToCommon: 'Αυτός είναι παρόμοιος με έναν κοινό κωδικό πρόσβασης.',
        simpleRepeat: 'Επαναλαμβανόμενοι χαρακτήρες όπως "aaa" είναι εύκολο να μαντευτούν.',
        straightRow: 'Σειρές γραμμάτων στο πληκτρολόγιο είναι εύκολα να μαντευτούν.',
        topHundred: 'Αυτός είναι ένας συχνά χρησιμοποιούμενος κωδικός πρόσβασης.',
        topTen: 'Αυτός είναι ένας πολύ διαδεδομένος κωδικός πρόσβασης.',
        userInputs: 'Δεν πρέπει να υπάρχουν προσωπικά ή σχετικά με τη σελίδα δεδομένα.',
        wordByItself: 'Οι μεμονωμένες λέξεις είναι εύκολες να μαντευτούν.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Προσθήκη λογαριασμού',
    action__manageAccount: 'Διαχείριση λογαριασμού',
    action__signOut: 'Αποσύνδεση',
    action__signOutAll: 'Αποσύνδεση από όλους τους λογαριασμούς',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Αντιγράφηκαν!',
      actionLabel__copy: 'Αντιγραφή όλων',
      actionLabel__download: 'Λήψη .txt',
      actionLabel__print: 'Εκτύπωση',
      infoText1: 'Οι εφεδρικοί κωδικοί θα είναι ενεργοποιημένοι για αυτόν τον λογαριασμό.',
      infoText2:
        'Φυλάξτε τους εφεδρικούς κωδικούς μυστικούς και αποθηκεύστε τους με ασφάλεια. Μπορείτε να δημιουργήσετε νέους εφεδρικούς κωδικούς εάν υποψιάζεστε ότι έχουν διαρρεύσει.',
      subtitle__codelist: 'Φυλάξτε τους με ασφάλεια και κρατήστε τους μυστικούς.',
      successMessage:
        'Οι εφεδρικοί κωδικοί είναι πλέον ενεργοποιημένοι. Μπορείτε να χρησιμοποιήσετε έναν από αυτούς για να συνδεθείτε στον λογαριασμό σας, εάν χάσετε την πρόσβαση στη συσκευή επαλήθευσής σας. Κάθε κωδικός μπορεί να χρησιμοποιηθεί μόνο μία φορά.',
      successSubtitle:
        'Μπορείτε να χρησιμοποιήσετε έναν από αυτούς για να συνδεθείτε στον λογαριασμό σας, εάν χάσετε την πρόσβαση στη συσκευή επαλήθευσής σας.',
      title: 'Προσθήκη επαλήθευσης με εφεδρικούς κωδικούς',
      title__codelist: 'Εφεδρικοί κωδικοί',
    },
    connectedAccountPage: {
      formHint: 'Επιλέξτε έναν πάροχο για να συνδέσετε τον λογαριασμό σας.',
      formHint__noAccounts: 'Δεν υπάρχουν διαθέσιμοι πάροχοι εξωτερικών λογαριασμών.',
      removeResource: {
        messageLine1: 'Ο {{identifier}} θα αφαιρεθεί από αυτόν τον λογαριασμό.',
        messageLine2:
          'Δεν θα μπορείτε πλέον να χρησιμοποιήσετε αυτόν τον συνδεδεμένο λογαριασμό και οποιεσδήποτε εξαρτημένες λειτουργίες δεν θα λειτουργούν πλέον.',
        successMessage: 'Ο {{connectedAccount}} έχει αφαιρεθεί από τον λογαριασμό σας.',
        title: 'Αφαίρεση συνδεδεμένου λογαριασμού',
      },
      socialButtonsBlockButton: 'Σύνδεση με τον λογαριασμό {{provider|titleize}}',
      successMessage: 'Ο πάροχος έχει προστεθεί στον λογαριασμό σας',
      title: 'Προσθήκη συνδεδεμένου λογαριασμού',
    },
    deletePage: {
      actionDescription: 'Πληκτρολογήστε "Διαγραφή λογαριασμού" παρακάτω για να συνεχίσετε.',
      confirm: 'Διαγραφή λογαριασμού',
      messageLine1: 'Είστε βέβαιος ότι θέλετε να διαγράψετε τον λογαριασμό σας;',
      messageLine2: 'Αυτή η ενέργεια είναι μόνιμη και μη αναστρέψιμη.',
      title: 'Διαγραφή λογαριασμού',
    },
    emailAddressPage: {
      emailCode: {
        formSubtitle: 'Εισαγάγετε τον κωδικό επαλήθευσης που εστάλη στην {{identifier}}',
        formTitle: 'Κωδικός επαλήθευσης',
        resendButton: 'Δεν λάβατε κωδικό; Επανάληψη αποστολής',
        successMessage: 'Το email {{identifier}} έχει προστεθεί στον λογαριασμό σας.',
      },
      emailLink: {
        formSubtitle: 'Κάντε κλικ στον σύνδεσμο επαλήθευσης στο email που εστάλη στην {{identifier}}',
        formTitle: 'Σύνδεσμος επαλήθευσης',
        resendButton: 'Δεν λάβατε κάποιον σύνδεσμο; Επανάληψη αποστολής',
        successMessage: 'Το email {{identifier}} έχει προστεθεί στον λογαριασμό σας.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      formHint: undefined,
      removeResource: {
        messageLine1: 'Η διεύθυνση {{identifier}} θα αφαιρεθεί από αυτόν τον λογαριασμό.',
        messageLine2: 'Δεν θα μπορείτε πλέον να συνδεθείτε χρησιμοποιώντας αυτήν τη διεύθυνση email.',
        successMessage: 'Η διεύθυνση {{emailAddress}} έχει αφαιρεθεί από τον λογαριασμό σας.',
        title: 'Αφαίρεση διεύθυνσης email',
      },
      title: 'Προσθήκη διεύθυνσης email',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Προσθήκη',
    formButtonPrimary__continue: 'Συνέχεια',
    formButtonPrimary__finish: 'Ολοκλήρωση',
    formButtonPrimary__remove: 'Αφαίρεση',
    formButtonPrimary__save: 'Αποθήκευση',
    formButtonReset: 'Ακύρωση',
    mfaPage: {
      formHint: 'Επιλέξτε μια μέθοδο για προσθήκη.',
      title: 'Προσθήκη διπλής επαλήθευσης',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Προσθήκη αριθμού τηλεφώνου',
      removeResource: {
        messageLine1: 'Ο {{identifier}} δεν θα λαμβάνει πλέον κωδικούς επαλήθευσης κατά τη σύνδεση.',
        messageLine2: 'Ο λογαριασμός σας ενδέχεται να μην είναι τόσο ασφαλής. Είστε σίγουροι ότι θέλετε να συνεχίσετε;',
        successMessage: 'Η διπλή επαλήθευση με κωδικούς SMS έχει αφαιρεθεί για τον αριθμό τηλεφώνου {{mfaPhoneCode}}',
        title: 'Αφαίρεση διπλής επαλήθευσης',
      },
      subtitle__availablePhoneNumbers:
        'Επιλέξτε έναν αριθμό τηλεφώνου για να εγγραφείτε για τη διπλή επαλήθευση με κωδικούς SMS.',
      subtitle__unavailablePhoneNumbers:
        'Δεν υπάρχουν διαθέσιμοι αριθμοί τηλεφώνου για εγγραφή στην διπλή επαλήθευση με κωδικούς SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Προσθήκη επαλήθευσης κωδικού SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Σάρωση QR κωδικού αντί αυτού',
        buttonUnableToScan__nonPrimary: 'Δεν μπορείτε να σαρώσετε τον QR κωδικό;',
        infoText__ableToScan:
          'Ρυθμίστε μια νέα μέθοδο σύνδεσης στην εφαρμογή αυθεντικοποίησης σας και σαρώστε τον παρακάτω QR κωδικό για να τον συνδέσετε με τον λογαριασμό σας.',
        infoText__unableToScan:
          'Ρυθμίστε μια νέα μέθοδο σύνδεσης στην αυθεντικοποίηση και εισαγάγετε τον κλειδί που παρέχεται παρακάτω.',
        inputLabel__unableToScan1:
          'Βεβαιωθείτε ότι οι κωδικοί που βασίζονται στον χρόνο ή μίας χρήσης είναι ενεργοποιημένοι και ολοκληρώστε τη σύνδεση του λογαριασμού σας.',
        inputLabel__unableToScan2:
          'Εναλλακτικά, εάν η εφαρμογή αυθεντικοποίησής σας υποστηρίζει TOTP URIs, μπορείτε επίσης να αντιγράψετε τον πλήρη URI.',
      },
      removeResource: {
        messageLine1:
          'Δεν θα απαιτούνται πλέον κωδικοί επαλήθευσης από αυτήν την εφαρμογή αυθεντικοποίησης κατά τη σύνδεση.',
        messageLine2: 'Ο λογαριασμός σας ενδέχεται να μην είναι τόσο ασφαλής. Είστε σίγουροι ότι θέλετε να συνεχίσετε;',
        successMessage: 'Η διπλή επαλήθευση μέσω εφαρμογής αυθεντικοποίησης έχει αφαιρεθεί.',
        title: 'Αφαίρεση διπλής επαλήθευσης',
      },
      successMessage:
        'Η διπλή επαλήθευση είναι πλέον ενεργοποιημένη. Κατά τη σύνδεση, θα πρέπει να εισαγάγετε έναν κωδικό επαλήθευσης από αυτήν την εφαρμογή αυθεντικοποίησης ως επιπλέον βήμα.',
      title: 'Προσθήκη εφαρμογής αυθεντικοποίησης',
      verifySubtitle: 'Εισαγάγετε τον κωδικό επαλήθευσης που δημιουργήθηκε από την εφαρμογή αυθεντικοποίησης',
      verifyTitle: 'Κωδικός επαλήθευσης',
    },
    mobileButton__menu: 'Μενού',
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
      readonly:
        'Ο κωδικός πρόσβασής σας δεν μπορεί να επεξεργαστεί αυτήν τη στιγμή επειδή μπορείτε να συνδεθείτε μόνο μέσω της σύνδεσης με την επιχείρηση.',
      successMessage__set: 'Ο κωδικός πρόσβασής σας έχει οριστεί.',
      successMessage__signOutOfOtherSessions: 'Όλες οι άλλες συνεδρίες έχουν αποσυνδεθεί.',
      successMessage__update: 'Ο κωδικός πρόσβασής σας έχει ενημερωθεί.',
      title__set: 'Ορισμός κωδικού πρόσβασης',
      title__update: 'Αλλαγή κωδικού πρόσβασης',
    },
    phoneNumberPage: {
      infoText: 'Θα σταλεί ένα μήνυμα κειμένου που περιέχει ένα σύνδεσμο επαλήθευσης σε αυτόν τον αριθμό τηλεφώνου.',
      removeResource: {
        messageLine1: 'Ο αριθμός {{identifier}} θα αφαιρεθεί από αυτόν τον λογαριασμό.',
        messageLine2: 'Δεν θα μπορείτε πλέον να συνδεθείτε χρησιμοποιώντας αυτόν τον αριθμό τηλεφώνου.',
        successMessage: 'Ο αριθμός τηλεφώνου {{phoneNumber}} έχει αφαιρεθεί από τον λογαριασμό σας.',
        title: 'Αφαίρεση αριθμού τηλεφώνου',
      },
      successMessage: 'Ο αριθμός τηλεφώνου {{identifier}} έχει προστεθεί στον λογαριασμό σας.',
      title: 'Προσθήκη αριθμού τηλεφώνου',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Ανεβάστε μια εικόνα σε μορφή JPG, PNG, GIF ή WEBP μικρότερη των 10 MB',
      imageFormDestructiveActionSubtitle: 'Αφαίρεση εικόνας',
      imageFormSubtitle: 'Ανέβασμα εικόνας',
      imageFormTitle: 'Εικόνα προφίλ',
      readonly:
        'Οι πληροφορίες του προφίλ σας έχουν παρασχεθεί από τη σύνδεση με την επιχείρηση και δεν μπορούν να επεξεργαστούν.',
      successMessage: 'Το προφίλ σας έχει ενημερωθεί.',
      title: 'Ενημέρωση προφίλ',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Αποσύνδεση από τη συσκευή',
        title: 'Ενεργές συσκευές',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Προσπάθεια ξανά',
        actionLabel__reauthorize: 'Εξουσιοδοτήστε τώρα',
        destructiveActionTitle: 'Αφαίρεση',
        primaryButton: 'Σύνδεση λογαριασμού',
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Συνδεδεμένοι λογαριασμοί',
      },
      dangerSection: {
        deleteAccountButton: 'Διαγραφή λογαριασμού',
        title: 'Κίνδυνος',
      },
      emailAddressesSection: {
        destructiveAction: 'Αφαίρεση διεύθυνσης email',
        detailsAction__nonPrimary: 'Ορισμός ως κύρια',
        detailsAction__primary: 'Ολοκλήρωση επαλήθευσης',
        detailsAction__unverified: 'Ολοκλήρωση επαλήθευσης',
        primaryButton: 'Προσθήκη διεύθυνσης email',
        title: 'Διευθύνσεις email',
      },
      enterpriseAccountsSection: {
        title: 'Επιχειρησιακοί λογαριασμοί',
      },
      headerTitle__account: 'Λογαριασμός',
      headerTitle__security: 'Ασφάλεια',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Επαναδημιουργία κωδικών',
          headerTitle: 'Εφεδρικοί κωδικοί',
          subtitle__regenerate:
            'Λάβετε ένα νέο σετ ασφαλών εφεδρικών κωδικών. Οι προηγούμενοι εφεδρικοί κωδικοί θα διαγραφούν και δεν μπορούν να χρησιμοποιηθούν.',
          title__regenerate: 'Επαναδημιουργία εφεδρικών κωδικών',
        },
        phoneCode: {
          actionLabel__setDefault: 'Ορισμός ως προεπιλεγμένος',
          destructiveActionLabel: 'Αφαίρεση αριθμού τηλεφώνου',
        },
        primaryButton: 'Προσθήκη αυθεντικοποίησης δύο βημάτων',
        title: 'Αυθεντικοποίηση δύο βημάτων',
        totp: {
          destructiveActionTitle: 'Αφαίρεση',
          headerTitle: 'Εφαρμογή αυθεντικοποίησης',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Ορισμός κωδικού πρόσβασης',
        primaryButton__updatePassword: 'Αλλαγή κωδικού πρόσβασης',
        title: 'Κωδικός πρόσβασης',
      },
      phoneNumbersSection: {
        destructiveAction: 'Αφαίρεση αριθμού τηλεφώνου',
        detailsAction__nonPrimary: 'Ορισμός ως κύριος',
        detailsAction__primary: 'Ολοκλήρωση επαλήθευσης',
        detailsAction__unverified: 'Ολοκλήρωση επαλήθευσης',
        primaryButton: 'Προσθήκη αριθμού τηλεφώνου',
        title: 'Αριθμοί τηλεφώνου',
      },
      profileSection: {
        primaryButton: 'Ενημέρωση προφίλ',
        title: 'Προφίλ',
      },
      usernameSection: {
        primaryButton__setUsername: 'Ορισμός ονόματος χρήστη',
        primaryButton__updateUsername: 'Αλλαγή ονόματος χρήστη',
        title: 'Όνομα χρήστη',
      },
      web3WalletsSection: {
        destructiveAction: 'Αφαίρεση πορτοφολιού',
        primaryButton: 'Πορτοφόλια Web3',
        title: 'Πορτοφόλια Web3',
      },
    },
    usernamePage: {
      successMessage: 'Το όνομα χρήστη σας έχει ενημερωθεί.',
      title__set: 'Ενημέρωση ονόματος χρήστη',
      title__update: 'Ενημέρωση ονόματος χρήστη',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: 'Το {{identifier}} θα αφαιρεθεί από αυτόν τον λογαριασμό.',
        messageLine2: 'Δεν θα μπορείτε πλέον να συνδεθείτε χρησιμοποιώντας αυτό το web3 πορτοφόλι.',
        successMessage: 'Το {{web3Wallet}} έχει αφαιρεθεί από τον λογαριασμό σας.',
        title: 'Αφαίρεση web3 πορτοφολιού',
      },
      subtitle__availableWallets: 'Επιλέξτε ένα web3 πορτοφόλι για να το συνδέσετε στον λογαριασμό σας.',
      subtitle__unavailableWallets: 'Δεν υπάρχουν διαθέσιμα web3 πορτοφόλια.',
      successMessage: 'Το πορτοφόλι έχει προστεθεί στον λογαριασμό σας.',
      title: 'Προσθήκη web3 πορτοφολιού',
      web3WalletButtonsBlockButton: undefined,
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
