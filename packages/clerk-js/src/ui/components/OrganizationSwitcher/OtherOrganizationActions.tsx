import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { Plus, SwitchArrows } from '../../../ui/icons';
import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Box, Button, descriptors, Icon, localizationKeys } from '../../customizables';
import { Action, Actions, OrganizationPreview, PersonalWorkspacePreview } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { common, PropsOfComponent } from '../../styledSystem';

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
    <Actions
      elementDescriptor={descriptors.organizationSwitcherPopoverActions}
      sx={t => ({
        backgroundColor: t.colors.$blackAlpha20,
        borderTop: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
      })}
    >
      <Box
        sx={t => ({
          maxHeight: `calc(4 * ${t.sizes.$12})`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {currentOrg && !hidePersonal && (
          <PreviewButton
            block
            sx={t => ({
              height: t.space.$12,
            })}
            onClick={onPersonalWorkspaceClick}
          >
            <PersonalWorkspacePreview
              user={{ profileImageUrl: user.profileImageUrl }}
              size='sm'
              avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
              title={localizationKeys('organizationSwitcher.personalWorkspace')}
            />
          </PreviewButton>
        )}
        {otherOrgs.map(organization => (
          <PreviewButton
            block
            sx={t => ({
              height: t.space.$12,
            })}
            key={organization.id}
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
      {createOrganizationButton}
    </Actions>
  );
};

const PreviewButton = (props: PropsOfComponent<typeof Button>) => {
  const { sx, children, ...rest } = props;
  const card = useCardState();

  return (
    <Button
      elementDescriptor={descriptors.organizationSwitcherPreviewButton}
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      hoverAsFocus
      isDisabled={card.isLoading}
      sx={[
        t => ({
          minHeight: 'unset',
          borderRadius: 0,
          justifyContent: 'space-between',
          padding: `${t.space.$3} ${t.space.$6}`,
          ':hover > svg': {
            visibility: 'initial',
          },
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
      <Icon
        icon={SwitchArrows}
        sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
      />
    </Button>
  );
};
