import { Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { StepLayout } from './StepLayout';

export const VerifyDomain = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <StepLayout
      title='Verify your domain'
      subtitle='Verify the domain you want to enable the enterprise connection on.'
    >
      <Text>UI goes here</Text>
    </StepLayout>
  );
};
