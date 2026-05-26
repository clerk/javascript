import { Step } from '@/components/ConfigureSSO/elements/Step';
import { useWizard, Wizard } from '@/components/ConfigureSSO/elements/Wizard';
import { InnerStepCounter } from '@/components/ConfigureSSO/elements/Wizard/InnerStepCounter';
import { Col, descriptors, Heading, localizationKeys } from '@/customizables';

export const SamlCustomConfigureSteps = () => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='attribute-mapping'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.attributeMappingStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomAttributeMappingStep />
      </Wizard.Step>

      <Wizard.Step id='assign-users'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomAssignUsersStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomIdentityProviderMetadataStep />
      </Wizard.Step>
    </>
  );
};

const SamlCustomCreateAppStep = () => {
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
                'configureSSO.configureStep.samlCustom.createAppStep.createAppInstructions.title',
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

const SamlCustomAttributeMappingStep = () => {
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

const SamlCustomAssignUsersStep = () => {
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

const SamlCustomIdentityProviderMetadataStep = () => {
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
