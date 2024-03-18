'use client';

import type { FormSubmitProps, OTPInputSegmentStatus } from '@clerk/elements/common';
import {
  Field as ElementsField,
  FieldError,
  FieldState,
  Input,
  Label,
  Submit as ElementsSubmit,
} from '@clerk/elements/common';
import clsx from 'clsx';
import * as React from 'react';

function OTPInputSegment({ value, status }: { value: string; status: OTPInputSegmentStatus }) {
  return (
    <FieldState>
      {({ state }) => (
        <span
          data-state={state}
          data-status={status}
          className={clsx(
            'flex flex-col justify-center items-center h-12 w-10 rounded-lg border-2 bg-white border-[var(--border-color)] [--border-color:theme(colors.gray.300)] data-[state="invalid"]:[--border-color:theme(colors.red.500)] text-lg text-black self-stretch',
            (status === 'cursor' || status === 'selected') &&
              '[--border-color:theme(colors.purple.500)] shadow-[0_0_0_1px_theme(colors.purple.500)]',
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
  { alwaysShow?: boolean; name: string; label: string; required?: boolean; autoSubmit?: boolean; autoFocus?: boolean }
>(function CustomField(
  { alwaysShow, name, label, required = false, autoSubmit = false, autoFocus = false },
  forwardedRef,
) {
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
      <div className='flex gap-4 justify-between items-center'>
        <Label>{label}</Label>
        <Input
          name={name}
          {...inputProps}
        />
      </div>

      <FieldError className='block text-red-400 font-mono' />
      <FieldState>{({ state }) => <pre className='opacity-60 text-xs'>Field state: {state}</pre>}</FieldState>
    </ElementsField>
  );
});

type CustomSubmitElement = React.ElementRef<typeof ElementsSubmit>;

export const CustomSubmit = React.forwardRef<CustomSubmitElement, FormSubmitProps>(function CustomButton(
  props,
  forwardedRef,
) {
  return (
    <ElementsSubmit
      className='px-7 py-3 justify-center transition rounded-lg focus:outline-none border items-center disabled:bg-[rgb(12,12,12)] focus:text-[rgb(255,255,255)] w-full duration-300 focus:!border-[rgb(37,37,37)] text-sm space-x-1.5 text-[rgb(160,160,160)] hover:text-[rgb(243,243,243)] disabled:text-[rgb(100,100,100)] select-none bg-[rgb(22,22,22)] hover:bg-[rgb(22,22,30)] border-[rgb(37,37,37)] hover:border-[rgb(50,50,50)]'
      {...props}
      type='submit'
      ref={forwardedRef}
    />
  );
});

const Field = CustomField;
const Submit = CustomSubmit;

export { Field, Submit };
