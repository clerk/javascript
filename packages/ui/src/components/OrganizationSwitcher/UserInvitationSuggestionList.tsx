import { withCardStateProvider } from '@/ui/elements/contexts';
import { useInvitationAcceptanceController } from '@/ui/hooks/useInvitationAcceptanceController';

import { useOrganizationSwitcherInvitationController } from './organization-switcher-invitation.controller';
import { OrganizationSwitcherInvitationView } from './organization-switcher-invitation.view';
import { useOrganizationSwitcherInvitationsModel } from './organization-switcher-invitations.model';
import type {
  OrganizationSwitcherInvitationData,
  OrganizationSwitcherSuggestionData,
} from './organization-switcher-invitations.types';
import {
  OrganizationSwitcherInvitationPreview,
  OrganizationSwitcherInvitationsView,
} from './organization-switcher-invitations.view';
import { OrganizationSwitcherSuggestionButtonView } from './organization-switcher-suggestion.view';

type UserInvitationSuggestionListProps = { onOrganizationClick: (organizationId: string) => unknown };

const InvitationPreview = withCardStateProvider(({ model }: { model: OrganizationSwitcherInvitationData }) => {
  const controller = useOrganizationSwitcherInvitationController(model);
  return <OrganizationSwitcherInvitationView {...controller} />;
});

export const SuggestionPreview = withCardStateProvider(({ model }: { model: OrganizationSwitcherSuggestionData }) => {
  const acceptance = useInvitationAcceptanceController(model.accept);
  return (
    <OrganizationSwitcherInvitationPreview organizationData={model.organizationData}>
      <OrganizationSwitcherSuggestionButtonView
        isAccepted={model.isAccepted}
        isLoading={acceptance.isLoading}
        onAccept={acceptance.onAccept}
      />
    </OrganizationSwitcherInvitationPreview>
  );
});

export const UserInvitationSuggestionList = (props: UserInvitationSuggestionListProps) => {
  const { invitations, suggestions, scopeKey, ...displayData } = useOrganizationSwitcherInvitationsModel(
    props.onOrganizationClick,
  );
  const invitationRows = invitations.map(model => (
    <InvitationPreview
      key={model.id}
      model={model}
    />
  ));
  const suggestionRows = suggestions.map(model => (
    <SuggestionPreview
      key={model.id}
      model={model}
    />
  ));
  return (
    <OrganizationSwitcherInvitationsView
      key={scopeKey}
      {...displayData}
      invitationRows={invitationRows}
      suggestionRows={suggestionRows}
    />
  );
};
