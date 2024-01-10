'use client';

import {
  Errors,
  Field,
  FieldState,
  Input,
  Label,
  SignIn,
  SignInFactorOne,
  SignInFactorTwo,
  SignInSSOCallback,
  SignInStart,
  SignInStrategies,
  SignInStrategy,
  SocialProviders,
  Submit,
} from '@clerk/elements';
import clsx from 'clsx';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { forwardRef } from 'react';

import { Debug } from '@/components/debug';
import { H1, H2, H3, HR, P } from '@/components/design';

const BUTTON_BGS: Record<string, string> = {
  github: 'rgba(23 23 23)',
  google: 'rgb(51 63 97)',
};

const BUTTON_BGS_HOVER: Record<string, string> = {
  github: 'rgba(23 23 23 / 0.8)',
  google: 'rgb(51 63 97 / 0.8)',
};

const CustomError = forwardRef<HTMLParagraphElement, { code: string; message: string }>(function CustomError(
  { code, message, ...rest },
  ref,
) {
  return (
    <p
      className='text-red-400 font-mono'
      ref={ref}
      {...rest}
    >
      <span className='block '>{code}:</span> {message}
    </p>
  );
});

export default function SignInPage() {
  return (
    <SignIn>
      <div className='m-auto w-max text-sm'>
        <SignInStart>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>START</H1>
            <div className='flex flex-col gap-3'>
              <SocialProviders
                render={provider => {
                  return (
                    <button
                      type='button'
                      style={
                        {
                          '--button-bg': BUTTON_BGS[provider.id],
                          '--button-bg-hover': BUTTON_BGS_HOVER[provider.id],
                        } as CSSProperties
                      }
                      className={clsx(
                        'flex items-center justify-center gap-4 rounded bg-[var(--button-bg)] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all',
                        'hover:bg-[var(--button-bg-hover)]',
                      )}
                    >
                      <Image
                        src={provider.iconUrl}
                        alt={provider.name}
                        width={24}
                        height={24}
                        className={clsx(provider.id === 'github' && 'invert')}
                      />
                      <span className='text-white'>Continue with {provider.name}</span>
                    </button>
                  );
                }}
              />
            </div>

            <HR />

            <Errors
              render={({ code, message }) => (
                <CustomError
                  code={code}
                  message={message}
                />
              )}
            />

            <div className='flex gap-6 flex-col'>
              <Field
                name='identifier'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Email</Label>
                  <Input
                    type='identifier'
                    className='bg-tertiary rounded-sm px-2 py-1 border border-foreground data-[invalid]:border-red-500'
                  />
                </div>

                <Errors
                  render={({ code, message }) => (
                    <CustomError
                      code={code}
                      message={message}
                    />
                  )}
                />
                <FieldState>{({ state }) => <span>Field state: {state}</span>}</FieldState>
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In with Email/Password
              </Submit>

              <HR />

              <Field
                name='identifier'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Phone</Label>
                  <Input
                    type='identifier'
                    className='bg-tertiary rounded-sm px-2 py-1 border border-foreground data-[invalid]:border-red-500'
                    asChild
                  >
                    <input type='tel' />
                  </Input>
                </div>

                <Errors
                  render={({ code, message }) => (
                    <CustomError
                      code={code}
                      message={message}
                    />
                  )}
                />
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In with Phone Number
              </Submit>
            </div>
          </div>
        </SignInStart>

        <SignInStrategies>
          <div className='flex gap-6 flex-col'>
            <H1>STRATEGIES (FIRST/SECOND FACTOR)</H1>

            <H2>
              <SignInFactorOne>First Factor</SignInFactorOne>
              <SignInFactorTwo>Second Factor</SignInFactorTwo>
            </H2>

            <SignInStrategy name='password'>
              <Field
                name='password'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Password</Label>
                  <Input
                    type='password'
                    className='bg-tertiary rounded-sm px-2 py-1 border border-foreground  data-[invalid]:border-red-500'
                  />
                </div>

                <Errors
                  render={({ code, message }) => (
                    <CustomError
                      code={code}
                      message={message}
                    />
                  )}
                />
                <FieldState>{({ state }) => <span>Field state: {state}</span>}</FieldState>
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In
              </Submit>
            </SignInStrategy>

            <SignInStrategy name='email_code'>
              <Field
                name='code'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Email Code</Label>
                  <Input
                    type='code'
                    className='bg-tertiary rounded-sm px-2 py-1 border border-foreground  data-[invalid]:border-red-500'
                  />
                </div>

                <Errors
                  render={({ code, message }) => (
                    <CustomError
                      code={code}
                      message={message}
                    />
                  )}
                />
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In
              </Submit>
            </SignInStrategy>

            <SignInStrategy name='phone_code'>
              <Field
                name='code'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Phone Code</Label>
                  <Input
                    type='code'
                    className='bg-tertiary rounded-sm px-2 py-1 border border-foreground  data-[invalid]:border-red-500'
                  />
                </div>

                <Errors
                  render={({ code, message }) => (
                    <CustomError
                      code={code}
                      message={message}
                    />
                  )}
                />
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In
              </Submit>
            </SignInStrategy>

            <SignInStrategy name='reset_password_email_code'>
              <H3>Verify your email</H3>

              <P>Please check your email for a verification code...</P>

              <Field
                name='code'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Email Code</Label>
                  <Input
                    type='code'
                    className='bg-tertiary rounded-sm px-2 py-1 border border-foreground  data-[invalid]:border-red-500'
                  />
                </div>

                <Errors
                  render={({ code, message }) => (
                    <CustomError
                      code={code}
                      message={message}
                    />
                  )}
                />
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Verify
              </Submit>
            </SignInStrategy>
          </div>
        </SignInStrategies>

        <SignInSSOCallback />
      </div>

      <Debug />
    </SignIn>
  );
}
