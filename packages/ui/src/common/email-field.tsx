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
  enabled,
  error,
  required,
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  label: React.ReactNode;
  hintText?: React.ReactNode;
  enabled?: boolean;
  error?: (message: string, code: string, name: string) => string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const { t, translateError } = useLocalizations();
  const { enabled: attributeEnabled, required: attributeRequired } = useAttributes('email_address');

  const renderLabel = label ? label : t('formFieldLabel__emailAddress');
  const renderError = error ? error : translateError;
  const isEnabled = enabled !== undefined ? enabled : attributeEnabled;
  const isRequired = required !== undefined ? required : attributeRequired;
  const renderHintText = () => {
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
            {renderLabel}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : renderHintText ? (
              <Field.Hint>{renderHintText()}</Field.Hint>
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
            return <Field.Message intent='error'>{renderError(message, code, DEFAULT_ERROR_NAME)}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
