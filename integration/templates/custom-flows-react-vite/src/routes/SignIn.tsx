'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignIn, useUser } from '@clerk/react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';

type AvailableStrategy = 'email_code' | 'phone_code' | 'password' | 'reset_password_email_code';

export function SignIn({ className, ...props }: React.ComponentProps<'div'>) {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [selectedStrategy, setSelectedStrategy] = useState<AvailableStrategy | null>(null);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleOauth = async (strategy: 'oauth_google') => {
    await signIn.sso({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/protected',
    });
  };

  const handleSubmit = async (formData: FormData) => {
    const identifier = formData.get('identifier');
    if (!identifier) {
      return;
    }

    await signIn.create({ identifier: identifier as string });
  };

  const handleSubmitResetPassword = async (formData: FormData) => {
    const password = formData.get('password');
    if (!password) {
      return;
    }

    await signIn.resetPasswordEmailCode.submitPassword({
      password: password as string,
    });

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: async () => {
          navigate('/protected');
        },
      });
    }
  };

  const handleVerify = async (formData: FormData) => {
    const code = formData.get('code') as string;
    const password = formData.get('password') as string;

    if (selectedStrategy === 'email_code') {
      await signIn.emailCode.verifyCode({ code: code });
    } else if (selectedStrategy === 'phone_code') {
      await signIn.phoneCode.verifyCode({ code: code });
    } else if (selectedStrategy === 'password') {
      await signIn.password({ password: password });
    } else if (selectedStrategy === 'reset_password_email_code') {
      await signIn.resetPasswordEmailCode.verifyCode({
        code: code,
      });
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: async () => {
          navigate('/protected');
        },
      });
    }
  };

  const handleStrategyChange = async (strategy: AvailableStrategy) => {
    if (strategy === 'email_code') {
      // TODO @revamp-hooks: Allow calling sendCode without an argument
      await signIn.emailCode.sendCode({});
    } else if (strategy === 'phone_code') {
      await signIn.phoneCode.sendCode({});
    } else if (strategy === 'reset_password_email_code') {
      await signIn.resetPasswordEmailCode.sendCode();
    }

    setSelectedStrategy(strategy);
  };

  if (signIn.status === 'needs_first_factor' && !selectedStrategy) {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Choose a sign in method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              {signIn.supportedFirstFactors
                .filter(({ strategy }) => strategy !== 'reset_password_email_code')
                .map(({ strategy }) => (
                  <Button
                    key={strategy}
                    onClick={() => handleStrategyChange(strategy)}
                    className='w-full'
                    disabled={fetchStatus === 'fetching'}
                  >
                    {strategy}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signIn.status === 'needs_first_factor' && selectedStrategy === 'password') {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Sign in with password</CardTitle>
            <CardDescription>Enter your password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleVerify}>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    required
                    name='password'
                  />
                  {errors.fields.password && <div className='text-red-500'>{errors.fields.password.message}</div>}
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={fetchStatus === 'fetching'}
                >
                  Continue
                </Button>
                <Button
                  type='button'
                  className='w-full'
                  onClick={() => handleStrategyChange('reset_password_email_code')}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    signIn.status === 'needs_first_factor' &&
    (selectedStrategy === 'email_code' ||
      selectedStrategy === 'phone_code' ||
      selectedStrategy === 'reset_password_email_code')
  ) {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Sign in with code</CardTitle>
            <CardDescription>Enter the code sent to your phone number or email below</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleVerify}>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='code'>Code</Label>
                  <Input
                    id='code'
                    type='text'
                    required
                    name='code'
                  />
                  {errors.fields.code && <div className='text-red-500'>{errors.fields.code.message}</div>}
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={fetchStatus === 'fetching'}
                >
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signIn.status === 'needs_new_password') {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Set new password</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmitResetPassword}>
              <div className='grid gap-6'>
                <div className='grid gap-6'>
                  <div className='grid gap-3'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      required
                      name='password'
                    />
                  </div>
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={fetchStatus === 'fetching'}
                  >
                    Set new password
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prevent showing the sign-in form if the sign-in is complete.
  if (signIn.status === 'complete' || isSignedIn) {
    return null;
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className='grid gap-6'>
              <Button
                type='button'
                className='w-full'
                disabled={fetchStatus === 'fetching'}
                onClick={() => handleOauth('oauth_google')}
              >
                Sign in with Google
              </Button>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='identifier'>Username, email, or phone number</Label>
                  <Input
                    id='identifier'
                    type='text'
                    placeholder='Username, email, or phone number'
                    required
                    name='identifier'
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={fetchStatus === 'fetching'}
                >
                  Continue
                </Button>
              </div>
              <div className='text-center text-sm'>
                Don&apos;t have an account?{' '}
                <NavLink
                  to='/sign-up'
                  className='underline underline-offset-4'
                >
                  Sign up
                </NavLink>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
