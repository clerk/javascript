import * as Common from '@clerk/elements/common';
import { cx } from 'cva';
import React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';
import { Animated } from '~/primitives/animated';
import * as Field from '~/primitives/field';
import EyeSlashSm from '~/primitives/icons/eye-slash-sm';
import EyeSm from '~/primitives/icons/eye-sm';
import { translatePasswordError } from '~/utils/make-localizable';

export function PasswordField({
  alternativeFieldTrigger,
  className,
  label,
  name = 'password',
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  validatePassword?: boolean;
  name?: 'password' | 'confirmPassword';
  /**
   * **Note:** this prop is required as the `label` differs depending on the context (e.g. new password)
   */
  label: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'autoCapitalize' | 'autoComplete' | 'spellCheck' | 'type'>) {
  const [type, setType] = React.useState('password');
  const id = React.useId();
  const { t, locale } = useLocalizations();

  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label}
            {alternativeFieldTrigger ? <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd> : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Field.InputGroup>
                <Common.Input
                  type={type}
                  className={cx('pe-7', className)}
                  {...props}
                  aria-describedby={props.validatePassword && state !== 'idle' ? id : undefined}
                  asChild
                >
                  <Field.Input intent={state} />
                </Common.Input>
                <Field.InputGroupEnd>
                  <button
                    type='button'
                    className={cx(
                      // Note:
                      // We set to `1.375rem` (22px) here for a hairline border
                      // around the focus ring to keep it distinct from the
                      // "surrounding" input
                      'text-icon-sm text-gray-10 start-auto m-1 inline-flex aspect-square h-[1.375rem] items-center justify-center rounded-sm bg-white p-0 outline-none disabled:cursor-not-allowed disabled:opacity-50',
                      'hover:enabled:text-gray-12 hover:enabled:bg-gray-3',
                      'focus-visible:rounded-[calc(var(--cl-radius)*0.4)] focus-visible:ring',
                    )}
                    onClick={() => setType(prev => (prev === 'password' ? 'text' : 'password'))}
                    title={[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}
                    disabled={props.disabled}
                  >
                    <span className='sr-only'>{[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}</span>
                    {type === 'password' ? <EyeSlashSm /> : <EyeSm />}
                  </button>
                </Field.InputGroupEnd>
              </Field.InputGroup>
            );
          }}
        </Common.FieldState>
        <Animated>
          {props.validatePassword ? (
            <Common.FieldState>
              {({ state, codes }) => {
                if (state === 'idle') {
                  return;
                }
                if (state === 'success') {
                  return (
                    <Field.Message
                      id={id}
                      intent='success'
                    >
                      {t('unstable__errors.zxcvbn.goodPassword')}
                    </Field.Message>
                  );
                }
                // Note:
                // If `codes` is `undefined`, the error is likely a native one
                // (e.g. `required`)
                if (typeof codes === 'undefined') {
                  return;
                }
                return (
                  <Field.Message
                    id={id}
                    intent={state}
                  >
                    {translatePasswordError({ codes, locale, t })}
                  </Field.Message>
                );
              }}
            </Common.FieldState>
          ) : (
            <Common.FieldError asChild>
              {({ message }) => {
                return <Field.Message intent='error'>{message}</Field.Message>;
              }}
            </Common.FieldError>
          )}
        </Animated>
      </Field.Root>
    </Common.Field>
  );
}
