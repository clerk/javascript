'use client';

import {
  Field,
  Form,
  Input,
  Label,
  SignIn,
  SignInFactorOne,
  SignInFactorTwo,
  SignInSSOCallback,
  SignInStart,
  SocialProviders,
  Submit,
} from '@clerk/elements';
import clsx from 'clsx';
import Image from 'next/image';
import type { CSSProperties } from 'react';

import { Debug } from '@/components/debug';

const BUTTON_BGS: Record<string, string> = {
  github: 'rgba(23 23 23)',
  google: 'rgb(51 63 97)',
};

const BUTTON_BGS_HOVER: Record<string, string> = {
  github: 'rgba(23 23 23 / 0.8)',
  google: 'rgb(51 63 97 / 0.8)',
};

export default function SignInPage() {
  return (
    <SignIn>
      <div className='m-auto w-max text-sm'>
        <SignInStart>
          <div className='flex flex-col items-center justify-center gap-12'>
            <h1 className='text-xl mb-6 font-mono'>START</h1>
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

            <hr className='w-full border-foreground opacity-10' />

            <Form className='flex gap-6 flex-col'>
              <Field
                name='identifier'
                className='flex gap-4 justify-between items-center'
              >
                <Label htmlFor='password'>Email</Label>
                <Input
                  type='identifier'
                  className='bg-tertiary rounded-sm px-2 py-1 border border-foreground'
                />
              </Field>

              <Field
                name='password'
                className='flex gap-4 justify-between items-center'
              >
                <Label htmlFor='password'>Password</Label>
                <Input
                  type='password'
                  className='bg-tertiary rounded-sm px-2 py-1 border border-foreground'
                />
              </Field>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In
              </Submit>
            </Form>
          </div>
        </SignInStart>

        <SignInFactorOne>
          <p>Factor one child</p>
        </SignInFactorOne>

        <SignInFactorTwo>
          <p>Factor two child</p>
        </SignInFactorTwo>

        <SignInSSOCallback />
      </div>

      <Debug />
    </SignIn>
  );
}
