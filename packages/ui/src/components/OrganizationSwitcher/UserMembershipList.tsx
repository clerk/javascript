import type React from 'react';

import { useOrganizationSwitcherMembershipModel } from './organization-switcher-membership.model';
import { OrganizationSwitcherMembershipView } from './organization-switcher-membership.view';

export type UserMembershipListProps = {
  onPersonalWorkspaceClick: React.MouseEventHandler;
  onOrganizationClick: (organizationId: string) => unknown;
};

export const UserMembershipList = (props: UserMembershipListProps) => {
  const model = useOrganizationSwitcherMembershipModel(props.onOrganizationClick);
  return (
    <OrganizationSwitcherMembershipView
      {...model}
      onPersonalWorkspaceClick={props.onPersonalWorkspaceClick}
    />
  );
};
