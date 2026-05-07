import type { PropsWithChildren } from 'react';

import { Box, Col, descriptors, Flow, Grid, SimpleButton, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const SelectProviderStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

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
                <ProviderCard>Okta Workforce</ProviderCard>
                <ProviderCard>Custom SAML Provider</ProviderCard>
              </Grid>
            </Col>
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep}
          />
          <Step.Footer.Continue
            onClick={() => goNext()}
            isDisabled={isLastStep}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type ProviderCardProps = PropsWithChildren<{
  isSelected?: boolean;
  onClick?: () => void;
}>;

const ProviderCard = ({ isSelected, onClick, children }: ProviderCardProps): JSX.Element => {
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
      {/* TODO: add provider icons */}
      <Box
        as='span'
        aria-hidden
        sx={theme => ({
          width: theme.sizes.$8,
          height: theme.sizes.$8,
          borderRadius: theme.radii.$md,
          backgroundColor: theme.colors.$primary500,
        })}
      />

      <Text
        as='span'
        variant='body'
        sx={theme => ({ color: theme.colors.$colorForeground })}
      >
        {children}
      </Text>
    </SimpleButton>
  );
};
