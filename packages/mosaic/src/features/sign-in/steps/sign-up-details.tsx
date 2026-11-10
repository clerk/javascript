import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Input } from '../../../components/input';
import { PasswordInput } from '../../../components/password-input';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignUpDetails } from '../sign-in.types';

interface SignUpDetailsProps {
  values: SignUpDetails;
  errors?: Partial<Record<keyof SignUpDetails, string>>;
  isPending?: boolean;
  onValueChange: (field: keyof SignUpDetails, value: string) => void;
  onSubmit: () => void;
  onSignIn?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignUpDetailsStep({
  values,
  errors = {},
  isPending = false,
  onValueChange,
  onSubmit,
  onSignIn,
  focusRef,
}: SignUpDetailsProps) {
  const m = useMessages('signIn');
  const formId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPending) {
      onSubmit();
    }
  };

  return (
    <>
      <Card.Header>
        <Card.Title>{m.signUp.title}</Card.Title>
        <Card.Description>{m.signUp.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Form
          id={formId}
          onSubmit={handleSubmit}
        >
          <div {...stylex.props(styles.fieldStack)}>
            <div {...stylex.props(styles.nameRow)}>
              <Field.Root
                required
                invalid={Boolean(errors.firstName)}
                disabled={isPending}
                focusableWhenDisabled
              >
                <Field.Label>{m.signUp.firstNameLabel}</Field.Label>
                <Input
                  ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
                  name='firstName'
                  autoComplete='given-name'
                  placeholder={m.signUp.firstNamePlaceholder}
                  value={values.firstName}
                  onChange={event => onValueChange('firstName', event.target.value)}
                />
                <Field.Message>
                  <Field.Error>{errors.firstName}</Field.Error>
                </Field.Message>
              </Field.Root>
              <Field.Root
                required
                invalid={Boolean(errors.lastName)}
                disabled={isPending}
                focusableWhenDisabled
              >
                <Field.Label>{m.signUp.lastNameLabel}</Field.Label>
                <Input
                  name='lastName'
                  autoComplete='family-name'
                  placeholder={m.signUp.lastNamePlaceholder}
                  value={values.lastName}
                  onChange={event => onValueChange('lastName', event.target.value)}
                />
                <Field.Message>
                  <Field.Error>{errors.lastName}</Field.Error>
                </Field.Message>
              </Field.Root>
            </div>
            <Field.Root
              required
              invalid={Boolean(errors.emailAddress)}
              disabled={isPending}
              focusableWhenDisabled
            >
              <Field.Label>{m.signUp.emailLabel}</Field.Label>
              <Input
                name='emailAddress'
                type='email'
                autoComplete='email'
                placeholder={m.signUp.emailPlaceholder}
                value={values.emailAddress}
                onChange={event => onValueChange('emailAddress', event.target.value)}
              />
              <Field.Message>
                <Field.Error>{errors.emailAddress}</Field.Error>
              </Field.Message>
            </Field.Root>
            <Field.Root
              required
              invalid={Boolean(errors.password)}
              disabled={isPending}
              focusableWhenDisabled
            >
              <Field.Label>{m.signUp.passwordLabel}</Field.Label>
              <PasswordInput
                name='password'
                autoComplete='new-password'
                placeholder={m.signUp.passwordPlaceholder}
                value={values.password}
                onChange={event => onValueChange('password', event.target.value)}
                showPasswordLabel={m.showPassword}
                hidePasswordLabel={m.hidePassword}
              />
              <Field.Message>
                <Field.Error>{errors.password}</Field.Error>
              </Field.Message>
            </Field.Root>
          </div>
        </Form>
        {onSignIn ? (
          <Text
            size='sm'
            color='foreground-secondary'
            xstyle={styles.footerText}
          >
            {m.signUp.signInPrompt}{' '}
            <Button
              type='button'
              size='sm'
              variant='link'
              disabled={isPending}
              onClick={onSignIn}
            >
              {m.signUp.signInLink}
            </Button>
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
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
