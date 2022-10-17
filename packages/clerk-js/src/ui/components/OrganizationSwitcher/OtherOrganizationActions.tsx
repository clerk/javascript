import React from 'react';

import { SwitchArrows } from '../../../ui/icons';
import { Button, Flex, Icon } from '../../customizables';
import {
  Actions,
  OrganizationPreview,
  OrganizationPreviewProps,
  PersonalWorkspacePreview,
  PersonalWorkspacePreviewProps,
} from '../../elements';
import { useCardState } from '../../elements/contexts';
import { PropsOfComponent } from '../../styledSystem';

export const OrganizationActions = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Actions
      sx={theme => ({
        backgroundColor: theme.colors.$blackAlpha20,
        border: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
        paddingTop: theme.space.$3,
        paddingBottom: theme.space.$3,
      })}
      {...props}
    />
  );
};

type OrganizationPreviewButtonProps = PropsOfComponent<typeof Button> & OrganizationPreviewProps;

export const OrganizationPreviewButton = (props: OrganizationPreviewButtonProps) => {
  const card = useCardState();
  const { organization, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      isDisabled={card.isLoading}
      {...rest}
      sx={[
        theme => ({
          height: theme.sizes.$14,
          borderRadius: 0,
          justifyContent: 'space-between',
          padding: `${theme.space.$3} ${theme.space.$6}`,
          ':hover > svg': {
            visibility: 'initial',
          },
        }),
        rest.sx,
      ]}
    >
      <OrganizationPreview
        organization={organization}
        size='sm'
      />

      <Icon
        icon={SwitchArrows}
        sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
      />
    </Button>
  );
};

type PersonalWorkspacePreviewButtonProps = PropsOfComponent<typeof Button> & PersonalWorkspacePreviewProps;

export const PersonalWorkspacePreviewButton = (props: PersonalWorkspacePreviewButtonProps) => {
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
        theme => ({
          height: theme.sizes.$14,
          borderRadius: 0,
          justifyContent: 'space-between',
          padding: `${theme.space.$3} ${theme.space.$6}`,
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
