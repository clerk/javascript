import React from 'react';

import { Flex } from '../customizables';
import { Form } from '../elements';
import { PropsOfComponent } from '../styledSystem';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type FormButtonsProps = PropsOfComponent<typeof Form.SubmitButton> & {
  isDisabled?: boolean;
  submitLabel?: string;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { isDisabled, submitLabel, ...rest } = props;
  return (
    <FormButtonContainer>
      <Form.SubmitButton
        block={false}
        isDisabled={isDisabled}
        {...rest}
      >
        {submitLabel || 'Continue'}
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

export const FormButtonContainer = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Flex
      direction={'rowReverse'}
      gap={2}
      {...props}
      sx={[theme => ({ marginTop: theme.space.$4 }), props.sx]}
    >
      {props.children}
    </Flex>
  );
};
