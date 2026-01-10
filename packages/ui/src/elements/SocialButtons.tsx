import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { useClerk } from '@clerk/shared/react';
import type { OAuthProvider, OAuthStrategy, PhoneCodeChannel, Web3Provider, Web3Strategy } from '@clerk/shared/types';
import type { Ref } from 'react';
import React, { forwardRef, isValidElement } from 'react';

import { ProviderInitialIcon } from '../common';
import type { LocalizationKey } from '../customizables';
import {
  Button,
  descriptors,
  Flex,
  Grid,
  Icon,
  localizationKeys,
  SimpleButton,
  Span,
  Spinner,
  Text,
  useAppearance,
} from '../customizables';
import { useEnabledThirdPartyProviders } from '../hooks';
import { useTotalEnabledAuthMethods } from '../hooks/useTotalEnabledAuthMethods';
import { mqu, type PropsOfComponent } from '../styledSystem';
import { sleep } from '../utils/sleep';
import { LastAuthenticationStrategyBadge } from './Badge';
import { useCardState } from './contexts';
import { distributeStrategiesIntoRows } from './utils';

const SOCIAL_BUTTON_BLOCK_THRESHOLD = 2;
const SOCIAL_BUTTON_PRE_TEXT_THRESHOLD = 1;
const MAX_STRATEGIES_PER_ROW = 5;
const SUPPORTS_MASK_IMAGE = ['apple', 'github', 'okx_wallet', 'vercel'];

export type SocialButtonsProps = React.PropsWithChildren<{
  enableOAuthProviders: boolean;
  enableWeb3Providers: boolean;
  enableAlternativePhoneCodeProviders: boolean;
}>;

type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
  web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
  alternativePhoneCodeCallback: (channel: PhoneCodeChannel) => void;
  idleAfterDelay?: boolean;
  showLastAuthenticationStrategy?: boolean;
};

const isWeb3Strategy = (val: string): val is Web3Strategy => {
  return val.startsWith('web3_');
};

const isPhoneCodeChannel = (val: string): val is PhoneCodeChannel => {
  return !!getAlternativePhoneCodeProviderData(val);
};

export const SocialButtons = React.memo((props: SocialButtonsRootProps) => {
  const {
    oauthCallback,
    web3Callback,
    alternativePhoneCodeCallback,
    enableOAuthProviders = true,
    enableWeb3Providers = true,
    enableAlternativePhoneCodeProviders = true,
    idleAfterDelay = true,
    showLastAuthenticationStrategy = false,
  } = props;
  const { web3Strategies, authenticatableOauthStrategies, strategyToDisplayData, alternativePhoneCodeChannels } =
    useEnabledThirdPartyProviders();
  const totalEnabledAuthMethods = useTotalEnabledAuthMethods();
  const card = useCardState();
  const clerk = useClerk();
  const { socialButtonsVariant } = useAppearance().parsedOptions;

  type TStrategy = OAuthStrategy | Web3Strategy | PhoneCodeChannel;

  const strategies: TStrategy[] = [
    ...(enableOAuthProviders ? authenticatableOauthStrategies : []),
    ...(enableWeb3Providers ? web3Strategies : []),
    ...(enableAlternativePhoneCodeProviders ? alternativePhoneCodeChannels : []),
  ];

  if (!strategies.length) {
    return null;
  }

  const clientLastAuth = showLastAuthenticationStrategy ? clerk.client?.lastAuthenticationStrategy : null;

  const isValidStrategy = (strategy: unknown): strategy is TStrategy => {
    return strategies.includes(strategy as TStrategy);
  };

  // Convert SAML strategies to OAuth strategies for consistency when matching last used strategy.
  const convertedClientLastAuth = clientLastAuth?.startsWith('saml_')
    ? clientLastAuth.replace('saml_', 'oauth_')
    : clientLastAuth;

  const lastAuthenticationStrategy =
    convertedClientLastAuth && isValidStrategy(convertedClientLastAuth) ? convertedClientLastAuth : null;

  const { strategyRows, lastAuthenticationStrategyPresent } = distributeStrategiesIntoRows<TStrategy>(
    [...strategies],
    MAX_STRATEGIES_PER_ROW,
    lastAuthenticationStrategy,
  );
  const strategyRowOneLength = strategyRows.at(lastAuthenticationStrategyPresent ? 1 : 0)?.length ?? 0;
  const remainingStrategiesLength = lastAuthenticationStrategyPresent ? strategies.length - 1 : strategies.length;
  const shouldForceSingleColumnOnMobile = !lastAuthenticationStrategyPresent && strategies.length === 2;

  const preferBlockButtons =
    socialButtonsVariant === 'blockButton'
      ? true
      : socialButtonsVariant === 'iconButton'
        ? false
        : strategies.length <= SOCIAL_BUTTON_BLOCK_THRESHOLD;

  const startOauth = async (strategy: OAuthStrategy | Web3Strategy) => {
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
    if (idleAfterDelay) {
      await sleep(5000);
      card.setIdle();
    }
  };

  const onSocialButtonClick = (strategy: OAuthStrategy | Web3Strategy | PhoneCodeChannel) => async () => {
    if (isPhoneCodeChannel(strategy)) {
      alternativePhoneCodeCallback(strategy);
    } else {
      await startOauth(strategy);
    }
  };

  const ButtonElement = preferBlockButtons ? SocialButtonBlock : SocialButtonIcon;

  return (
    <Flex
      direction='col'
      gap={2}
      elementDescriptor={descriptors.socialButtonsRoot}
    >
      {strategyRows.map((row, rowIndex) => (
        <Grid
          key={row.join('-')}
          elementDescriptor={descriptors.socialButtons}
          gap={2}
          sx={t => ({
            justifyContent: 'center',
            [mqu.sm]: {
              // Force single-column on mobile when 2 strategies are present (without last auth) to prevent
              // label overflow. When last auth is present, only 1 strategy remains here, so overflow isn't a concern.
              gridTemplateColumns: shouldForceSingleColumnOnMobile ? 'repeat(1, minmax(0, 1fr))' : undefined,
            },
            gridTemplateColumns:
              strategies.length < 1
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
          {row.map(strategy => {
            const shouldShowPreText =
              remainingStrategiesLength === SOCIAL_BUTTON_PRE_TEXT_THRESHOLD ||
              (strategy === lastAuthenticationStrategy && row.length === 1);

            const label = shouldShowPreText
              ? `Continue with ${strategyToDisplayData[strategy].name}`
              : strategyToDisplayData[strategy].name;

            const localizedText = shouldShowPreText
              ? localizationKeys('socialButtonsBlockButton', {
                  provider: strategyToDisplayData[strategy].name,
                })
              : localizationKeys('socialButtonsBlockButtonManyInView', {
                  provider: strategyToDisplayData[strategy].name,
                });

            const imageOrInitial = strategyToDisplayData[strategy].iconUrl ? (
              <Span
                elementDescriptor={[descriptors.providerIcon, descriptors.socialButtonsProviderIcon]}
                elementId={descriptors.socialButtonsProviderIcon.setId(strategyToDisplayData[strategy].id)}
                aria-label={`Sign in with ${strategyToDisplayData[strategy].name}`}
                sx={theme => ({
                  display: 'inline-block',
                  width: theme.sizes.$4,
                  height: theme.sizes.$4,
                  maxWidth: '100%',
                  ...(SUPPORTS_MASK_IMAGE.includes(strategyToDisplayData[strategy].id)
                    ? {
                        '--cl-icon-fill': theme.colors.$colorForeground,
                        backgroundColor: 'var(--cl-icon-fill)',
                        maskImage: `url(${strategyToDisplayData[strategy].iconUrl})`,
                        maskSize: 'cover',
                        maskPosition: 'center',
                        maskRepeat: 'no-repeat',
                      }
                    : {
                        backgroundImage: `url(${strategyToDisplayData[strategy].iconUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }),
                })}
              />
            ) : (
              <ProviderInitialIcon
                id={strategyToDisplayData[strategy].id}
                value={strategyToDisplayData[strategy].name}
                isLoading={card.loadingMetadata === strategy}
                isDisabled={card.isLoading}
              />
            );

            return (
              <ButtonElement
                key={strategy}
                id={strategyToDisplayData[strategy].id}
                onClick={onSocialButtonClick(strategy)}
                isLoading={card.loadingMetadata === strategy}
                isDisabled={card.isLoading}
                label={label}
                textLocalizationKey={localizedText}
                icon={imageOrInitial}
                lastAuthenticationStrategy={strategy === lastAuthenticationStrategy && totalEnabledAuthMethods > 1}
              />
            );
          })}
        </Grid>
      ))}
    </Flex>
  );
});

type SocialButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ReactElement;
  id: OAuthProvider | Web3Provider | PhoneCodeChannel;
  textLocalizationKey: LocalizationKey | undefined;
  label?: string;
  lastAuthenticationStrategy?: boolean;
};

const SocialButtonIcon = forwardRef((props: SocialButtonProps, ref: Ref<HTMLButtonElement> | null): JSX.Element => {
  const { icon, label, id, textLocalizationKey, lastAuthenticationStrategy, ...rest } = props;

  if (lastAuthenticationStrategy) {
    return (
      <SocialButtonBlock
        {...props}
        ref={ref}
      />
    );
  }

  return (
    <Button
      ref={ref}
      elementDescriptor={descriptors.socialButtonsIconButton}
      elementId={descriptors.socialButtonsIconButton.setId(id)}
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

const SocialButtonBlock = forwardRef((props: SocialButtonProps, ref: Ref<HTMLButtonElement> | null): JSX.Element => {
  const { id, icon, isLoading, label, textLocalizationKey, lastAuthenticationStrategy, ...rest } = props;
  const isIconElement = isValidElement(icon);

  return (
    <SimpleButton
      elementDescriptor={descriptors.socialButtonsBlockButton}
      elementId={descriptors.socialButtonsBlockButton.setId(id)}
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
      {lastAuthenticationStrategy && <LastAuthenticationStrategyBadge overlay />}

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
          elementDescriptor={descriptors.socialButtonsBlockButtonText}
          elementId={descriptors.socialButtonsBlockButtonText.setId(id)}
          as='span'
          truncate
          variant='buttonLarge'
          localizationKey={textLocalizationKey}
        >
          {label}
        </Text>
      </Flex>
    </SimpleButton>
  );
});
