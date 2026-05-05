import { Flow, Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { StepLayout } from './StepLayout';

export const ConfigureCreateApp = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <Flow.Part part='configureCreateApp'>
      <StepLayout
        title='Configure Okta Workforce'
        subtitle='Create a new enterprise application in your Okta Dashboard.'
      >
        <Text>UI goes here</Text>
      </StepLayout>
    </Flow.Part>
  );
};
