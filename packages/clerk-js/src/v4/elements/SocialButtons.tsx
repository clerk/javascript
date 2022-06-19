import { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import React from 'react';

import { BlockButtonIcon, Button, descriptors, Flex, Grid, Icon, Image } from '../customizables';
import { useEnabledThirdPartyProviders, useLoadingStatus } from '../hooks';
import { ArrowRightIcon } from '../icons';
import { PropsOfComponent } from '../styledSystem';
import { useCardState } from './contexts';

export type SocialButtonsProps = React.PropsWithChildren<{ buttonVariant?: 'icon' | 'block' }>;

type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
  web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
};

const isWeb3Strategy = (val: string): val is Web3Strategy => {
  return val.startsWith('web3_');
};

export const SocialButtonsRoot = React.memo((props: SocialButtonsRootProps): JSX.Element => {
  const { oauthCallback, web3Callback } = props;
  const { strategies, displayData } = useEnabledThirdPartyProviders();
  const card = useCardState();
  const status = useLoadingStatus<string>();

  const preferBlockButtons = props.buttonVariant ? props.buttonVariant === 'block' : strategies.length <= 3;

  const reset = () => {
    status.setIdle();
    card.setIdle();
  };

  const startOauth = (strategy: OAuthStrategy | Web3Strategy) => async () => {
    status.setLoading(strategy);
    card.setLoading();
    if (isWeb3Strategy(strategy)) {
      await web3Callback(strategy);
    } else {
      await oauthCallback(strategy);
    }
    setTimeout(reset, 2000);
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

type SocialButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ReactElement;
  id: OAuthProvider | Web3Provider;
  label?: string;
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
