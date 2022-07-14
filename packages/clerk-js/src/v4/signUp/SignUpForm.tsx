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
          {fields.firstName && (
            <Form.Control
              {...{
                ...formState.firstName.props,
                isRequired: fields.firstName.required,
                isOptional: !fields.firstName.required,
              }}
            />
          )}
          {fields.lastName && (
            <Form.Control
              {...{
                ...formState.lastName.props,
                isRequired: fields.lastName.required,
                isOptional: !fields.lastName.required,
              }}
            />
          )}
        </Form.ControlRow>
      )}
      {fields.username && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.username.props,
              isRequired: fields.username.required,
              isOptional: !fields.username.required,
            }}
          />
        </Form.ControlRow>
      )}
      {fields.emailAddress && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.emailAddress.props,
              isRequired: fields.emailAddress.required,
              isOptional: !fields.emailAddress.required,
            }}
            actionLabel={canToggleEmailPhone ? 'Use phone instead' : undefined}
            onActionClicked={canToggleEmailPhone ? () => handleEmailPhoneToggle('phoneNumber') : undefined}
          />
        </Form.ControlRow>
      )}
      {fields.phoneNumber && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.phoneNumber.props,
              isRequired: fields.phoneNumber.required,
              isOptional: !fields.phoneNumber.required,
            }}
            actionLabel={canToggleEmailPhone ? 'Use email instead' : undefined}
            onActionClicked={canToggleEmailPhone ? () => handleEmailPhoneToggle('emailAddress') : undefined}
          />
        </Form.ControlRow>
      )}
      {fields.password && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.password.props,
              isRequired: fields.password.required,
              isOptional: !fields.password.required,
            }}
          />
        </Form.ControlRow>
      )}
      <Form.SubmitButton>Continue</Form.SubmitButton>
    </Form.Root>
  );
};
