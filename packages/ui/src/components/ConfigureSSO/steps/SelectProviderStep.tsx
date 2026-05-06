import React from 'react';

import { Box, Button, Col, descriptors, Flex, Flow, Icon, Text } from '@/customizables';
import { CheckCircle, CogFilled, ExclamationTriangle } from '@/icons';

import { type ConfigureSSOSupportedProvider, useConfigureSSOFlow } from '../ConfigureSSOContext';
import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

interface ProviderOption {
  id: ConfigureSSOSupportedProvider;
  label: string;
  icon: React.ComponentType;
}

const SAML_PROVIDERS: ProviderOption[] = [
  {
    id: 'saml_okta',
    label: 'Okta Workforce',
    icon: CogFilled,
  },
  {
    id: 'saml_custom',
    label: 'Custom SAML Provider',
    icon: CogFilled,
  },
];

export const SelectProviderStep = (): JSX.Element => {
  const { goNext } = useConfigureSSOWizard();
  const { selectedProvider, setSelectedProvider, enterpriseConnection } = useConfigureSSOFlow();

  // Once a connection exists the provider is locked-in for that user;
  // re-entering the wizard should preselect it
  const isLockedIn = Boolean(enterpriseConnection?.provider);

  useRegisterContinueAction({
    handler: () => goNext(),
    isDisabled: !selectedProvider,
  });

  return (
    <Flow.Part part='selectProvider'>
      <StepLayout
        title='Select provider'
        subtitle='Select the provider you are going to setup SSO for.'
      >
        <Col sx={t => ({ gap: t.space.$5, paddingBlockEnd: t.space.$4 })}>
          <Col sx={t => ({ gap: t.space.$3 })}>
            <Text
              as='p'
              sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$medium })}
            >
              Select your identity provider
            </Text>
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$colorMutedForeground })}
            >
              We&apos;ll guide you through the desired setup process next.
            </Text>
          </Col>

          <ProviderGroup
            heading='SAML'
            options={SAML_PROVIDERS}
            selectedProvider={selectedProvider}
            isLockedIn={isLockedIn}
            onSelect={setSelectedProvider}
          />

          <Flex
            align='center'
            sx={t => ({
              gap: t.space.$2,
              padding: `${t.space.$2x5} ${t.space.$3}`,
              borderRadius: t.radii.$md,
              backgroundColor: t.colors.$warningAlpha100,
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$warningAlpha200,
            })}
          >
            <Icon
              icon={ExclamationTriangle}
              size='sm'
              sx={t => ({ color: t.colors.$warning500, flexShrink: 0 })}
            />
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$colorMutedForeground, fontSize: t.fontSizes.$sm })}
            >
              Once a provider is selected, you cannot change again until the configuration is over.
            </Text>
          </Flex>
        </Col>
      </StepLayout>
    </Flow.Part>
  );
};

interface ProviderGroupProps {
  heading: string;
  options: ProviderOption[];
  selectedProvider: ConfigureSSOSupportedProvider | undefined;
  isLockedIn: boolean;
  onSelect: (provider: ConfigureSSOSupportedProvider | undefined) => void;
}

const ProviderGroup = ({ heading, options, selectedProvider, isLockedIn, onSelect }: ProviderGroupProps) => (
  <Col sx={t => ({ gap: t.space.$2 })}>
    <Text
      as='p'
      sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$semibold })}
    >
      {heading}
    </Text>
    <Box
      sx={t => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: t.space.$3,
      })}
    >
      {options.map(option => (
        <ProviderCard
          key={option.id}
          option={option}
          isSelected={selectedProvider === option.id}
          isLockedIn={isLockedIn}
          onSelect={onSelect}
        />
      ))}
    </Box>
  </Col>
);

interface ProviderCardProps {
  option: ProviderOption;
  isSelected: boolean;
  isLockedIn: boolean;
  onSelect: (provider: ConfigureSSOSupportedProvider | undefined) => void;
}

const ProviderCard = ({ option, isSelected, isLockedIn, onSelect }: ProviderCardProps) => {
  const isDisabled = isLockedIn && !isSelected;

  return (
    <Button
      elementDescriptor={descriptors.button}
      variant='unstyled'
      isDisabled={isDisabled}
      onClick={() => onSelect(option.id)}
      sx={t => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space.$2,
        padding: t.space.$5,
        minHeight: t.sizes.$28,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: isSelected ? t.colors.$colorForeground : t.colors.$borderAlpha100,
        backgroundColor: t.colors.$colorBackground,
        textAlign: 'center',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: `border-color ${t.transitionDuration.$fast} ${t.transitionTiming.$common}`,
        '&:hover': isDisabled
          ? {}
          : {
              borderColor: t.colors.$colorForeground,
            },
      })}
    >
      {isSelected ? (
        <Icon
          icon={CheckCircle}
          size='md'
          sx={t => ({
            position: 'absolute',
            top: t.space.$2,
            insetInlineEnd: t.space.$2,
            color: t.colors.$success500,
          })}
        />
      ) : null}
      <Icon
        icon={option.icon}
        sx={t => ({ width: t.sizes.$6, height: t.sizes.$6, color: t.colors.$colorMutedForeground })}
      />
      <Text
        as='span'
        sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$medium })}
      >
        {option.label}
      </Text>
    </Button>
  );
};
