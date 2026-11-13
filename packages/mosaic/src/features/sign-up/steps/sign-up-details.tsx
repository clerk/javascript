import { inertProps } from '@clerk/shared/inert';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useCallback, useRef, useState } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { PasswordInput } from '../../../components/password-input';
import { PhoneInput } from '../../../components/phone-input';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../../auth-flow/auth-flow.styles';
import type { AuthFlowProvider } from '../../auth-flow/auth-flow.types';
import { FlowCaptcha } from '../../auth-flow/steps/captcha';
import type { SignUpDetails, SignUpFieldName, SignUpSubmitEvent, SignUpValues } from '../sign-up.types';
import { signUpDetailsHeading, signUpFieldNames } from '../sign-up.utils';
import { SignUpLegalConsentField } from './sign-up-legal-consent';

interface SignUpDetailsProps {
  step: SignUpDetails;
  onSwitchField?: () => void;
  socialProviders: readonly AuthFlowProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  isDisabled: boolean;
  form: UseFormResult<SignUpValues>;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: (event: SignUpSubmitEvent) => void;
  passwordFeedback?: FieldFeedback;
  onSignIn?: () => void;
  focusRef?: Ref<HTMLElement>;
  logo?: { src: string; alt: string };
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
  logo,
}: SignUpDetailsProps) {
  const m = useMessages('signUp');
  const shared = useMessages('signIn');
  const { fields, legalConsent } = step;
  const heading = signUpDetailsHeading(step, m);
  const [first] = signUpFieldNames(fields);
  const onlyLegalConsent = Boolean(legalConsent) && !first;
  const hasFields = Boolean(first) || Boolean(legalConsent);
  const hasForm = hasFields || step.purpose === 'continue';
  const [isChallengeShown, setIsChallengeShown] = useState(false);
  return (
    <>
      <Card.Header>
        {logo ? (
          <Card.Media>
            <img
              src={logo.src}
              alt={logo.alt}
              {...stylex.props(styles.logo)}
            />
          </Card.Media>
        ) : null}
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
        <div
          {...stylex.props(isChallengeShown ? styles.spotlightHidden : styles.spotlightGroup)}
          {...inertProps(isChallengeShown)}
        >
          <SignUpProviders
            providers={onlyLegalConsent ? [] : socialProviders}
            showDivider={hasFields}
            pendingProviderId={pendingProviderId}
            isDisabled={isDisabled}
            onSelectProvider={onSelectProvider}
          />
          {hasForm ? (
            <SignUpFields
              step={step}
              form={form}
              isDisabled={isDisabled}
              onSubmit={onSubmit}
              onSwitchField={onSwitchField}
              passwordFeedback={passwordFeedback}
              focusRef={focusRef}
            />
          ) : null}
        </div>
        {step.purpose === 'continue' ? null : <FlowCaptcha onInteractiveChange={setIsChallengeShown} />}
        {onSignIn ? (
          <Text
            size='sm'
            color='foreground-secondary'
            xstyle={styles.footerText}
          >
            {m.signInPrompt}{' '}
            <Button
              type='button'
              size='sm'
              variant='link'
              disabled={isDisabled}
              onClick={onSignIn}
            >
              {m.signInLink}
            </Button>
          </Text>
        ) : null}
      </Card.Content>
      {hasForm ? (
        <Card.Footer xstyle={isChallengeShown && styles.spotlightHidden}>
          <SubmitButton
            form={form.id}
            fullWidth
            disabled={Boolean(pendingProviderId)}
            isPending={isPending}
            pendingLabel={shared.verifying}
          >
            {shared.continue}
          </SubmitButton>
        </Card.Footer>
      ) : null}
    </>
  );
}

function SignUpFields({
  step,
  form,
  isDisabled,
  onSubmit,
  onSwitchField,
  passwordFeedback,
  focusRef,
}: Pick<
  SignUpDetailsProps,
  'step' | 'form' | 'isDisabled' | 'onSubmit' | 'onSwitchField' | 'passwordFeedback' | 'focusRef'
>) {
  const m = useMessages('signUp');
  const { fields, nextField, legalConsent } = step;
  const [first] = signUpFieldNames(fields);
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
    disabled: isDisabled || Boolean(fields[name]?.disabled),
    autoFocus: first === name,
    inputRef: first === name ? focusRef : undefined,
  });
  const switchField =
    nextField && onSwitchField
      ? {
          switchRef: focusAfterSwitch,
          switchLabel: nextField === 'phoneNumber' ? m.form.usePhone : m.form.useEmail,
          onSwitch: () => {
            switchedRef.current = true;
            onSwitchField();
          },
        }
      : undefined;

  return (
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
            label={m.form.usernameLabel}
            placeholder={m.form.usernamePlaceholder}
            autoComplete='username'
          />
        ) : null}
        {fields.emailAddress ? (
          <TextField
            {...field('emailAddress')}
            {...switchField}
            name='identifier'
            type='email'
            label={m.form.emailLabel}
            placeholder={m.form.emailPlaceholder}
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
          <SignUpLegalConsentField
            form={form}
            consent={legalConsent}
            disabled={isDisabled}
          />
        ) : null}
      </div>
    </Form>
  );
}

function SignUpProviders({
  providers,
  pendingProviderId,
  isDisabled,
  onSelectProvider,
  showDivider,
}: {
  providers: readonly AuthFlowProvider[];
  showDivider: boolean;
  pendingProviderId?: string;
  isDisabled: boolean;
  onSelectProvider: (id: string) => void;
}) {
  const shared = useMessages('signIn');
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
            longLabel={fill(shared.start.socialButton, { provider: provider.name })}
            shortLabel={provider.name}
            isPending={pendingProviderId === provider.id}
            pendingLabel={shared.verifying}
            onClick={() => onSelectProvider(provider.id)}
          />
        ))}
      </ProviderButtonGroup>
      {showDivider ? (
        <div
          role='separator'
          {...stylex.props(styles.divider)}
        >
          <span {...stylex.props(styles.dividerLine)} />
          <Text
            size='sm'
            color='foreground-secondary'
          >
            {shared.start.divider}
          </Text>
          <span {...stylex.props(styles.dividerLine)} />
        </div>
      ) : null}
    </>
  );
}

function NameFields({ firstName, lastName }: { firstName?: FieldProps; lastName?: FieldProps }) {
  const m = useMessages('signUp');
  if (!firstName && !lastName) {
    return null;
  }

  return (
    <div {...stylex.props(firstName && lastName ? styles.nameRow : styles.fieldStack)}>
      {firstName ? (
        <TextField
          {...firstName}
          name='firstName'
          label={m.form.firstNameLabel}
          placeholder={m.form.firstNamePlaceholder}
          autoComplete='given-name'
        />
      ) : null}
      {lastName ? (
        <TextField
          {...lastName}
          name='lastName'
          label={m.form.lastNameLabel}
          placeholder={m.form.lastNamePlaceholder}
          autoComplete='family-name'
        />
      ) : null}
    </div>
  );
}

interface FieldProps {
  form: UseFormResult<SignUpValues>;
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
  const m = useMessages('signUp');
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
        <Field.Label>{m.form.phoneLabel}</Field.Label>
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
        placeholder={m.form.phonePlaceholder}
        countryTriggerLabel={m.form.selectedCountry}
        countryPopupLabel={m.form.chooseCountry}
        countrySearchLabel={m.form.searchCountries}
        countrySearchPlaceholder={m.form.countrySearchPlaceholder}
        noResultsMessage={m.form.noCountries}
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
  const m = useMessages('signUp');
  const shared = useMessages('signIn');
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
        <Field.Label>{m.form.passwordLabel}</Field.Label>
        {required ? null : <OptionalHint />}
      </Field.Header>
      <PasswordInput
        ref={mergedRef}
        autoComplete='new-password'
        placeholder={m.form.passwordPlaceholder}
        {...control}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          control.onBlur();
        }}
        showPasswordLabel={shared.showPassword}
        hidePasswordLabel={shared.hidePassword}
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
  const m = useMessages('signUp');

  return (
    <Text
      size='sm'
      color='foreground-secondary'
      render={<span />}
    >
      {m.form.optional}
    </Text>
  );
}
