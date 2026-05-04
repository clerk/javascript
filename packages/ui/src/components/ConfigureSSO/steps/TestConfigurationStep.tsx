import { Col, Text } from '@/customizables';

import { StepLayout } from './StepLayout';

export const TestConfigurationStep = (): JSX.Element => {
  return (
    <StepLayout
      title='Test your connection'
      subtitle='Make sure everything is wired up before you finish.'
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
          Test step UI goes here. The shared &ldquo;Continue&rdquo; button is hidden on the last step; use a step-local
          primary action to finish.
        </Text>
      </Col>
    </StepLayout>
  );
};
