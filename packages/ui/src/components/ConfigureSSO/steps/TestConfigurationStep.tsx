import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const TestConfigurationStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <Flow.Part part='testSso'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('test')}
      >
        <Step.Header
          title='Test your SSO connection'
          description='Test your SSO configuration to verify you can successfully authenticate via your identity provider'
        />

        <Step.Body>
          <Step.Section
            sx={theme => ({
              borderBottomWidth: theme.borderWidths.$normal,
              borderBottomStyle: theme.borderStyles.$solid,
              borderBottomColor: theme.colors.$borderAlpha100,
            })}
          >
            <Text>Test your SSO URL</Text>
          </Step.Section>

          <Step.Section>
            <Text>Your test results</Text>
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
      </Step>
    </Flow.Part>
  );
};
