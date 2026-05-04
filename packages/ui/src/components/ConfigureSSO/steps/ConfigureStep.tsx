import { Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { StepLayout } from './StepLayout';

export const Configure = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <StepLayout
      title='Configure Okta Workforce'
      subtitle='Create a new enterprise application in your Okta Dashboard.'
    >
      <Text as='p'>Configuration form goes here.</Text>
    </StepLayout>
  );
};
