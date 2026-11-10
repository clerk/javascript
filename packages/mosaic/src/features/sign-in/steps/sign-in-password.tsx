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
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface SignInPasswordProps {
  identifier: string;
  onEditIdentifier?: () => void;
  value: string;
  errorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPassword({
  identifier,
  onEditIdentifier,
  value,
  errorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onForgotPassword,
  onCancel,
  focusRef,
}: SignInPasswordProps) {
  const m = useMessages('signIn');
  const formId = useId();
  const [visible, setVisible] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPending) {
      onSubmit();
    }
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{m.password.title}</Card.Title>
        <Card.Description>{m.password.description}</Card.Description>
        <SignInIdentityPreview
          identifier={identifier}
          editLabel={m.password.editIdentifier}
          disabled={isPending}
          onEdit={onEditIdentifier}
        />
      </Card.Header>
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
            <Field.Label>{m.password.label}</Field.Label>
            <InputGroup.Root>
              <InputGroup.Input
                ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
                name='password'
                type={visible ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder={m.password.placeholder}
                value={value}
                onChange={event => onValueChange(event.target.value)}
              />
              <InputGroup.End>
                <Button
                  type='button'
                  aria-label={visible ? m.hidePassword : m.showPassword}
                  onClick={() => setVisible(current => !current)}
                >
                  <Icon glyph={visible ? EyeSlash : Eye} />
                </Button>
              </InputGroup.End>
            </InputGroup.Root>
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
            {onForgotPassword ? (
              <Button
                type='button'
                size='sm'
                variant='link'
                disabled={isPending}
                onClick={onForgotPassword}
                xstyle={styles.forgotPassword}
              >
                {m.password.forgotPassword}
              </Button>
            ) : null}
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
            {m.useAnotherMethod}
          </Button>
        ) : null}
        <SubmitButton
          form={formId}
          fullWidth
          isPending={isPending}
          pendingLabel={m.verifying}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
