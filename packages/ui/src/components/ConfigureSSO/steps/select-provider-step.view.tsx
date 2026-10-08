import type { OAuthProvider } from '@clerk/shared/types';
import React from 'react';

import { ProviderIcon } from '@/common';
import { Box, Col, descriptors, Flow, Grid, localizationKeys, RadioInput, Text } from '@/customizables';
import { common, mqu } from '@/styledSystem';
import { Alert } from '@/ui/elements/Alert';

import { ChangeProviderDialog } from '../ChangeProviderDialog';
import { Step } from '../elements/Step';
import type { useSelectProviderStepController } from './select-provider-step.controller';
import type { useSelectProviderStepModel } from './select-provider-step.model';

export const SelectProviderStepView = ({
  providerGroups,
  connectionName,
  contentRef,
  selected,
  isSubmitting,
  isChangeDialogOpen,
  currentProviderLabel,
  nextProviderLabel,
  error,
  isFirstStep,
  goPrev,
  handleSelect,
  handleContinue,
  closeChangeDialog,
  handleConfirmChangeProvider,
}: Pick<ReturnType<typeof useSelectProviderStepModel>, 'providerGroups' | 'connectionName' | 'contentRef'> &
  ReturnType<typeof useSelectProviderStepController>): JSX.Element => {
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
            {providerGroups.map(group => (
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
                  role='radiogroup'
                  aria-label={group.ariaLabel}
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
                      iconUrl={option.iconUrl}
                      labelText={option.labelText}
                      checked={selected === option.id}
                      onChange={() => handleSelect(option.id)}
                    />
                  ))}
                </Grid>
              </Col>
            ))}

            {error && (
              <Alert
                variant='danger'
                title={error}
                sx={t => ({ margin: t.space.$3 })}
              />
            )}
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep || isSubmitting}
          />

          <Step.Footer.Continue
            onClick={handleContinue}
            isLoading={isSubmitting && !isChangeDialogOpen}
            isDisabled={!selected || isSubmitting}
          />
        </Step.Footer>

        {currentProviderLabel && nextProviderLabel ? (
          <ChangeProviderDialog
            isOpen={isChangeDialogOpen}
            onClose={closeChangeDialog}
            onConfirm={() => {
              void handleConfirmChangeProvider();
            }}
            isSubmitting={isSubmitting}
            nextProviderLabel={nextProviderLabel}
            currentProviderLabel={currentProviderLabel}
            connectionName={connectionName}
            contentRef={contentRef}
          />
        ) : null}
      </Step>
    </Flow.Part>
  );
};

type ProviderCardProps = {
  name: string;
  value: string;
  iconId: string;
  labelText: string;
  iconUrl: string;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ProviderCard = ({
  name,
  value,
  iconId,
  iconUrl,
  labelText,
  checked,
  onChange,
}: ProviderCardProps): JSX.Element => {
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
        // The visible dot is intentionally dropped per design; the radio stays in
        // the a11y tree (sr-only, not display:none) so it keeps native radiogroup
        // keyboard semantics and names itself from the wrapping label.
        sx={common.visuallyHidden()}
      />

      <ProviderIcon
        id={iconId as OAuthProvider}
        iconUrl={iconUrl}
        name={labelText}
        size='$8'
        aria-hidden
        elementDescriptor={descriptors.configureSSOProviderCardIcon}
        elementId={descriptors.configureSSOProviderCardIcon.setId(value)}
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
