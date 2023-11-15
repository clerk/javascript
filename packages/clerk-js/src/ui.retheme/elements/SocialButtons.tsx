import type { OAuthProvider, OAuthStrategy, Web3Provider, Web3Strategy } from '@clerk/types';
import type { Ref } from 'react';
import React, { forwardRef, isValidElement, useLayoutEffect, useRef, useState } from 'react';

import type { LocalizationKey } from '../customizables';
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
  useAppearance,
} from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { sleep } from '../utils';
import { useCardState } from './contexts';

const SOCIAL_BUTTON_BLOCK_THRESHOLD = 2;
const SOCIAL_BUTTON_PRE_TEXT_THRESHOLD = 1;
const MAX_STRATEGIES_PER_ROW = 6;

function distributeStrategiesIntoRows<T>(items: T[]): T[][] {
  if (items.length <= MAX_STRATEGIES_PER_ROW) return [items];

  const numArrays = Math.ceil(items.length / MAX_STRATEGIES_PER_ROW);
  const itemsPerArray = Math.ceil(items.length / numArrays);
  const arrays: T[][] = Array.from({ length: numArrays }, () => []);

  let currentArrayIndex = 0;

  for (const item of items) {
    arrays[currentArrayIndex].push(item);

    if (arrays[currentArrayIndex].length === itemsPerArray) {
      currentArrayIndex++;
    }
  }

  return arrays;
}

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
  const firstStrategyRef = useRef<HTMLButtonElement>(null);
  const { socialButtonsVariant } = useAppearance().parsedLayout;
  const [strategyWidth, setStrategyWidth] = useState(0);

  const strategies = [
    ...(enableOAuthProviders ? authenticatableOauthStrategies : []),
    ...(enableWeb3Providers ? web3Strategies : []),
  ];

  useLayoutEffect(() => {
    if (!firstStrategyRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      setStrategyWidth(firstStrategyRef.current?.clientWidth ?? 0);
    });

    resizeObserver.observe(firstStrategyRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!strategies.length) {
    return null;
  }

  const strategyRows = distributeStrategiesIntoRows([...strategies]);

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

  return (
    <Flex
      direction='col'
      gap={2}
    >
      {strategyRows.map((row, rowIndex) => (
        <Grid
          key={row.join('-')}
          elementDescriptor={descriptors.socialButtons}
          gap={2}
          sx={{
            // Allow the first row items to use the entire row's width, but the rest should have a fixed width based on the first row's items
            gridTemplateColumns: `repeat(${row.length}, ${rowIndex === 0 ? `1fr` : `${strategyWidth}px`})`,
            justifyContent: 'center',
          }}
        >
          {row.map((strategy, strategyIndex) => {
            const label =
              strategies.length === SOCIAL_BUTTON_PRE_TEXT_THRESHOLD
                ? `Continue with ${strategyToDisplayData[strategy].name}`
                : strategyToDisplayData[strategy].name;

            const localizedText =
              strategies.length === SOCIAL_BUTTON_PRE_TEXT_THRESHOLD
                ? localizationKeys('socialButtonsBlockButton', {
                    provider: strategyToDisplayData[strategy].name,
                  })
                : undefined;

            // When strategies break into 2 rows or more, use the first item of the first
            // row as reference for the width of the buttons in the second row and beyond
            const ref =
              strategies.length > MAX_STRATEGIES_PER_ROW && rowIndex === 0 && strategyIndex === 0
                ? firstStrategyRef
                : null;

            return (
              <div key={strategy}>
                <ButtonElement
                  id={strategyToDisplayData[strategy].id}
                  ref={ref}
                  onClick={startOauth(strategy)}
                  isLoading={card.loadingMetadata === strategy}
                  isDisabled={card.isLoading}
                  label={label}
                  textLocalizationKey={localizedText}
                  icon={
                    <Image
                      elementDescriptor={[descriptors.providerIcon, descriptors.socialButtonsProviderIcon]}
                      elementId={descriptors.socialButtonsProviderIcon.setId(strategyToDisplayData[strategy].id)}
                      isLoading={card.loadingMetadata === strategy}
                      isDisabled={card.isLoading}
                      src={strategyToDisplayData[strategy].iconUrl}
                      alt={`Sign in with ${strategyToDisplayData[strategy].name}`}
                      sx={theme => ({ width: theme.sizes.$4, height: 'auto', maxWidth: '100%' })}
                    />
                  }
                />
              </div>
            );
          })}
        </Grid>
      ))}
    </Flex>
  );
});

type SocialButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ReactElement;
  id: OAuthProvider | Web3Provider;
  textLocalizationKey: LocalizationKey | undefined;
  label?: string;
};

const SocialButtonIcon = forwardRef((props: SocialButtonProps, ref: Ref<HTMLButtonElement> | null): JSX.Element => {
  const { icon, label, id, textLocalizationKey, ...rest } = props;

  return (
    <Button
      ref={ref}
      elementDescriptor={descriptors.socialButtonsIconButton}
      elementId={descriptors.socialButtonsIconButton.setId(id)}
      variant='icon'
      colorScheme='neutral'
      sx={{
        width: '100%',
      }}
      {...rest}
    >
      {icon}
    </Button>
  );
});

const SocialButtonBlock = (props: SocialButtonProps): JSX.Element => {
  const { icon, isLoading, label, textLocalizationKey, ...rest } = props;
  const isIconElement = isValidElement(icon);

  return (
    <SimpleButton
      variant='outline'
      colorScheme='neutral'
      block
      isLoading={isLoading}
      {...rest}
      sx={theme => [
        {
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'flex-start',
          borderColor: theme.colors.$blackAlpha200,
        },
        props.sx,
      ]}
    >
      <Flex
        justify='center'
        align='center'
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
              <Spinner size='sm' />
            ) : !isIconElement && icon ? (
              <Icon
                icon={icon as unknown as React.ComponentType}
                sx={[
                  theme => ({
                    color: theme.colors.$blackAlpha600,
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
          colorScheme='inherit'
          variant='buttonSmallRegular'
          localizationKey={textLocalizationKey}
        >
          {label}
        </Text>
      </Flex>
    </SimpleButton>
  );
};
