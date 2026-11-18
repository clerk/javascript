import { useClerk, useOrganization } from '@clerk/shared/react';
import { eventFlowStepMounted } from '@clerk/shared/telemetry';

import { Button, Col, descriptors, Flex, Flow, Heading, Icon, localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { ChevronRight, DuotoneShieldCheck } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';

export const ActivateStep = (): JSX.Element => {
  const {
    enterpriseConnection,
    organizationEnterpriseConnection,
    enterpriseConnectionMutations: { setConnectionActive },
    onExit,
  } = useConfigureSSO();
  const card = useCardState();
  const clerk = useClerk();
  const { organization } = useOrganization();

  // The activate step is only reachable with a configured connection, so the
  // domains are set; join multiples for the subtitle copy.
  const domain = (enterpriseConnection?.domains ?? []).join(', ');
  const isActive = organizationEnterpriseConnection.isActive;

  const handleActivate = async (): Promise<void> => {
    if (!enterpriseConnection || card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await setConnectionActive(enterpriseConnection.id, true);
      clerk.telemetry?.record(
        eventFlowStepMounted('configureSSO', 'activate', {
          timestamp: new Date().toISOString(),
          connectionStatus: 'active',
          connectionId: enterpriseConnection.id,
          organizationId: organization?.id ?? null,
        }),
      );
      onExit?.();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Flow.Part part='ssoActivate'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('activate')}
      >
        <Step.Body>
          <Step.Section
            elementDescriptor={descriptors.configureSSOActivate}
            fill
            gap={5}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Col
              align='center'
              sx={t => ({ textAlign: 'center', maxWidth: '20.75rem', gap: t.space.$3x5 })}
            >
              <Icon
                elementDescriptor={descriptors.configureSSOActivateIcon}
                icon={DuotoneShieldCheck}
                colorScheme='neutral'
                sx={t => ({ width: t.sizes.$8, height: t.sizes.$8 })}
              />

              <Col
                align='center'
                gap={2}
              >
                <Heading
                  elementDescriptor={descriptors.configureSSOActivateTitle}
                  textVariant='h2'
                  localizationKey={localizationKeys(
                    isActive ? 'configureSSO.activate.activeTitle' : 'configureSSO.activate.title',
                  )}
                />
                <Text
                  elementDescriptor={descriptors.configureSSOActivateSubtitle}
                  as='p'
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    isActive ? 'configureSSO.activate.activeSubtitle' : 'configureSSO.activate.subtitle',
                    { domain },
                  )}
                />
              </Col>

              {card.error && (
                <Alert
                  variant='danger'
                  sx={{ width: '100%' }}
                  title={card.error}
                />
              )}
            </Col>

            {isActive ? (
              <Button
                elementDescriptor={descriptors.configureSSOActivateButton}
                variant='bordered'
                colorScheme='secondary'
                size='sm'
                onClick={() => onExit?.()}
                localizationKey={localizationKeys('configureSSO.activate.doneButton')}
              />
            ) : (
              <Flex
                align='center'
                gap={4}
              >
                <Button
                  elementDescriptor={descriptors.configureSSOActivateButton}
                  variant='solid'
                  size='sm'
                  isLoading={card.isLoading}
                  onClick={() => void handleActivate()}
                  localizationKey={localizationKeys('configureSSO.activate.activateButton')}
                />

                <Button
                  elementDescriptor={descriptors.configureSSOActivateSkipButton}
                  variant='outline'
                  size='sm'
                  isDisabled={card.isLoading}
                  onClick={() => onExit?.()}
                >
                  <Text
                    as='span'
                    localizationKey={localizationKeys('configureSSO.activate.skipButton')}
                  />
                  <Icon
                    icon={ChevronRight}
                    size='sm'
                    sx={t => ({ marginInlineStart: t.space.$1 })}
                  />
                </Button>
              </Flex>
            )}
          </Step.Section>
        </Step.Body>
      </Step>
    </Flow.Part>
  );
};
