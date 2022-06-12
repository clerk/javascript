import { OAuthProvider, OAuthStrategy } from '@clerk/types';
import React from 'react';

import { BlockButtonIcon, Button, descriptors, Flex, Grid, Icon, Image } from '../customizables';
import { useEnabledOauthProviders, useLoadingStatus } from '../hooks';
import { ArrowRightIcon } from '../icons';
import { useCardState } from './contexts';

export type SocialButtonsProps = React.PropsWithChildren<{ buttonVariant?: 'icon' | 'block' }>;

type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
};

export const SocialButtonsRoot = React.memo((props: SocialButtonsRootProps): JSX.Element => {
  const { oauthCallback } = props;
  const { strategies, displayData } = useEnabledOauthProviders();
  const card = useCardState();
  const status = useLoadingStatus<OAuthStrategy>();

  const preferBlockButtons = props.buttonVariant ? props.buttonVariant === 'block' : strategies.length <= 3;

  const reset = () => {
    status.setIdle();
    card.setIdle();
  };

  const startOauth = (strategy: OAuthStrategy) => () => {
    status.setLoading(strategy);
    card.setLoading();
    return oauthCallback(strategy)
      .then(res => {
        setTimeout(reset, 2000);
        return res;
      })
      .catch(err => {
        reset();
        throw err;
      });
  };

  const ButtonElement = preferBlockButtons ? SocialButtonBlock : SocialButtonIcon;
  const WrapperElement = preferBlockButtons ? ButtonRows : ButtonGrid;

  return (
    <WrapperElement>
      {strategies.map(strategy => (
        <ButtonElement
          key={strategy}
          id={displayData[strategy].id}
          onClick={startOauth(strategy)}
          isLoading={status.loadingMetadata === strategy}
          isDisabled={status.isLoading || card.isLoading}
          label={`Continue with ${displayData[strategy].name}`}
          icon={
            <Image
              elementDescriptor={descriptors.socialButtonsLogo}
              elementId={descriptors.socialButtonsLogo.setId(displayData[strategy].id)}
              isLoading={status.loadingMetadata === strategy}
              isDisabled={status.isLoading || card.isLoading}
              src={displayData[strategy].iconUrl}
              alt={`Sign in with ${displayData[strategy].name}`}
              sx={theme => ({ width: theme.sizes.$5 })}
            />
          }
        />
      ))}
    </WrapperElement>
  );
});

const ButtonGrid = (props: React.PropsWithChildren<any>) => {
  return (
    <Grid
      elementDescriptor={descriptors.socialButtons}
      columns={6}
      gap={2}
      sx={{
        gridAutoRows: '1fr',
        '&:before': {
          content: "''",
          width: 0,
          paddingBottom: '100%',
          gridRow: '1/1',
          gridColumn: '1/1',
        },
        '& > :first-of-type': {
          gridRow: '1/1',
          gridColumn: '1/1',
        },
      }}
    >
      {props.children}
    </Grid>
  );
};

const ButtonRows = (props: React.PropsWithChildren<any>) => {
  return (
    <Grid
      elementDescriptor={descriptors.socialButtons}
      columns={1}
      gap={2}
    >
      {props.children}
    </Grid>
  );
};

const SocialButtonIcon = (props: SocialButtonProps): JSX.Element => {
  const { icon, label, id, ...rest } = props;
  return (
    <Button
      elementDescriptor={descriptors.socialButtonsButtonIcon}
      elementId={descriptors.socialButtonsButtonIcon.setId(id)}
      variant='icon'
      colorScheme='neutral'
      sx={{ padding: 0, height: 'unset' }}
      {...rest}
    >
      {icon}
    </Button>
  );
};

type SocialButtonProps = Parameters<typeof Button>[0] & { icon: React.ReactElement; id: OAuthProvider; label?: string };

// TODO: Can we refactor this and the BlockButtonWithArrow into 1 button?
// What about the selectors?
const SocialButtonBlock = (props: SocialButtonProps): JSX.Element => {
  const { icon, label, id, ...rest } = props;
  return (
    <BlockButtonIcon
      elementDescriptor={descriptors.socialButtonsButtonBlock}
      elementId={descriptors.socialButtonsButtonBlock.setId(id)}
      leftIcon={icon}
      rightIcon={
        <Icon
          elementDescriptor={descriptors.socialButtonsButtonBlockArrow}
          elementId={descriptors.socialButtonsButtonBlockArrow.setId(id)}
          icon={ArrowRightIcon}
        />
      }
      {...rest}
    >
      <Flex
        elementDescriptor={descriptors.socialButtonsButtonBlockText}
        elementId={descriptors.socialButtonsButtonBlockText.setId(id)}
        as='span'
        sx={{ width: '100%' }}
      >
        {label}
      </Flex>
    </BlockButtonIcon>
  );
};
