import { iconImageUrl } from '@clerk/shared/constants';
import { useUser } from '@clerk/shared/react/index';
import React from 'react';

import type { LocalizationKey } from '@/customizables';
import {
  Col,
  descriptors,
  Flow,
  Grid,
  localizationKeys,
  RadioInput,
  SimpleButton,
  Span,
  Text,
  useLocalizations,
} from '@/customizables';
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
  const { provider, setProvider, createEnterpriseConnection } = useConfigureSSO();

  // Re-hydrate from context so users returning from `verify-domain`
  // (after picking a provider but needing to verify their email first)
  // don't have to re-click their provider.
  const [selected, setSelected] = React.useState<ProviderType | null>(provider ?? null);
  const { user } = useUser();
  const card = useCardState();

  const handleContinue = async () => {
    if (!selected || !user) {
      return;
    }

    setProvider(selected);

    const primaryEmailAddress = user?.primaryEmailAddress;
    const hasVerifiedPrimaryEmailAddress = primaryEmailAddress?.verification.status === 'verified';

    if (!primaryEmailAddress || !hasVerifiedPrimaryEmailAddress) {
      void goToStep('verify-domain');
      return;
    }

    // Otherwise, set the provider and create the enterprise connection
    try {
      await createEnterpriseConnection(selected, primaryEmailAddress);
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
            {PROVIDER_GROUPS.map(group => (
              <Col
                key={group.id}
                elementDescriptor={descriptors.configureSSOProviderGroup}
                elementId={descriptors.configureSSOProviderGroup.setId(group.id)}
                gap={3}
              >
                <Text
                  elementDescriptor={descriptors.configureSSOProviderGroupLabel}
                  elementId={descriptors.configureSSOProviderGroupLabel.setId(group.id)}
                  as='label'
                  variant='subtitle'
                  localizationKey={group.label}
                />

                <Grid
                  elementDescriptor={descriptors.configureSSOProviderGrid}
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
    <SimpleButton
      as='label'
      variant='outline'
      elementDescriptor={descriptors.configureSSOProviderCard}
      elementId={descriptors.configureSSOProviderCard.setId(value)}
      isActive={checked}
      sx={theme => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.$2,
        height: theme.sizes.$32,
        padding: theme.space.$1x5,
        position: 'relative',
        cursor: 'pointer',
        '&:has(input:focus-visible)': {
          ...common.focusRingStyles(theme),
          borderColor: theme.colors.$borderAlpha300,
        },
        '&:has(input:checked)': {
          backgroundColor: theme.colors.$neutralAlpha50,
        },
      })}
    >
      <RadioInput
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        focusRing={false}
        sx={theme => ({
          position: 'absolute',
          top: theme.space.$1x5,
          insetInlineStart: theme.space.$1x5,
          margin: 0,
          width: 'fit-content',
        })}
      />

      <Span
        elementDescriptor={descriptors.configureSSOProviderCardIcon}
        elementId={descriptors.configureSSOProviderCardIcon.setId(value)}
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
        elementDescriptor={descriptors.configureSSOProviderCardLabel}
        elementId={descriptors.configureSSOProviderCardLabel.setId(value)}
        as='span'
        variant='body'
        sx={theme => ({ color: theme.colors.$colorForeground })}
      >
        {labelText}
      </Text>
    </SimpleButton>
  );
};
