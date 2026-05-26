import { Step } from '@/components/ConfigureSSO/elements/Step';
import { useWizard, Wizard } from '@/components/ConfigureSSO/elements/Wizard';
import { InnerStepCounter } from '@/components/ConfigureSSO/elements/Wizard/InnerStepCounter';
import { Col, descriptors, Heading, localizationKeys } from '@/customizables';

export const SamlOktaConfigureSteps = () => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='attribute-mapping'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaAttributeMappingStep />
      </Wizard.Step>

      <Wizard.Step id='assign-users'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.assignUsersStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaAssignUsersStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaIdentityProviderMetadataStep />
      </Wizard.Step>
    </>
  );
};

const SamlOktaCreateAppStep = () => {
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();

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
                'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.title',
              )}
            />
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

const SamlOktaAttributeMappingStep = () => {
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <p>add table here</p>
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

const SamlOktaAssignUsersStep = () => {
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <p>add content here</p>
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

const SamlOktaIdentityProviderMetadataStep = () => {
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <p>add content here</p>
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
