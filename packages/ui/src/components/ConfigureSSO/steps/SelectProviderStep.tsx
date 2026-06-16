import { iconImageUrl } from '@clerk/shared/constants';
import React from 'react';

import type { LocalizationKey } from '@/customizables';
import { Box, Col, descriptors, Flow, Grid, localizationKeys, Span, Text, useLocalizations } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { common, mqu } from '@/styledSystem';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { ChangeProviderDialog } from '../ChangeProviderDialog';
import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import type { ProviderType } from '../types';

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
        id: 'saml_microsoft',
        label: localizationKeys('configureSSO.selectProviderStep.saml.microsoft'),
        iconId: 'microsoft',
      },
      {
        id: 'saml_google',
        label: localizationKeys('configureSSO.selectProviderStep.saml.google'),
        iconId: 'google',
      },
      {
        id: 'saml_custom',
        label: localizationKeys('configureSSO.selectProviderStep.saml.customSaml'),
        iconId: 'saml',
      },
    ],
  },
];

const providerLabel = (provider: ProviderType): LocalizationKey | undefined =>
  PROVIDER_GROUPS.flatMap(group => group.options).find(option => option.id === provider)?.label;

export const SelectProviderStep = (): JSX.Element => {
  const {
    organizationEnterpriseConnection: c,
    enterpriseConnectionMutations: { createConnection, changeProvider },
    contentRef,
  } = useConfigureSSO();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { t } = useLocalizations();

  const [selected, setSelected] = React.useState<ProviderType | null>(c.provider ?? null);
  const card = useCardState();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isChangeDialogOpen, setIsChangeDialogOpen] = React.useState(false);

  const handleSelect = (next: ProviderType) => {
    setSelected(next);
  };

  const isChangingProvider = c.hasConnection && selected !== null && selected !== c.provider;

  const handleContinue = async (): Promise<void> => {
    if (!selected) {
      return;
    }

    if (c.hasConnection && selected === c.provider) {
      void goNext();
      return;
    }

    if (isChangingProvider) {
      setIsChangeDialogOpen(true);
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      await createConnection(selected);
      void goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
      setIsSubmitting(false);
    }
  };

  const handleConfirmChangeProvider = async (): Promise<void> => {
    if (!selected) {
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      await changeProvider(selected);
      setIsChangeDialogOpen(false);
      void goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
      setIsChangeDialogOpen(false);
      setIsSubmitting(false);
    }
  };

  const currentProviderLabel = c.provider ? providerLabel(c.provider) : undefined;
  const nextProviderLabel = selected ? providerLabel(selected) : undefined;

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
                  role='radiogroup'
                  aria-label={t(group.label)}
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
                      value={option.id}
                      iconId={option.iconId}
                      label={option.label}
                      isSelected={selected === option.id}
                      onSelect={() => handleSelect(option.id)}
                    />
                  ))}
                </Grid>
              </Col>
            ))}

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
            onClose={() => setIsChangeDialogOpen(false)}
            onConfirm={() => {
              void handleConfirmChangeProvider();
            }}
            isSubmitting={isSubmitting}
            nextProviderLabel={nextProviderLabel}
            currentProviderLabel={currentProviderLabel}
            contentRef={contentRef}
          />
        ) : null}
      </Step>
    </Flow.Part>
  );
};

type ProviderCardProps = {
  value: string;
  iconId: string;
  label: LocalizationKey;
  isSelected?: boolean;
  onSelect: () => void;
};

const ProviderCard = ({ value, iconId, label, isSelected, onSelect }: ProviderCardProps): JSX.Element => {
  const { t } = useLocalizations();
  const labelText = t(label);

  return (
    <Box
      as='button'
      role='radio'
      aria-checked={isSelected}
      aria-label={labelText}
      elementDescriptor={descriptors.configureSSOProviderCard}
      elementId={descriptors.configureSSOProviderCard.setId(value)}
      isActive={isSelected}
      onClick={onSelect}
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
        appearance: 'none',
        textAlign: 'center',
        backgroundColor: isSelected ? t.colors.$neutralAlpha50 : 'transparent',
        ...common.borderVariants(t).normal,
        '&:focus-visible': {
          ...common.focusRingStyles(t),
          borderColor: t.colors.$borderAlpha300,
        },
        '&:hover': {
          backgroundColor: t.colors.$neutralAlpha50,
        },
      })}
    >
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
