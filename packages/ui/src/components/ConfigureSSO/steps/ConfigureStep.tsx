import { descriptors, Flow, localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { handleError } from '@/utils/errorHandler';
import { useFormControl } from '@/utils/useFormControl';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';

export const ConfigureStep = (): JSX.Element => {
  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        <Wizard>
          <Step.Header
            title={localizationKeys('configureSSO.configureStep.title')}
            description={localizationKeys('configureSSO.configureStep.subtitle')}
          >
            <InnerStepCounter />
          </Step.Header>

          <Step.Body>
            <Wizard.Step id='create-app'>
              <CreateAppSubStep />
            </Wizard.Step>

            <Wizard.Step id='configure-attributes'>
              <ConfigureAttributesSubStep />
            </Wizard.Step>

            <Wizard.Step id='assign-users'>
              <AssignUsersSubStep />
            </Wizard.Step>

            <Wizard.Step id='submit-saml-config'>
              <SubmitSamlConfigSubStep />
            </Wizard.Step>
          </Step.Body>
        </Wizard>
      </Step>
    </Flow.Part>
  );
};

const InnerStepCounter = (): JSX.Element => {
  const { currentIndex, totalSteps } = useWizard();
  return (
    <Step.Counter
      total={totalSteps}
      current={currentIndex + 1}
    />
  );
};

export const CreateAppSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Section sx={{ flex: 1 }}>
        <Text>UI goes here</Text>
      </Step.Section>

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

export const ConfigureAttributesSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Section sx={{ flex: 1 }}>
        <Text>UI goes here</Text>
      </Step.Section>

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

export const AssignUsersSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Section sx={{ flex: 1 }}>
        <Text>UI goes here</Text>
      </Step.Section>

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

export const SubmitSamlConfigSubStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { enterpriseConnection, updateConnection } = useConfigureSSO();

  const metadataUrlField = useFormControl('idpMetadataUrl', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.metadataUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.metadataUrl.placeholder'),
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const canSubmit = trimmedMetadataUrl.length > 0 && !card.isLoading;

  const handleContinue = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await updateConnection({ saml: { idpMetadataUrl: trimmedMetadataUrl } });
      void goNext();
    } catch (err) {
      handleError(err as Error, [metadataUrlField], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Section sx={theme => ({ flex: 1, gap: theme.space.$5 })}>
        <Text
          as='p'
          variant='body'
          sx={theme => ({ color: theme.colors.$colorMutedForeground })}
          localizationKey={localizationKeys('configureSSO.configureStep.metadataUrl.description')}
        />
        <Form.ControlRow elementId={metadataUrlField.id}>
          <Form.PlainInput {...metadataUrlField.props} />
        </Form.ControlRow>
      </Step.Section>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep || card.isLoading}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={card.isLoading}
          isDisabled={!canSubmit}
        />
      </Step.Footer>
    </>
  );
};
