import { type JSX } from 'react';

import { Col, descriptors, Heading, Text } from '@/customizables';
import { localizationKeys } from '@/localization';

import { Step } from '../../../elements/Step';
import { useWizard, Wizard } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';

export const SamlGoogleConfigureSteps = (): JSX.Element => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlGoogle.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlGoogleCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlGoogleIdentityProviderMetadataStep />
      </Wizard.Step>
    </>
  );
};

const SamlGoogleCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.title',
              )}
            />

            <Col
              elementDescriptor={descriptors.configureSSOInstructionsList}
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$5,
                listStyleType: 'disc',
              })}
            >
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step4',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step5',
                )}
              />
            </Col>
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
    </>
  );
};

const SamlGoogleIdentityProviderMetadataStep = (): JSX.Element => {
  return <div>SamlGoogleIdentityProviderMetadataStep</div>;
};
