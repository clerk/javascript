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
  footerPageLink__help: 'Aide',
  footerPageLink__privacy: 'Vie privée',
  footerPageLink__terms: 'Conditions',
  formButtonPrimary: 'Continuer',
  formButtonPrimary__verify: 'Vérifier',
  formFieldAction__forgotPassword: 'Mot de passe oublié ?',
  formFieldError__matchingPasswords: 'Les mots de passe correspondent.',
  formFieldError__notMatchingPasswords: 'Les mots de passe ne correspondent pas.',
  formFieldError__verificationLinkExpired: 'Le lien de vérification a expiré. Merci de demander un nouveau lien.',
  formFieldHintText__optional: 'Optionnel',
  formFieldHintText__slug:
    'Un slug est un identifiant lisible qui doit être unique. Il est souvent utilisé dans les URL.',
  formFieldInputPlaceholder__backupCode: 'Code de sauvegarde',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Supprimer le compte',
  formFieldInputPlaceholder__emailAddress: 'Adresse e-mail',
  formFieldInputPlaceholder__emailAddress_username: "Nom d'utilisateur ou adresse e-mail",
  formFieldInputPlaceholder__emailAddresses:
    'Saisissez ou collez une ou plusieurs adresses e-mail, séparées par des espaces ou des virgules',
  formFieldInputPlaceholder__firstName: 'Prénom',
  formFieldInputPlaceholder__lastName: 'Nom de famille',
  formFieldInputPlaceholder__organizationDomain: "Domaine de l'organisation",
  formFieldInputPlaceholder__organizationDomainEmailAddress: "Adresse e-mail de l'organisation",
  formFieldInputPlaceholder__organizationName: "Nom de l'organisation",
  formFieldInputPlaceholder__organizationSlug: "Identifiant de l'organisation",
  formFieldInputPlaceholder__password: 'Mot de passe',
  formFieldInputPlaceholder__phoneNumber: 'Numéro de téléphone',
  formFieldInputPlaceholder__username: "Nom d'utilisateur",
  formFieldLabel__automaticInvitations: 'Autoriser les invitations automatiques pour ce domaine',
  formFieldLabel__backupCode: 'Code de récupération',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Confirmer le mot de passe',
  formFieldLabel__currentPassword: 'Mot de passe actuel',
  formFieldLabel__emailAddress: 'Adresse e-mail',
  formFieldLabel__emailAddress_username: "Adresse e-mail ou nom d'utilisateur",
  formFieldLabel__emailAddresses: 'Adresses e-mail',
  formFieldLabel__firstName: 'Prénom',
  formFieldLabel__lastName: 'Nom de famille',
  formFieldLabel__newPassword: 'Nouveau mot de passe',
  formFieldLabel__organizationDomain: 'Domaine',
  formFieldLabel__organizationDomainDeletePending: 'Supprimer les invitations et suggestions en attente',
  formFieldLabel__organizationDomainEmailAddress: 'E-mail de vérification',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Entrer une adresse e-mail appartenant à ce domaine pour recevoir un code et vérifier ce domaine.',
  formFieldLabel__organizationName: "Nom de l'organisation",
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Mot de passe',
  formFieldLabel__phoneNumber: 'Numéro de téléphone',
  formFieldLabel__role: 'Rôle',
  formFieldLabel__signOutOfOtherSessions: 'Se déconnecter de tous les autres appareils',
  formFieldLabel__username: "Nom d'utilisateur",
  impersonationFab: {
    action__signOut: 'Déconnexion',
    title: 'Connecté en tant que {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Administrateur',
  membershipRole__basicMember: 'Membre',
  membershipRole__guestMember: 'Invité',
  organizationList: {
    action__createOrganization: 'Créer une organisation',
    action__invitationAccept: 'Rejoindre',
    action__suggestionsAccept: "Demande d'adhésion",
    createOrganization: 'Créer une Organisation',
    invitationAcceptedLabel: 'Acceptée',
    subtitle: 'pour continuer vers {{applicationName}}',
    suggestionsAcceptedLabel: 'En attente d’approbation',
    title: 'Choisissez un compte',
    titleWithoutPersonal: 'Choisissez une organisation',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Invitations automatiques',
    badge__automaticSuggestion: 'Suggestions automatiques',
    badge__manualInvitation: "Pas d'inscription automatique",
    badge__unverified: 'Non vérifié',
    createDomainPage: {
      subtitle:
        "Ajoutez le domaine pour le vérifier. Les utilisateurs possédant une adresses e-mail sur ce domaine peuvent rejoindre l'organisation automatiquement ou faire une demande pour y adhérer.",
      title: 'Ajouter un domaine',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Les invitations suivantes n’ont pas pu être envoyées. Veuillez régler ce problème et réessayer:',
      formButtonPrimary__continue: 'Envoyer des invitations',
      selectDropdown__role: 'Sélectionner un rôle',
      subtitle: 'Inviter des membres à rejoindre l’organisation',
      successMessage: 'Les invitations ont été envoyées.',
      title: 'Inviter des membres',
    },
    membersPage: {
      action__invite: 'Inviter',
      activeMembersTab: {
        menuAction__remove: 'Supprimer',
        tableHeader__actions: 'Actions',
        tableHeader__joined: 'Rejoint',
        tableHeader__role: 'Rôle',
        tableHeader__user: 'Utilisateur',
      },
      detailsTitle__emptyRow: 'Aucun membre',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            "Invitez des utilisateurs en connectant un domaine de messagerie à votre organisation. Toute personne s'inscrivant avec une adresses e-mail sur ce domaine pourra rejoindre l'organisation.",
          headerTitle: 'Invitations automatiques',
          primaryButton: 'Gérer les domaines validés',
        },
        table__emptyRow: "Pas d'invitations à afficher",
      },
      invitedMembersTab: {
        menuAction__revoke: "Révoquer l'invitation",
        tableHeader__invited: 'Invité',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            "Les utilisateurs qui s'inscrivent avec un domaine de messagerie identique verront une suggestion pour demander à rejoindre votre organisation.",
          headerTitle: 'Suggestions automatiques',
          primaryButton: 'Gérer les domaines validés',
        },
        menuAction__approve: 'Approuver',
        menuAction__reject: 'Rejeter',
        tableHeader__requested: 'Accès demandé',
        table__emptyRow: 'Pas de demandes à afficher',
      },
      start: {
        headerTitle__invitations: 'Invitations',
        headerTitle__members: 'Membres',
        headerTitle__requests: 'Demandes',
      },
    },
    navbar: {
      description: 'Gérer votre organisation.',
      general: 'Général',
      members: 'Membres',
      title: 'Organisation',
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
        menuAction__manage: 'Gérer',
        menuAction__remove: 'Supprimer',
        menuAction__verify: 'Valider',
        primaryButton: 'Ajouter un domaine',
        subtitle:
          "Permettre aux utilisateurs de rejoindre l'organisation automatiquement ou de faire une demande d'adhésion si leur domaine de messagerie est vérifié.",
        title: 'Domaines vérifiés',
      },
      successMessage: "L'organisation a été mise à jour.",
      title: 'Profil de l’organisation',
    },
    removeDomainPage: {
      messageLine1: 'Le domaine de messagerie {{domain}} sera supprimé.',
      messageLine2: "Les utilisateurs ne pourront plus rejoindre l'organisation automatiquement après cela.",
      successMessage: '{{domain}} a été supprimé.',
      title: 'Supprimer un domaine',
    },
    start: {
      headerTitle__general: 'Général',
      headerTitle__members: 'Membres',
      profileSection: {
        primaryButton: 'Mettre à jour le profil',
        title: "Profil de l'organisation",
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Supprimer ce domaine affectera les utilisateurs invités.',
        removeDomainActionLabel__remove: 'Supprimer ce domaine',
        removeDomainSubtitle: 'Supprimer ce domaine de vos domaines vérifiés',
        removeDomainTitle: 'Supprimer un domaine',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          "Les utilisateurs sont automatiquement invités à rejoindre l'organisation lors de leur inscription et peuvent la rejoindre à tout moment.",
        automaticInvitationOption__label: 'Invitations automatiques',
        automaticSuggestionOption__description:
          "Les utilisateurs reçoivent une suggestion d'adhésion à l'organisation, mais doivent être approuvés par un administrateur avant de pouvoir y adhérer.",
        automaticSuggestionOption__label: 'Suggestions automatiques',
        calloutInfoLabel: "Changer le mode d'inscription n'affectera que les nouveaux utilisateurs.",
        calloutInvitationCountLabel: 'Invitations en attente envoyées aux utilisateurs : {{count}}',
        calloutSuggestionCountLabel: 'Suggestions en attente envoyées aux utilisateurs : {{count}}',
        manualInvitationOption__description:
          "Les utilisateurs ne peuvent être invités à l'organisation que manuellement.",
        manualInvitationOption__label: "Pas d'inscription automatique",
        subtitle: "Choisissez comment les utilisateurs de ce domaine peuvent rejoindre l'organisation.",
      },
      start: {
        headerTitle__danger: 'Danger',
        headerTitle__enrollment: "Option d'inscription",
      },
      subtitle: "Le domaine {{domain}} est maintenant vérifié. Poursuivez en sélectionnant le mode d'inscription.",
      title: 'Mettre à jour {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Saisissez le code de vérification envoyé à votre adresse e-mail',
      formTitle: 'Code de vérification',
      resendButton: "Vous n'avez pas reçu de code ? Renvoyer",
      subtitle: 'Le domaine {{domainName}} doit être vérifié par e-mail.',
      subtitleVerificationCodeScreen:
        'Un code de vérification a été envoyé à {{emailAddress}}. Saisissez le code pour continuer.',
      title: 'Vérifier un domaine',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Créer une organisation',
    action__invitationAccept: 'Rejoindre',
    action__manageOrganization: "Gérer l'organisation",
    action__suggestionsAccept: 'Demander à rejoindre',
    notSelected: 'Aucune organisation sélectionnée',
    personalWorkspace: 'Espace de travail personnel',
    suggestionsAcceptedLabel: "En attente d'acceptation",
  },
  paginationButton__next: 'Prochain',
  paginationButton__previous: 'Précédent',
  paginationRowText__displaying: 'Affichage',
  paginationRowText__of: 'de',
  reverification: {
    alternativeMethods: {
      actionLink: 'Utiliser une autre méthode',
      actionText: 'Vous ne pouvez pas accéder à votre compte ?',
      blockButton__backupCode: 'Utiliser un code de récupération',
      blockButton__emailCode: 'Recevoir un code par e-mail',
      blockButton__password: 'Utiliser le mot de passe',
      blockButton__phoneCode: 'Recevoir un code par téléphone',
      blockButton__totp: 'Utiliser un code d’application d’authentification',
      getHelp: {
        blockButton__emailSupport: 'Contacter le support par e-mail',
        content:
          "Si vous ne pouvez pas accéder à votre compte, contactez notre équipe de support pour obtenir de l'aide.",
        title: "Obtenir de l'aide",
      },
      subtitle: 'Choisissez une méthode alternative pour vérifier votre identité.',
      title: 'Vérification alternative',
    },
    backupCodeMfa: {
      subtitle: "Entrez l'un de vos codes de récupération pour vérifier votre compte.",
      title: 'Vérification par code de récupération',
    },
    emailCode: {
      formTitle: 'Entrez le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'Un code a été envoyé à votre adresse e-mail.',
      title: 'Vérification par e-mail',
    },
    noAvailableMethods: {
      message: "Aucune méthode de vérification n'est disponible.",
      subtitle: 'Impossible de procéder à la vérification.',
      title: 'Aucune méthode disponible',
    },
    password: {
      actionLink: 'Réinitialiser le mot de passe',
      subtitle: 'Entrez votre mot de passe pour continuer.',
      title: 'Vérification par mot de passe',
    },
    phoneCode: {
      formTitle: 'Entrez le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'Un code a été envoyé à votre téléphone.',
      title: 'Vérification par téléphone',
    },
    phoneCodeMfa: {
      formTitle: 'Entrez le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'Un code a été envoyé à votre téléphone pour vérification.',
      title: 'Vérification par téléphone',
    },
    totpMfa: {
      formTitle: 'Entrez le code de vérification',
      subtitle: "Entrez le code généré par votre application d'authentification.",
      title: 'Vérification par application d’authentification',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Ajouter un compte',
      action__signOutAll: 'Se déconnecter de tous les comptes',
      subtitle: 'Sélectionnez le compte avec lequel vous souhaitez continuer.',
      title: 'Choisissez un compte',
    },
    alternativeMethods: {
      actionLink: "Obtenir de l'aide",
      actionText: "Aucune de ces méthode d'authentification ?",
      blockButton__backupCode: 'Utiliser un code de récupération',
      blockButton__emailCode: 'Envoyer le code à {{identifier}}',
      blockButton__emailLink: 'Envoyer le lien à {{identifier}}',
      blockButton__passkey: 'Utiliser une clé de sécurité',
      blockButton__password: 'Connectez-vous avec votre mot de passe',
      blockButton__phoneCode: 'Envoyer le code à {{identifier}}',
      blockButton__totp: "Utilisez votre application d'authentification",
      getHelp: {
        blockButton__emailSupport: 'Assistance par e-mail',
        content:
          "Si vous rencontrez des difficultés pour vous connecter à votre compte, envoyez-nous un e-mail et nous travaillerons avec vous pour rétablir l'accès dès que possible.",
        title: "Obtenir de l'aide",
      },
      subtitle: "Vous rencontrez des problèmes ? Vous pouvez utiliser l'une de ces méthodes pour vous connecter.",
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
      clientMismatch: {
        subtitle: 'Ce lien ne correspond pas à la demande en cours.',
        title: 'Erreur de correspondance du client',
      },
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
      subtitle: 'pour réinitialiser votre mot de passe',
      subtitle_email: "Tout d'abord, saisissez le code envoyé à votre adresse e-mail.",
      subtitle_phone: "Tout d'abord, saisissez le code envoyé à votre téléphone.",
      title: 'Réinitialiser le mot de passe',
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
    passkey: {
      subtitle: 'Utilisez une clé de sécurité pour continuer.',
      title: 'Clé de sécurité',
    },
    password: {
      actionLink: 'Utiliser une autre méthode',
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Tapez votre mot de passe',
    },
    passwordPwned: {
      title: 'Mot de passe compromis',
    },
    phoneCode: {
      formTitle: 'Code de vérification',
      resendButton: "Vous n'avez pas reçu de code ? Renvoyer",
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Vérifiez votre téléphone',
    },
    phoneCodeMfa: {
      formTitle: 'Code de vérification',
      resendButton: "Vous n'avez pas reçu de code ? Renvoyer",
      subtitle: 'Entrez le code envoyé à votre téléphone pour continuer.',
      title: 'Vérifiez votre téléphone',
    },
    resetPassword: {
      formButtonPrimary: 'Réinitialiser',
      requiredMessage: 'Pour des raisons de sécurité, il est nécessaire de réinitialiser votre mot de passe.',
      successMessage:
        'Votre mot de passe a été modifié avec succès. Nous vous reconnectons, veuillez patienter un instant.',
      title: 'Réinitialiser le mot de passe',
    },
    resetPasswordMfa: {
      detailsLabel: 'Nous devons vérifier votre identité avant de réinitialiser votre mot de passe.',
    },
    start: {
      actionLink: "S'inscrire",
      actionLink__join_waitlist: "Rejoindre la liste d'attente",
      actionLink__use_email: 'Utiliser e-mail',
      actionLink__use_email_username: "Utiliser l'e-mail ou le nom d'utilisateur",
      actionLink__use_passkey: 'Utiliser une clé de sécurité',
      actionLink__use_phone: 'Utiliser téléphone',
      actionLink__use_username: "Utiliser le nom d'utilisateur",
      actionText: "Vous n'avez pas encore de compte ?",
      actionText__join_waitlist: "Inscrivez-vous sur la liste d'attente",
      subtitle: 'pour continuer vers {{applicationName}}',
      title: "S'identifier",
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Le code de vérification',
      subtitle: "Entrez le code de l'application d'authentification.",
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
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Vérifiez votre e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Ce lien ne correspond pas à la demande en cours.',
        title: 'Erreur de correspondance du client',
      },
      formSubtitle: 'Utilisez le lien de vérification envoyé à votre adresse e-mail',
      formTitle: 'lien de vérification',
      loading: {
        title: 'Création de votre compte...',
      },
      resendButton: 'Renvoyer le lien',
      subtitle: 'pour continuer vers {{applicationName}}',
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
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: "J'accepte la Politique de confidentialité.",
        label__onlyTermsOfService: "J'accepte les Conditions d'utilisation.",
        label__termsOfServiceAndPrivacyPolicy:
          "J'accepte les Conditions d'utilisation et la Politique de confidentialité.",
      },
      continue: {
        subtitle: 'Lisez et acceptez les conditions pour continuer.',
        title: 'Consentement légal',
      },
    },
    phoneCode: {
      formSubtitle: 'Entrez le code de vérification envoyé à votre numéro de téléphone',
      formTitle: 'Le code de vérification',
      resendButton: 'Renvoyer le code',
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Vérifiez votre téléphone',
    },
    restrictedAccess: {
      actionLink: 'Contacter le support',
      actionText: 'Accès restreint.',
      blockButton__emailSupport: 'Contacter le support par e-mail',
      blockButton__joinWaitlist: "Rejoindre la liste d'attente",
      subtitle: "Vous n'avez pas la permission d'accéder à cette page.",
      subtitleWaitlist: "Inscrivez-vous pour demander l'accès.",
      title: 'Accès restreint',
    },
    start: {
      actionLink: "S'identifier",
      actionLink__use_email: 'Utiliser votre adresse e-mail',
      actionLink__use_phone: 'Utiliser votre téléphone',
      actionText: 'Vous avez déjà un compte ?',
      subtitle: 'pour continuer vers {{applicationName}}',
      title: 'Créez votre compte',
    },
  },
  socialButtonsBlockButton: 'Continuer avec {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: 'Afficher plus de boutons sociaux',
  unstable__errors: {
    already_a_member_in_organization: 'Vous êtes déjà membre de cette organisation.',
    captcha_invalid:
      "Inscription échouée en raison de validations de sécurité incorrectes. Veuillez rafraîchir la page pour réessayer ou contacter le support pour obtenir de l'aide.",
    captcha_unavailable:
      "Inscription échouée en raison d'une validation de captcha non réussie. Veuillez actualiser la page pour réessayer ou contacter le support pour obtenir de l'aide.",
    form_code_incorrect: 'Code incorrect',
    form_identifier_exists: 'Cet identifiant existe déjà. Veuillez en renseigner un différent.',
    form_identifier_exists__email_address: 'Cette adresse e-mail existe déjà.',
    form_identifier_exists__phone_number: 'Ce numéro de téléphone existe déjà.',
    form_identifier_exists__username: "Ce nom d'utilisateur existe déjà.",
    form_identifier_not_found: 'Identifiant introuvable',
    form_param_format_invalid: 'Le format est invalide',
    form_param_format_invalid__email_address: "L'adresse e-mail doit être une adresse e-mail valide.",
    form_param_format_invalid__phone_number: 'Le numéro de téléphone doit être au format international.',
    form_param_max_length_exceeded__first_name: 'Le prénom ne doit pas dépasser 256 caractères.',
    form_param_max_length_exceeded__last_name: 'Le nom ne doit pas dépasser 256 caractères.',
    form_param_max_length_exceeded__name: 'Le nom ne doit pas dépasser 256 caractères.',
    form_param_nil: 'Ce champ est requis.',
    form_param_value_invalid: 'La valeur fournie est invalide.',
    form_password_incorrect: 'Mot de passe incorrect',
    form_password_length_too_short: 'Votre mot de passe est trop court.',
    form_password_not_strong_enough: "Votre mot de passe n'est pas assez fort.",
    form_password_pwned:
      'Ce mot de passe a été compromis et ne peut pas être utilisé. Veuillez essayer un autre mot de passe à la place.',
    form_password_pwned__sign_in: 'Mot de passe compromis. Veuillez le réinitialiser.',
    form_password_size_in_bytes_exceeded:
      "Votre mot de passe a dépassé le nombre maximum d'octets autorisés. Veuillez le raccourcir ou supprimer certains caractères spéciaux.",
    form_password_validation_failed: 'Mot de passe incorrect',
    form_username_invalid_character: "L'identifiant contient des caractères invalides.",
    form_username_invalid_length: "Le nombre de caractères de l'identifiant est invalide.",
    identification_deletion_failed: 'Vous ne pouvez pas supprimer votre dernière identification.',
    not_allowed_access: 'Accès non autorisé',
    organization_domain_blocked: "Ce domaine d'organisation est bloqué.",
    organization_domain_common: 'Ce domaine est trop courant pour une organisation.',
    organization_membership_quota_exceeded: "Le quota de membres de l'organisation a été dépassé.",
    organization_minimum_permissions_needed: 'Permissions minimales nécessaires pour accéder à cette organisation.',
    passkey_already_exists: 'Cette clé de sécurité existe déjà.',
    passkey_not_supported: 'Les clés de sécurité ne sont pas prises en charge sur cet appareil.',
    passkey_pa_not_supported: 'Les clés de sécurité ne sont pas prises en charge dans cet environnement.',
    passkey_registration_cancelled: 'Enregistrement de la clé de sécurité annulé.',
    passkey_retrieval_cancelled: 'Récupération de la clé de sécurité annulée.',
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
      enterpriseSsoLink: {
        formHint: undefined,
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      removeResource: {
        messageLine1: '{{identifier}} sera supprimé de ce compte.',
        messageLine2: 'Vous ne pourrez plus vous connecter avec cette adresse e-mail.',
        successMessage: '{{emailAddress}} a été supprimé de votre compte.',
        title: "Supprimer l'adresse e-mail",
      },
      title: 'Ajouter une adresse e-mail',
      verifyTitle: 'Verifier un e-mail',
    },
    formButtonPrimary__add: 'Ajouter',
    formButtonPrimary__continue: 'Continuer',
    formButtonPrimary__finish: 'Retour',
    formButtonPrimary__remove: 'Supprimer',
    formButtonPrimary__save: 'Sauvegarder',
    formButtonReset: 'Annuler',
    mfaPage: {
      formHint: 'Sélectionnez une méthode à ajouter.',
      title: 'Ajouter la vérification en deux étapes',
    },
    mfaPhoneCodePage: {
      backButton: 'Utiliser un numéro existant',
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
        'Lors de la connexion, vous devrez entrer un code de vérification envoyé à ce numéro de téléphone comme étape supplémentaire.',
      successMessage2:
        "Enregistrez ces codes de récupérations et conservez-les en lieu sûr. Si vous perdez l'accès à votre appareil d'authentification, vous pourrez utiliser les codes de récupérations pour vous connecter.",
      successTitle: 'Vérification par SMS activée',
      title: 'Ajouter la vérification du code SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scannez le QR code à la place',
        buttonUnableToScan__nonPrimary: 'Vous ne pouvez pas scanner le QR code ?',
        infoText__ableToScan:
          "Configurez une nouvelle méthode de connexion dans votre application d'authentification et scannez le QR code suivant pour le lier à votre compte.",
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
      account: 'Compte',
      description: 'Gérer votre compte.',
      security: 'Sécurité',
      title: 'Profil',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: 'Êtes-vous sûr de vouloir supprimer cette clé de sécurité ?',
        title: 'Supprimer la clé de sécurité',
      },
      subtitle__rename: 'Renommez votre clé de sécurité pour une identification facile.',
      title__rename: 'Renommer la clé de sécurité',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Il est recommandé de se déconnecter de tous les autres appareils qui pourraient avoir utilisé votre ancien mot de passe.',
      readonly:
        "Votre mot de passe ne peut pas être modifié pour l'instant car vous ne pouvez vous connecter qu'à l'aide de la connexion entreprise.",
      successMessage__set: 'Votre mot de passe a été mis à jour.',
      successMessage__signOutOfOtherSessions: 'Tous les autres appareils ont été déconnectés.',
      successMessage__update: 'Votre mot de passe a été mis à jour.',
      title__set: 'Mettre à jour le mot de passe',
      title__update: 'Changer le mot de passe',
    },
    phoneNumberPage: {
      infoText: 'Un SMS contenant un lien de vérification sera envoyé à ce numéro de téléphone.',
      removeResource: {
        messageLine1: '{{identifier}} sera supprimé de ce compte.',
        messageLine2: 'Vous ne pourrez plus vous connecter avec ce numéro de téléphone.',
        successMessage: '{{phoneNumber}} a été supprimé de votre compte.',
        title: 'Supprimer le numéro de téléphone',
      },
      successMessage: '{{identifier}} a été vérifié et ajouté à votre compte.',
      title: 'Ajouter un numéro de téléphone',
      verifySubtitle: 'Saisissez le code de vérification envoyé à {{identifier}}',
      verifyTitle: 'Vérification du numéro de téléphone',
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
        actionLabel__reauthorize: 'Autoriser maintenant',
        destructiveActionTitle: 'Retirer',
        primaryButton: 'Connecter le compte',
        subtitle__disconnected: 'Compte déconnecté. Connectez-vous à nouveau pour accéder aux fonctionnalités.',
        subtitle__reauthorize:
          'Les autorisations requises ont été mises à jour, ce qui peut entraîner des fonctionnalités limitées. Veuillez ré-autoriser cette application pour éviter tout problème.',
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
        title: 'Comptes entreprises',
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
      passkeysSection: {
        menuAction__destructive: 'Supprimer',
        menuAction__rename: 'Renommer',
        title: 'Clés de sécurité',
      },
      passwordSection: {
        primaryButton__setPassword: 'Définir le mot de passe',
        primaryButton__updatePassword: 'Changer le mot de passe',
        title: 'Mot de passe',
      },
      phoneNumbersSection: {
        destructiveAction: 'Supprimer le numéro de téléphone',
        detailsAction__nonPrimary: 'Définir comme principale',
        detailsAction__primary: 'Compléter la vérification',
        detailsAction__unverified: 'Compléter la vérification',
        primaryButton: 'Ajouter un numéro de téléphone',
        title: 'Numéros de téléphone',
      },
      profileSection: {
        primaryButton: 'Mettre à jour le profil',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: "Définir le nom d'utilisateur",
        primaryButton__updateUsername: "Changer le nom d'utilisateur",
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
      title__set: "Mettre à jour le nom d'utilisateur",
      title__update: "Mettre à jour le nom d'utilisateur",
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
      web3WalletButtonsBlockButton: 'Utiliser un portefeuille Web3',
    },
  },

  waitlist: {
    start: {
      actionLink: "Rejoindre la liste d'attente",
      actionText: 'Intéressé ? Rejoignez-nous !',
      formButton: "S'inscrire",
      subtitle: 'Soyez parmi les premiers à découvrir notre nouveau service.',
      title: "Rejoindre la liste d'attente",
    },
    success: {
      message: "Merci ! Vous avez été ajouté à la liste d'attente.",
      subtitle: 'Nous vous contacterons bientôt avec plus de détails.',
      title: 'Inscription réussie',
    },
  },
} as const;
