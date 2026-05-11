import { iconImageUrl } from '@clerk/shared/constants';
import React from 'react';

import { Col, descriptors, Flow, Grid, SimpleButton, Span, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

type ProviderType = 'okta' | 'custom_saml';

const PROVIDER_OPTIONS: ReadonlyArray<{ id: ProviderType; label: string; iconId: string }> = [
  { id: 'okta', label: 'Okta Workforce', iconId: 'okta' },
  { id: 'custom_saml', label: 'Custom SAML Provider', iconId: 'saml' },
];

export const SelectProviderStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const [selected, setSelected] = React.useState<ProviderType | null>(null);

  return (
    <Flow.Part part='selectProvider'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('select-provider')}
      >
        <Step.Header
          title='Select provider'
          description='Select the provider you are going to setup SSO for'
        />

        <Step.Body>
          <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
            <Col sx={theme => ({ gap: theme.space.$1x5 })}>
              <Text
                as='p'
                variant='subtitle'
                sx={theme => ({ color: theme.colors.$colorForeground })}
              >
                Select your identity provider
              </Text>

              <Text
                as='p'
                variant='body'
                sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              >
                We&apos;ll guide you through the detailed setup process next.
              </Text>
            </Col>

            <Col sx={theme => ({ gap: theme.space.$3 })}>
              <Text
                as='label'
                variant='subtitle'
                sx={theme => ({ color: theme.colors.$colorForeground })}
              >
                SAML
              </Text>

              <Grid
                gap={3}
                columns={2}
              >
                {PROVIDER_OPTIONS.map(option => (
                  <ProviderCard
                    key={option.id}
                    iconId={option.iconId}
                    label={option.label}
                    isSelected={selected === option.id}
                    onClick={() => setSelected(option.id)}
                  />
                ))}
              </Grid>
            </Col>

            <Alert variant='warning'>
              Once a provider is selected you cannot change again until the configuration is over
            </Alert>
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep}
          />
          <Step.Footer.Continue
            onClick={() => goNext()}
            isDisabled={isLastStep || !selected}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type ProviderCardProps = {
  iconId: string;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
};

const ProviderCard = ({ iconId, label, isSelected, onClick }: ProviderCardProps): JSX.Element => {
  return (
    <SimpleButton
      variant='outline'
      block
      onClick={onClick}
      aria-pressed={isSelected}
      sx={theme => ({
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.$2,
        height: theme.sizes.$32,
        padding: theme.space.$1x5,
        backgroundColor: theme.colors.$colorBackground,
        ...(isSelected
          ? {
              boxShadow: `0 0 0 4px ${theme.colors.$colorRing}`,
            }
          : {}),
      })}
    >
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
        {label}
      </Text>
    </SimpleButton>
  );
};
