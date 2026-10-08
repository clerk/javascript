import type { OAuthProvider, OAuthStrategy, PhoneCodeChannel, Web3Provider, Web3Strategy } from '@clerk/shared/types';
import type { Ref } from 'react';
import React, { forwardRef, isValidElement } from 'react';

import { ProviderIcon } from '../common';
import type { LocalizationKey } from '../customizables';
import {
  Button,
  descriptors,
  Flex,
  Grid,
  Icon,
  localizationKeys,
  SimpleButton,
  Spinner,
  Text,
  useAppearance,
  useLocalizations,
} from '../customizables';
import { mqu, type PropsOfComponent } from '../styledSystem';
import { LastAuthenticationStrategyBadge } from './Badge';
import { useSocialButtonsController } from './social-buttons.controller';
import type { SocialStrategy } from './social-buttons.model';
import { useSocialButtonsModel } from './social-buttons.model';
import { distributeStrategiesIntoRows } from './utils';

const SOCIAL_BUTTON_BLOCK_THRESHOLD = 2;
const SOCIAL_BUTTON_PRE_TEXT_THRESHOLD = 1;
const MAX_STRATEGIES_PER_ROW = 5;

export type SocialButtonsProps = React.PropsWithChildren<{
  enableOAuthProviders: boolean;
  enableWeb3Providers: boolean;
  enableAlternativePhoneCodeProviders: boolean;
}>;

export type SocialButtonsRootProps = SocialButtonsProps & {
  oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
  web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
  alternativePhoneCodeCallback: (channel: PhoneCodeChannel) => void;
  idleAfterDelay?: boolean;
  showLastAuthenticationStrategy?: boolean;
};

export const SocialButtons = React.memo((props: SocialButtonsRootProps) => {
  const model = useSocialButtonsModel(props);
  const controller = useSocialButtonsController(model, props);
  return (
    <SocialButtonsView
      strategies={model.strategies}
      strategyToDisplayData={model.strategyToDisplayData}
      totalEnabledAuthMethods={model.totalEnabledAuthMethods}
      lastAuthenticationStrategy={model.lastAuthenticationStrategy}
      {...controller}
    />
  );
});

type SocialButtonsViewProps = Pick<
  ReturnType<typeof useSocialButtonsModel>,
  'strategies' | 'strategyToDisplayData' | 'totalEnabledAuthMethods' | 'lastAuthenticationStrategy'
> &
  ReturnType<typeof useSocialButtonsController>;

export const SocialButtonsView = ({
  strategies,
  strategyToDisplayData,
  totalEnabledAuthMethods,
  lastAuthenticationStrategy,
  isLoading,
  loadingMetadata,
  onSocialButtonClick,
}: SocialButtonsViewProps) => {
  const { t } = useLocalizations();
  const { socialButtonsVariant } = useAppearance().parsedOptions;
  if (!strategies.length) {
    return null;
  }
  const { strategyRows, lastAuthenticationStrategyPresent } = distributeStrategiesIntoRows<SocialStrategy>(
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
            const isLastAuthenticationStrategy = strategy === lastAuthenticationStrategy && totalEnabledAuthMethods > 1;
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

            const imageOrInitial = (
              <ProviderIcon
                id={strategyToDisplayData[strategy].id}
                iconUrl={strategyToDisplayData[strategy].iconUrl}
                name={strategyToDisplayData[strategy].name}
                isLoading={loadingMetadata === strategy}
                isDisabled={isLoading}
                aria-hidden
                elementDescriptor={[descriptors.providerIcon, descriptors.socialButtonsProviderIcon]}
                elementId={descriptors.socialButtonsProviderIcon.setId(strategyToDisplayData[strategy].id)}
              />
            );

            return (
              <ButtonElement
                key={strategy}
                id={strategyToDisplayData[strategy].id}
                onClick={() => {
                  void onSocialButtonClick(strategy)();
                }}
                isLoading={loadingMetadata === strategy}
                isDisabled={isLoading}
                label={label}
                aria-label={
                  preferBlockButtons || isLastAuthenticationStrategy
                    ? undefined
                    : t(
                        localizationKeys('socialButtonsBlockButton', {
                          provider: strategyToDisplayData[strategy].name,
                        }),
                      )
                }
                textLocalizationKey={localizedText}
                icon={imageOrInitial}
                lastAuthenticationStrategy={isLastAuthenticationStrategy}
              />
            );
          })}
        </Grid>
      ))}
    </Flex>
  );
};

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
      sx={{ width: '100%' }}
      {...rest}
    >
      {/* Reserve one line of button text so the icon button matches the height of the
          block button (and its siblings) across any theme spacing/font size, instead of
          pinning to a static minHeight that stops tracking the text-based controls. */}
      <Flex
        as='span'
        center
        sx={{ minHeight: '1lh' }}
      >
        {icon}
      </Flex>
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
