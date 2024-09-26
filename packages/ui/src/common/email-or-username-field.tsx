import * as Common from '@clerk/elements/common';
import React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';
import { Animated } from '~/primitives/animated';
import * as Field from '~/primitives/field';

export const EmailOrUsernameField = React.forwardRef(function EmailOrUsernameField(
  {
    alternativeFieldTrigger,

    ...props
  }: {
    alternativeFieldTrigger?: React.ReactNode;
  } & Omit<React.ComponentProps<typeof Common.Input>, 'type'>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const { t } = useLocalizations();

  return (
    <Common.Field
      name='identifier'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {t('formFieldLabel__emailAddress_username')}{' '}
            {alternativeFieldTrigger && <span className='flex-grow self-end text-end'>{alternativeFieldTrigger}</span>}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Common.Input
                ref={forwardedRef}
                type='text'
                {...props}
                asChild
              >
                <Field.Input intent={state} />
              </Common.Input>
            );
          }}
        </Common.FieldState>
        <Animated>
          <Common.FieldError asChild>
            {({ message }) => {
              return <Field.Message intent='error'>{message}</Field.Message>;
            }}
          </Common.FieldError>
        </Animated>
      </Field.Root>
    </Common.Field>
  );
});
