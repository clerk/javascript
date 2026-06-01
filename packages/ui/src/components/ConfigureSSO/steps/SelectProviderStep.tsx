import { iconImageUrl } from '@clerk/shared/constants';
import React from 'react';

import type { LocalizationKey } from '@/customizables';
import {
  Box,
  Col,
  descriptors,
  Flow,
  Grid,
  localizationKeys,
  RadioInput,
  Span,
  Text,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { common, mqu } from '@/styledSystem';
import { Alert } from '@/ui/elements/Alert';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { submitSelectProvider } from '../machine/submit';
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
  const { provider, setProvider } = useConfigureSSO();

  // Re-hydrate from context so users returning from another step don't have to
  // re-click their provider. Pushing the selection straight into context on
  // change keeps `ctx.provider` fresh for the central `submitSelectProvider`
  // handler that the footer runs (it reads `provider` off context, not local
  // state).
  const [selected, setSelected] = React.useState<ProviderType | null>(provider ?? null);
  const card = useCardState();

  const handleSelect = (next: ProviderType) => {
    setSelected(next);
    setProvider(next);
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
                      onChange={() => handleSelect(option.id)}
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

          <Step.Footer.Submit
            onSubmit={submitSelectProvider}
            canContinue={Boolean(selected)}
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
      elementDescriptor={descriptors.configureSSOProviderCard}
      elementId={descriptors.configureSSOProviderCard.setId(value)}
      isActive={checked}
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space.$2,
        height: t.sizes.$32,
        padding: t.space.$1x5,
        cursor: 'pointer',
        position: 'relative',
        ...common.borderVariants(t).normal,
        '&:has(input:focus-visible)': {
          ...common.focusRingStyles(t),
          borderColor: t.colors.$borderAlpha300,
        },
        '&:hover': {
          backgroundColor: t.colors.$neutralAlpha50,
        },
        '&:has(input:checked)': {
          backgroundColor: t.colors.$neutralAlpha50,
        },
      })}
    >
      <RadioInput
        elementDescriptor={descriptors.configureSSOProviderCardRadio}
        elementId={descriptors.configureSSOProviderCardRadio.setId(value)}
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
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
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
    </Box>
  );
};
