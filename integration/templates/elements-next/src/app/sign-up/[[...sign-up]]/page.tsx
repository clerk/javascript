'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

export default function SignUpPage() {
  return (
    <main>
      <SignUp.Root>
        <SignUp.Step
          name='start'
          data-test-id='sign-up-step-start'
          className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8'
        >
          <header className='text-center'>
            <h1 className='text-xl font-medium tracking-tight text-zinc-950'>Create an account</h1>
          </header>
          <Clerk.GlobalError className='block text-sm text-red-400' />
          <div className='space-y-4'>
            <Clerk.Field
              name='emailAddress'
              className='space-y-2'
            >
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Email</Clerk.Label>
              <Clerk.Input
                type='email'
                required
                className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
              />
              <Clerk.FieldError className='block text-sm text-red-400' />
            </Clerk.Field>
            <Clerk.Field
              name='password'
              className='space-y-2'
            >
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Password</Clerk.Label>
              <Clerk.Input
                type='password'
                required
                className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
              />
              <Clerk.FieldError className='block text-sm text-red-400' />
            </Clerk.Field>
            <Clerk.Field
              name='phoneNumber'
              className='space-y-2'
            >
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Phone number (optional)</Clerk.Label>
              <Clerk.Input className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400' />
              <Clerk.FieldError className='block text-sm text-red-400' />
            </Clerk.Field>
            <Clerk.Field
              name='username'
              className='space-y-2'
            >
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Username (optional)</Clerk.Label>
              <Clerk.Input className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400' />
              <Clerk.FieldError className='block text-sm text-red-400' />
            </Clerk.Field>
          </div>
          <SignUp.Action
            submit
            className='w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70'
          >
            Continue
          </SignUp.Action>
        </SignUp.Step>
        <SignUp.Step
          name='verifications'
          className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8'
        >
          <Clerk.GlobalError className='block text-sm text-red-400' />
          <SignUp.Strategy name='email_code'>
            <header className='text-center'>
              <h1 className='text-xl font-medium tracking-tight text-zinc-950'>Verify email code</h1>
            </header>
            <Clerk.Field
              name='code'
              className='space-y-2'
            >
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Email code</Clerk.Label>
              <Clerk.Input
                type='otp'
                required
                aria-label='Enter email verification code'
                className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
              />
              <Clerk.FieldError className='block text-sm text-red-400' />
            </Clerk.Field>
            <SignUp.Action
              submit
              className='w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70'
            >
              Continue
            </SignUp.Action>
          </SignUp.Strategy>
          <SignUp.Strategy name='phone_code'>
            <header className='text-center'>
              <h1 className='text-xl font-medium tracking-tight text-zinc-950'>Verify phone code</h1>
            </header>
            <Clerk.Field
              name='code'
              className='space-y-2'
            >
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Phone code</Clerk.Label>
              <Clerk.Input
                type='otp'
                required
                aria-label='Enter phone verification code'
                className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
              />
              <Clerk.FieldError className='block text-sm text-red-400' />
            </Clerk.Field>
            <SignUp.Action
              submit
              className='w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70'
            >
              Continue
            </SignUp.Action>
          </SignUp.Strategy>
        </SignUp.Step>
        <SignUp.Step
          name='continue'
          className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8'
        >
          <header className='text-center'>
            <h1 className='text-xl font-medium tracking-tight text-zinc-950'>Continue registration</h1>
          </header>
          <Clerk.GlobalError className='block text-sm text-red-400' />
          <Clerk.Field
            name='username'
            className='space-y-2'
          >
            <Clerk.Label className='text-sm font-medium text-zinc-950'>Username</Clerk.Label>
            <Clerk.Input
              type='text'
              required
              className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
            />
            <Clerk.FieldError className='block text-sm text-red-400' />
          </Clerk.Field>
          <SignUp.Action
            submit
            className='w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70'
          >
            Continue
          </SignUp.Action>
        </SignUp.Step>
      </SignUp.Root>
    </main>
  );
}
