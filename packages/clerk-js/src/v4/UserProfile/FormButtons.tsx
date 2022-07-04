import React from 'react';

import { Form } from '../elements';

type FormButtonsProps = {
  isDisabled?: boolean;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { isDisabled, onCancel } = props;
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
        onClick={onCancel}
      >
        Cancel
      </Form.ResetButton>
    </>
  );
};
