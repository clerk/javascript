import { withCardStateProvider } from '@/ui/elements/contexts';
import { useInvitationAcceptanceController } from '@/ui/hooks/useInvitationAcceptanceController';

import type { OrganizationListInvitation } from './organization-list.types';
import { InvitationView } from './organization-list-invitation.view';
import { MembershipPreview } from './UserMembershipList';

export const InvitationPreview = withCardStateProvider(({ model }: { model: OrganizationListInvitation }) => {
  const acceptance = useInvitationAcceptanceController(model.accept);

  return acceptance.state.status === 'accepted' && acceptance.state.value ? (
    <MembershipPreview model={acceptance.state.value} />
  ) : (
    <InvitationView
      organizationData={model.organizationData}
      isLoading={acceptance.isLoading}
      onAccept={() => void acceptance.onAccept()}
    />
  );
});
