'use client';

import { Errors, Field, Input, Label, SignUp, SignUpSocialProviders, SignUpStart, Submit } from '@clerk/elements';
import clsx from 'clsx';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { forwardRef } from 'react';

import { H1, HR } from '@/components/design';
import { SignUpDebug } from '@/components/sign-up-debug';

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

const CustomField = forwardRef<HTMLInputElement, { name: string; label: string }>(function CustomField(
  { name, label },
  ref,
) {
  return (
    <Field
      name={name}
      className='flex flex-col gap-4'
    >
      <div
        className='flex gap-4 justify-between items-center'
        ref={ref}
      >
        <Label>{label}</Label>
        <Input
          type={name}
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
      {/* <FieldState>{({ state }) => <span>Field state: {state}</span>}</FieldState> */}
    </Field>
  );
});

export default function SignUpPage() {
  return (
    <SignUp>
      <div className='m-auto w-max text-sm'>
        <SignUpStart>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>START</H1>
            <div className='flex flex-col gap-3'>
              <SignUpSocialProviders
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
              <CustomField
                label='Email'
                name='emailAddress'
              />
              {/* <CustomField
                label='Phone'
                name='phoneNumber'
              />
              <CustomField
                label='First Name'
                name='firstName'
              />
              <CustomField
                label='Last Name'
                name='lastName'
              />
              <CustomField
                label='Username'
                name='username'
              /> */}
              <CustomField
                label='Password'
                name='password'
              />

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign Up
              </Submit>
            </div>
          </div>
        </SignUpStart>
      </div>

      <SignUpDebug />
    </SignUp>
  );
}
