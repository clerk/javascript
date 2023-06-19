import type { OrganizationResource } from '@clerk/types';
import React from 'react';

import { Plus, SwitchArrows } from '../../../ui/icons';
import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Box, descriptors, localizationKeys } from '../../customizables';
import { Action, OrganizationPreview, PersonalWorkspacePreview, PreviewButton, SecondaryActions } from '../../elements';
import { common } from '../../styledSystem';

type OrganizationActionListProps = {
  onCreateOrganizationClick: React.MouseEventHandler;
  onPersonalWorkspaceClick: React.MouseEventHandler;
  onOrganizationClick: (org: OrganizationResource) => unknown;
};

export const OrganizationActionList = (props: OrganizationActionListProps) => {
  const { onCreateOrganizationClick, onPersonalWorkspaceClick, onOrganizationClick } = props;
  const { organizationList } = useCoreOrganizationList();
  const { organization: currentOrg } = useCoreOrganization();
  const user = useCoreUser();
  const { hidePersonal } = useOrganizationSwitcherContext();

  const otherOrgs = (organizationList || []).map(e => e.organization).filter(o => o.id !== currentOrg?.id);

  const createOrganizationButton = (
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

  return (
    <SecondaryActions elementDescriptor={descriptors.organizationSwitcherPopoverActions}>
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
              user={user}
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
              elementId={'organizationSwitcher'}
              avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
              organization={organization}
              size='sm'
            />
          </PreviewButton>
        ))}
      </Box>
      {user.createOrganizationEnabled && createOrganizationButton}
    </SecondaryActions>
  );
};
