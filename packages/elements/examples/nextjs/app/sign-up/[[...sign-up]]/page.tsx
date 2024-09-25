'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import Link from 'next/link';
import type { ComponentProps } from 'react';

import { H1, HR as Hr, P } from '@/components/design';
import { CustomField } from '@/components/form';
import { Spinner } from '@/components/spinner';

function CustomSamlConnection({ children }: { children: string }) {
  return (
    <Clerk.Loading scope='provider:saml'>
      {isLoading => (
        <Clerk.Connection
          className='relative flex h-14 w-full cursor-pointer items-center justify-center text-xs text-[rgb(243,243,243)] transition-all duration-150'
          disabled={isLoading}
          name='saml'
          type='button'
        >
          <span className='inline-flex items-center justify-center leading-loose'>
            {isLoading ? (
              <>
                <Spinner /> Loading...
              </>
            ) : (
              children
            )}
          </span>
        </Clerk.Connection>
      )}
    </Clerk.Loading>
  );
}

function CustomSubmit({ children }: ComponentProps<'button'>) {
  return (
    <SignUp.Action
      className='inline-flex w-full select-none items-center justify-center space-x-1.5 rounded-lg border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] px-7 py-3 text-sm text-[rgb(160,160,160)] transition duration-300 hover:border-[rgb(50,50,50)] hover:bg-[rgb(22,22,30)] hover:text-[rgb(243,243,243)] focus:!border-[rgb(37,37,37)] focus:text-[rgb(255,255,255)] focus:outline-none disabled:bg-[rgb(12,12,12)] disabled:text-[rgb(100,100,100)]'
      submit
    >
      <Clerk.Loading>{isLoading => (isLoading ? <Spinner /> : children)}</Clerk.Loading>
    </SignUp.Action>
  );
}

function ResendableFallback({ resendableAfter }: { resendableAfter: number }) {
  return <P className='text-sm'>Didn&apos;t recieve a code? Retry in {resendableAfter} seconds.</P>;
}

function CustomResendable() {
  return (
    <SignUp.Action
      fallback={ResendableFallback}
      resend
    >
      Didn&apos;t recieve a code? <strong className='text-blue-400'>Retry Now</strong>
    </SignUp.Action>
  );
}

export default function SignUpPage() {
  return (
    <SignUp.Root
      fallback={
        <div className='m-auto w-max text-sm'>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>Sign Up</H1>

            <p className='text-base text-zinc-400'>
              Have an account?{' '}
              <Link
                href='/sign-in'
                className='no-underline hover:underline'
              >
                Sign In
              </Link>
            </p>

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <Clerk.Connection
                name='github'
                className='flex items-center justify-center gap-4 rounded bg-[#171717] px-4 py-3 text-sm text-white shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon className='invert' />
                Sign In with GitHub
              </Clerk.Connection>

              <Clerk.Connection
                name='google'
                className='flex items-center justify-center gap-4 rounded bg-[#333f61] px-4 py-3 text-sm text-white shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon />
                Sign In with Google
              </Clerk.Connection>
            </div>

            <Hr />

            <Clerk.GlobalError className='block font-mono text-red-400' />

            <div className='flex flex-col gap-6'>
              <CustomField
                label='Email'
                name='emailAddress'
              />

              <CustomField
                label='Phone Number'
                name='phoneNumber'
              />

              <div className='flex w-full justify-between'>
                <CustomSubmit>Sign Up</CustomSubmit>
                <CustomSamlConnection>Continue with SAML</CustomSamlConnection>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className='m-auto text-sm'>
        <SignUp.Step name='start'>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>Sign Up</H1>

            <p className='text-base text-zinc-400'>
              Have an account?{' '}
              <Link
                href='/sign-in'
                className='no-underline hover:underline'
              >
                Sign In
              </Link>
            </p>

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <Clerk.Connection
                name='github'
                className='flex items-center justify-center gap-4 rounded bg-[#171717] px-4 py-3 text-sm text-white shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon className='invert' />
                Sign In with GitHub
              </Clerk.Connection>

              <Clerk.Connection
                name='google'
                className='flex items-center justify-center gap-4 rounded bg-[#333f61] px-4 py-3 text-sm text-white shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon />
                Sign In with Google
              </Clerk.Connection>
            </div>

            <Hr />

            <Clerk.GlobalError className='block font-mono text-red-400' />

            <div className='flex w-96 flex-col gap-6'>
              <CustomField
                label='Email'
                name='emailAddress'
              />

              <CustomField
                label='Password'
                name='password'
                validatePassword
              />

              <SignUp.Captcha id='test' />

              <div className='flex w-full justify-between'>
                <CustomSubmit>Sign Up</CustomSubmit>
                <CustomSamlConnection>Continue with SAML</CustomSamlConnection>
              </div>
            </div>
          </div>
        </SignUp.Step>

        <SignUp.Step name='continue'>
          <H1>Please enter additional information:</H1>
          <Clerk.GlobalError className='block font-mono text-red-400' />
          <CustomField
            label='Password'
            name='password'
          />

          <CustomField
            label='Phone Number'
            name='phoneNumber'
          />

          <CustomSubmit>Sign Up</CustomSubmit>
        </SignUp.Step>

        <SignUp.Step name='verifications'>
          <H1>Verify your information:</H1>

          <Clerk.GlobalError className='block font-mono text-red-400' />

          <SignUp.Strategy name='phone_code'>
            <CustomResendable />

            <CustomField
              label='SMS Code'
              name='code'
            />

            <CustomSubmit>Verify</CustomSubmit>
          </SignUp.Strategy>

          <SignUp.Strategy name='email_code'>
            <CustomResendable />

            <CustomField
              label='Email Code'
              name='code'
            />

            <CustomSubmit>Verify</CustomSubmit>
          </SignUp.Strategy>

          <SignUp.Strategy name='email_link'>
            Please check your email for a link to verify your account.
            <CustomResendable />
          </SignUp.Strategy>
        </SignUp.Step>

        <SignUp.Step name='restricted-access'>
          <H1>Restricted Access</H1>
          <P>Access to this app is limited, and an invitation is required to sign up.</P>
        </SignUp.Step>
      </div>
    </SignUp.Root>
  );
}
