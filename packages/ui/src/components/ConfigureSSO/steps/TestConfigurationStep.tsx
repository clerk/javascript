import { Text } from '@/customizables';

import { StepLayout } from './StepLayout';

export const TestConfigurationStep = (): JSX.Element => {
  return (
    <StepLayout
      title='Test your SSO connection'
      subtitle='Test your SSO configuration to verify you can successfully authenticate via your identity provider'
    >
      <Text>UI goes here</Text>
    </StepLayout>
  );
};
