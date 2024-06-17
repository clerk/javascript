'use client';

import type { OTPInputSegmentStatus } from '@clerk/elements/common';
import { Field as ElementsField, FieldError, FieldState, Input, Label } from '@clerk/elements/common';
import clsx from 'clsx';
import * as React from 'react';

function OTPInputSegment({ value, status }: { value: string; status: OTPInputSegmentStatus }) {
  return (
    <FieldState>
      {state => (
        <span
          data-state={state}
          data-status={status}
          className={clsx(
            'flex h-12 w-10 flex-col items-center justify-center self-stretch rounded-lg border-2 border-[var(--border-color)] bg-white text-lg text-black [--border-color:theme(colors.gray.300)] data-[state="invalid"]:[--border-color:theme(colors.red.500)]',
            (status === 'cursor' || status === 'selected') &&
              'shadow-[0_0_0_1px_theme(colors.purple.500)] [--border-color:theme(colors.purple.500)]',
            status === 'selected' && 'bg-purple-100',
          )}
        >
          {value}
        </span>
      )}
    </FieldState>
  );
}

export const CustomField = React.forwardRef<
  typeof Input,
  {
    alwaysShow?: boolean;
    name: string;
    label: string;
    required?: boolean;
    autoSubmit?: boolean;
    autoFocus?: boolean;
    validatePassword?: boolean;
  }
>(function CustomField(
  { alwaysShow, name, label, required = false, autoSubmit = false, autoFocus = false, validatePassword = false },
  forwardedRef,
) {
  const [hidden, setHidden] = React.useState(true);

  const inputProps =
    name === 'code'
      ? {
          render: OTPInputSegment,
          className: 'flex gap-3',
          required,
          autoSubmit,
          autoFocus,
        }
      : {
          className: 'bg-tertiary rounded-sm px-2 py-1 border border-foreground data-[invalid]:border-red-500',
          ref: forwardedRef,
          required,
          autoFocus,
        };

  return (
    <ElementsField
      alwaysShow={alwaysShow}
      name={name}
      className='flex flex-col gap-4'
    >
      <div className='flex items-center justify-between gap-4'>
        <Label>{label}</Label>
        <Input
          name={name}
          validatePassword={validatePassword}
          {...(name === 'password' ? { type: hidden ? 'password' : 'text' } : {})}
          {...inputProps}
        />
        {name === 'password' ? (
          <button
            type='button'
            onClick={() => setHidden(s => !s)}
          >{`${hidden ? 'Show' : 'Hide'}`}</button>
        ) : null}
      </div>

      <FieldError className='block font-mono text-red-400' />
      <FieldState>
        {({ state, codes, message }) => (
          <div>
            <pre className='text-xs opacity-60'>Field state: {state}</pre>
            <pre className='text-xs opacity-60'>Field msg: {message}</pre>
            {name === 'password' ? <pre className='text-xs opacity-60'>Pwd Keys: {codes?.join(', ')}</pre> : null}
          </div>
        )}
      </FieldState>
    </ElementsField>
  );
});

const Field = CustomField;

export { Field };
