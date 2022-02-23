import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { handleError, useFieldState } from 'ui/common';
import { Error } from 'ui/common/error';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { PageHeading } from 'ui/userProfile/pageHeading';

export function ChangePassword(): JSX.Element {
  const user = useCoreUser();
  const { authConfig } = useEnvironment();
  const { navigate } = useNavigate();

  const password = useFieldState('password', '');
  const confirmPassword = useFieldState('confirmPassword', '');
  const [error, setError] = React.useState<string | undefined>();

  const onClickUpdatePassword = async () => {
    if (password.value !== confirmPassword.value) {
      setError("Passwords don't match.");
      return;
    }

    try {
      await user.update({ password: password.value });
      navigate('../');
    } catch (err) {
      handleError(err, [password], setError);
    }
  };

  const showRemovePassword =
    user.passwordEnabled && authConfig.password !== 'required';

  const onClickRemovePassword = async () => {
    try {
      await user.update({ password: '' });
      navigate('../');
    } catch (err) {
      setError('' + err);
    }
  };

  return (
    <>
      <PageHeading
        title='Password'
        subtitle='Change your password'
        backTo='../'
      />
      <TitledCard className='cl-themed-card cl-editable-field'>
        <Error>{error}</Error>
        <Form
          submitButtonLabel='Change password'
          handleSubmit={onClickUpdatePassword}
          resetButtonLabel={showRemovePassword ? 'Remove password' : ''}
          handleReset={showRemovePassword ? onClickRemovePassword : undefined}
          buttonGroupClassName='cl-form-button-group'
        >
          <Control error={password.error} htmlFor='password' label='Password'>
            <Input
              type='password'
              id='password'
              value={password.value}
              handleChange={el => password.setValue(el.value || '')}
              autoFocus
              required
              minLength={1}
            />
          </Control>
          <Control
            error={confirmPassword.error}
            htmlFor='confirmPassword'
            label='Confirm password'
          >
            <Input
              type='password'
              id='confirmPassword'
              value={confirmPassword.value}
              handleChange={el => confirmPassword.setValue(el.value || '')}
              required
              minLength={1}
            />
          </Control>
        </Form>
      </TitledCard>
    </>
  );
}
