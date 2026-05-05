import { Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { StepLayout } from './StepLayout';

export const ProvideEmail = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => {
      return goNext();
    },
  });

  return (
    <StepLayout
      title='Verify your domain'
      subtitle='Verify the domain you want to enable the enterprise connection on.'
    >
      <Text as='p'>UI goes here</Text>
    </StepLayout>
  );
};
