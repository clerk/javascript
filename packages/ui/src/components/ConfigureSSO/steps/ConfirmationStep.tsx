import { Flow, Text } from '@/customizables';

import { StepLayout } from './StepLayout';

export const ConfirmationStep = (): JSX.Element => {
  return (
    <Flow.Part part='sso-confirmation'>
      <StepLayout>
        <Text>UI goes here</Text>
      </StepLayout>
    </Flow.Part>
  );
};
