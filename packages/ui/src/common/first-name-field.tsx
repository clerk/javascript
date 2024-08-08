import * as Common from '@clerk/elements/common';
import React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';
import * as Field from '~/primitives/field';

export function FirstNameField(props: Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const { t, translateError } = useLocalizations();

  return (
    <Common.Field
      name='firstName'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {t('formFieldLabel__firstName')}{' '}
            {!props?.required ? <Field.Hint>{t('formFieldHintText__optional')}</Field.Hint> : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Common.Input
                type='text'
                {...props}
                asChild
              >
                <Field.Input intent={state} />
              </Common.Input>
            );
          }}
        </Common.FieldState>
        <Common.FieldError asChild>
          {({ message, code }) => {
            return (
              <Field.Message intent='error'>{translateError({ message, code, name: 'first_name' })}</Field.Message>
            );
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
