'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';
import Link from 'next/link';
import type { ComponentProps } from 'react';

import { H1, HR as Hr, P } from '@/components/design';
import { CustomField } from '@/components/form';
import { Spinner } from '@/components/spinner';

function CustomSubmit({ children }: ComponentProps<'button'>) {
  return (
    <SignUp.Action
      className='inline-flex px-7 py-3 justify-center transition rounded-lg focus:outline-none border items-center disabled:bg-[rgb(12,12,12)] focus:text-[rgb(255,255,255)] w-full duration-300 focus:!border-[rgb(37,37,37)] text-sm space-x-1.5 text-[rgb(160,160,160)] hover:text-[rgb(243,243,243)] disabled:text-[rgb(100,100,100)] select-none bg-[rgb(22,22,22)] hover:bg-[rgb(22,22,30)] border-[rgb(37,37,37)] hover:border-[rgb(50,50,50)]'
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
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon className='invert' />
                Sign In with GitHub
              </Clerk.Connection>

              <Clerk.Connection
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon />
                Sign In with Google
              </Clerk.Connection>

              <Clerk.Connection
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon />
                Sign In with Metamask
              </Clerk.Connection>
            </div>

            <Hr />

            <Clerk.GlobalError className='block text-red-400 font-mono' />

            <div className='flex gap-6 flex-col'>
              <CustomField
                label='Email'
                name='emailAddress'
              />

              <CustomField
                label='Phone Number'
                name='phoneNumber'
              />
              <CustomSubmit>
                <Clerk.Loading>
                  {isLoading =>
                    isLoading ? (
                      <>
                        <Spinner /> Loading...
                      </>
                    ) : (
                      'Sign Up'
                    )
                  }
                </Clerk.Loading>
              </CustomSubmit>
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
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon className='invert' />
                Sign In with GitHub
              </Clerk.Connection>

              <Clerk.Connection
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon />
                Sign In with Google
              </Clerk.Connection>

              <Clerk.Connection
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Clerk.Icon />
                Sign In with Metamask
              </Clerk.Connection>
            </div>

            <Hr />

            <Clerk.GlobalError className='block text-red-400 font-mono' />

            <div className='flex gap-6 flex-col w-96'>
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

              <CustomSubmit>Sign Up</CustomSubmit>
            </div>
          </div>
        </SignUp.Step>

        <SignUp.Step name='continue'>
          <H1>Please enter additional information:</H1>
          <Clerk.GlobalError className='block text-red-400 font-mono' />
          <CustomField
            label='Password'
            name='password'
          />

          <CustomSubmit>Sign Up</CustomSubmit>
        </SignUp.Step>

        <SignUp.Step name='verifications'>
          <H1>Verify your information:</H1>

          <Clerk.GlobalError className='block text-red-400 font-mono' />

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
      </div>
    </SignUp.Root>
  );
}
