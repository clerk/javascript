'use client';

import * as React from 'react';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

// password, phone_code, email_code, email_link, reset_password_email_code, but the rendered strategies are:
// password, email_code, reset_password_email_code, phone_code

function Button({ children, ...props }: { children: React.ReactNode }) {
  return (
    <button
      type='button'
      className='relative w-full truncate rounded-md bg-neutral-600 bg-gradient-to-b from-neutral-500 to-neutral-600 py-1.5 text-sm font-medium text-white shadow-[0_1px_1px_0_theme(colors.white/10%)_inset,0_1px_2.5px_0_theme(colors.black/36%)] outline-none ring-1 ring-inset ring-neutral-600 before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:opacity-0 hover:before:opacity-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:bg-neutral-600 active:text-white/60 active:before:opacity-0'
      {...props}
    >
      {children}
    </button>
  );
}

export default function SignInPage() {
  const [usePhone, setUsePhone] = React.useState(false);

  return (
    <main>
      <div className='grid w-full flex-grow items-center px-4 sm:justify-center'>
        <SignIn.Root>
          <SignIn.Step
            name='start'
            data-test-id='sign-in-step-start'
            className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 sm:w-96 sm:px-8'
          >
            <header className='text-center'>
              <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Sign in to Clover</h1>
            </header>
            <Clerk.GlobalError className='block text-sm text-red-600' />
            <Clerk.Field
              name='identifier'
              className='space-y-2'
            >
              <div className='flex justify-between'>
                <Clerk.Label className='text-sm font-medium text-zinc-950'>
                  {usePhone ? 'Phone number' : 'Email or username'}
                </Clerk.Label>
                <button
                  onClick={() => setUsePhone(!usePhone)}
                  className='text-sm text-neutral-700'
                >
                  Use {usePhone ? 'email' : 'phone'}
                </button>
              </div>
              <Clerk.Input
                type={usePhone ? 'tel' : 'text'}
                required
                className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
              />
              <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
            </Clerk.Field>
            <Clerk.Field
              name='password'
              className='pointer-events-none absolute h-0 opacity-0'
            >
              <Clerk.Input />
            </Clerk.Field>
            <SignIn.Action
              submit
              asChild
            >
              <Button>Continue</Button>
            </SignIn.Action>
            <div className='rounded-xl bg-neutral-100 p-5'>
              <p className='mb-4 text-center text-sm/5 text-neutral-500'>Alternatively, sign in with these platforms</p>
              <div className='space-y-2'>
                <Clerk.Connection
                  name='google'
                  className='flex w-full items-center justify-center gap-x-3 rounded-md bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-sm font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 hover:to-neutral-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:text-neutral-950/60'
                >
                  <Clerk.Icon
                    className='size-4'
                    aria-hidden
                  />
                  Login with Google
                </Clerk.Connection>
              </div>
            </div>
          </SignIn.Step>
          <SignIn.Step
            name='choose-strategy'
            className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 sm:w-96 sm:px-8'
          >
            <header className='text-center'>
              <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Use another method</h1>
            </header>
            <Clerk.GlobalError className='block text-sm text-red-600' />
            <SignIn.SupportedStrategy
              asChild
              name='password'
            >
              <Button>Sign in with your password</Button>
            </SignIn.SupportedStrategy>

            <SignIn.SupportedStrategy
              asChild
              name='phone_code'
            >
              <Button>Send SMS code to TODO</Button>
            </SignIn.SupportedStrategy>

            <SignIn.SupportedStrategy
              asChild
              name='email_code'
            >
              <Button>
                Email code to <SignIn.SafeIdentifier />
              </Button>
            </SignIn.SupportedStrategy>
            <div className='rounded-xl bg-neutral-100 p-5'>
              <p className='mb-4 text-center text-sm/5 text-neutral-500'>Alternatively, sign in with these platforms</p>
              <div className='space-y-2'>
                <Clerk.Connection
                  name='google'
                  className='flex w-full items-center justify-center gap-x-3 rounded-md bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-sm font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 hover:to-neutral-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:text-neutral-950/60'
                >
                  <Clerk.Icon
                    className='size-4'
                    aria-hidden
                  />
                  Login with Google
                </Clerk.Connection>
              </div>
            </div>
            <p className='text-center text-sm'>
              <SignIn.Action
                navigate='previous'
                className='rounded px-1 py-0.5 text-neutral-700 outline-none hover:cursor-pointer hover:bg-neutral-100 focus-visible:bg-neutral-100'
              >
                Go back
              </SignIn.Action>
            </p>
          </SignIn.Step>
          <SignIn.Step
            name='forgot-password'
            className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 sm:w-96 sm:px-8'
          >
            <header className='text-center'>
              <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Forgot password?</h1>
            </header>
            <Clerk.GlobalError className='block text-sm text-red-600' />
            <SignIn.SupportedStrategy
              asChild
              name='reset_password_email_code'
            >
              <Button>Reset your password via Email</Button>
            </SignIn.SupportedStrategy>
            <div className='rounded-xl bg-neutral-100 p-5'>
              <p className='mb-4 text-center text-sm/5 text-neutral-500'>Alternatively, sign in with these platforms</p>
              <div className='space-y-2'>
                <Clerk.Connection
                  name='google'
                  className='flex w-full items-center justify-center gap-x-3 rounded-md bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-sm font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 hover:to-neutral-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:text-neutral-950/60'
                >
                  <Clerk.Icon
                    className='size-4'
                    aria-hidden
                  />
                  Login with Google
                </Clerk.Connection>
              </div>
            </div>
          </SignIn.Step>
          <SignIn.Step
            name='verifications'
            className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 sm:w-96 sm:px-8'
          >
            <SignIn.Strategy name='password'>
              <header className='text-center'>
                <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Enter your password</h1>
                <p className='mt-2 text-sm text-neutral-500'>
                  Welcome back <SignIn.Salutation />
                </p>
              </header>
              <Clerk.GlobalError className='block text-sm text-red-600' />
              <Clerk.Field
                name='password'
                className='space-y-2'
              >
                <div className='flex justify-between'>
                  <Clerk.Label className='text-sm font-medium text-zinc-950'>Password</Clerk.Label>
                  <SignIn.Action
                    navigate='forgot-password'
                    className='text-sm text-neutral-700'
                  >
                    Forgot password?
                  </SignIn.Action>
                </div>
                <Clerk.Input
                  required
                  className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
                />
                <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
              </Clerk.Field>
              <SignIn.Action
                submit
                asChild
              >
                <Button>Continue</Button>
              </SignIn.Action>
            </SignIn.Strategy>
            <SignIn.Strategy name='email_code'>
              <header className='text-center'>
                <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Verify email code</h1>
              </header>
              <Clerk.GlobalError className='block text-sm text-red-600' />
              <Clerk.Field name='code'>
                <Clerk.Label className='sr-only'>Email code</Clerk.Label>
                <Clerk.Input
                  type='otp'
                  required
                  placeholder='Email code'
                  aria-label='Enter email verification code'
                  className='w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 data-[invalid]:border-red-600 data-[invalid]:text-red-600'
                />
                <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
              </Clerk.Field>
              <SignIn.Action
                submit
                asChild
              >
                <Button>Continue</Button>
              </SignIn.Action>
            </SignIn.Strategy>
            <SignIn.Strategy name='email_link'>
              <header className='text-center'>
                <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Verify email link</h1>
              </header>
              <Clerk.GlobalError className='block text-sm text-red-600' />
              <Clerk.Field name='email_link'>
                <Clerk.Label className='sr-only'>Email link</Clerk.Label>
                <Clerk.Input
                  required
                  placeholder='Email link'
                  className='w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 data-[invalid]:border-red-600 data-[invalid]:text-red-600'
                />
                <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
              </Clerk.Field>
              <SignIn.Action
                submit
                asChild
              >
                <Button>Continue</Button>
              </SignIn.Action>
            </SignIn.Strategy>
            <SignIn.Strategy name='reset_password_email_code'>
              <header className='text-center'>
                <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Verify email code</h1>
              </header>
              <Clerk.GlobalError className='block text-sm text-red-600' />
              <Clerk.Field name='code'>
                <Clerk.Label className='sr-only'>Email code</Clerk.Label>
                <Clerk.Input
                  type='otp'
                  required
                  placeholder='Email code'
                  autoSubmit
                  aria-label='Enter email verification code'
                  className='w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 data-[invalid]:border-red-600 data-[invalid]:text-red-600'
                />
                <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
              </Clerk.Field>
              <SignIn.Action
                submit
                asChild
              >
                <Button>Continue</Button>
              </SignIn.Action>
            </SignIn.Strategy>
            <SignIn.Strategy name='phone_code'>
              <header className='text-center'>
                <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Verify phone code</h1>
              </header>
              <Clerk.GlobalError className='block text-sm text-red-600' />
              <Clerk.Field name='code'>
                <Clerk.Label className='sr-only'>Phone code</Clerk.Label>
                <Clerk.Input
                  type='otp'
                  required
                  placeholder='Phone code'
                  aria-label='Enter phone verification code'
                  className='w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 data-[invalid]:border-red-600 data-[invalid]:text-red-600'
                />
                <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
              </Clerk.Field>
              <SignIn.Action
                submit
                asChild
              >
                <Button>Continue</Button>
              </SignIn.Action>
            </SignIn.Strategy>
            <div className='text-center text-sm'>
              <SignIn.Action
                navigate='choose-strategy'
                className='rounded px-1 py-0.5 text-neutral-700 outline-none hover:cursor-pointer hover:bg-neutral-100 focus-visible:bg-neutral-100'
              >
                Use another method
              </SignIn.Action>
            </div>
          </SignIn.Step>
          <SignIn.Step
            name='reset-password'
            className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 sm:w-96 sm:px-8'
          >
            <header className='text-center'>
              <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Reset your password</h1>
            </header>
            <Clerk.GlobalError className='block text-sm text-red-600' />
            <Clerk.Field name='password'>
              <Clerk.Label className='sr-only'>New password</Clerk.Label>
              <Clerk.Input
                required
                placeholder='New password'
                className='w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 data-[invalid]:border-red-600 data-[invalid]:text-red-600'
              />
              <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
            </Clerk.Field>
            <Clerk.Field name='confirmPassword'>
              <Clerk.Label className='sr-only'>Confirm password</Clerk.Label>
              <Clerk.Input
                required
                placeholder='Confirm password'
                className='w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 data-[invalid]:border-red-600 data-[invalid]:text-red-600'
              />
              <Clerk.FieldError className='mt-2 block text-xs text-red-600' />
            </Clerk.Field>
            <SignIn.Action
              submit
              asChild
            >
              <Button>Reset password</Button>
            </SignIn.Action>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </main>
  );
}
