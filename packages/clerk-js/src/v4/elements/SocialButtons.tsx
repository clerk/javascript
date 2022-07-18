import { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import React from 'react';

import { Button, descriptors, Flex, Grid, Image, useAppearance } from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import { mqu, PropsOfComponent } from '../styledSystem';
import { sleep } from '../utils';
import { ArrowBlockButton } from './ArrowBlockButton';
import { useCardState } from './contexts';

export type SocialButtonsProps = React.PropsWithChildren<{}>;

type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
  web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
};

const isWeb3Strategy = (val: string): val is Web3Strategy => {
  return val.startsWith('web3_');
};

export const SocialButtons = React.memo((props: SocialButtonsRootProps) => {
  const { oauthCallback, web3Callback } = props;
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const card = useCardState();
  const { socialButtonsVariant } = useAppearance().parsedLayout;

  if (!strategies.length) {
    return null;
  }

  const preferBlockButtons =
    socialButtonsVariant === 'blockButton'
      ? true
      : socialButtonsVariant === 'iconButton'
      ? false
      : strategies.length <= 3;

  const startOauth = (strategy: OAuthStrategy | Web3Strategy) => async () => {
    card.setLoading(strategy);
    if (isWeb3Strategy(strategy)) {
      await web3Callback(strategy);
    } else {
      await oauthCallback(strategy);
    }
    await sleep(5000);
    card.setIdle();
  };

  const ButtonElement = preferBlockButtons ? SocialButtonBlock : SocialButtonIcon;
  const WrapperElement = preferBlockButtons ? ButtonRows : ButtonGrid;

  return (
    <WrapperElement>
      {strategies.map(strategy => (
        <ButtonElement
          key={strategy}
          id={strategyToDisplayData[strategy].id}
          onClick={startOauth(strategy)}
          isLoading={card.loadingMetadata === strategy}
          isDisabled={card.isLoading}
          label={`Continue with ${strategyToDisplayData[strategy].name}`}
          icon={
            <Image
              elementDescriptor={descriptors.socialButtonsLogo}
              elementId={descriptors.socialButtonsLogo.setId(strategyToDisplayData[strategy].id)}
              isLoading={card.loadingMetadata === strategy}
              isDisabled={card.isLoading}
              src={strategyToDisplayData[strategy].iconUrl}
              alt={`Sign in with ${strategyToDisplayData[strategy].name}`}
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
    <Flex
      elementDescriptor={descriptors.socialButtons}
      gap={2}
      wrap='wrap'
    >
      {props.children}
    </Flex>
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
      sx={t => ({
        padding: 0,
        borderColor: t.colors.$blackAlpha200,
        height: t.sizes.$12,
        width: t.sizes.$12,
        [mqu.sm]: {
          height: t.sizes.$11,
          width: t.sizes.$11,
        },
      })}
      {...rest}
    >
      {icon}
    </Button>
  );
};

const SocialButtonBlock = (props: SocialButtonProps): JSX.Element => {
  const { label, id, ...rest } = props;

  return (
    <ArrowBlockButton
      elementDescriptor={descriptors.socialButtonsButtonBlock}
      elementId={descriptors.socialButtonsButtonBlock.setId(id)}
      textElementDescriptor={descriptors.socialButtonsButtonBlockText}
      textElementId={descriptors.socialButtonsButtonBlockText.setId(id)}
      arrowElementDescriptor={descriptors.socialButtonsButtonBlockArrow}
      arrowElementId={descriptors.socialButtonsButtonBlockArrow.setId(id)}
      {...rest}
    >
      {label}
    </ArrowBlockButton>
  );
};
