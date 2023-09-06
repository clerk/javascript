import React from 'react';

import { Plus } from '../../../ui/icons';
import { useCoreUser } from '../../contexts';
import { descriptors, localizationKeys } from '../../customizables';
import { Action, SecondaryActions } from '../../elements';
import { UserInvitationSuggestionList } from './UserInvitationSuggestionList';
import type { UserMembershipListProps } from './UserMembershipList';
import { UserMembershipList } from './UserMembershipList';

export interface OrganizationActionListProps extends UserMembershipListProps {
  onCreateOrganizationClick: React.MouseEventHandler;
}

const CreateOrganizationButton = ({
  onCreateOrganizationClick,
}: Pick<OrganizationActionListProps, 'onCreateOrganizationClick'>) => {
  const user = useCoreUser();

  if (!user.createOrganizationEnabled) {
    return null;
  }

  return (
    <Action
      elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
      elementId={descriptors.organizationSwitcherPopoverActionButton.setId('createOrganization')}
      iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
      iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('createOrganization')}
      iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
      iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('createOrganization')}
      textElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonText}
      textElementId={descriptors.organizationSwitcherPopoverActionButtonText.setId('createOrganization')}
      icon={Plus}
      label={localizationKeys('organizationSwitcher.action__createOrganization')}
      onClick={onCreateOrganizationClick}
    />
  );
};

export const OrganizationActionList = (props: OrganizationActionListProps) => {
  const { onCreateOrganizationClick, onPersonalWorkspaceClick, onOrganizationClick } = props;

  return (
    <>
      <UserInvitationSuggestionList />
      <SecondaryActions elementDescriptor={descriptors.organizationSwitcherPopoverActions}>
        <UserMembershipList {...{ onPersonalWorkspaceClick, onOrganizationClick }} />
        <CreateOrganizationButton {...{ onCreateOrganizationClick }} />
      </SecondaryActions>
    </>
  );
};
