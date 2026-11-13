import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { PhoneInput } from '../../../components/phone-input';
import { Text } from '../../../components/text';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSubmitEvent, SignInValues, SignUpFieldName, SignUpFields } from '../sign-in.types';
import { signUpFieldNames } from '../sign-in.utils';
import { SignInOptionalHint, SignInPasswordField } from './sign-in-password-field';

interface SignUpDetailsProps {
  fields: SignUpFields;
  form: UseFormResult<SignInValues>;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  passwordFeedback?: FieldFeedback;
  onSignIn?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignUpDetailsStep({
  fields,
  form,
  globalErrorMessage,
  isPending,
  onSubmit,
  passwordFeedback,
  onSignIn,
  focusRef,
}: SignUpDetailsProps) {
  const m = useMessages('signIn');
  const [first] = signUpFieldNames(fields);
  const field = (name: SignUpFieldName) => ({
    form,
    required: fields[name]?.required ?? false,
    disabled: isPending,
    autoFocus: first === name,
    inputRef: first === name ? focusRef : undefined,
  });

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
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <Form
          id={form.id}
          onSubmit={onSubmit}
        >
          <div {...stylex.props(styles.fieldStack)}>
            {fields.firstName || fields.lastName ? (
              <div {...stylex.props(fields.firstName && fields.lastName ? styles.nameRow : styles.fieldStack)}>
                {fields.firstName ? (
                  <TextField
                    {...field('firstName')}
                    name='firstName'
                    label={m.signUp.firstNameLabel}
                    placeholder={m.signUp.firstNamePlaceholder}
                    autoComplete='given-name'
                  />
                ) : null}
                {fields.lastName ? (
                  <TextField
                    {...field('lastName')}
                    name='lastName'
                    label={m.signUp.lastNameLabel}
                    placeholder={m.signUp.lastNamePlaceholder}
                    autoComplete='family-name'
                  />
                ) : null}
              </div>
            ) : null}
            {fields.username ? (
              <TextField
                {...field('username')}
                name='username'
                label={m.signUp.usernameLabel}
                placeholder={m.signUp.usernamePlaceholder}
                autoComplete='username'
              />
            ) : null}
            {fields.emailAddress ? (
              <TextField
                {...field('emailAddress')}
                name='identifier'
                type='email'
                label={m.signUp.emailLabel}
                placeholder={m.signUp.emailPlaceholder}
                autoComplete='email'
              />
            ) : null}
            {fields.phoneNumber ? <PhoneField {...field('phoneNumber')} /> : null}
            {fields.password ? (
              <SignInPasswordField
                {...field('password')}
                name='password'
                label={m.signUp.passwordLabel}
                placeholder={m.signUp.passwordPlaceholder}
                advisoryFeedback={passwordFeedback}
              />
            ) : null}
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

interface FieldProps {
  form: UseFormResult<SignInValues>;
  required: boolean;
  disabled: boolean;
  autoFocus: boolean;
  inputRef?: Ref<HTMLElement>;
}

function TextField({
  form,
  name,
  type = 'text',
  label,
  placeholder,
  autoComplete,
  required,
  disabled,
  autoFocus,
  inputRef,
}: FieldProps & {
  name: 'firstName' | 'lastName' | 'username' | 'identifier';
  type?: 'text' | 'email';
  label: string;
  placeholder: string;
  autoComplete: string;
}) {
  const { ref, ...control } = form.register(name);
  const flowAutoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, autoFocus ? flowAutoFocusRef : undefined]);
  const { feedback } = form.fields[name];

  return (
    <Field.Root
      required={required}
      invalid={feedback?.type === 'error'}
      disabled={disabled}
      focusableWhenDisabled
    >
      <Field.Header>
        <Field.Label>{label}</Field.Label>
        {required ? null : <SignInOptionalHint />}
      </Field.Header>
      <Input
        ref={mergedRef}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...control}
      />
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}

function PhoneField({ form, required, disabled, autoFocus, inputRef }: FieldProps) {
  const m = useMessages('signIn');
  const { ref, ...control } = form.registerValue('phoneNumber');
  const flowAutoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, autoFocus ? flowAutoFocusRef : undefined]);
  const { feedback } = form.fields.phoneNumber;

  return (
    <Field.Root
      required={required}
      invalid={feedback?.type === 'error'}
      disabled={disabled}
      focusableWhenDisabled
    >
      <Field.Header>
        <Field.Label>{m.signUp.phoneLabel}</Field.Label>
        {required ? null : <SignInOptionalHint />}
      </Field.Header>
      <PhoneInput
        ref={mergedRef}
        autoComplete='tel'
        placeholder={m.signUp.phonePlaceholder}
        countryTriggerLabel={m.signUp.selectedCountry}
        countryPopupLabel={m.signUp.chooseCountry}
        countrySearchLabel={m.signUp.searchCountries}
        {...control}
      />
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}
