import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';
import { useCallback, useRef, useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Checkbox } from '../../../components/checkbox';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { Link } from '../../../components/link';
import { PasswordInput } from '../../../components/password-input';
import { PhoneInput } from '../../../components/phone-input';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { fill, rich, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type {
  SignInProvider,
  SignInStep,
  SignInSubmitEvent,
  SignInValues,
  SignUpFieldName,
  SignUpLegalConsent,
} from '../sign-in.types';
import { legalConsentLabel, signUpFieldNames, signUpHeading } from '../sign-in.utils';

interface SignUpDetailsProps {
  step: Extract<SignInStep, { kind: 'sign-up' }>;
  onSwitchField?: () => void;
  socialProviders: readonly SignInProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  isDisabled: boolean;
  form: UseFormResult<SignInValues>;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  passwordFeedback?: FieldFeedback;
  onSignIn?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignUpDetailsStep({
  step,
  onSwitchField,
  socialProviders,
  pendingProviderId,
  onSelectProvider,
  isDisabled,
  form,
  globalErrorMessage,
  isPending,
  onSubmit,
  passwordFeedback,
  onSignIn,
  focusRef,
}: SignUpDetailsProps) {
  const m = useMessages('signIn');
  const { fields, nextField, legalConsent } = step;
  const heading = signUpHeading(step, m);
  const [first] = signUpFieldNames(fields);
  const onlyLegalConsent = Boolean(legalConsent) && !first;
  const switchedRef = useRef(false);
  const focusAfterSwitch = useCallback((element: HTMLElement | null) => {
    if (element && switchedRef.current) {
      switchedRef.current = false;
      element.focus();
    }
  }, []);
  const field = (name: SignUpFieldName) => ({
    form,
    required: fields[name]?.required ?? false,
    disabled: isDisabled,
    autoFocus: first === name,
    inputRef: first === name ? focusRef : undefined,
  });
  const switchField =
    nextField && onSwitchField
      ? {
          switchRef: focusAfterSwitch,
          switchLabel: nextField === 'phoneNumber' ? m.signUp.usePhone : m.signUp.useEmail,
          onSwitch: () => {
            switchedRef.current = true;
            onSwitchField();
          },
        }
      : undefined;

  return (
    <>
      <Card.Header>
        <Card.Title>{heading.title}</Card.Title>
        <Card.Description>{heading.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <SignUpProviders
          providers={onlyLegalConsent ? [] : socialProviders}
          pendingProviderId={pendingProviderId}
          isDisabled={isDisabled}
          onSelectProvider={onSelectProvider}
        />
        <Form
          id={form.id}
          onSubmit={onSubmit}
        >
          <div {...stylex.props(styles.fieldStack)}>
            <NameFields
              firstName={fields.firstName ? field('firstName') : undefined}
              lastName={fields.lastName ? field('lastName') : undefined}
            />
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
                {...switchField}
                name='identifier'
                type='email'
                label={m.signUp.emailLabel}
                placeholder={m.signUp.emailPlaceholder}
                autoComplete='email'
              />
            ) : null}
            {fields.phoneNumber ? (
              <PhoneField
                {...field('phoneNumber')}
                {...switchField}
              />
            ) : null}
            {fields.password ? (
              <PasswordField
                {...field('password')}
                advisoryFeedback={passwordFeedback}
              />
            ) : null}
            {legalConsent ? (
              <LegalConsentField
                form={form}
                consent={legalConsent}
                disabled={isDisabled}
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
              disabled={isDisabled}
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
          disabled={Boolean(pendingProviderId)}
          isPending={isPending}
          pendingLabel={m.verifying}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function SignUpProviders({
  providers,
  pendingProviderId,
  isDisabled,
  onSelectProvider,
}: {
  providers: readonly SignInProvider[];
  pendingProviderId?: string;
  isDisabled: boolean;
  onSelectProvider: (id: string) => void;
}) {
  const m = useMessages('signIn');
  if (providers.length === 0) {
    return null;
  }

  return (
    <>
      <ProviderButtonGroup disabled={isDisabled}>
        {providers.map(provider => (
          <ProviderButton
            key={provider.id}
            icon={
              <img
                src={provider.iconUrl}
                alt=''
                {...stylex.props(styles.providerIcon)}
              />
            }
            longLabel={fill(m.start.socialButton, { provider: provider.name })}
            shortLabel={provider.name}
            isPending={pendingProviderId === provider.id}
            pendingLabel={m.verifying}
            onClick={() => onSelectProvider(provider.id)}
          />
        ))}
      </ProviderButtonGroup>
      <div
        role='separator'
        {...stylex.props(styles.divider)}
      >
        <span {...stylex.props(styles.dividerLine)} />
        <Text
          size='sm'
          color='foreground-secondary'
        >
          {m.start.divider}
        </Text>
        <span {...stylex.props(styles.dividerLine)} />
      </div>
    </>
  );
}

function LegalConsentField({
  form,
  consent,
  disabled,
}: {
  form: UseFormResult<SignInValues>;
  consent: SignUpLegalConsent;
  disabled: boolean;
}) {
  const m = useMessages('signIn');
  const { feedback } = form.fields.legalAccepted;
  const link = (href: string | undefined) => (children: ReactNode) =>
    href ? (
      <Link
        href={href}
        target='_blank'
        rel='noopener noreferrer'
      >
        {children}
      </Link>
    ) : (
      children
    );

  return (
    <Field.Root
      orientation='horizontal'
      required
      invalid={feedback?.type === 'error'}
      disabled={disabled}
    >
      <Checkbox
        checked={form.values.legalAccepted}
        onChange={event => form.setValue('legalAccepted', event.target.checked)}
      />
      <Field.Label>
        {rich(legalConsentLabel(consent, m), {
          components: { terms: link(consent.termsUrl), privacy: link(consent.privacyPolicyUrl) },
        })}
      </Field.Label>
    </Field.Root>
  );
}

function NameFields({ firstName, lastName }: { firstName?: FieldProps; lastName?: FieldProps }) {
  const m = useMessages('signIn');
  if (!firstName && !lastName) {
    return null;
  }

  return (
    <div {...stylex.props(firstName && lastName ? styles.nameRow : styles.fieldStack)}>
      {firstName ? (
        <TextField
          {...firstName}
          name='firstName'
          label={m.signUp.firstNameLabel}
          placeholder={m.signUp.firstNamePlaceholder}
          autoComplete='given-name'
        />
      ) : null}
      {lastName ? (
        <TextField
          {...lastName}
          name='lastName'
          label={m.signUp.lastNameLabel}
          placeholder={m.signUp.lastNamePlaceholder}
          autoComplete='family-name'
        />
      ) : null}
    </div>
  );
}

interface FieldProps {
  form: UseFormResult<SignInValues>;
  required: boolean;
  disabled: boolean;
  autoFocus: boolean;
  inputRef?: Ref<HTMLElement>;
  switchRef?: Ref<HTMLElement>;
  switchLabel?: string;
  onSwitch?: () => void;
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
  switchRef,
  switchLabel,
  onSwitch,
}: FieldProps & {
  name: 'firstName' | 'lastName' | 'username' | 'identifier';
  type?: 'text' | 'email';
  label: string;
  placeholder: string;
  autoComplete: string;
}) {
  const { ref, ...control } = form.register(name);
  const flowAutoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, switchRef, autoFocus ? flowAutoFocusRef : undefined]);
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
        <FieldHeaderEnd
          required={required}
          disabled={disabled}
          switchLabel={switchLabel}
          onSwitch={onSwitch}
        />
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

function PhoneField({ form, required, disabled, autoFocus, inputRef, switchRef, switchLabel, onSwitch }: FieldProps) {
  const m = useMessages('signIn');
  const { ref, ...control } = form.registerValue('phoneNumber');
  const flowAutoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, switchRef, autoFocus ? flowAutoFocusRef : undefined]);
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
        <FieldHeaderEnd
          required={required}
          disabled={disabled}
          switchLabel={switchLabel}
          onSwitch={onSwitch}
        />
      </Field.Header>
      <PhoneInput
        ref={mergedRef}
        autoComplete='tel'
        placeholder={m.signUp.phonePlaceholder}
        countryTriggerLabel={m.signUp.selectedCountry}
        countryPopupLabel={m.signUp.chooseCountry}
        countrySearchLabel={m.signUp.searchCountries}
        countrySearchPlaceholder={m.signUp.countrySearchPlaceholder}
        noResultsMessage={m.signUp.noCountries}
        {...control}
      />
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}

function PasswordField({
  form,
  required,
  disabled,
  autoFocus,
  inputRef,
  advisoryFeedback,
}: FieldProps & { advisoryFeedback?: FieldFeedback }) {
  const m = useMessages('signIn');
  const [focused, setFocused] = useState(false);
  const { feedback } = form.fields.password;
  const message = feedback?.type === 'error' ? feedback : advisoryFeedback;
  const feedbackType = message?.type === 'info' && !focused ? 'error' : message?.type;
  const { ref, ...control } = form.register('password');
  const flowAutoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const mergedRef = useMergeRefs<HTMLElement>([ref, inputRef, autoFocus ? flowAutoFocusRef : undefined]);

  return (
    <Field.Root
      required={required}
      invalid={feedbackType === 'error'}
      disabled={disabled}
      focusableWhenDisabled
    >
      <Field.Header>
        <Field.Label>{m.signUp.passwordLabel}</Field.Label>
        {required ? null : <OptionalHint />}
      </Field.Header>
      <PasswordInput
        ref={mergedRef}
        autoComplete='new-password'
        placeholder={m.signUp.passwordPlaceholder}
        {...control}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          control.onBlur();
        }}
        showPasswordLabel={m.showPassword}
        hidePasswordLabel={m.hidePassword}
      />
      <Field.Feedback feedback={message && feedbackType ? { ...message, type: feedbackType } : undefined} />
    </Field.Root>
  );
}

function FieldHeaderEnd({
  required,
  disabled,
  switchLabel,
  onSwitch,
}: Pick<FieldProps, 'required' | 'disabled' | 'switchLabel' | 'onSwitch'>) {
  if (switchLabel && onSwitch) {
    return (
      <Button
        type='button'
        size='sm'
        variant='link'
        disabled={disabled}
        onClick={onSwitch}
      >
        {switchLabel}
      </Button>
    );
  }
  return required ? null : <OptionalHint />;
}

function OptionalHint() {
  const m = useMessages('signIn');

  return (
    <Text
      size='sm'
      color='foreground-secondary'
      render={<span />}
    >
      {m.signUp.optional}
    </Text>
  );
}
