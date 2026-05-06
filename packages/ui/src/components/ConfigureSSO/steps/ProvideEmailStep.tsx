import { Flow, Text } from '@/customizables';

import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

export const ProvideEmail = (): JSX.Element => {
  const { goNext } = useConfigureSSOWizard();

  useRegisterContinueAction({
    handler: () => {
      return goNext();
    },
  });

  return (
    <Flow.Part part='provideEmail'>
      <StepLayout
        title='Verify your domain'
        subtitle='Verify the domain you want to enable the enterprise connection on.'
      >
        <Text as='p'>UI goes here</Text>
      </StepLayout>
    </Flow.Part>
  );
};
