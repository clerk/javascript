import type { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import React from 'react';

import { Button, descriptors, Grid, Image, localizationKeys, useAppearance } from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { sleep } from '../utils';
import { ArrowBlockButton } from './ArrowBlockButton';
import { useCardState } from './contexts';

const SOCIAL_BUTTON_BLOCK_THRESHOLD = 2;

export type SocialButtonsProps = React.PropsWithChildren<{
  enableOAuthProviders: boolean;
  enableWeb3Providers: boolean;
}>;

type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
  web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
};

const isWeb3Strategy = (val: string): val is Web3Strategy => {
  return val.startsWith('web3_');
};

export const SocialButtons = React.memo((props: SocialButtonsRootProps) => {
  const { oauthCallback, web3Callback, enableOAuthProviders = true, enableWeb3Providers = true } = props;
  const { web3Strategies, authenticatableOauthStrategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const card = useCardState();
  const { socialButtonsVariant } = useAppearance().parsedLayout;

  const strategies = [
    ...(enableOAuthProviders ? authenticatableOauthStrategies : []),
    ...(enableWeb3Providers ? web3Strategies : []),
  ];

  if (!strategies.length) {
    return null;
  }

  const preferBlockButtons =
    socialButtonsVariant === 'blockButton'
      ? true
      : socialButtonsVariant === 'iconButton'
      ? false
      : strategies.length <= SOCIAL_BUTTON_BLOCK_THRESHOLD;

  const startOauth = (strategy: OAuthStrategy | Web3Strategy) => async () => {
    card.setLoading(strategy);
    try {
      if (isWeb3Strategy(strategy)) {
        await web3Callback(strategy);
      } else {
        await oauthCallback(strategy);
      }
    } catch {
      await sleep(1000);
      card.setIdle();
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
          providerName={strategyToDisplayData[strategy].name}
          onClick={startOauth(strategy)}
          isLoading={card.loadingMetadata === strategy}
          isDisabled={card.isLoading}
          label={`Continue with ${strategyToDisplayData[strategy].name}`}
          icon={
            <Image
              elementDescriptor={[descriptors.providerIcon, descriptors.socialButtonsProviderIcon]}
              elementId={descriptors.socialButtonsProviderIcon.setId(strategyToDisplayData[strategy].id)}
              isLoading={card.loadingMetadata === strategy}
              isDisabled={card.isLoading}
              src={strategyToDisplayData[strategy].iconUrl}
              alt={`Sign in with ${strategyToDisplayData[strategy].name}`}
              sx={theme => ({ width: theme.sizes.$5, height: 'auto', maxWidth: '100%' })}
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
      gap={2}
      sx={t => ({
        gridTemplateColumns: `repeat(auto-fit, minmax(${t.sizes.$12}, 1fr))`,
        gridAutoRows: t.sizes.$12,
      })}
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
  providerName: string;
  label?: string;
};

const SocialButtonIcon = (props: SocialButtonProps): JSX.Element => {
  const { icon, label, id, providerName, ...rest } = props;
  return (
    <Button
      elementDescriptor={descriptors.socialButtonsIconButton}
      elementId={descriptors.socialButtonsIconButton.setId(id)}
      variant='icon'
      colorScheme='neutral'
      sx={t => ({
        padding: 0,
        borderColor: t.colors.$blackAlpha200,
      })}
      {...rest}
    >
      {icon}
    </Button>
  );
};

const SocialButtonBlock = (props: SocialButtonProps): JSX.Element => {
  const { label, id, providerName, sx, icon, ...rest } = props;

  return (
    <ArrowBlockButton
      elementDescriptor={descriptors.socialButtonsBlockButton}
      elementId={descriptors.socialButtonsBlockButton.setId(id)}
      textElementDescriptor={descriptors.socialButtonsBlockButtonText}
      textElementId={descriptors.socialButtonsBlockButtonText.setId(id)}
      textLocalizationKey={localizationKeys('socialButtonsBlockButton', { provider: providerName })}
      arrowElementDescriptor={descriptors.socialButtonsBlockButtonArrow}
      arrowElementId={descriptors.socialButtonsBlockButtonArrow.setId(id)}
      leftIcon={icon}
      sx={[
        {
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
        sx,
      ]}
      {...rest}
    >
      {label}
    </ArrowBlockButton>
  );
};
