import { Text } from '@/customizables';

import { StepLayout } from './StepLayout';

export const ConfirmationStep = (): JSX.Element => {
  return (
    <StepLayout>
      <Text
        as='p'
        variant='body'
        sx={theme => ({ color: theme.colors.$colorMutedForeground })}
      >
        UI goes here
      </Text>
    </StepLayout>
  );
};
