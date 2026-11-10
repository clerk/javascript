import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { PasswordInput } from '../../../components/password-input';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues } from '../sign-in.types';

interface SignUpDetailsProps {
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onSignIn?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignUpDetailsStep({ form, errorMessage, isPending, onSubmit, onSignIn, focusRef }: SignUpDetailsProps) {
  const m = useMessages('signIn');
  const { ref: firstNameFieldRef, ...firstName } = form.register('firstName');
  const firstNameRef = useMergeRefs<HTMLElement>([firstNameFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const {
    firstName: firstNameField,
    lastName: lastNameField,
    identifier: emailField,
    password: passwordField,
  } = form.fields;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.signUp.title}</Card.Title>
        <Card.Description>{m.signUp.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {errorMessage ?? form.error}
      </Card.Banner>
      <Card.Content>
        <Form
          id={form.id}
          onSubmit={onSubmit}
        >
          <div {...stylex.props(styles.fieldStack)}>
            <div {...stylex.props(styles.nameRow)}>
              <Field.Root
                required
                invalid={firstNameField.feedback?.type === 'error'}
                disabled={isPending}
                focusableWhenDisabled
              >
                <Field.Label>{m.signUp.firstNameLabel}</Field.Label>
                <Input
                  ref={firstNameRef}
                  autoComplete='given-name'
                  placeholder={m.signUp.firstNamePlaceholder}
                  {...firstName}
                />
                <Field.Feedback feedback={firstNameField.feedback} />
              </Field.Root>
              <Field.Root
                required
                invalid={lastNameField.feedback?.type === 'error'}
                disabled={isPending}
                focusableWhenDisabled
              >
                <Field.Label>{m.signUp.lastNameLabel}</Field.Label>
                <Input
                  autoComplete='family-name'
                  placeholder={m.signUp.lastNamePlaceholder}
                  {...form.register('lastName')}
                />
                <Field.Feedback feedback={lastNameField.feedback} />
              </Field.Root>
            </div>
            <Field.Root
              required
              invalid={emailField.feedback?.type === 'error'}
              disabled={isPending}
              focusableWhenDisabled
            >
              <Field.Label>{m.signUp.emailLabel}</Field.Label>
              <Input
                type='email'
                autoComplete='email'
                placeholder={m.signUp.emailPlaceholder}
                {...form.register('identifier')}
              />
              <Field.Feedback feedback={emailField.feedback} />
            </Field.Root>
            <Field.Root
              required
              invalid={passwordField.feedback?.type === 'error'}
              disabled={isPending}
              focusableWhenDisabled
            >
              <Field.Label>{m.signUp.passwordLabel}</Field.Label>
              <PasswordInput
                autoComplete='new-password'
                placeholder={m.signUp.passwordPlaceholder}
                {...form.register('password')}
                showPasswordLabel={m.showPassword}
                hidePasswordLabel={m.hidePassword}
              />
              <Field.Feedback feedback={passwordField.feedback} />
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
          form={form.id}
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
