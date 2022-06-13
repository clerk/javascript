import React from 'react';
import { ActiveIdentifier, Fields } from 'ui/signUp/signUpFormHelpers';

import { Form } from '../elements';
import { FormControlState } from '../utils';

type SignUpFormProps = {
  handleSubmit: React.FormEventHandler;
  fields: Fields;
  formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
  canToggleEmailPhone: boolean;
  handleEmailPhoneToggle: (type: ActiveIdentifier) => void;
};

export const SignUpForm = (props: SignUpFormProps) => {
  const { handleSubmit, fields, formState, canToggleEmailPhone, handleEmailPhoneToggle } = props;
  return (
    <Form.Root onSubmit={handleSubmit}>
      {(fields.firstName || fields.lastName) && (
        <Form.ControlRow>
          {fields.firstName && <Form.Control {...formState.firstName.props} />}
          {fields.lastName && <Form.Control {...formState.lastName.props} />}
        </Form.ControlRow>
      )}
      {fields.username && <Form.Control {...formState.username.props} />}
      {fields.emailAddress && (
        <Form.Control
          {...formState.emailAddress.props}
          actionLabel={canToggleEmailPhone ? 'Use phone instead' : undefined}
          onActionClicked={canToggleEmailPhone ? () => handleEmailPhoneToggle('phoneNumber') : undefined}
        />
      )}
      {fields.phoneNumber && (
        <Form.Control
          {...formState.phoneNumber.props}
          actionLabel={canToggleEmailPhone ? 'Use email instead' : undefined}
          onActionClicked={canToggleEmailPhone ? () => handleEmailPhoneToggle('emailAddress') : undefined}
        />
      )}
      {fields.password && <Form.Control {...formState.password.props} />}
      <Form.SubmitButton>Continue</Form.SubmitButton>
    </Form.Root>
  );
};
