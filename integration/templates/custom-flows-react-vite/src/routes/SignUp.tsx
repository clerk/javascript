'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignUp } from '@clerk/react';
import { NavLink, useNavigate } from 'react-router';

export function SignUp({ className, ...props }: React.ComponentProps<'div'>) {
  const { signUp, errors, fetchStatus } = useSignUp();
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    const username = formData.get('username') as string | null;
    const emailAddress = formData.get('emailAddress') as string | null;
    const phoneNumber = formData.get('phoneNumber') as string | null;
    const password = formData.get('password') as string | null;

    if (!emailAddress || !password) {
      return;
    }

    if (phoneNumber) {
      await signUp.password({ phoneNumber, password });
    } else {
      await signUp.password({ emailAddress, password });
    }

    if (signUp.status === 'missing_requirements') {
      if (signUp.unverifiedFields.includes('email_address')) {
        await signUp.verifications.sendEmailCode({ emailAddress });
      } else if (signUp.unverifiedFields.includes('phone_number')) {
        await signUp.verifications.sendPhoneCode({ phoneNumber });
      }
    }
  };

  const handleVerify = async (formData: FormData) => {
    const code = formData.get('code') as string | null;

    if (!code) {
      return;
    }

    if (signUp.unverifiedFields.includes('email_address')) {
      await signUp.verifications.verifyEmailCode({ code });
    } else if (signUp.unverifiedFields.includes('phone_number')) {
      await signUp.verifications.verifyPhoneCode({ code });
    }

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: async () => {
          navigate('/protected');
        },
      });
    }
  };

  if (
    signUp.status === 'missing_requirements' &&
    (signUp.unverifiedFields.includes('email_address') || signUp.unverifiedFields.includes('phone_number'))
  ) {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Sign up with code</CardTitle>
            <CardDescription>Enter the code sent to your email or phone number below</CardDescription>
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

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Sign up</CardTitle>
          <CardDescription>Enter your email or phone number below to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className='grid gap-6'>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    type='test'
                    placeholder='Username'
                    name='username'
                  />
                  {errors.fields.username && (
                    <p className='text-sm text-red-600'>{errors.fields.username.longMessage}</p>
                  )}
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='emailAddress'>Email address</Label>
                  <Input
                    id='emailAddress'
                    type='email'
                    placeholder='Email address'
                    required
                    name='emailAddress'
                  />
                  {errors.fields.emailAddress && (
                    <p className='text-sm text-red-600'>{errors.fields.emailAddress.longMessage}</p>
                  )}
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='phoneNumber'>Phone number</Label>
                  <Input
                    id='phoneNumber'
                    type='tel'
                    placeholder='Phone number'
                    name='phoneNumber'
                  />
                  {errors.fields.phoneNumber && (
                    <p className='text-sm text-red-600'>{errors.fields.phoneNumber.longMessage}</p>
                  )}
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='Password'
                    required
                    name='password'
                  />
                  {errors.fields.password && (
                    <p className='text-sm text-red-600'>{errors.fields.password.longMessage}</p>
                  )}
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={fetchStatus === 'fetching'}
                >
                  Continue
                </Button>
                {errors.global && (
                  <p className='text-sm text-red-600'>{(errors.global[0] as { longMessage: string }).longMessage}</p>
                )}
                <div id='clerk-captcha'></div>
              </div>
              <div className='text-center text-sm'>
                Already have an account?{' '}
                <NavLink
                  to='/sign-in'
                  className='underline underline-offset-4'
                >
                  Sign in
                </NavLink>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
