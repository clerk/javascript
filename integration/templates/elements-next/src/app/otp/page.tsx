'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

function clsx(...args: (string | undefined | Record<string, boolean>)[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    switch (typeof arg) {
      case 'string':
        classes.push(arg);
        break;
      case 'object':
        for (const key in arg) {
          if (arg[key]) {
            classes.push(key);
          }
        }
        break;
    }
  }

  return classes.join(' ');
}

export default function OTP() {
  return (
    <main>
      <SignIn.Root path='/otp'>
        <SignIn.Step
          name='start'
          className='w-full space-y-6 rounded-2xl bg-white px-4 py-10 text-center shadow-md sm:w-96 sm:px-8'
        >
          <header className='text-center'>
            <h1 className='text-xl font-medium tracking-tight text-neutral-950'>OTP Playground</h1>
          </header>
          <Clerk.Field
            name='simple-otp'
            className='space-y-2'
          >
            <Clerk.Label className='text-sm font-medium text-zinc-950'>Simple OTP Input</Clerk.Label>
            <Clerk.Input
              type='otp'
              className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
              data-testid='simple-otp'
            />
          </Clerk.Field>
          <Clerk.Field
            name='segmented-otp'
            className='space-y-2'
          >
            <Clerk.Label className='text-sm font-medium text-zinc-950'>Segmented OTP Input</Clerk.Label>
            <Clerk.Input
              className='segmented-otp-wrapper flex justify-center has-[:disabled]:opacity-50'
              type='otp'
              data-testid='segmented-otp'
              render={({ value, status, index }) => {
                return (
                  <div
                    data-status={status}
                    data-testid={`segmented-otp-${index}`}
                    className={clsx(
                      'border-input relative flex size-10 items-center justify-center border-y border-r text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                      {
                        'z-10 ring-2 ring-black ring-offset-black': status === 'cursor' || status === 'selected',
                      },
                    )}
                  >
                    {value}
                    {status === 'cursor' && (
                      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                        <div className='animate-caret-blink h-4 w-px bg-black duration-1000' />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </Clerk.Field>
          <Clerk.Field
            name='segmented-otp-with-props'
            className='space-y-2'
          >
            <Clerk.Label className='text-sm font-medium text-zinc-950'>Segmented OTP Input (with props)</Clerk.Label>
            <Clerk.Input
              className='segmented-otp-with-props-wrapper flex justify-center has-[:disabled]:opacity-50'
              type='otp'
              data-testid='segmented-otp-with-props'
              passwordManagerOffset={4}
              length={4}
              render={({ value, status }) => {
                return (
                  <div
                    data-status={status}
                    className={clsx(
                      'border-input relative flex size-10 items-center justify-center border-y border-r text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                      {
                        'z-10 ring-2 ring-black ring-offset-black': status === 'cursor' || status === 'selected',
                      },
                    )}
                  >
                    {value}
                    {status === 'cursor' && (
                      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                        <div className='animate-caret-blink h-4 w-px bg-black duration-1000' />
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </Clerk.Field>
        </SignIn.Step>
      </SignIn.Root>
    </main>
  );
}
