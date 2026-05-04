import { Col, Text } from '@/customizables';

import { StepLayout } from './StepLayout';

export const TestConfigurationStep = (): JSX.Element => {
  return (
    <StepLayout
      title='Test your SSO connection'
      subtitle='Test your SSO configuration to verify you can successfully authenticate via your identity provider'
    >
      <Col
        sx={theme => ({
          gap: theme.space.$4,
          maxWidth: theme.sizes.$160,
          marginInline: 'auto',
          paddingBlock: theme.space.$8,
        })}
      >
        <Text
          as='p'
          variant='body'
          sx={theme => ({ color: theme.colors.$colorMutedForeground })}
        >
          UI goes here
        </Text>
      </Col>
    </StepLayout>
  );
};
