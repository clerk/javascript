import React from 'react';

import { Flex } from '../customizables';
import { Form } from '../elements';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type FormButtonsProps = {
  isDisabled?: boolean;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { isDisabled } = props;
  return (
    <FormButtonContainer>
      <Form.SubmitButton
        block={false}
        isDisabled={isDisabled}
      >
        Continue
      </Form.SubmitButton>
      <Form.ResetButton
        block={false}
        onClick={navigateToFlowStart}
      >
        Cancel
      </Form.ResetButton>
    </FormButtonContainer>
  );
};

export const FormButtonContainer = (props: React.PropsWithChildren<{}>) => {
  return (
    <Flex
      sx={theme => ({ marginTop: theme.space.$8 })}
      direction={'rowReverse'}
      gap={4}
    >
      {props.children}
    </Flex>
  );
};
