import { Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { StepLayout } from './StepLayout';

export const ConfigureMapAttributes = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <StepLayout
      title='Map attributes'
      subtitle='Map identity provider attributes to Clerk user properties.'
    >
      <Text as='p'>UI goes here</Text>
    </StepLayout>
  );
};
