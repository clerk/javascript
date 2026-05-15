import { iconImageUrl } from '@clerk/shared/constants';
import { useUser } from '@clerk/shared/react/index';
import React from 'react';

import type { LocalizationKey } from '@/customizables';
import { Box, Col, descriptors, Flow, Grid, localizationKeys, Span, Text, useLocalizations } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { common, mqu } from '@/styledSystem';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import type { ProviderType } from '../types';

/**
 * Provider icons whose SVGs are monochromatic and should flip with the
 * theme. Mirrors the SUPPORTS_MASK_IMAGE list in `common/ProviderIcon.tsx`
 * — keep in sync if either grows.
 */
const MONOCHROMATIC_PROVIDER_ICONS: ReadonlySet<string> = new Set(['okta']);

const PROVIDER_GROUPS: ReadonlyArray<{
  id: 'saml';
  label: LocalizationKey;
  options: ReadonlyArray<{ id: ProviderType; label: LocalizationKey; iconId: string }>;
}> = [
  {
    id: 'saml',
    label: localizationKeys('configureSSO.selectProviderStep.saml.groupLabel'),
    options: [
      { id: 'saml_okta', label: localizationKeys('configureSSO.selectProviderStep.saml.okta'), iconId: 'okta' },
      {
        id: 'saml_custom',
        label: localizationKeys('configureSSO.selectProviderStep.saml.customSaml'),
        iconId: 'saml',
      },
    ],
  },
];

export const SelectProviderStep = (): JSX.Element => {
  const { goToStep } = useWizard();
  const { setProvider, createEnterpriseConnection } = useConfigureSSO();
  const [selected, setSelected] = React.useState<ProviderType | null>(null);
  const { user } = useUser();
  const card = useCardState();

  const handleContinue = async () => {
    if (!selected || !user) {
      return;
    }

    setProvider(selected);

    const primaryEmailAddress = user?.primaryEmailAddress;
    const hasVerifiedPrimaryEmailAddress = primaryEmailAddress?.verification.status === 'verified';

    // If the user doesn't have a primary email address, go direct to the provide email step
    if (!primaryEmailAddress) {
      void goToStep('provide-email');
      return;
    }

    // If the user's primary email address is not verified, go to the verify email address step
    if (!hasVerifiedPrimaryEmailAddress) {
      void goToStep('verify-email-address');
      return;
    }

    // Otherwise, set the provider and create the enterprise connection
    try {
      await createEnterpriseConnection(selected);
    } catch (err) {
      handleError(err as Error, [], card.setError);
      return;
    }

    void goToStep('configure');
  };

  return (
    <Flow.Part part='selectProvider'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('select-provider')}
      >
        <Step.Header
          title={localizationKeys('configureSSO.selectProviderStep.title')}
          description={localizationKeys('configureSSO.selectProviderStep.subtitle')}
        />

        <Step.Body>
          <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
            <Col sx={theme => ({ gap: theme.space.$1x5 })}>
              <Text
                as='p'
                variant='subtitle'
                localizationKey={localizationKeys('configureSSO.selectProviderStep.body.title')}
              />

              <Text
                as='p'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.selectProviderStep.body.description')}
              />
            </Col>

            {PROVIDER_GROUPS.map(group => (
              <Col
                key={group.id}
                sx={theme => ({ gap: theme.space.$3 })}
              >
                <Text
                  as='label'
                  variant='subtitle'
                  localizationKey={group.label}
                />

                <Grid
                  gap={3}
                  sx={{
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    [mqu.sm]: {
                      gridTemplateColumns: '1fr',
                    },
                  }}
                >
                  {group.options.map(option => (
                    <ProviderCard
                      key={option.id}
                      name='configure-sso-provider'
                      value={option.id}
                      iconId={option.iconId}
                      label={option.label}
                      checked={selected === option.id}
                      onChange={() => setSelected(option.id)}
                    />
                  ))}
                </Grid>
              </Col>
            ))}

            <Alert
              variant='warning'
              title={localizationKeys('configureSSO.selectProviderStep.warning')}
            />

            {card.error && (
              <Alert
                variant='danger'
                title={card.error}
                sx={t => ({ margin: t.space.$3 })}
              />
            )}
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous isDisabled />

          <Step.Footer.Continue
            onClick={handleContinue}
            isLoading={card.isLoading}
            isDisabled={!selected}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type ProviderCardProps = {
  name: string;
  value: string;
  iconId: string;
  label: LocalizationKey;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ProviderCard = ({ name, value, iconId, label, checked, onChange }: ProviderCardProps): JSX.Element => {
  const { t } = useLocalizations();
  const labelText = t(label);

  return (
    <Box
      as='label'
      sx={theme => ({
        // Outline-button look (mirrors SimpleButton variant='outline' for visual continuity).
        borderWidth: theme.borderWidths.$normal,
        borderStyle: theme.borderStyles.$solid,
        borderColor: theme.colors.$borderAlpha150,
        borderRadius: theme.radii.$md,
        color: theme.colors.$neutralAlpha600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.$2,
        height: theme.sizes.$32,
        padding: theme.space.$1x5,
        backgroundColor: theme.colors.$colorBackground,
        cursor: 'pointer',
        position: 'relative',
        '&:hover': { backgroundColor: theme.colors.$neutralAlpha50 },
        // Keyboard focus indication — fires when the inner input is focused.
        '&:has(input:focus-visible)': {
          ...common.focusRingStyles(theme),
          borderColor: theme.colors.$borderAlpha300,
        },
        // Selected ring — CSS-driven via :checked so it survives focus changes.
        '&:has(input:checked)': {
          borderColor: theme.colors.$borderAlpha300,
          ...common.focusRingStyles(theme),
        },
      })}
    >
      <input
        type='radio'
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        css={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      />

      <Span
        aria-hidden
        sx={theme => {
          const isMonochromatic = MONOCHROMATIC_PROVIDER_ICONS.has(iconId);
          const baseSize = { width: theme.sizes.$8, height: theme.sizes.$8 };
          if (isMonochromatic) {
            return {
              ...baseSize,
              backgroundColor: theme.colors.$colorForeground,
              maskImage: `url(${iconImageUrl(iconId)})`,
              maskSize: 'contain',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
            };
          }
          return {
            ...baseSize,
            backgroundImage: `url(${iconImageUrl(iconId)})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          };
        }}
      />

      <Text
        as='span'
        variant='body'
        sx={theme => ({ color: theme.colors.$colorForeground })}
      >
        {labelText}
      </Text>
    </Box>
  );
};
