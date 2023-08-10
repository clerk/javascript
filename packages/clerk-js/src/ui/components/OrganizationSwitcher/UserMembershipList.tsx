import type { OrganizationResource } from '@clerk/types';
import React from 'react';

import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Box, descriptors, localizationKeys } from '../../customizables';
import { OrganizationPreview, PersonalWorkspacePreview, PreviewButton } from '../../elements';
import { SwitchArrows } from '../../icons';
import { common } from '../../styledSystem';

export type UserMembershipListProps = {
  onPersonalWorkspaceClick: React.MouseEventHandler;
  onOrganizationClick: (org: OrganizationResource) => unknown;
};
export const UserMembershipList = (props: UserMembershipListProps) => {
  const { onPersonalWorkspaceClick, onOrganizationClick } = props;

  const { hidePersonal } = useOrganizationSwitcherContext();
  const { organization: currentOrg } = useCoreOrganization();
  const { organizationList } = useCoreOrganizationList();
  const user = useCoreUser();

  const otherOrgs = (organizationList || []).map(e => e.organization).filter(o => o.id !== currentOrg?.id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

  return (
    <Box
      sx={t => ({
        maxHeight: `calc(4 * ${t.sizes.$12})`,
        overflowY: 'auto',
        ...common.unstyledScrollbar(t),
      })}
    >
      {currentOrg && !hidePersonal && (
        <PreviewButton
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          icon={SwitchArrows}
          sx={{ borderRadius: 0 }}
          onClick={onPersonalWorkspaceClick}
        >
          <PersonalWorkspacePreview
            user={userWithoutIdentifiers}
            size='sm'
            avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
            title={localizationKeys('organizationSwitcher.personalWorkspace')}
          />
        </PreviewButton>
      )}
      {otherOrgs.map(organization => (
        <PreviewButton
          key={organization.id}
          elementDescriptor={descriptors.organizationSwitcherPreviewButton}
          icon={SwitchArrows}
          sx={{ borderRadius: 0 }}
          onClick={() => onOrganizationClick(organization)}
        >
          <OrganizationPreview
            elementId='organizationSwitcher'
            avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
            organization={organization}
            size='sm'
          />
        </PreviewButton>
      ))}
    </Box>
  );
};
