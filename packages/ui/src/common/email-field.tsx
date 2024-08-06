import * as Common from '@clerk/elements/common';
import React from 'react';

import { useAttributes } from '~/hooks/use-attributes';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Field from '~/primitives/field';

const DEFAULT_FIELD_NAME = 'emailAddress';

export function EmailField({
  alternativeFieldTrigger,
  name = DEFAULT_FIELD_NAME,
  enabled,
  required,
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  enabled?: boolean;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const { t, translateError } = useLocalizations();
  const { enabled: attributeEnabled, required: attributeRequired } = useAttributes('email_address');

  const isEnabled = enabled !== undefined ? enabled : attributeEnabled;
  const isRequired = required !== undefined ? required : attributeRequired;

  if (!isEnabled) {
    return null;
  }

  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {t('formFieldLabel__emailAddress')}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : !isRequired ? (
              <Field.Hint>{t('formFieldHintText__optional')}</Field.Hint>
            ) : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Common.Input
                type='email'
                {...props}
                required={isRequired}
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
              <Field.Message intent='error'>{translateError({ message, code, name: 'email_address' })}</Field.Message>
            );
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
