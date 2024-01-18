'use client';

import { ClerkError, Field as ElementsField, FieldState, Input, Label, Submit } from '@clerk/elements';
import clsx from 'clsx';
import { forwardRef } from 'react';

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

export const CustomField = forwardRef<Input, { name: string; label: string }>(function CustomField(
  { name, label },
  forwardedRef,
) {
  const inputProps =
    name === 'code'
      ? {
          render: OTPInputSegment,
        }
      : {
          className: 'bg-tertiary rounded-sm px-2 py-1 border border-foreground data-[invalid]:border-red-500',
        };

  return (
    <ElementsField
      name={name}
      className='flex flex-col gap-4'
    >
      <div className='flex gap-4 justify-between items-center'>
        <Label>{label}</Label>
        <Input
          ref={forwardedRef}
          name={name}
          {...inputProps}
        />
      </div>

      <ClerkError className='block text-red-400 font-mono' />
      <FieldState>{({ state }) => <pre className='opacity-60 text-xs'>Field state: {state}</pre>}</FieldState>
    </ElementsField>
  );
});

export const CustomSubmit = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
  function CustomButton(props, forwardedRef) {
    return (
      <Submit
        className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'
        {...props}
        type='submit'
        ref={forwardedRef}
      />
    );
  },
);

const Field = CustomField;
const Submit = CustomSubmit;

export { Field, Submit };
