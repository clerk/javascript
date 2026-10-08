import { useInvitationAcceptanceController } from '@/ui/hooks/useInvitationAcceptanceController';

import type {
  OrganizationSwitcherInvitationData,
  OrganizationSwitcherInvitationViewProps,
} from './organization-switcher-invitations.types';
export const useOrganizationSwitcherInvitationController = (
  model: OrganizationSwitcherInvitationData,
): OrganizationSwitcherInvitationViewProps => {
  const acceptance = useInvitationAcceptanceController(model.accept);
  const acceptedOrganization =
    acceptance.state.status === 'accepted' ? acceptance.state.value : model.acceptedOrganization;
  const isAccepted = model.isAccepted;

  return {
    organizationData: model.organizationData,
    isAccepted,
    isHidden:
      isAccepted &&
      (model.organizationData.id === model.activeOrganizationId ||
        (!!acceptedOrganization?.id && model.activeOrganizationId === acceptedOrganization.id)),
    isLoading: acceptance.isLoading || acceptance.state.status === 'pending',
    onAcceptedClick: acceptedOrganization?.onClick,
    onAccept: acceptance.onAccept,
  };
};
