import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { Plus, SwitchArrows } from '../../../ui/icons';
import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationSwitcherContext,
} from '../../contexts';
import { Box, Button, Icon, localizationKeys, Text } from '../../customizables';
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
      icon={Plus}
      label={localizationKeys('organizationSwitcher.action__createOrganization')}
      onClick={onCreateOrganizationClick}
    />
  );

  return (
    <Actions
      sx={t => ({
        backgroundColor: t.colors.$blackAlpha20,
        border: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
        paddingTop: t.space.$3,
        paddingBottom: t.space.$3,
      })}
    >
      {currentOrg && !hidePersonal && (
        <PreviewButton
          sx={t => ({ marginBottom: t.space.$4 })}
          onClick={onPersonalWorkspaceClick}
        >
          <PersonalWorkspacePreview
            user={user}
            subtitle={localizationKeys('organizationSwitcher.personalWorkspace')}
          />
        </PreviewButton>
      )}
      {!!otherOrgs.length && (
        <Text
          size='xss'
          colorScheme='neutral'
          sx={t => ({
            paddingLeft: t.space.$6,
            marginBottom: t.space.$1,
            textTransform: 'uppercase',
          })}
          localizationKey={localizationKeys('organizationSwitcher.listTitle')}
        />
      )}
      <Box
        sx={t => ({
          maxHeight: `calc(3.5 * ${t.sizes.$14})`,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
        })}
      >
        {otherOrgs.map(organization => (
          <PreviewButton
            block
            key={organization.id}
            onClick={() => onOrganizationClick(organization)}
          >
            <OrganizationPreview
              organization={organization}
              user={user}
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
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      isDisabled={card.isLoading}
      {...rest}
      sx={[
        t => ({
          height: t.sizes.$14,
          borderRadius: 0,
          justifyContent: 'space-between',
          padding: `${t.space.$3} ${t.space.$6}`,
          ':hover > svg': {
            visibility: 'initial',
          },
        }),
        sx,
      ]}
    >
      {children}
      <Icon
        icon={SwitchArrows}
        sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
      />
    </Button>
  );
};
