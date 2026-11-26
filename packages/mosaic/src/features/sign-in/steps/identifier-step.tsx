import { inertProps } from '@clerk/shared/inert';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React, { type Ref } from 'react';

import { AuthAlternativeChannel, AuthCaptcha, AuthProviderIcon } from '../../../blocks/auth';
import { Prompt } from '../../../blocks/prompt';
import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Icon } from '../../../components/icon';
import { Input } from '../../../components/input';
import { PasswordInput } from '../../../components/password-input';
import { PhoneInput } from '../../../components/phone-input';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Separator } from '../../../components/separator';
import { SecurityPasskey } from '../../../icons/glyphs/security-passkey';
import { fill, useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { Form } from '../../../primitives/form';
import { mergeStyleProps, themeProps } from '../../../props';
import { separatorGap } from '../../../styles/separator-gap.styles';
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

type IdentifierStepData = Extract<SignInStep, { kind: 'identifier' }>;

interface IdentifierStepProps extends Omit<
  IdentifierStartProps,
  'field' | 'nextField' | 'lastUsed' | 'password' | 'passwordVisible'
> {
  step: IdentifierStepData;
  onCancel?: () => void;
}

export function IdentifierStep({ step, onCancel, ...props }: IdentifierStepProps) {
  const m = useMessages('signIn');
  const signUp = useMessages('signUp');
  if ('channel' in step) {
    const copy = step.flow === 'sign-up' ? signUp.alternativePhone : m.alternativeChannel;
    return (
      <AuthAlternativeChannel
        messages={{
          title: copy.title,
          description: copy.description,
          fieldLabel: copy.label,
          phonePlaceholder: m.start.phonePlaceholder,
          selectedCountry: m.start.selectedCountry,
          chooseCountry: m.start.chooseCountry,
          searchCountries: m.start.searchCountries,
          countrySearchPlaceholder: m.start.countrySearchPlaceholder,
          noCountries: m.start.noCountries,
          secondaryActionLabel: m.useAnotherMethod,
          primaryActionLabel: m.continue,
          pendingLabel: m.verifying,
        }}
        channel={step.channel}
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
      </AuthAlternativeChannel>
    );
  }
  return (
    <IdentifierStart
      field={step.field}
      nextField={step.nextField}
      lastUsed={step.lastUsed}
      password={step.password}
      passwordVisible={step.passwordVisible}
      emailFirst={step.emailFirst}
      {...props}
    />
  );
}

interface IdentifierStartProps {
  field?: SignInIdentifierField;
  nextField?: SignInIdentifierField;
  lastUsed?: boolean;
  password?: boolean;
  passwordVisible?: boolean;
  emailFirst?: boolean;
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
  passkeyInlineFrom?: number;
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
  passwordVisible = false,
  emailFirst = false,
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
  passkeyInlineFrom,
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
          {emailFirst && field ? null : (
            <SignInProviders
              providers={socialProviders}
              showDivider={Boolean(field)}
              pendingProviderId={pendingProviderId}
              lastUsedProviderId={lastUsedProviderId}
              isDisabled={isDisabled}
              onSelectProvider={onSelectProvider}
              onPasskey={onPasskey}
              passkeyInlineFrom={passkeyInlineFrom}
            />
          )}
          {field ? (
            <StartForm
              field={field}
              nextField={nextField}
              lastUsed={lastUsed}
              password={password}
              passwordVisible={passwordVisible}
              form={form}
              errorMessage={errorMessage}
              isDisabled={isDisabled}
              onSubmit={onSubmit}
              onSwitchField={onSwitchField}
              onForgotPassword={onForgotPassword}
              focusRef={focusRef}
            />
          ) : null}
          {field ? (
            <SubmitButton
              form={form.id}
              fullWidth
              disabled={Boolean(pendingProviderId)}
              isPending={isPending}
              pendingLabel={m.verifying}
            >
              {emailFirst && field === 'email' ? m.start.continueWithEmail : m.continue}
            </SubmitButton>
          ) : null}
          {emailFirst && field ? (
            <StackedProviders
              providers={socialProviders}
              pendingProviderId={pendingProviderId}
              lastUsedProviderId={lastUsedProviderId}
              isDisabled={isDisabled}
              onSelectProvider={onSelectProvider}
              onPasskey={onPasskey}
            />
          ) : null}
        </div>
        <AuthCaptcha onInteractiveChange={setIsChallengeShown} />
      </Card.Content>
      <StartPrompt
        onSignUp={onSignUp}
        onJoinWaitlist={onJoinWaitlist}
        isDisabled={isDisabled}
      />
    </>
  );
}

interface StartFormProps {
  field: SignInIdentifierField;
  nextField?: SignInIdentifierField;
  lastUsed: boolean;
  password: boolean;
  passwordVisible: boolean;
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
  passwordVisible,
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
                color='neutral'
                variant='link'
                disabled={isDisabled}
                onClick={switchField}
              >
                {identifierFieldCopy(nextField, m).switchLabel}
              </Button>
            ) : lastUsed ? (
              <Badge color='primary'>{m.start.lastUsed}</Badge>
            ) : null}
          </Field.Header>
          {field === 'phone' ? (
            <PhoneInput
              size='lg'
              ref={phoneRef}
              autoComplete='tel webauthn'
              enterKeyHint='go'
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
              size='lg'
              ref={identifierRef}
              type={field === 'email' ? 'email' : 'text'}
              dir={field === 'email' ? 'ltr' : undefined}
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
              enterKeyHint='go'
              autoComplete={field === 'email' ? 'email webauthn' : 'username webauthn'}
              placeholder={copy.placeholder}
              {...identifier}
            />
          )}
          <Field.Feedback feedback={feedback} />
        </Field.Root>
        {password ? (
          <StartPassword
            visible={passwordVisible}
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
  visible,
  form,
  isDisabled,
  onForgotPassword,
}: {
  visible: boolean;
  form: UseFormResult<SignInValues>;
  isDisabled: boolean;
  onForgotPassword?: () => void;
}) {
  const m = useMessages('signIn');
  const { ref: fieldRef, ...control } = form.register('password');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ref = useMergeRefs<HTMLElement>([fieldRef, inputRef]);
  const [autofilled, setAutofilled] = React.useState(false);
  const shown = visible || autofilled || form.values.password !== '';

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
            color='neutral'
            variant='link'
            disabled={isDisabled}
            onClick={onForgotPassword}
          >
            {m.password.forgotPassword}
          </Button>
        ) : null}
      </Field.Header>
      <PasswordInput
        size='lg'
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
  onPasskey?: () => void;
  passkeyInlineFrom?: number;
  showDivider: boolean;
}

const PASSKEY_INLINE_FROM = 3;

const PASSKEY_ID = 'passkey';

const STACKED_COUNT = 3;

function SignInProviders({ showDivider, ...options }: SignInProvidersProps) {
  const m = useMessages('signIn');
  if (options.providers.length === 0 && !options.onPasskey) {
    return null;
  }
  const stacked = options.providers.length + (options.onPasskey ? 1 : 0) === STACKED_COUNT;

  return (
    <>
      <div {...mergeStyleProps(themeProps('sign-in-providers'), stylex.props(styles.fastOptions))}>
        {stacked ? <StackedOptions {...options} /> : <InlineOptions {...options} />}
      </div>
      {showDivider ? (
        <Separator
          {...themeProps('sign-in-divider')}
          xstyle={separatorGap.tight}
        >
          {m.start.divider}
        </Separator>
      ) : null}
    </>
  );
}

function InlineOptions({
  providers,
  pendingProviderId,
  lastUsedProviderId,
  isDisabled,
  onSelectProvider,
  onPasskey,
  passkeyInlineFrom = PASSKEY_INLINE_FROM,
}: Omit<SignInProvidersProps, 'showDivider'>) {
  const m = useMessages('signIn');
  const { lastUsed: lastUsedProvider, others: otherProviders } = splitLastUsedProvider(providers, lastUsedProviderId);
  const providerButton = (provider: SignInProvider, badge?: string) => (
    <ProviderButton
      key={provider.id}
      icon={
        <AuthProviderIcon
          id={provider.id}
          iconUrl={provider.iconUrl}
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

  const passkeyLastUsed = Boolean(onPasskey) && lastUsedProviderId === PASSKEY_ID;
  const passkeyInline = Boolean(onPasskey) && providers.length >= passkeyInlineFrom;
  const passkeyButton = onPasskey ? (
    <ProviderButton
      key={PASSKEY_ID}
      icon={<Icon glyph={SecurityPasskey} />}
      longLabel={m.start.passkeyButton}
      shortLabel={m.start.passkeyShort}
      badge={passkeyLastUsed ? m.start.lastUsed : undefined}
      isPending={pendingProviderId === PASSKEY_ID}
      pendingLabel={m.verifying}
      onClick={onPasskey}
    />
  ) : null;
  const placement = placePasskey({
    passkeyButton,
    passkeyInline,
    passkeyLastUsed,
    lastUsedProviderButton: lastUsedProvider ? providerButton(lastUsedProvider, m.start.lastUsed) : undefined,
  });
  const passkeyRow = placement.row ? (
    <ProviderButtonGroup
      layout='stacked'
      disabled={isDisabled}
    >
      {placement.row}
    </ProviderButtonGroup>
  ) : null;

  return (
    <>
      {passkeyLastUsed ? passkeyRow : null}
      {providers.length > 0 ? (
        <ProviderButtonGroup
          disabled={isDisabled}
          lastUsed={placement.groupLastUsed}
        >
          {otherProviders.map(provider => providerButton(provider))}
          {placement.groupTrailing}
        </ProviderButtonGroup>
      ) : null}
      {passkeyLastUsed ? null : passkeyRow}
    </>
  );
}

function placePasskey({
  passkeyButton,
  passkeyInline,
  passkeyLastUsed,
  lastUsedProviderButton,
}: {
  passkeyButton: React.ReactElement | null;
  passkeyInline: boolean;
  passkeyLastUsed: boolean;
  lastUsedProviderButton?: React.ReactElement;
}) {
  if (!passkeyButton) {
    return { row: null, groupLastUsed: lastUsedProviderButton, groupTrailing: null };
  }
  if (!passkeyInline) {
    return { row: passkeyButton, groupLastUsed: lastUsedProviderButton, groupTrailing: null };
  }
  if (passkeyLastUsed) {
    return { row: null, groupLastUsed: passkeyButton, groupTrailing: null };
  }
  return { row: null, groupLastUsed: lastUsedProviderButton, groupTrailing: passkeyButton };
}

const STACKED_LIMIT = 3;

function StackedProviders(props: Omit<SignInProvidersProps, 'showDivider'>) {
  const m = useMessages('signIn');
  if (props.providers.length === 0 && !props.onPasskey) {
    return null;
  }

  return (
    <>
      <Separator
        {...themeProps('sign-in-divider')}
        xstyle={separatorGap.tight}
      >
        {m.start.divider}
      </Separator>
      <StackedOptions {...props} />
    </>
  );
}

function StackedOptions({
  providers,
  pendingProviderId,
  lastUsedProviderId,
  isDisabled,
  onSelectProvider,
  onPasskey,
}: Omit<SignInProvidersProps, 'showDivider'>) {
  const m = useMessages('signIn');
  const [showAll, setShowAll] = React.useState(false);
  const options = [
    ...providers.map(provider => ({
      id: provider.id,
      icon: (
        <AuthProviderIcon
          id={provider.id}
          iconUrl={provider.iconUrl}
        />
      ),
      label: fill(m.start.socialButton, { provider: provider.name }),
      onClick: () => onSelectProvider(provider.id),
    })),
    ...(onPasskey
      ? [{ id: PASSKEY_ID, icon: <Icon glyph={SecurityPasskey} />, label: m.start.passkeyButton, onClick: onPasskey }]
      : []),
  ].sort((a, b) => Number(b.id === lastUsedProviderId) - Number(a.id === lastUsedProviderId));
  if (options.length === 0) {
    return null;
  }
  const hidden = options.length - STACKED_LIMIT;
  const visible = showAll || hidden <= 1 ? options : options.slice(0, STACKED_LIMIT);

  return (
    <>
      <ProviderButtonGroup
        layout='stacked'
        disabled={isDisabled}
      >
        {visible.map(option => (
          <ProviderButton
            key={option.id}
            icon={option.icon}
            longLabel={option.label}
            shortLabel={option.label}
            badge={option.id === lastUsedProviderId ? m.start.lastUsed : undefined}
            isPending={pendingProviderId === option.id}
            pendingLabel={m.verifying}
            onClick={option.onClick}
          />
        ))}
      </ProviderButtonGroup>
      {visible.length < options.length ? (
        <Button
          type='button'
          variant='ghost'
          color='neutral'
          fullWidth
          disabled={isDisabled}
          onClick={() => setShowAll(true)}
        >
          {m.start.showOtherOptions}
        </Button>
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
    <Card.Footer>
      <Prompt
        text={prompt.text}
        action={prompt.link}
        disabled={isDisabled}
        onAction={prompt.onClick}
      />
    </Card.Footer>
  );
}
