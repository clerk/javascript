'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWaitlist } from '@clerk/react';
import { NavLink } from 'react-router';

export function Waitlist({ className, ...props }: React.ComponentProps<'div'>) {
  const { waitlist, errors, fetchStatus } = useWaitlist();

  const handleSubmit = async (formData: FormData) => {
    const emailAddress = formData.get('emailAddress') as string | null;

    if (!emailAddress) {
      return;
    }

    await waitlist.join({ emailAddress });
  };

  if (waitlist?.id) {
    return (
      <div
        className={cn('flex flex-col gap-6', className)}
        {...props}
      >
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Successfully joined!</CardTitle>
            <CardDescription>You&apos;re on the waitlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <div className='text-center text-sm'>
                Already have an account?{' '}
                <NavLink
                  to='/sign-in'
                  className='underline underline-offset-4'
                  data-testid='sign-in-link'
                >
                  Sign in
                </NavLink>
              </div>
            </div>
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
          <CardTitle className='text-xl'>Join the Waitlist</CardTitle>
          <CardDescription>Enter your email address to join the waitlist</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className='grid gap-6'>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='emailAddress'>Email address</Label>
                  <Input
                    id='emailAddress'
                    type='email'
                    placeholder='Email address'
                    required
                    name='emailAddress'
                    data-testid='email-input'
                  />
                  {errors.fields.emailAddress && (
                    <p
                      className='text-sm text-red-600'
                      data-testid='email-error'
                    >
                      {errors.fields.emailAddress.longMessage}
                    </p>
                  )}
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={fetchStatus === 'fetching'}
                  data-testid='submit-button'
                >
                  Join Waitlist
                </Button>
              </div>
              <div className='text-center text-sm'>
                Already have an account?{' '}
                <NavLink
                  to='/sign-in'
                  className='underline underline-offset-4'
                  data-testid='sign-in-link'
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
