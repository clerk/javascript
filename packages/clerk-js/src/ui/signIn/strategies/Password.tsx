import React from 'react';
import { Form } from '@clerk/shared/components/form';
import { FieldState } from 'ui/common';
import { Control } from '@clerk/shared/components/control';
import { Input } from '@clerk/shared/components/input';

export type PasswordProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  password: FieldState<string>;
};

export const Password: React.FC<PasswordProps> = ({
  handleSubmit,
  password,
}) => {
  return (
    <Form
      handleSubmit={handleSubmit}
      submitButtonClassName='cl-sign-in-button'
      submitButtonLabel='Sign in'
    >
      <Control
        key='password'
        htmlFor='password'
        label='Password'
        error={password.error}
      >
        <Input
          id='password'
          type='password'
          name='password'
          value={password.value}
          handleChange={el => password.setValue(el.value || '')}
          autoFocus
        />
      </Control>
    </Form>
  );
};
