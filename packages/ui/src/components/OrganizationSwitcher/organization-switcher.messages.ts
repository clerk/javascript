import { localizationKeys } from '../../localization';

export const organizationSwitcherMessages = {
  trigger: {
    open: localizationKeys('organizationSwitcher.action__openOrganizationSwitcher'),
    close: localizationKeys('organizationSwitcher.action__closeOrganizationSwitcher'),
  },
  organizations: {
    personal: localizationKeys('organizationSwitcher.personalWorkspace'),
    notSelected: localizationKeys('organizationSwitcher.notSelected'),
    acceptInvitation: localizationKeys('organizationSwitcher.action__invitationAccept'),
    acceptSuggestion: localizationKeys('organizationSwitcher.action__suggestionsAccept'),
    suggestionAccepted: localizationKeys('organizationSwitcher.suggestionsAcceptedLabel'),
  },
  manage: {
    settings: localizationKeys('organizationSwitcher.action__manageOrganization'),
    create: localizationKeys('organizationSwitcher.action__createOrganization'),
  },
} as const;
