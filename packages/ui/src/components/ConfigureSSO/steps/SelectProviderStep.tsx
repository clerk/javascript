import { iconImageUrl } from '@clerk/shared/constants';
import React from 'react';

import type { LocalizationKey } from '@/customizables';
import {
  Col,
  descriptors,
  Flow,
  Grid,
  localizationKeys,
  SimpleButton,
  Span,
  Text,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { mqu } from '@/styledSystem';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

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
  const card = useCardState();
  const { goNext } = useWizard();
  const { setProvider, createConnection } = useConfigureSSO();
  const [selected, setSelected] = React.useState<ProviderType | null>(null);

  const handleContinue = async () => {
    if (!selected) {
      return;
    }

    setProvider(selected);
    card.setError(undefined);
    card.setLoading();

    try {
      await createConnection(selected);
      void goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
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
                      iconId={option.iconId}
                      label={option.label}
                      isSelected={selected === option.id}
                      onClick={() => setSelected(option.id)}
                    />
                  ))}
                </Grid>
              </Col>
            ))}

            <Alert
              variant='warning'
              title={localizationKeys('configureSSO.selectProviderStep.warning')}
            />

            {card.error ? (
              <Text
                as='p'
                variant='body'
                sx={theme => ({ color: theme.colors.$danger500, fontSize: theme.fontSizes.$sm })}
              >
                {card.error}
              </Text>
            ) : null}
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous isDisabled />

          <Step.Footer.Continue
            onClick={handleContinue}
            isLoading={card.isLoading}
            isDisabled={!selected || card.isLoading}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type ProviderCardProps = {
  iconId: string;
  label: LocalizationKey;
  isSelected?: boolean;
  onClick?: () => void;
};

const ProviderCard = ({ iconId, label, isSelected, onClick }: ProviderCardProps): JSX.Element => {
  const { t } = useLocalizations();
  const labelText = t(label);

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
        {labelText}
      </Text>
    </SimpleButton>
  );
};
