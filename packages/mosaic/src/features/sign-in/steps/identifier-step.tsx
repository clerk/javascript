import { inertProps } from '@clerk/shared/inert';
import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import React, { type Ref } from 'react';

import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Captcha } from '../../../components/captcha';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { PhoneInput } from '../../../components/phone-input';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type {
  SignInIdentifierField,
  SignInProvider,
  SignInStep,
  SignInSubmitEvent,
  SignInValues,
} from '../sign-in.types';
import { identifierFieldCopy } from '../sign-in.utils';
import { SignInAlternativeChannel } from './sign-in-alternative-channel';

type IdentifierStepData = Extract<SignInStep, { kind: 'identifier' }>;

interface IdentifierStepProps extends Omit<IdentifierStartProps, 'field' | 'nextField' | 'lastUsed'> {
  step: IdentifierStepData;
  onCancel?: () => void;
}

export function IdentifierStep({ step, onCancel, ...props }: IdentifierStepProps) {
  if ('channel' in step) {
    return (
      <SignInAlternativeChannel
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
      />
    );
  }
  return (
    <IdentifierStart
      field={step.field}
      nextField={step.nextField}
      lastUsed={step.lastUsed}
      {...props}
    />
  );
}

interface IdentifierStartProps {
  field: SignInIdentifierField;
  nextField?: SignInIdentifierField;
  lastUsed?: boolean;
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
  const { ref: identifierFieldRef, ...identifier } = form.register('identifier');
  const { ref: phoneFieldRef, ...phone } = form.registerValue('identifier');
  const autoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const identifierRef = useMergeRefs<HTMLElement>([identifierFieldRef, focusRef, autoFocusRef]);
  const phoneRef = useMergeRefs<HTMLElement>([phoneFieldRef, focusRef, autoFocusRef]);
  const copy = identifierFieldCopy(field, m);
  const [isChallengeShown, setIsChallengeShown] = React.useState(false);
  const feedback: FieldFeedback | undefined = errorMessage ? { type: 'error', message: errorMessage } : undefined;

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
            pendingProviderId={pendingProviderId}
            lastUsedProviderId={lastUsedProviderId}
            isDisabled={isDisabled}
            onSelectProvider={onSelectProvider}
          />
          <Form
            id={form.id}
            onSubmit={onSubmit}
          >
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
                    onClick={onSwitchField}
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
          </Form>
        </div>
        <Captcha
          xstyle={styles.captcha}
          onInteractiveChange={setIsChallengeShown}
        />
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
    </>
  );
}

interface SignInProvidersProps {
  providers: readonly SignInProvider[];
  pendingProviderId?: string;
  lastUsedProviderId?: string;
  isDisabled: boolean;
  onSelectProvider: (id: string) => void;
}

function SignInProviders({
  providers,
  pendingProviderId,
  lastUsedProviderId,
  isDisabled,
  onSelectProvider,
}: SignInProvidersProps) {
  const m = useMessages('signIn');
  if (providers.length === 0) {
    return null;
  }
  const lastUsedProvider = providers.find(provider => provider.id === lastUsedProviderId);
  const otherProviders = providers.filter(provider => provider !== lastUsedProvider);
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

interface StartPromptProps {
  onSignUp?: () => void;
  onJoinWaitlist?: () => void;
  isDisabled: boolean;
}

function StartPrompt({ onSignUp, onJoinWaitlist, isDisabled }: StartPromptProps) {
  const m = useMessages('signIn');
  const prompt = onJoinWaitlist
    ? { text: m.start.waitlistPrompt, link: m.start.waitlistLink, onClick: onJoinWaitlist }
    : onSignUp
      ? { text: m.start.signUpPrompt, link: m.start.signUpLink, onClick: onSignUp }
      : undefined;
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
