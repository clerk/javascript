import { Button, Col, descriptors, Flex, Flow, Heading, Icon, localizationKeys, Text } from '@/customizables';
import { ChevronRight, DuotoneShieldCheck } from '@/icons';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../elements/Step';
import type { useActivateStepController } from './activate-step.controller';
import type { useActivateStepModel } from './activate-step.model';

export const ActivateStepView = ({
  domain,
  isActive,
  error,
  isLoading,
  handleActivate,
  onExit,
}: Pick<ReturnType<typeof useActivateStepModel>, 'domain' | 'isActive'> &
  ReturnType<typeof useActivateStepController>): JSX.Element => {
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

              {error && (
                <Alert
                  variant='danger'
                  sx={{ width: '100%' }}
                  title={error}
                />
              )}
            </Col>

            {isActive ? (
              <Button
                elementDescriptor={descriptors.configureSSOActivateButton}
                variant='bordered'
                colorScheme='secondary'
                size='sm'
                isDisabled={isLoading}
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
                  isLoading={isLoading}
                  onClick={() => void handleActivate()}
                  localizationKey={localizationKeys('configureSSO.activate.activateButton')}
                />

                <Button
                  elementDescriptor={descriptors.configureSSOActivateSkipButton}
                  variant='outline'
                  size='sm'
                  isDisabled={isLoading}
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
