import * as Common from '@clerk/elements/common';
import React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';

import * as Field from '../primitives/field';

export function UsernameField({
  alternativeFieldTrigger,
  name = 'username',
  ...props
}: { alternativeFieldTrigger?: React.ReactNode } & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const { t } = useLocalizations();

  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {t('formFieldLabel__username')}{' '}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : !props?.required ? (
              <Field.Hint>{t('formFieldHintText__optional')}</Field.Hint>
            ) : null}
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
          {({ message }) => {
            return <Field.Message intent='error'>{message}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
