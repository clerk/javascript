import { Flow, Text } from '@/customizables';

import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

export const VerifyDomainStep = (): JSX.Element => {
  const { goNext } = useConfigureSSOWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
    // TODO: Implement verification
    isDisabled: true,
  });

  return (
    <Flow.Part part='verifyDomain'>
      <StepLayout
        title='Verify your domain'
        subtitle='Verify the domain you want to enable the enterprise connection on.'
      >
        <Text>UI goes here</Text>
      </StepLayout>
    </Flow.Part>
  );
};
