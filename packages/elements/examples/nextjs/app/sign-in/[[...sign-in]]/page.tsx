'use client';

import { Field, FieldError, GlobalError, Input, Label } from '@clerk/elements/common';
import { SignIn, SocialProvider, SocialProviderIcon, Step, Verification } from '@clerk/elements/sign-in';
import Link from 'next/link';
import { type ComponentProps, useState } from 'react';

import { H1, H3, P } from '@/components/design';
import { CustomField, CustomSubmit } from '@/components/form';

function CustomSocialProvider({
  children,
  provider,
}: {
  children: string;
  provider: ComponentProps<typeof SocialProvider>['name'];
}) {
  return (
    <SocialProvider
      name={provider}
      className='text-[rgb(243,243,243)] border-[rgb(37,37,37)] hover:border-[rgb(50,50,50)] [&>img]:opacity-80  [&>img]:hover:opacity-100 [&>img]:grayscale [&>img]:hover:grayscale-0 relative flex h-14 w-full cursor-pointer items-center justify-center rounded-lg border bg-[rgb(22,22,22)] hover:bg-[rgb(22,22,30)] text-sm transition-all duration-150'
    >
      <SocialProviderIcon
        className={`absolute left-4 transition-all duration-200${provider === 'github' ? ' invert' : ''}`}
      />
      <span className='leading-loose'>{children}</span>
    </SocialProvider>
  );
}

export default function SignInPage() {
  const [continueWithEmail, setContinueWithEmail] = useState(false);

  return (
    <SignIn>
      <div className='h-dvh flex flex-col justify-center items-center bg-zinc-950 text-white gap-10'>
        <div className='text-center'>
          <H1>Sign In</H1>
          <p className='text-base text-zinc-400'>
            Don&apos;t have an account?{' '}
            <Link
              href='/sign-up'
              className='no-underline hover:underline'
            >
              Sign Up
            </Link>
          </p>
        </div>

        <Step name='start'>
          <div className='flex flex-col items-center  gap-12 w-96'>
            <GlobalError className='block text-red-400 font-mono' />

            <div className='flex flex-col gap-2 self-stretch'>
              <CustomSocialProvider provider='github'>Continue with GitHub</CustomSocialProvider>
              <CustomSocialProvider provider='google'>Continue with Google</CustomSocialProvider>
              <CustomSocialProvider provider='metamask'>Continue with Metamask</CustomSocialProvider>
            </div>

            {continueWithEmail ? (
              <>
                <Field
                  className='flex flex-col gap-4 w-full'
                  name='identifier'
                >
                  <Label className='sr-only'>Email</Label>
                  <Input
                    className='bg-[rgb(12,12,12)] border-[rgb(37,37,37)] border rounded data-[invalid=true]:border-red-400 w-full placeholder-[rgb(100,100,100)] px-4 py-2'
                    placeholder='Enter your email address'
                  />
                  <FieldError className='block text-red-400 font-mono w-full' />
                </Field>

                <CustomSubmit>Sign in with Email</CustomSubmit>
              </>
            ) : (
              <button
                className='m-0 py-3 px-6 text-base font-medium text-zinc-400 transition-colors duration-150 hover:text-[rgb(204,204,204)]'
                onClick={() => setContinueWithEmail(true)}
                type='button'
              >
                Continue with Email
              </button>
            )}
          </div>
        </Step>

        <Step name='verifications'>
          <div className='flex gap-6 flex-col'>
            <H1>Verify</H1>

            <GlobalError className='block text-red-400 font-mono' />

            <Verification name='password'>
              <CustomField
                label='Password'
                name='password'
              />

              <CustomSubmit>Verify</CustomSubmit>
            </Verification>

            <Verification name='email_code'>
              <CustomField
                label='Email Code'
                name='code'
              />

              <CustomSubmit>Verify</CustomSubmit>
            </Verification>

            <Verification name='phone_code'>
              <CustomField
                label='Phone Code'
                name='code'
              />

              <CustomSubmit>Verify</CustomSubmit>
            </Verification>

            <Verification name='reset_password_email_code'>
              <H3>Verify your email</H3>

              <P>Please check your email for a verification code...</P>
            </Verification>
          </div>
        </Step>
      </div>
    </SignIn>
  );
}
