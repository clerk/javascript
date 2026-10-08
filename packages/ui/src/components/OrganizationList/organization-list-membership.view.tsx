import { sharedMainIdentifierSx } from '@/ui/common/organizations/OrganizationPreview';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { PersonalWorkspacePreview } from '@/ui/elements/PersonalWorkspacePreview';

import { organizationListMessages } from './organization-list.messages';
import type {
  OrganizationListMembershipViewProps,
  OrganizationListPersonalAccountViewProps,
} from './organization-list.types';
import { OrganizationListPreviewButton } from './shared';

export const MembershipView = (props: OrganizationListMembershipViewProps) => {
  if (!props.isVisible) {
    return null;
  }

  return (
    <OrganizationListPreviewButton onClick={props.onClick}>
      <OrganizationPreview
        elementId='organizationList'
        mainIdentifierSx={sharedMainIdentifierSx}
        organization={props.organizationPreview}
      />
    </OrganizationListPreviewButton>
  );
};

export const PersonalAccountView = (props: OrganizationListPersonalAccountViewProps) => {
  if (!props.isVisible || !props.user) {
    return null;
  }

  return (
    <OrganizationListPreviewButton onClick={props.onClick}>
      <PersonalWorkspacePreview
        user={props.user}
        mainIdentifierSx={sharedMainIdentifierSx}
        title={organizationListMessages.organizations.personal}
      />
    </OrganizationListPreviewButton>
  );
};
