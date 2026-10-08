import { organizationListMessages } from './organization-list.messages';
import type { OrganizationListAcceptButtonProps, OrganizationListInvitationViewProps } from './organization-list.types';
import { PreviewListItem, PreviewListItemButton } from './shared';

export const InvitationButtonView = (props: OrganizationListAcceptButtonProps) => (
  <PreviewListItemButton
    isLoading={props.isLoading}
    onClick={props.onAccept}
    localizationKey={organizationListMessages.organizations.acceptInvitation}
  />
);

export const InvitationView = (props: OrganizationListInvitationViewProps) => {
  return (
    <PreviewListItem organizationData={props.organizationData}>
      <InvitationButtonView
        isLoading={props.isLoading}
        onAccept={props.onAccept}
      />
    </PreviewListItem>
  );
};
