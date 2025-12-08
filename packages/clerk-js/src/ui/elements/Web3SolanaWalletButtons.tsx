import { WalletReadyState } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { MAINNET_ENDPOINT } from '@solana/wallet-standard';
import type { Ref } from 'react';
import React, { forwardRef, isValidElement, useMemo } from 'react';

import { ProviderInitialIcon } from '@/ui/common';
import {
  Button,
  descriptors,
  Flex,
  Grid,
  Icon,
  Image,
  localizationKeys,
  SimpleButton,
  Spinner,
  Text,
  useLocalizations,
} from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { LinkRenderer } from '@/ui/elements/LinkRenderer';
import { distributeStrategiesIntoRows } from '@/ui/elements/utils';
import { mqu, type PropsOfComponent } from '@/ui/styledSystem';
import { sleep } from '@/ui/utils/sleep';

type Web3WalletButtonsProps = {
  web3AuthCallback: ({ walletName }: { walletName: string }) => Promise<unknown>;
};

const SOCIAL_BUTTON_BLOCK_THRESHOLD = 2;
const SOCIAL_BUTTON_PRE_TEXT_THRESHOLD = 1;
const MAX_STRATEGIES_PER_ROW = 5;

const Web3SolanaWalletButtonsInner = ({ web3AuthCallback }: Web3WalletButtonsProps) => {
  const card = useCardState();
  const { wallets } = useWallet();
  const { t } = useLocalizations();

  // Filter to only show installed wallets
  const installedWallets = React.useMemo(
    () =>
      wallets
        .filter(w => {
          return w.readyState === WalletReadyState.Installed;
        })
        .map(wallet => {
          return {
            name: wallet.adapter.name,
            icon: wallet.adapter.icon,
          };
        }),
    [wallets],
  );

  const startWeb3AuthFlow = (walletName: string) => async () => {
    card.setLoading(walletName);
    try {
      await web3AuthCallback({ walletName });
    } catch {
      await sleep(1000);
    } finally {
      card.setIdle();
    }
  };

  const { strategyRows } = distributeStrategiesIntoRows(installedWallets, MAX_STRATEGIES_PER_ROW, undefined);
  const strategyRowOneLength = strategyRows.at(0)?.length ?? 0;
  const shouldForceSingleColumnOnMobile = installedWallets.length === 2;
  const ButtonElement = installedWallets.length <= SOCIAL_BUTTON_BLOCK_THRESHOLD ? WalletButtonBlock : WalletButtonIcon;

  if (installedWallets.length === 0) {
    return (
      <Card.Alert>
        <LinkRenderer
          text={t(
            localizationKeys('web3WalletButtons.noneAvailable', {
              solanaWalletsLink: 'https://solana.com/solana-wallets',
            }),
          )}
          isExternal
          sx={t => ({
            textDecoration: 'underline',
            textUnderlineOffset: t.space.$1,
            color: 'inherit',
          })}
        />
      </Card.Alert>
    );
  }

  return (
    <Flex
      direction='col'
      gap={2}
    >
      {strategyRows.map((row, rowIndex) => (
        <Grid
          key={row
            .map(r => {
              return r.name;
            })
            .join('-')}
          gap={2}
          sx={t => ({
            justifyContent: 'center',
            [mqu.sm]: {
              // Force single-column on mobile when 2 strategies are present (without last auth) to prevent
              // label overflow. When last auth is present, only 1 strategy remains here, so overflow isn't a concern.
              gridTemplateColumns: shouldForceSingleColumnOnMobile ? 'repeat(1, minmax(0, 1fr))' : undefined,
            },
            gridTemplateColumns:
              wallets.length < 1
                ? `repeat(1, minmax(0, 1fr))`
                : `repeat(${row.length}, ${
                    rowIndex === 0
                      ? `minmax(0, 1fr)`
                      : // Calculate the width of each button based on the width of the buttons within the first row.
                        // t.sizes.$2 is used here to represent the gap defined on the Grid component.
                        `minmax(0, calc((100% - (${strategyRowOneLength} - 1) * ${t.sizes.$2}) / ${strategyRowOneLength}))`
                  })`,
          })}
        >
          {row.map(w => {
            const shouldShowPreText = installedWallets.length === SOCIAL_BUTTON_PRE_TEXT_THRESHOLD;
            const label = shouldShowPreText
              ? localizationKeys('web3WalletButtons.continue', { walletName: w.name })
              : w.name;

            const imageOrInitial = w.icon ? (
              <Image
                isDisabled={card.isLoading}
                isLoading={card.loadingMetadata === w.name}
                src={w.icon}
                alt={t(localizationKeys('web3WalletButtons.connect', { walletName: w.name }))}
                sx={theme => ({ width: theme.sizes.$4, height: 'auto', maxWidth: '100%' })}
              />
            ) : (
              <ProviderInitialIcon
                value={w.name}
                isDisabled={card.isLoading}
                id={'linear'}
              />
            );

            return (
              <ButtonElement
                key={w.name}
                id={w.name}
                onClick={startWeb3AuthFlow(w.name)}
                isLoading={card.loadingMetadata === w.name}
                isDisabled={card.isLoading}
                label={t(label)}
                icon={imageOrInitial}
              />
            );
          })}
        </Grid>
      ))}
    </Flex>
  );
};

type WalletButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ReactElement;
  id: string;
  label: string;
};

const WalletButtonIcon = forwardRef((props: WalletButtonProps, ref: Ref<HTMLButtonElement> | null): JSX.Element => {
  const { icon, label, id, ...rest } = props;

  return (
    <Button
      ref={ref}
      textVariant='buttonLarge'
      variant='outline'
      colorScheme='neutral'
      hoverAsFocus
      sx={t => ({
        minHeight: t.sizes.$8,
        width: '100%',
      })}
      {...rest}
    >
      {icon}
    </Button>
  );
});

const WalletButtonBlock = forwardRef((props: WalletButtonProps, ref: Ref<HTMLButtonElement> | null): JSX.Element => {
  const { id, icon, isLoading, label, ...rest } = props;
  const isIconElement = isValidElement(icon);

  return (
    <SimpleButton
      variant='outline'
      block
      isLoading={isLoading}
      hoverAsFocus
      ref={ref}
      {...rest}
      sx={theme => [
        {
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'flex-start',
        },
        props.sx,
      ]}
    >
      <Flex
        justify='center'
        align='center'
        as='span'
        gap={3}
        sx={{
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {(isLoading || icon) && (
          <Flex
            as='span'
            center
            sx={theme => ({ flex: `0 0 ${theme.space.$4}` })}
          >
            {isLoading ? (
              <Spinner
                size='sm'
                elementDescriptor={descriptors.spinner}
              />
            ) : !isIconElement && icon ? (
              <Icon
                icon={icon as unknown as React.ComponentType}
                sx={[
                  theme => ({
                    color: theme.colors.$neutralAlpha600,
                    width: theme.sizes.$4,
                    position: 'absolute',
                  }),
                ]}
              />
            ) : (
              icon
            )}
          </Flex>
        )}
        <Text
          as='span'
          truncate
          variant='buttonLarge'
        >
          {label}
        </Text>
      </Flex>
    </SimpleButton>
  );
});

export const Web3SolanaWalletButtons = (props: Web3WalletButtonsProps) => {
  const network = MAINNET_ENDPOINT;
  const wallets = useMemo(() => [], [network]);
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider
        wallets={wallets}
        onError={err => {
          console.error(err);
        }}
      >
        <Web3SolanaWalletButtonsInner web3AuthCallback={props.web3AuthCallback} />
      </WalletProvider>
    </ConnectionProvider>
  );
};
