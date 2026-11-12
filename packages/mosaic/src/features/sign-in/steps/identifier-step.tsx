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
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInIdentifierField, SignInProvider, SignInSubmitEvent, SignInValues } from '../sign-in.types';
import { identifierFieldCopy } from '../sign-in.utils';

interface IdentifierStepProps {
  field: SignInIdentifierField;
  nextField?: SignInIdentifierField;
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
  focusRef?: Ref<HTMLElement>;
}

export function IdentifierStep({
  field,
  nextField,
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
  focusRef,
}: IdentifierStepProps) {
  const m = useMessages('signIn');
  const { ref: identifierFieldRef, ...identifier } = form.register('identifier');
  const { ref: phoneFieldRef, ...phone } = form.registerValue('identifier');
  const autoFocusRef = useFlowAutoFocus<HTMLInputElement>();
  const identifierRef = useMergeRefs<HTMLElement>([identifierFieldRef, focusRef, autoFocusRef]);
  const phoneRef = useMergeRefs<HTMLElement>([phoneFieldRef, focusRef, autoFocusRef]);
  const copy = identifierFieldCopy(field, m);
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
        {socialProviders.length > 0 ? (
          <>
            <ProviderButtonGroup disabled={isDisabled}>
              {socialProviders.map(provider => (
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
        ) : null}
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
        {onSignUp ? (
          <Text
            size='sm'
            color='foreground-secondary'
            xstyle={styles.footerText}
          >
            {m.start.signUpPrompt}{' '}
            <Button
              type='button'
              size='sm'
              variant='link'
              disabled={isDisabled}
              onClick={onSignUp}
            >
              {m.start.signUpLink}
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
