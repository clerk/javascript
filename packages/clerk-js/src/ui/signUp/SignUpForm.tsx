import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { PhoneInput } from '@clerk/shared/components/phoneInput';
import React from 'react';

import { ActiveIdentifier, Fields, FormState } from './sign_up_form_helpers';

type SignUpFormProps = {
  fields: Fields;
  formState: FormState<string>;
  toggleEmailPhone: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleChangeActive: (type: ActiveIdentifier) => (e: React.MouseEvent) => void;
};

export function SignUpForm({
  fields,
  formState,
  toggleEmailPhone,
  handleSubmit,
  handleChangeActive,
}: SignUpFormProps): JSX.Element {
  return (
    <Form
      handleSubmit={handleSubmit}
      submitButtonClassName='cl-sign-up-button'
      submitButtonLabel='Sign up'
    >
      <>
        {(fields.firstName.enabled || fields.lastName.enabled) && (
          <div className='cl-field-row'>
            {fields.firstName.enabled && (
              <Control
                className='cl-half-field'
                htmlFor='firstName'
                key='firstName'
                label='First name'
                error={formState.firstName.error}
                hint={fields.firstName.required ? undefined : 'Optional'}
              >
                <Input
                  id='firstName'
                  name='firstName'
                  value={formState.firstName.value}
                  handleChange={el => formState.firstName.setValue(el.value || '')}
                />
              </Control>
            )}

            {fields.lastName.enabled && (
              <Control
                className='cl-half-field'
                htmlFor='lastName'
                key='lastName'
                label='Last name'
                error={formState.lastName.error}
                hint={fields.lastName.required ? undefined : 'Optional'}
              >
                <Input
                  id='lastName'
                  name='lastName'
                  value={formState.lastName.value}
                  handleChange={el => formState.lastName.setValue(el.value || '')}
                />
              </Control>
            )}
          </div>
        )}

        {fields.username.enabled && (
          <Control
            htmlFor='username'
            key='username'
            label='Username'
            error={formState.username.error}
            hint={fields.username.required ? undefined : 'Optional'}
          >
            <Input
              id='username'
              name='username'
              value={formState.username.value}
              handleChange={el => formState.username.setValue(el.value || '')}
            />
          </Control>
        )}

        {fields.emailAddress.enabled && (
          <Control
            key='emailAddress'
            htmlFor='emailAddress'
            label='Email address'
            error={formState.emailAddress.error}
            hint={toggleEmailPhone ? 'Use phone instead' : undefined}
            hintOnClickHandler={handleChangeActive('phoneNumber')}
          >
            <Input
              id='emailAddress'
              type='email'
              name='emailAddress'
              value={formState.emailAddress.value}
              handleChange={el => formState.emailAddress.setValue(el.value || '')}
              disabled={fields.emailAddress.showAsDisabled}
            />
          </Control>
        )}

        {fields.phoneNumber.enabled && (
          <Control
            key='phoneNumber'
            htmlFor='phoneNumber'
            label='Phone number'
            error={formState.phoneNumber.error}
            hint={toggleEmailPhone ? 'Use email instead' : undefined}
            hintOnClickHandler={handleChangeActive('emailAddress')}
          >
            <PhoneInput
              id='phoneNumber'
              name='phoneNumber'
              handlePhoneChange={formState.phoneNumber.setValue}
            />
          </Control>
        )}

        {fields.password.enabled && (
          <Control
            key='password'
            htmlFor='password'
            label='Password'
            error={formState.password.error}
          >
            <Input
              id='password'
              type='password'
              name='password'
              value={formState.password.value}
              handleChange={el => formState.password.setValue(el.value || '')}
            />
          </Control>
        )}
      </>
    </Form>
  );
}
