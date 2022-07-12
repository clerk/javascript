import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { PhoneInput } from '@clerk/shared/components/phoneInput';
import React from 'react';

import { ActiveIdentifier, Fields, FormState } from './signUpFormHelpers';

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
      id='cl-sign-up-form'
      handleSubmit={handleSubmit}
      submitButtonClassName='cl-sign-up-button'
      submitButtonLabel='Sign up'
    >
      <>
        {(fields.firstName || fields.lastName) && (
          <div className='cl-field-row'>
            {fields.firstName && (
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

            {fields.lastName && (
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

        {fields.username && (
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

        {fields.emailAddress && (
          <Control
            key='emailAddress'
            htmlFor='emailAddress'
            label='Email address'
            error={formState.emailAddress.error}
            hint={toggleEmailPhone ? 'Use phone instead' : fields.emailAddress.required ? undefined : 'Optional'}
            hintOnClickHandler={toggleEmailPhone ? handleChangeActive('phoneNumber') : undefined}
          >
            <Input
              id='emailAddress'
              type='email'
              name='emailAddress'
              value={formState.emailAddress.value}
              handleChange={el => formState.emailAddress.setValue(el.value || '')}
              disabled={fields.emailAddress.disabled}
            />
          </Control>
        )}

        {fields.phoneNumber && (
          <Control
            key='phoneNumber'
            htmlFor='phoneNumber'
            label='Phone number'
            error={formState.phoneNumber.error}
            hint={toggleEmailPhone ? 'Use email instead' : fields.phoneNumber.required ? undefined : 'Optional'}
            hintOnClickHandler={toggleEmailPhone ? handleChangeActive('emailAddress') : undefined}
          >
            <PhoneInput
              id='phoneNumber'
              name='phoneNumber'
              handlePhoneChange={formState.phoneNumber.setValue}
            />
          </Control>
        )}

        {fields.password && (
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
