import { Flow, Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { StepLayout } from './StepLayout';

export const ConfigureMapAttributes = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <Flow.Part part='configureMapAttributes'>
      <StepLayout
        title='Map attributes'
        subtitle='Map identity provider attributes to Clerk user properties.'
      >
        <Text>UI goes here</Text>
      </StepLayout>
    </Flow.Part>
  );
};
