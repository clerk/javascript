import { useMergeRefs } from '@floating-ui/react';
import type { FormEvent, Ref } from 'react';
import { useId, useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { InputGroup } from '../../../components/input-group';
import { Eye } from '../../../icons/glyphs/eye';
import { EyeSlash } from '../../../icons/glyphs/eye-slash';
import { Form } from '../../../primitives/form';

export interface ReverificationPasswordMessages {
  title: string;
  description: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface ReverificationPasswordProps {
  messages: ReverificationPasswordMessages;
  value: string;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function ReverificationPassword({
  messages,
  value,
  errorMessage,
  globalErrorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onCancel,
  focusRef,
}: ReverificationPasswordProps) {
  const formId = useId();
  const [visible, setVisible] = useState(false);

  const canSubmit = value !== '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isPending) {
      onSubmit();
    }
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <Form
          id={formId}
          onSubmit={handleSubmit}
        >
          <Field.Root
            required
            invalid={Boolean(errorMessage)}
            disabled={isPending}
            focusableWhenDisabled
          >
            <Field.Label>{messages.fieldLabel}</Field.Label>
            <InputGroup.Root>
              <InputGroup.Input
                ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
                name='password'
                type={visible ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder={messages.fieldPlaceholder}
                value={value}
                onChange={event => onValueChange(event.target.value)}
              />
              <InputGroup.End>
                <Button
                  type='button'
                  aria-label={visible ? messages.hidePasswordLabel : messages.showPasswordLabel}
                  onClick={() => setVisible(current => !current)}
                >
                  <Icon glyph={visible ? EyeSlash : Eye} />
                </Button>
              </InputGroup.End>
            </InputGroup.Root>
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
          </Field.Root>
        </Form>
      </Card.Content>
      <Card.Footer>
        {onCancel ? (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            disabled={isPending}
            onClick={onCancel}
          >
            {messages.secondaryActionLabel}
          </Button>
        ) : null}
        <SubmitButton
          form={formId}
          fullWidth
          disabled={!canSubmit}
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
