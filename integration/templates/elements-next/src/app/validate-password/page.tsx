'use client';

import * as React from 'react';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

export default function ValitePassword() {
  const [hidden, setHidden] = React.useState(true);

  return (
    <main>
      <SignIn.Root path='/validate-password'>
        <SignIn.Step
          name='start'
          className='w-full space-y-6 rounded-2xl px-4 py-10 sm:w-96 sm:px-8 bg-white text-center shadow-md'
        >
          <header className='text-center'>
            <h1 className='text-xl font-medium tracking-tight text-neutral-950'>Password Validation Playground</h1>
            <p className='text-sm mt-2 text-neutral-500'>
              Just to test out the{' '}
              <a
                className='text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline'
                href='https://clerk.com/docs/elements/reference/common#input-type-password'
              >
                password validation
              </a>{' '}
              🙃
            </p>
          </header>
          <Clerk.Field name='password'>
            <div className='flex justify-between mb-2'>
              <Clerk.Label className='text-sm font-medium text-zinc-950'>Password</Clerk.Label>
              <button
                onClick={() => setHidden(s => !s)}
                className='text-sm text-neutral-700'
              >
                {hidden ? 'Show' : 'Hide'}
              </button>
            </div>
            <Clerk.Input
              validatePassword
              type={hidden ? 'password' : 'text'}
              className='w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400'
            />
            <Clerk.FieldState>
              {({ state, codes, message }) => (
                <div className='mt-6'>
                  <p className='mb-2'>Field State Props</p>
                  <table className='table-auto w-full border-collapse text-sm'>
                    <thead className='bg-slate-200'>
                      <tr>
                        <th className='border-b font-medium p-2 pl-4 text-left'>Prop</th>
                        <th className='border-b font-medium p-2 pl-4 text-left'>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className='border-b font-medium p-2 pl-4 text-left'>State</td>
                        <td
                          className='border-b font-medium p-2 pl-4 text-left'
                          data-testid='state'
                        >
                          {state}
                        </td>
                      </tr>
                      <tr>
                        <td className='border-b font-medium p-2 pl-4 text-left'>Codes</td>
                        <td
                          className='border-b font-medium p-2 pl-4 text-left'
                          data-testid='codes'
                        >
                          {codes?.join(', ')}
                        </td>
                      </tr>
                      <tr>
                        <td className='border-b font-medium p-2 pl-4 text-left'>Message</td>
                        <td
                          className='border-b font-medium p-2 pl-4 text-left'
                          data-testid='message'
                        >
                          {message}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Clerk.FieldState>
          </Clerk.Field>
        </SignIn.Step>
      </SignIn.Root>
    </main>
  );
}
