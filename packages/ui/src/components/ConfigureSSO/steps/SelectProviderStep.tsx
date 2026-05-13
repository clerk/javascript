import { iconImageUrl } from '@clerk/shared/constants';
import React from 'react';

import type { LocalizationKey } from '@/customizables';
import { Box, Col, descriptors, Flow, Grid, localizationKeys, Span, Text, useLocalizations } from '@/customizables';
import { mqu } from '@/styledSystem';
import { Alert } from '@/ui/elements/Alert';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import type { ProviderType } from '../types';

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
  const { goNext } = useWizard();
  const { setProvider } = useConfigureSSO();
  const [selected, setSelected] = React.useState<ProviderType | null>(null);

  const handleContinue = () => {
    if (!selected) {
      return;
    }
    setProvider(selected);
    void goNext();
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
                sx={theme => ({ color: theme.colors.$colorForeground })}
                localizationKey={localizationKeys('configureSSO.selectProviderStep.body.title')}
              />

              <Text
                as='p'
                variant='body'
                sx={theme => ({ color: theme.colors.$colorMutedForeground })}
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
                  sx={theme => ({ color: theme.colors.$colorForeground })}
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
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous isDisabled />

          <Step.Footer.Continue
            onClick={handleContinue}
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
          outline: `2px solid ${theme.colors.$colorRing}`,
          outlineOffset: '2px',
        },
        // Selected ring — CSS-driven via :checked so it survives focus changes.
        '&:has(input:checked)': {
          boxShadow: `0 0 0 4px ${theme.colors.$colorRing}`,
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
        sx={theme => ({
          width: theme.sizes.$8,
          height: theme.sizes.$8,
          backgroundImage: `url(${iconImageUrl(iconId)})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        })}
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
