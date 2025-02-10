import React, { SyntheticEvent, useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import type { NextPage } from 'next';

type PasswordState = 'neutral' | 'success' | 'warn' | 'fail';
const colors: { [k in PasswordState]?: string } = {
  fail: 'red',
  success: 'green',
  warn: 'orange',
};

const SignInPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [complete, setComplete] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [passwordState, setPasswordState] = useState<PasswordState>('neutral');

  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  async function create(e: SyntheticEvent) {
    e.preventDefault();
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then(_ => {
        setSuccessfulCreation(true);
      })
      .catch(err => console.error('error', err.errors[0].longMessage));
  }

  async function reset(e: SyntheticEvent) {
    e.preventDefault();
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then(result => {
        if (result.status === 'needs_second_factor') {
          setSecondFactor(true);
        } else if (result.status === 'complete') {
          setActive({ session: result.createdSessionId });
          setComplete(true);
        } else {
          console.log(result);
        }
      })
      .catch(err => console.error('error', err.errors[0].longMessage));
  }

  return (
    <div
      style={{
        margin: 'auto',
        maxWidth: '500px',
      }}
    >
      <h1>Forgot Password ?</h1>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1em',
        }}
        onSubmit={!successfulCreation ? create : reset}
      >
        {!successfulCreation && !complete && (
          <>
            <label htmlFor='email'>Please provide identifier</label>
            <input
              type='email'
              placeholder='e.g john@doe.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <button>Sign in</button>
          </>
        )}

        {successfulCreation && !complete && (
          <>
            <label htmlFor='password'>New password</label>
            <input
              type='password'
              value={password}
              style={{
                outline: 'none',
                borderColor: colors[passwordState],
              }}
              onChange={e => {
                signIn.validatePassword(e.target.value, {
                  onValidation(res) {
                    if (Object.values(res?.complexity || {}).length > 0) {
                      return setPasswordState('fail');
                    }

                    // Strength that fails
                    if (res?.strength?.state === 'fail') {
                      return setPasswordState('fail');
                    }

                    // Strength that can be better
                    if (res?.strength?.state === 'pass') {
                      return setPasswordState('warn');
                    }

                    // Perfection
                    return setPasswordState('success');
                  },
                });
                setPassword(e.target.value);
              }}
            />

            <label htmlFor='password'>Reset password code</label>
            <input
              type='text'
              value={code}
              onChange={e => setCode(e.target.value)}
            />

            <button>Reset</button>
          </>
        )}

        {complete && 'You successfully changed you password'}
        {secondFactor && '2FA is required, this UI does not handle that'}
      </form>
    </div>
  );
};

export default SignInPage;
