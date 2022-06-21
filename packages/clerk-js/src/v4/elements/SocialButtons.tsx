import { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import React from 'react';

import { Button, descriptors, Grid, Image } from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import { PropsOfComponent } from '../styledSystem';
import { ArrowBlockButton } from './ArrowBlockButton';
import { useCardState } from './contexts';

export type SocialButtonsProps = React.PropsWithChildren<{ buttonVariant?: 'icon' | 'block' }>;

type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
  web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
};

const isWeb3Strategy = (val: string): val is Web3Strategy => {
  return val.startsWith('web3_');
};

export const SocialButtons = React.memo((props: SocialButtonsRootProps): JSX.Element => {
  const { oauthCallback, web3Callback, buttonVariant } = props;
  const { strategies, displayData } = useEnabledThirdPartyProviders();
  const card = useCardState();

  const preferBlockButtons = buttonVariant ? buttonVariant === 'block' : strategies.length <= 3;

  const startOauth = (strategy: OAuthStrategy | Web3Strategy) => async () => {
    card.setLoading(strategy);
    if (isWeb3Strategy(strategy)) {
      await web3Callback(strategy);
    } else {
      await oauthCallback(strategy);
    }
    setTimeout(() => card.setIdle(), 2000);
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
          isLoading={card.loadingMetadata === strategy}
          isDisabled={card.isLoading}
          label={`Continue with ${displayData[strategy].name}`}
          icon={
            <Image
              elementDescriptor={descriptors.socialButtonsLogo}
              elementId={descriptors.socialButtonsLogo.setId(displayData[strategy].id)}
              isLoading={card.loadingMetadata === strategy}
              isDisabled={card.isLoading}
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
      gap={2}
      sx={theme => ({
        '--cl-socialButtonSize': theme.sizes.$12,
        '--cl-socialButtonsPerLine': 'auto-fill',
        gridTemplateColumns: 'repeat(var(--cl-socialButtonsPerLine), minmax(var(--cl-socialButtonSize), 1fr))',
        gridAutoRows: 'var(--cl-socialButtonSize)',
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
      sx={theme => ({ padding: 0, height: '100%', width: '100%', borderColor: theme.colors.$blackAlpha200 })}
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
