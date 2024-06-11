import * as Common from '@clerk/elements/common';
import cn from 'clsx';
import React from 'react';

import * as Field from '../primitives/field';
import * as Icon from '../primitives/icon';

export function PasswordField({
  className,
  label = 'Password',
  ...props
}: { label?: React.ReactNode } & Omit<
  React.ComponentProps<typeof Common.Input>,
  'autoCapitalize' | 'autoComplete' | 'spellCheck' | 'type'
>) {
  const [type, setType] = React.useState('password');
  const [touched, setTouched] = React.useState(false);

  return (
    <Common.Field
      name='password'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>{label}</Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <div className='relative'>
                <Common.Input
                  type={type}
                  // note: we set `type` to `text` to show the password, but our
                  //       mutually exclusive prop `validatePassword` requires a
                  //      `type` of `password`. `validatePassword` does however
                  //       behave as expected when `type` is `text`, so we can
                  //       safely ignore the TS error.
                  // @ts-expect-error – see above
                  validatePassword
                  className={cn('pe-7', className)}
                  onBlur={() => setTouched(true)}
                  {...props}
                  asChild
                >
                  <Field.Input intent={state} />
                </Common.Input>
                <button
                  type='button'
                  className={cn(
                    'aspect-square absolute rounded-sm outline-none end-1 top-1 text-icon-sm text-gray-11 p-1',
                    'hover:text-gray-12 hover:bg-gray-3',
                    'focus-visible:rounded-[calc(var(--cl-radius)*0.4)] focus-visible:ring-2 focus-visible:ring-default',
                  )}
                  onClick={() => setType(prev => (prev === 'password' ? 'text' : 'password'))}
                  title={[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}
                >
                  <span className='sr-only'>{[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}</span>
                  {type === 'password' ? <Icon.EyeSlashSm /> : <Icon.EyeSm />}
                </button>
              </div>
            );
          }}
        </Common.FieldState>
        <Common.FieldError asChild>
          {({ message }) => {
            return <Field.Message intent='error'>{message}</Field.Message>;
          }}
        </Common.FieldError>
        <Common.FieldState>
          {({ state, message }) => {
            if (state === 'idle') {
              return;
            }

            // Confirm success states immediately
            if (state === 'success') {
              return <Field.Message intent={state}>{message}</Field.Message>;
            }

            // Show errors and warnings only if the field has been interacted with
            if (!touched) {
              return;
            }

            return <Field.Message intent={state}>{message}</Field.Message>;
          }}
        </Common.FieldState>
      </Field.Root>
    </Common.Field>
  );
}
