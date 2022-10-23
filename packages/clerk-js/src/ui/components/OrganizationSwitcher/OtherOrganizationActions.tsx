import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { Plus, SwitchArrows } from '../../../ui/icons';
import { useCoreOrganization, useCoreOrganizationList, useCoreUser } from '../../contexts';
import { Box, Button, Icon, localizationKeys, Text } from '../../customizables';
import {
  Action,
  Actions,
  OrganizationPreview,
  OrganizationPreviewProps,
  PersonalWorkspacePreview,
} from '../../elements';
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
  const showPersonalAccount = true;

  const otherOrgs = (organizationList || []).map(e => e.organization).filter(o => o.id !== currentOrg?.id);
  console.log({ currentOrg, otherOrgs });

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
      {currentOrg && showPersonalAccount && (
        <PersonalWorkspacePreviewButton
          user={user}
          sx={t => ({ marginBottom: t.space.$4 })}
          onClick={onPersonalWorkspaceClick}
        />
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
          maxHeight: `calc(3 * ${t.sizes.$14})`,
          overflowY: 'scroll',
          ...common.unstyledScrollbar(t),
        })}
      >
        {otherOrgs.map(organization => (
          <OrganizationPreviewButton
            key={organization.id}
            organization={organization}
            user={user}
            onClick={() => onOrganizationClick(organization)}
          />
        ))}
      </Box>
      {createOrganizationButton}
    </Actions>
  );
};

export const OrganizationPreviewButton = (props: PropsOfComponent<typeof Button> & OrganizationPreviewProps) => {
  const card = useCardState();
  const { organization, user, ...rest } = props;

  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      isDisabled={card.isLoading}
      block
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
        rest.sx,
      ]}
    >
      <OrganizationPreview
        organization={organization}
        user={user}
        size='sm'
      />
      <Icon
        icon={SwitchArrows}
        sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
      />
    </Button>
  );
};

export const PersonalWorkspacePreviewButton = (
  props: PropsOfComponent<typeof Button> & PropsOfComponent<typeof PersonalWorkspacePreview>,
) => {
  const card = useCardState();
  const { user, ...rest } = props;
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
        rest.sx,
      ]}
    >
      <PersonalWorkspacePreview
        user={user}
        size='sm'
      />
      <Icon
        icon={SwitchArrows}
        sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
      />
    </Button>
  );
};
