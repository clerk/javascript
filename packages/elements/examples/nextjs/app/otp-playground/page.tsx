'use client';

import { Field, FieldState, Input, SignIn, SignInStart } from '@clerk/elements';
import clsx from 'clsx';

function OTPInputSegment({ value, status }: any) {
  return (
    <FieldState>
      {({ state }) => (
        <span
          data-state={state}
          data-status={status}
          className={clsx(
            'flex flex-col justify-center items-center h-12 w-10 rounded-lg border-2 bg-white border-[var(--border-color)] [--border-color:theme(colors.gray.300)] data-[state="invalid"]:[--border-color:theme(colors.red.500)] text-lg text-black self-stretch',
            (status === 'cursor' || status === 'selected') &&
              '[--border-color:theme(colors.purple.500)] shadow-[theme(colors.purple.500_0_0_0_1px)]',
            status === 'selected' && 'bg-purple-100',
          )}
        >
          {value}
        </span>
      )}
    </FieldState>
  );
}

export default function Page() {
  return (
    <div>
      <h1>OTP Playground</h1>
      <SignIn>
        <SignInStart>
          <Field
            name='code'
            className='w-[400px]'
          >
            <Input
              type='otp'
              render={OTPInputSegment}
            />
          </Field>
        </SignInStart>
      </SignIn>
    </div>
  );
}
