import { localizationKeys } from '../../localization';

export const organizationListMessages = {
  header: {
    title: (hidePersonal: boolean) =>
      localizationKeys(hidePersonal ? 'organizationList.titleWithoutPersonal' : 'organizationList.title'),
    subtitle: (applicationName: string) => localizationKeys('organizationList.subtitle', { applicationName }),
  },
  organizations: {
    personal: localizationKeys('organizationSwitcher.personalWorkspace'),
    create: localizationKeys('organizationList.action__createOrganization'),
    createTitle: localizationKeys('organizationList.createOrganization'),
    acceptInvitation: localizationKeys('organizationList.action__invitationAccept'),
    acceptSuggestion: localizationKeys('organizationList.action__suggestionsAccept'),
    suggestionAccepted: localizationKeys('organizationList.suggestionsAcceptedLabel'),
  },
  errors: {
    unauthorized: localizationKeys('unstable__errors.organization_not_found_or_unauthorized'),
    unauthorizedWithoutCreation: localizationKeys(
      'unstable__errors.organization_not_found_or_unauthorized_with_create_organization_disabled',
    ),
  },
} as const;
