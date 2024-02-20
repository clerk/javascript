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

export const frFR: LocalizationResource = {
  locale: 'fr-FR',
  backButton: 'Retour',
  badge__default: 'Défaut',
  badge__otherImpersonatorDevice: "Autre dispositif d'imitation",
  badge__primary: 'Principal',
  badge__requiresAction: 'Nécessite une action',
  badge__thisDevice: 'Cet appareil',
  badge__unverified: 'Non vérifié',
  badge__userDevice: 'Appareil utilisateur',
  badge__you: 'Vous',
  createOrganization: {
    formButtonSubmit: 'Créer l’organisation',
    invitePage: {
      formButtonReset: 'Passer',
    },
    title: 'Créer une organisation',
  },
  dates: {
    lastDay: "Hier à {{ date | timeString('fr-FR') }}",
    next6Days: "{{ date | weekday('fr-FR','long') }} à {{ date | timeString('fr-FR') }}",
    nextDay: "Demain à {{ date | timeString('fr-FR') }}",
    numeric: "{{ date | numeric('fr-FR') }}",
    previous6Days: "{{ date | weekday('fr-FR','long') }} dernier à {{ date | timeString('fr-FR') }}",
    sameDay: "Aujourd'hui à {{ date | timeString('fr-FR') }}",
  },
  dividerText: 'ou',
  footerActionLink__useAnotherMethod: 'Utiliser une autre méthode',
  footerPageLink__help: 'Aider',
  footerPageLink__privacy: 'Intimité',
  footerPageLink__terms: 'Conditions',
  formButtonPrimary: 'Continuer',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Mot de passe oublié?',
  formFieldError__matchingPasswords: 'Les mots de passe correspondent.',
  formFieldError__notMatchingPasswords: 'Les mots de passe ne correspondent pas.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Optionnel',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Saisissez ou collez une ou plusieurs adresses e-mail, séparées par des espaces ou des virgules',
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
  formFieldLabel__backupCode: 'Code de récupération',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Confirmez le mot de passe',
  formFieldLabel__currentPassword: 'Mot de passe actuel',
  formFieldLabel__emailAddress: 'Adresse e-mail',
  formFieldLabel__emailAddress_username: "Adresse email ou nom d'utilisateur",
  formFieldLabel__emailAddresses: 'Adresses e-mail',
  formFieldLabel__firstName: 'Prénom',
  formFieldLabel__lastName: 'Nom de famille',
  formFieldLabel__newPassword: 'Nouveau mot de passe',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: "Nom de l'organisation",
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__password: 'Mot de passe',
  formFieldLabel__phoneNumber: 'Numéro de téléphone',
  formFieldLabel__role: 'Rôle',
  formFieldLabel__signOutOfOtherSessions: 'Se déconnecter de tous les autres appareils',
  formFieldLabel__username: "Nom d'utilisateur",
  impersonationFab: {
    action__signOut: 'Déconnexion',
    title: 'Connecté en tant que {{identifier}}',
  },
  membershipRole__admin: 'Administrateur',
  membershipRole__basicMember: 'Membre',
  membershipRole__guestMember: 'Invité',
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
        'Les invitations suivantes n’ont pas pu être envoyées. Veuillez régler ce problème et réessayer:',
      formButtonPrimary__continue: 'Envoyer des invitations',
      selectDropdown__role: 'Select role',
      subtitle: 'Inviter des membres à rejoindre l’organisation',
      successMessage: 'Les invitations ont été envoyées.',
      title: 'Inviter des membres',
    },
    membersPage: {
      action__invite: 'Inviter',
      activeMembersTab: {
        menuAction__remove: 'Supprimer',
        tableHeader__actions: '',
        tableHeader__joined: 'Rejoint',
        tableHeader__role: 'Rôle',
        tableHeader__user: 'Utilisateur',
      },
      detailsTitle__emptyRow: 'Aucun membre',
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
        menuAction__revoke: "Révoquer l'invitation",
        tableHeader__invited: 'Invité',
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
          actionDescription: 'Saisissez {{organizationName}} ci-dessous pour continuer.',
          messageLine1: 'Êtes-vous sûr(e) de vouloir supprimer cette organisation ?',
          messageLine2: 'Cette action est définitive et irréversible.',
          successMessage: "Vous avez supprimé l'organisation.",
          title: "Supprimer l'organisation",
        },
        leaveOrganization: {
          actionDescription: 'Saisissez {{organizationName}} ci-dessous pour continuer.',
          messageLine1:
            "Êtes-vous sûr de vouloir quitter cette organisation ? Vous perdrez l'accès à cette organisation et à ses applications.",
          messageLine2: 'Cette action est permanente et irréversible.',
          successMessage: "Vous avez quitté l'organisation.",
          title: "Quitter l'organisation",
        },
        title: 'Danger',
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
      successMessage: "L'organisation a été mise à jour.",
      title: 'Profil de l’organisation',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membres',
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
    action__createOrganization: 'Créer une organisation',
    action__invitationAccept: 'Join',
    action__manageOrganization: "Gérer l'organisation",
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Aucune organisation sélectionnée',
    personalWorkspace: 'Espace de travail personnel',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Prochain',
  paginationButton__previous: 'Précédent',
  paginationRowText__displaying: 'Affichage',
  paginationRowText__of: 'de',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: "Obtenir de l'aide",
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Utiliser un code de récupération',
      blockButton__emailCode: 'Envoyer le code à {{identifier}}',
      blockButton__emailLink: 'Envoyer le lien à {{identifier}}',
      blockButton__password: 'Connectez-vous avec votre mot de passe',
      blockButton__phoneCode: 'Envoyer le code à {{identifier}}',
      blockButton__totp: "Utilisez votre application d'authentification",
      getHelp: {
        blockButton__emailSupport: 'Assistance par e-mail',
        content:
          "Si vous rencontrez des difficultés pour vous connecter à votre compte, envoyez-nous un e-mail et nous travaillerons avec vous pour rétablir l'accès dès que possible.",
        title: "Obtenir de l'aide",
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Utiliser une autre méthode',
    },
    backupCodeMfa: {
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Entrez un code de récupération',
    },
    emailCode: {
      formTitle: 'Le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Vérifiez votre messagerie',
    },
    emailLink: {
      expired: {
        subtitle: "Retournez à l'onglet d'origine pour continuer",
        title: 'Ce lien de vérification a expiré',
      },
      failed: {
        subtitle: "Retourner à l'onglet original pour continuer",
        title: "Ce lien de vérification n'est pas valide",
      },
      formSubtitle: 'Utilisez le lien de vérification envoyé par e-mail',
      formTitle: 'lien de vérification',
      loading: {
        subtitle: 'Vous allez bientôt être redirigé',
        title: 'Signing in...',
      },
      resendButton: 'Renvoyer le lien',
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Vérifiez votre messagerie',
      unusedTab: {
        title: 'Vous pouvez fermer cet onglet',
      },
      verified: {
        subtitle: 'Vous serez bientôt redirigé',
        title: 'Connexion réussie',
      },
      verifiedSwitchTab: {
        subtitle: "Revenir à l'onglet d'origine pour continuer",
        subtitleNewTab: "Revenez à l'onglet nouvellement ouvert pour continuer",
        titleNewTab: 'Connecté sur un autre onglet',
      },
    },
    forgotPassword: {
      formTitle: 'Code de réinitialisation du mot de passe',
      resendButton: "Vous n'avez pas reçu de code ? Renvoyer",
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Réinitialiser votre mot de passe',
      label__alternativeMethods: 'Ou connectez-vous avec une autre méthode.',
      title: 'Mot de passe oublié ?',
    },
    noAvailableMethods: {
      message: "Impossible de poursuivre la connexion. Aucun facteur d'authentification n'est disponible.",
      subtitle: "Une erreur s'est produite",
      title: 'Impossible de se connecter',
    },
    password: {
      actionLink: 'Utiliser une autre méthode',
      subtitle: 'pour continuer à {{applicationName}}',
      title: 'Tapez votre mot de passe',
    },
    phoneCode: {
      formTitle: 'Code de vérification',
      resendButton: "Vous n'avez pas reçu de code ? Renvoyer",
      subtitle: 'pour continuer sur {{applicationName}}',
      title: 'Vérifiez votre téléphone',
    },
    phoneCodeMfa: {
      formTitle: 'Code de vérification',
      resendButton: "Vous n'avez pas reçu de code ? Renvoyer",
      subtitle: '',
      title: 'Vérifiez votre téléphone',
    },
    resetPassword: {
      formButtonPrimary: 'Réinitialiser',
      requiredMessage:
        'An account already exists with an unverified email address. Please reset your password for security.',
      successMessage:
        'Votre mot de passe a été modifié avec succès. Nous vous reconnectons, veuillez patienter un instant.',
      title: 'Réinitialiser le mot de passe',
    },
    resetPasswordMfa: {
      detailsLabel: 'Nous devons vérifier votre identité avant de réinitialiser votre mot de passe.',
    },
    start: {
      actionLink: "S'inscrire",
      actionLink__use_email: 'Utiliser e-mail',
      actionLink__use_email_username: "Utiliser l'e-mail ou le nom d'utilisateur",
      actionLink__use_phone: 'Utiliser téléphone',
      actionLink__use_username: "Utiliser le nom d'utilisateur",
      actionText: "Vous n'avez pas encore de compte ?",
      subtitle: 'pour continuer vers {{applicationName}}',
      title: "S'identifier",
    },
    totpMfa: {
      formTitle: 'Le code de vérification',
      subtitle: '',
      title: 'Vérification en deux étapes',
    },
  },
  signInEnterPasswordTitle: 'Tapez votre mot de passe',
  signUp: {
    continue: {
      actionLink: "S'identifier",
      actionText: 'Vous avez déjà un compte ?',
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Remplir les champs manquants',
    },
    emailCode: {
      formSubtitle: 'Entrez le code de vérification envoyé à votre adresse e-mail',
      formTitle: 'Le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'pour continuer à {{applicationName}}',
      title: 'Vérifiez votre e-mail',
    },
    emailLink: {
      formSubtitle: 'Utilisez le lien de vérification envoyé à votre adresse e-mail',
      formTitle: 'lien de vérification',
      loading: {
        title: 'Création de votre compte...',
      },
      resendButton: 'Renvoyer le lien',
      subtitle: 'pour continuer à {{applicationName}}',
      title: 'Vérifiez votre e-mail',
      verified: {
        title: 'Compte créé',
      },
      verifiedSwitchTab: {
        subtitle: "Revenez à l'onglet nouvellement ouvert pour continuer",
        subtitleNewTab: "Revenir à l'onglet précédent pour continuer",
        title: 'Courriel vérifié avec succès',
      },
    },
    phoneCode: {
      formSubtitle: 'Entrez le code de vérification envoyé à votre numéro de téléphone',
      formTitle: 'Le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'pour continuer à {{applicationName}}',
      title: 'Vérifiez votre téléphone',
    },
    start: {
      actionLink: "S'identifier",
      actionText: 'Vous avez déjà un compte ?',
      subtitle: 'pour continuer à {{applicationName}}',
      title: 'Créez votre compte',
    },
  },
  socialButtonsBlockButton: 'Continuer avec {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      "Inscription échouée en raison de validations de sécurité incorrectes. Veuillez rafraîchir la page pour réessayer ou contacter le support pour obtenir de l'aide.",
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: 'Code incorrect',
    form_identifier_exists: 'Cet identifiant existe déjà. Veuillez en renseigner un différent.',
    form_identifier_not_found: 'Identifiant introuvable',
    form_param_format_invalid: 'Le format est invalide',
    form_param_format_invalid__email_address: "L'adresse e-mail doit être une adresse e-mail valide.",
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: 'Mot de passe incorrect',
    form_password_length_too_short: 'Votre mot de passe est trop court.',
    form_password_not_strong_enough: "Votre mot de passe n'est pas assez fort.",
    form_password_pwned:
      'Ce mot de passe a été compromis et ne peut pas être utilisé. Veuillez essayer un autre mot de passe à la place.',
    form_password_size_in_bytes_exceeded:
      "Votre mot de passe a dépassé le nombre maximum d'octets autorisés. Veuillez le raccourcir ou supprimer certains caractères spéciaux.",
    form_password_validation_failed: 'Mot de passe incorrect',
    form_username_invalid_character: "L'identifiant contient des caractères invalide.",
    form_username_invalid_length: "Le nombre de caractères de l'identifiant est invalide.",
    identification_deletion_failed: 'Vous ne pouvez pas supprimer votre dernière identification.',
    not_allowed_access: 'Accès non autorisé',
    passwordComplexity: {
      maximumLength: 'moins de {{length}} caractères',
      minimumLength: '{{length}} caractères ou plus',
      requireLowercase: 'une lettre minuscule',
      requireNumbers: 'un chiffre',
      requireSpecialCharacter: 'un caractère spécial',
      requireUppercase: 'une lettre majuscule',
      sentencePrefix: 'Votre mot de passe doit contenir',
    },
    phone_number_exists: 'Ce numéro de téléphone est déjà utilisé. Veuillez essayer un autre.',
    zxcvbn: {
      couldBeStronger: "Votre mot de passe fonctionne mais pourrait être plus sûr. Essayez d'ajouter des caractères.",
      goodPassword: "Bien joué. C'est un excellent mot de passe.",
      notEnough: "Votre mot de passe n'est pas assez fort.",
      suggestions: {
        allUppercase: 'Mettez quelques lettres en majuscules, mais pas toutes.',
        anotherWord: 'Ajoutez des mots moins courants.',
        associatedYears: 'Évitez les années qui vous sont associées. (ex: date de naissance)',
        capitalization: 'Capitalisez mais pas seulement la première lettre.',
        dates: 'Évitez les dates et les années qui vous sont associées. (ex: date ou année de naissance)',
        l33t: "Évitez les substitutions de lettres prévisibles comme '@' pour 'a'.",
        longerKeyboardPattern: 'Utilisez des motifs de clavier plus longs et changez de sens de frappe plusieurs fois.',
        noNeed:
          'Vous pouvez créer des mots de passe forts sans utiliser de symboles, de chiffres ou de lettres majuscules.',
        pwned: 'Si vous utilisez ce mot de passe ailleurs, vous devriez le modifier.',
        recentYears: 'Évitez les dernières années.',
        repeated: 'Évitez les mots et les caractères répétés.',
        reverseWords: 'Évitez les orthographes inversées des mots courants',
        sequences: 'Évitez les séquences de caractères courantes.',
        useWords: 'Utilisez plusieurs mots, mais évitez les phrases courantes.',
      },
      warnings: {
        common: 'Ce mot de passe est couramment utilisé.',
        commonNames: 'Les noms communs et les noms de famille sont faciles à deviner.',
        dates: 'Les dates sont faciles à deviner.',
        extendedRepeat: "Les caractères répétés comme 'abcabcabc' sont faciles à deviner.",
        keyPattern: 'Des motifs de clavier courts sont faciles à deviner.',
        namesByThemselves: 'Des noms ou des prénoms simples sont faciles à deviner.',
        pwned: 'Votre mot de passe a été divulgué suite à une violation de données sur Internet.',
        recentYears: 'Les années récentes sont faciles à deviner.',
        sequences: "Des séquences de caractères communs comme 'abc' sont faciles à deviner.",
        similarToCommon: 'Ce mot de passe est similaire à un mot de passe couramment utilisé.',
        simpleRepeat: "Les caractères répétés comme 'aaa' sont faciles à deviner.",
        straightRow: 'Les lignes droites de touches de votre clavier sont faciles à deviner.',
        topHundred: 'Ce mot de passe est fréquemment utilisé.',
        topTen: 'Ce mot de passe est très utilisé.',
        userInputs: 'Le mot de passe ne doit pas comporter de données personnelles ou liées au site.',
        wordByItself: 'Les mots simples sont faciles à deviner.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Ajouter un compte',
    action__manageAccount: 'Gérer son compte',
    action__signOut: 'Déconnexion',
    action__signOutAll: 'Se déconnecter de tous les comptes',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copié !',
      actionLabel__copy: 'Copier tous les codes',
      actionLabel__download: 'Télécharger en .txt',
      actionLabel__print: 'Imprimer',
      infoText1: 'Les codes de récupération seront activés pour ce compte.',
      infoText2:
        "Gardez les codes de récupération secrets et stockez-les en toute sécurité. Vous pouvez régénérer les codes de récupération si vous pensez qu'ils ont été compromis.",
      subtitle__codelist: 'Conservez-les en toute sécurité et gardez-les secrets.',
      successMessage:
        "Les codes de récupération sont maintenant activés. Vous pouvez utiliser l'un d'entre eux pour vous connecter à votre compte, si vous perdez l'accès à votre dispositif d'authentification. Chaque code ne peut être utilisé qu'une seule fois.",
      successSubtitle:
        "Vous pouvez utiliser l'un d'entre eux pour vous connecter à votre compte, si vous perdez l'accès à votre dispositif d'authentification.",
      title: 'Ajouter la vérification du code de récupération',
      title__codelist: 'Codes de récupération',
    },
    connectedAccountPage: {
      formHint: 'Sélectionnez un fournisseur pour connecter votre compte.',
      formHint__noAccounts: "Aucun fournisseur de compte externe n'est disponible.",
      removeResource: {
        messageLine1: '{{identifier}} sera supprimé de ce compte.',
        messageLine2:
          'Vous ne pourrez plus utiliser ce compte connecté et toutes les fonctionnalités dépendantes ne fonctionneront plus.',
        successMessage: '{{connectedAccount}} a été supprimé de votre compte.',
        title: 'Supprimer le compte connecté',
      },
      socialButtonsBlockButton: 'Connecter {{provider|titleize}} compte',
      successMessage: 'Le fournisseur a été ajouté à votre compte',
      title: 'Ajouter un compte connecté',
    },
    deletePage: {
      actionDescription: 'Saisissez "Supprimer le compte" ci-dessous pour continuer.',
      confirm: 'Supprimer le compte',
      messageLine1: 'Êtes-vous sûr(e) de vouloir supprimer votre compte ?',
      messageLine2: 'Cette action est définitive et irréversible.',
      title: 'Supprimer le compte',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Un e-mail contenant un code de vérification sera envoyé à cette adresse e-mail.',
        formSubtitle: 'Saisissez le code de vérification envoyé à {{identifier}}',
        formTitle: 'Le code de vérification',
        resendButton: 'Renvoyer le lien',
        successMessage: "L'e-mail {{identifier}} a été vérifié et ajouté à votre compte.",
      },
      emailLink: {
        formHint: 'Un e-mail contenant un lien de vérification sera envoyé à cette adresse e-mail.',
        formSubtitle: "Cliquez sur le lien de vérification dans l'e-mail envoyé à {{identifier}}",
        formTitle: 'lien de vérification',
        resendButton: 'Renvoyer le lien',
        successMessage: "L'e-mail {{identifier}} a été vérifié et ajouté à votre compte.",
      },
      removeResource: {
        messageLine1: '{{identifier}} sera supprimé de ce compte.',
        messageLine2: 'Vous ne pourrez plus vous connecter avec cette adresse e-mail.',
        successMessage: '{{emailAddress}} a été supprimé de votre compte.',
        title: "Supprimer l'adresse e-mail",
      },
      title: 'Ajouter une adresse e-mail',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Continuer',
    formButtonPrimary__finish: 'Retour',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Annuler',
    mfaPage: {
      formHint: 'Sélectionnez une méthode à ajouter.',
      title: 'Ajouter la vérification en deux étapes',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Ajouter un numéro de téléphone',
      removeResource: {
        messageLine1: '{{identifier}} ne recevra plus de codes de validation lors de la connexion.',
        messageLine2: 'Votre compte sera moins sécurisé. Souhaitez-vous continuer ?',
        successMessage: 'La vérification en deux étapes du code SMS a été supprimée pour {{mfaPhoneCode}}',
        title: 'Supprimer la vérification en deux étapes',
      },
      subtitle__availablePhoneNumbers:
        'Sélectionnez un numéro de téléphone pour vous inscrire à la vérification en deux étapes du code SMS.',
      subtitle__unavailablePhoneNumbers:
        "Il n'y a pas de numéros de téléphone disponibles pour s'inscrire à la vérification en deux étapes du code SMS.",
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Ajouter la vérification du code SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scannez le code QR à la place',
        buttonUnableToScan__nonPrimary: 'Vous ne pouvez pas scanner le code QR ?',
        infoText__ableToScan:
          "Configurez une nouvelle méthode de connexion dans votre application d'authentification et scannez le code QR suivant pour le lier à votre compte.",
        infoText__unableToScan:
          'Configurez une nouvelle méthode de connexion dans votre authentificateur et entrez la clé fournie ci-dessous.',
        inputLabel__unableToScan1:
          'Assurez-vous que les mots de passe basés sur le temps ou à usage unique sont activés, puis terminez la liaison de votre compte.',
        inputLabel__unableToScan2:
          "Alternativement, si votre authentificateur prend en charge les URI TOTP, vous pouvez également copier l'URI complet.",
      },
      removeResource: {
        messageLine1: 'Les codes de vérification de cet authentificateur ne seront plus requis lors de la connexion.',
        messageLine2: 'Votre compte sera moins sécurisé. Souhaitez-vous continuer ?',
        successMessage: "La vérification en deux étapes via l'application d'authentification a été supprimée.",
        title: 'Supprimer la vérification en deux étapes',
      },
      successMessage:
        'La vérification en deux étapes est maintenant activée. Lors de la connexion, vous devrez saisir un code de vérification de cet authentificateur comme étape supplémentaire.',
      title: "Ajouter une application d'authentification",
      verifySubtitle: "Entrez le code de vérification généré par votre application d'authentification",
      verifyTitle: 'Le code de vérification',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      changePasswordSuccessMessage: 'Votre mot de passe a été mis à jour.',
      changePasswordTitle: 'Changer le mot de passe',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      sessionsSignedOutSuccessMessage: 'Tous les autres appareils ont été déconnectés.',
      successMessage: 'Votre mot de passe a été mis à jour.',
      title: 'Mettre à jour le mot de passe',
    },
    phoneNumberPage: {
      infoText: 'Un message texte contenant un lien de vérification sera envoyé à ce numéro de téléphone.',
      removeResource: {
        messageLine1: '{{identifier}} sera supprimé de ce compte.',
        messageLine2: 'Vous ne pourrez plus vous connecter avec ce numéro de téléphone.',
        successMessage: '{{phoneNumber}} a été supprimé de votre compte.',
        title: 'Supprimer le numéro de téléphone',
      },
      successMessage: '{{identifier}} a été vérifié et ajouté à votre compte.',
      title: 'Ajouter un numéro de téléphone',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Téléchargez une image JPG, PNG, GIF ou WEBP inférieure à 10 Mo',
      imageFormDestructiveActionSubtitle: "Supprimer l'image",
      imageFormSubtitle: 'Télécharger une image',
      imageFormTitle: 'Photo de profil',
      readonly:
        "Les informations de votre profil ont été fournies par la connexion d'entreprise et ne peuvent pas être modifiées.",
      successMessage: 'Votre profil a été mis a jour.',
      title: 'Mettre à jour le profil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: "Se déconnecter de l'appareil",
        title: 'Appareils actifs',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Réessayer',
        actionLabel__reauthorize: 'Authorize now',
        destructiveActionTitle: 'Retirer',
        primaryButton: 'Connecter le compte',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Comptes connectés',
      },
      dangerSection: {
        deleteAccountButton: 'Supprimer le compte',
        title: 'Danger',
      },
      emailAddressesSection: {
        destructiveAction: "Supprimer l'adresse e-mail",
        detailsAction__nonPrimary: 'Définir comme principale',
        detailsAction__primary: 'Compléter la vérification',
        detailsAction__unverified: 'Compléter la vérification',
        primaryButton: 'Ajouter une adresse e-mail',
        title: 'Adresses e-mail',
      },
      enterpriseAccountsSection: {
        title: 'Comptes entreprise',
      },
      headerTitle__account: 'Compte',
      headerTitle__security: 'Sécurité',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Régénérer les codes',
          headerTitle: 'Codes de récupération',
          subtitle__regenerate:
            'Obtenez de nouveaux codes de récupération sécurisés. Les codes de récupération antérieurs seront supprimés et ne pourront pas être utilisés.',
          title__regenerate: 'Régénérer les codes de récupération',
        },
        phoneCode: {
          actionLabel__setDefault: 'Définir par défaut',
          destructiveActionLabel: 'Supprimer le numéro de téléphone',
        },
        primaryButton: 'Ajouter la vérification en deux étapes',
        title: 'Vérification en deux étapes',
        totp: {
          destructiveActionTitle: 'Désactiver',
          headerTitle: "Application d'authentification",
        },
      },
      passwordSection: {
        primaryButton__changePassword: 'Changer le mot de passe',
        primaryButton__setPassword: 'Définir le mot de passe',
        title: 'Mot de passe',
      },
      phoneNumbersSection: {
        destructiveAction: 'Supprimer le numéro de téléphone',
        detailsAction__nonPrimary: 'Définir comme principale',
        detailsAction__primary: 'Compléter la vérification',
        detailsAction__unverified: 'Compléter la vérification',
        primaryButton: 'Ajouter un numéro de téléphone',
        title: 'Les numéros de téléphone',
      },
      profileSection: {
        primaryButton: 'Edit Profile',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__changeUsername: "Changer le nom d'utilisateur",
        primaryButton__setUsername: "Définir le nom d'utilisateur",
        title: "Nom d'utilisateur",
      },
      web3WalletsSection: {
        destructiveAction: 'Supprimer le portefeuille',
        primaryButton: 'Portefeuilles Web3',
        title: 'Portefeuilles Web3',
      },
    },
    usernamePage: {
      successMessage: "Votre nom d'utilisateur a été mis à jour.",
      title: "Mettre à jour le nom d'utilisateur",
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} sera supprimé de ce compte.',
        messageLine2: 'Vous ne pourrez plus vous connecter avec ce portefeuille web3.',
        successMessage: '{{web3Wallet}} a été supprimé de votre compte.',
        title: 'Supprimer le portefeuille Web3',
      },
      subtitle__availableWallets: 'Sélectionnez un portefeuille Web3 pour vous connecter à votre compte.',
      subtitle__unavailableWallets: "Il n'y a pas de portefeuilles Web3 disponibles.",
      successMessage: 'Le portefeuille a été ajouté à votre compte.',
      title: 'Ajouter un portefeuille Web3',
    },
  },
} as const;
