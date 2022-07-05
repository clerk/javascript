import React from 'react';

import { Form } from '../elements';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type FormButtonsProps = {
  isDisabled?: boolean;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { isDisabled } = props;
  return (
    <>
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
    </>
  );
};
