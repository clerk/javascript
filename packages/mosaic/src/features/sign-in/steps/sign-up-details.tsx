import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId, useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Input } from '../../../components/input';
import { InputGroup } from '../../../components/input-group';
import { Text } from '../../../components/text';
import { styles } from '../sign-in.styles';
import type { SignUpDetails } from '../sign-in.types';

export interface SignUpDetailsMessages {
  title: string;
  description: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
  actionText: string;
  actionLink: string;
}

export interface SignUpDetailsProps {
  messages: SignUpDetailsMessages;
  values: SignUpDetails;
  errors?: Partial<Record<keyof SignUpDetails, string>>;
  isPending?: boolean;
  onValueChange: (field: keyof SignUpDetails, value: string) => void;
  onSubmit: () => void;
  onSignIn?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignUpDetailsStep({
  messages,
  values,
  errors = {},
  isPending = false,
  onValueChange,
  onSubmit,
  onSignIn,
  focusRef,
}: SignUpDetailsProps) {
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
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <form
          id={formId}
          onSubmit={handleSubmit}
          {...stylex.props(styles.fieldStack)}
        >
          <div {...stylex.props(styles.nameRow)}>
            <Field.Root
              required
              invalid={Boolean(errors.firstName)}
              disabled={isPending}
              focusableWhenDisabled
            >
              <Field.Label>{messages.firstNameLabel}</Field.Label>
              <Input
                ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
                name='firstName'
                autoComplete='given-name'
                placeholder={messages.firstNamePlaceholder}
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
              <Field.Label>{messages.lastNameLabel}</Field.Label>
              <Input
                name='lastName'
                autoComplete='family-name'
                placeholder={messages.lastNamePlaceholder}
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
            <Field.Label>{messages.emailLabel}</Field.Label>
            <Input
              name='emailAddress'
              type='email'
              autoComplete='email'
              placeholder={messages.emailPlaceholder}
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
            <Field.Label>{messages.passwordLabel}</Field.Label>
            <InputGroup.Root>
              <InputGroup.Input
                name='password'
                type={visible ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder={messages.passwordPlaceholder}
                value={values.password}
                onChange={event => onValueChange('password', event.target.value)}
              />
              <InputGroup.End>
                <Button
                  type='button'
                  aria-label={visible ? messages.hidePasswordLabel : messages.showPasswordLabel}
                  onClick={() => setVisible(current => !current)}
                >
                  <Icon name={visible ? 'eye-slash' : 'eye'} />
                </Button>
              </InputGroup.End>
            </InputGroup.Root>
            <Field.Message>
              <Field.Error>{errors.password}</Field.Error>
            </Field.Message>
          </Field.Root>
        </form>
        {onSignIn ? (
          <Text
            size='sm'
            color='foreground-secondary'
            xstyle={styles.footerText}
          >
            {messages.actionText}{' '}
            <Button
              type='button'
              size='sm'
              variant='link'
              disabled={isPending}
              onClick={onSignIn}
            >
              {messages.actionLink}
            </Button>
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={formId}
          fullWidth
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
