import { inertProps } from '@clerk/shared/inert';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React, { type Ref } from 'react';

import { Badge } from '../../../components/badge';
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
import { SignUpLegalConsentField } from '../../sign-up/steps/sign-up-legal-consent';
import { styles } from '../sign-in.styles';
import type {
  SignInIdentifierField,
  SignInProvider,
  SignInStep,
  SignInSubmitEvent,
  SignInValues,
} from '../sign-in.types';
import { identifierFieldCopy, splitLastUsedProvider, startPrompt } from '../sign-in.utils';
import { SignInAlternativeChannel } from './sign-in-alternative-channel';
import { SignInCaptcha } from './sign-in-captcha';

type IdentifierStepData = Extract<SignInStep, { kind: 'identifier' }>;

interface IdentifierStepProps extends Omit<IdentifierStartProps, 'field' | 'nextField' | 'lastUsed' | 'password'> {
  step: IdentifierStepData;
  onCancel?: () => void;
}

export function IdentifierStep({ step, onCancel, ...props }: IdentifierStepProps) {
  const signUp = useMessages('signUp');
  if ('channel' in step) {
    return (
      <SignInAlternativeChannel
        channel={step.channel}
        copy={step.flow === 'sign-up' ? signUp.alternativePhone : undefined}
        applicationName={props.applicationName}
        logo={props.logo}
        form={props.form}
        errorMessage={props.errorMessage}
        globalErrorMessage={props.globalErrorMessage}
        isPending={props.isPending}
        isDisabled={props.isDisabled}
        onSubmit={props.onSubmit}
        onCancel={onCancel}
        focusRef={props.focusRef}
      >
        {step.legalConsent ? (
          <SignUpLegalConsentField
            form={props.form}
            consent={step.legalConsent}
            disabled={props.isDisabled}
          />
        ) : null}
      </SignInAlternativeChannel>
    );
  }
  return (
    <IdentifierStart
      field={step.field}
      nextField={step.nextField}
      lastUsed={step.lastUsed}
      password={step.password}
      {...props}
    />
  );
}

interface IdentifierStartProps {
  field?: SignInIdentifierField;
  nextField?: SignInIdentifierField;
  lastUsed?: boolean;
  password?: boolean;
  onForgotPassword?: () => void;
  lastUsedProviderId?: string;
  onSwitchField?: () => void;
  applicationName: string;
  combined: boolean;
  logo?: { src: string; alt: string };
  socialProviders: readonly SignInProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  onPasskey?: () => void;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  isDisabled: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onSignUp?: () => void;
  onJoinWaitlist?: () => void;
  focusRef?: Ref<HTMLElement>;
}

function IdentifierStart({
  field,
  nextField,
  lastUsed = false,
  password = false,
  onForgotPassword,
  lastUsedProviderId,
  onSwitchField,
  applicationName,
  combined,
  logo,
  socialProviders,
  pendingProviderId,
  onSelectProvider,
  onPasskey,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  isDisabled,
  onSubmit,
  onSignUp,
  onJoinWaitlist,
  focusRef,
}: IdentifierStartProps) {
  const m = useMessages('signIn');
  const [isChallengeShown, setIsChallengeShown] = React.useState(false);

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
        <Card.Title>{fill(combined ? m.start.titleCombined : m.start.title, { applicationName })}</Card.Title>
        <Card.Description>{combined ? m.start.descriptionCombined : m.start.description}</Card.Description>
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
          <SignInProviders
            providers={socialProviders}
            showDivider={Boolean(field)}
            pendingProviderId={pendingProviderId}
            lastUsedProviderId={lastUsedProviderId}
            isDisabled={isDisabled}
            onSelectProvider={onSelectProvider}
          />
          {field ? (
            <StartForm
              field={field}
              nextField={nextField}
              lastUsed={lastUsed}
              password={password}
              form={form}
              errorMessage={errorMessage}
              isDisabled={isDisabled}
              onSubmit={onSubmit}
              onSwitchField={onSwitchField}
              onForgotPassword={onForgotPassword}
              focusRef={focusRef}
            />
          ) : null}
        </div>
        <SignInCaptcha onInteractiveChange={setIsChallengeShown} />
        {onPasskey ? (
          <Button
            type='button'
            size='sm'
            variant='link'
            disabled={isDisabled}
            onClick={onPasskey}
            xstyle={styles.passkeyAction}
          >
            {m.start.usePasskey}
          </Button>
        ) : null}
        <StartPrompt
          onSignUp={onSignUp}
          onJoinWaitlist={onJoinWaitlist}
          isDisabled={isDisabled}
        />
      </Card.Content>
      {field ? (
        <Card.Footer
          xstyle={isChallengeShown && styles.spotlightHidden}
          {...inertProps(isChallengeShown)}
        >
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
      ) : null}
    </>
  );
}

interface StartFormProps {
  field: SignInIdentifierField;
  nextField?: SignInIdentifierField;
  lastUsed: boolean;
  password: boolean;
  form: UseFormResult<SignInValues>;
  errorMessage?: string;
  isDisabled: boolean;
  onSubmit: (event: SignInSubmitEvent) => void;
  onSwitchField?: () => void;
  onForgotPassword?: () => void;
  focusRef?: Ref<HTMLElement>;
}

function StartForm({
  field,
  nextField,
  lastUsed,
  password,
  form,
  errorMessage,
  isDisabled,
  onSubmit,
  onSwitchField,
  onForgotPassword,
  focusRef,
}: StartFormProps) {
  const m = useMessages('signIn');
  const { ref: identifierFieldRef, ...identifier } = form.register('identifier');
  const { ref: phoneFieldRef, ...phone } = form.registerValue('phoneNumber');
  const autoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const switchedRef = React.useRef(false);
  const focusAfterSwitch = React.useCallback((element: HTMLElement | null) => {
    if (element && switchedRef.current) {
      switchedRef.current = false;
      element.focus();
    }
  }, []);
  const switchField = () => {
    switchedRef.current = true;
    onSwitchField?.();
  };
  const identifierRef = useMergeRefs<HTMLElement>([identifierFieldRef, focusRef, autoFocusRef, focusAfterSwitch]);
  const phoneRef = useMergeRefs<HTMLElement>([phoneFieldRef, focusRef, autoFocusRef, focusAfterSwitch]);
  const copy = identifierFieldCopy(field, m);
  const feedback: FieldFeedback | undefined = errorMessage ? { type: 'error', message: errorMessage } : undefined;

  return (
    <Form
      id={form.id}
      onSubmit={onSubmit}
    >
      <div {...stylex.props(styles.fieldStack)}>
        <Field.Root
          required
          invalid={feedback?.type === 'error'}
          disabled={isDisabled}
          focusableWhenDisabled
        >
          <Field.Header>
            <Field.Label>{copy.label}</Field.Label>
            {nextField && onSwitchField ? (
              <Button
                type='button'
                size='sm'
                variant='link'
                disabled={isDisabled}
                onClick={switchField}
              >
                {identifierFieldCopy(nextField, m).switchLabel}
              </Button>
            ) : lastUsed ? (
              <Badge color='neutral'>{m.start.lastUsed}</Badge>
            ) : null}
          </Field.Header>
          {field === 'phone' ? (
            <PhoneInput
              ref={phoneRef}
              autoComplete='tel webauthn'
              placeholder={copy.placeholder}
              countryTriggerLabel={m.start.selectedCountry}
              countryPopupLabel={m.start.chooseCountry}
              countrySearchLabel={m.start.searchCountries}
              countrySearchPlaceholder={m.start.countrySearchPlaceholder}
              noResultsMessage={m.start.noCountries}
              {...phone}
            />
          ) : (
            <Input
              ref={identifierRef}
              type={field === 'email' ? 'email' : 'text'}
              autoComplete={field === 'email' ? 'email webauthn' : 'username webauthn'}
              placeholder={copy.placeholder}
              {...identifier}
            />
          )}
          <Field.Feedback feedback={feedback} />
        </Field.Root>
        {password ? (
          <StartPassword
            form={form}
            isDisabled={isDisabled}
            onForgotPassword={onForgotPassword}
          />
        ) : null}
      </div>
    </Form>
  );
}

function isAutofilled(element: HTMLInputElement): boolean {
  try {
    return element.matches(':autofill');
  } catch {
    return false;
  }
}

function StartPassword({
  form,
  isDisabled,
  onForgotPassword,
}: {
  form: UseFormResult<SignInValues>;
  isDisabled: boolean;
  onForgotPassword?: () => void;
}) {
  const m = useMessages('signIn');
  const { ref: fieldRef, ...control } = form.register('password');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ref = useMergeRefs<HTMLElement>([fieldRef, inputRef]);
  const [autofilled, setAutofilled] = React.useState(false);
  const shown = autofilled || form.values.password !== '';

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current && isAutofilled(inputRef.current)) {
        setAutofilled(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Field.Root
      disabled={isDisabled}
      aria-hidden={shown ? undefined : true}
      xstyle={!shown && styles.startPasswordHidden}
    >
      <Field.Header>
        <Field.Label>{m.password.label}</Field.Label>
        {shown && onForgotPassword ? (
          <Button
            type='button'
            size='sm'
            variant='link'
            disabled={isDisabled}
            onClick={onForgotPassword}
          >
            {m.password.forgotPassword}
          </Button>
        ) : null}
      </Field.Header>
      <PasswordInput
        ref={ref}
        autoComplete='current-password'
        placeholder={m.password.placeholder}
        tabIndex={shown ? undefined : -1}
        {...control}
        showPasswordLabel={m.showPassword}
        hidePasswordLabel={m.hidePassword}
      />
    </Field.Root>
  );
}

interface SignInProvidersProps {
  providers: readonly SignInProvider[];
  pendingProviderId?: string;
  lastUsedProviderId?: string;
  isDisabled: boolean;
  onSelectProvider: (id: string) => void;
  showDivider: boolean;
}

function SignInProviders({
  providers,
  pendingProviderId,
  lastUsedProviderId,
  isDisabled,
  onSelectProvider,
  showDivider,
}: SignInProvidersProps) {
  const m = useMessages('signIn');
  if (providers.length === 0) {
    return null;
  }
  const { lastUsed: lastUsedProvider, others: otherProviders } = splitLastUsedProvider(providers, lastUsedProviderId);
  const providerButton = (provider: SignInProvider, badge?: string) => (
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
      badge={badge}
      isPending={pendingProviderId === provider.id}
      pendingLabel={m.verifying}
      onClick={() => onSelectProvider(provider.id)}
    />
  );

  return (
    <>
      <ProviderButtonGroup
        disabled={isDisabled}
        lastUsed={lastUsedProvider ? providerButton(lastUsedProvider, m.start.lastUsed) : undefined}
      >
        {otherProviders.map(provider => providerButton(provider))}
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
            {m.start.divider}
          </Text>
          <span {...stylex.props(styles.dividerLine)} />
        </div>
      ) : null}
    </>
  );
}

interface StartPromptProps {
  onSignUp?: () => void;
  onJoinWaitlist?: () => void;
  isDisabled: boolean;
}

function StartPrompt({ onSignUp, onJoinWaitlist, isDisabled }: StartPromptProps) {
  const m = useMessages('signIn');
  const prompt = startPrompt(m, { onSignUp, onJoinWaitlist });
  if (!prompt) {
    return null;
  }

  return (
    <Text
      size='sm'
      color='foreground-secondary'
      xstyle={styles.footerText}
    >
      {prompt.text}{' '}
      <Button
        type='button'
        size='sm'
        variant='link'
        disabled={isDisabled}
        onClick={prompt.onClick}
      >
        {prompt.link}
      </Button>
    </Text>
  );
}
