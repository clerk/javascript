import React from 'react';

import { descriptors, localizationKeys } from '../../customizables';
import { UserInvitationSuggestionList } from './UserInvitationSuggestionList';
import type { UserMembershipListProps } from './UserMembershipList';
import { UserMembershipList } from './UserMembershipList';
import { CreateOrganizationAction } from '@/common/CreateOrganizationAction';

export interface OrganizationActionListProps extends UserMembershipListProps {
  onCreateOrganizationClick: React.MouseEventHandler;
}

const CreateOrganizationButton = ({
  onCreateOrganizationClick,
}: Pick<OrganizationActionListProps, 'onCreateOrganizationClick'>) => {
  return (
    <CreateOrganizationAction
      elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
      elementId={descriptors.organizationSwitcherPopoverActionButton.setId('createOrganization')}
      iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
      iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('createOrganization')}
      iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
      iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('createOrganization')}
      label={localizationKeys('organizationSwitcher.action__createOrganization')}
      onClick={onCreateOrganizationClick}
      sx={t => ({
        padding: `${t.space.$5} ${t.space.$5}`,
      })}
      iconSx={t => ({
        width: t.sizes.$9,
        height: t.sizes.$6,
      })}
      iconBoxSx={t => ({
        width: t.sizes.$9,
        height: t.sizes.$6,
      })}
      spinnerSize='sm'
    />
  );
};

export const OrganizationActionList = (props: OrganizationActionListProps) => {
  const { onCreateOrganizationClick, onPersonalWorkspaceClick, onOrganizationClick } = props;

  return (
    <>
      <UserInvitationSuggestionList onOrganizationClick={onOrganizationClick} />
      <UserMembershipList {...{ onPersonalWorkspaceClick, onOrganizationClick }} />
      <CreateOrganizationButton {...{ onCreateOrganizationClick }} />
    </>
  );
};
