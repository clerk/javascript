import React from 'react';
import { ActiveIdentifier, Fields } from 'v4/SignUp/signUpFormHelpers';

import { useAppearance } from '../customizables';
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
  const { showOptionalFields } = useAppearance().parsedLayout;

  const shouldShow = (name: keyof typeof fields) => {
    return !!fields[name] && (showOptionalFields || fields[name]?.required);
  };

  return (
    <Form.Root onSubmit={handleSubmit}>
      {(shouldShow('firstName') || shouldShow('lastName')) && (
        <Form.ControlRow>
          {shouldShow('firstName') && (
            <Form.Control
              {...{
                ...formState.firstName.props,
                isRequired: fields.firstName!.required,
                isOptional: !fields.firstName!.required,
              }}
            />
          )}
          {shouldShow('lastName') && (
            <Form.Control
              {...{
                ...formState.lastName.props,
                isRequired: fields.lastName!.required,
                isOptional: !fields.lastName!.required,
              }}
            />
          )}
        </Form.ControlRow>
      )}
      {shouldShow('username') && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.username.props,
              isRequired: fields.username!.required,
              isOptional: !fields.username!.required,
            }}
          />
        </Form.ControlRow>
      )}
      {shouldShow('emailAddress') && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.emailAddress.props,
              isRequired: fields.emailAddress!.required,
              isOptional: !fields.emailAddress!.required,
            }}
            actionLabel={canToggleEmailPhone ? 'Use phone instead' : undefined}
            onActionClicked={canToggleEmailPhone ? () => handleEmailPhoneToggle('phoneNumber') : undefined}
          />
        </Form.ControlRow>
      )}
      {shouldShow('phoneNumber') && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.phoneNumber.props,
              isRequired: fields.phoneNumber!.required,
              isOptional: !fields.phoneNumber!.required,
            }}
            actionLabel={canToggleEmailPhone ? 'Use email instead' : undefined}
            onActionClicked={canToggleEmailPhone ? () => handleEmailPhoneToggle('emailAddress') : undefined}
          />
        </Form.ControlRow>
      )}
      {shouldShow('password') && (
        <Form.ControlRow>
          <Form.Control
            {...{
              ...formState.password.props,
              isRequired: fields.password!.required,
              isOptional: !fields.password!.required,
            }}
          />
        </Form.ControlRow>
      )}
      <Form.SubmitButton>Continue</Form.SubmitButton>
    </Form.Root>
  );
};
