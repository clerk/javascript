import * as Common from '@clerk/elements/common';
import React from 'react';

import { useAttributes } from '~/hooks/use-attributes';
import { useLocalizations } from '~/hooks/use-localizations';

import * as Field from '../primitives/field';

const DEFAULT_FIELD_NAME = 'emailAddress';
const DEFAULT_ERROR_NAME = 'email_address';

export function EmailField({
  alternativeFieldTrigger,
  label,
  name = DEFAULT_FIELD_NAME,
  hintText,
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  label?: React.ReactNode;
  hintText?: string;
  enabled?: boolean;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const { t, translateError } = useLocalizations();
  const { enabled, required } = useAttributes('email_address');
  const renderedLabel = label ? label : t('formFieldLabel__emailAddress');
  const isEnabled = props.enabled !== undefined ? props.enabled : enabled;
  const isRequired = props.required !== undefined ? props.required : required;
  const renderedHintText = () => {
    if (hintText) {
      return hintText;
    }
    if (!isRequired) {
      return t('formFieldHintText__optional');
    }
    return null;
  };
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
            {renderedLabel}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : renderedHintText ? (
              <Field.Hint>{renderedHintText()}</Field.Hint>
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
            return <Field.Message intent='error'>{translateError(message, code, DEFAULT_ERROR_NAME)}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
