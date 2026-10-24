import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Input } from '../../../components/input';
import { Text } from '../../../components/text';
import { styles } from '../sign-in.styles';
import type { SignInSocialProvider } from '../sign-in.types';

const SOCIAL_BUTTON_BLOCK_THRESHOLD = 2;

export interface SignInStartMessages {
  title: string;
  description: string;
  socialBlockButton: (provider: string) => string;
  socialIconButton: (provider: string) => string;
  dividerText: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  primaryActionLabel: string;
  pendingLabel: string;
  actionText: string;
  actionLink: string;
}

export interface SignInStartProps {
  messages: SignInStartMessages;
  socialProviders: readonly SignInSocialProvider[];
  pendingProviderId?: string;
  onSelectProvider: (id: string) => void;
  value: string;
  errorMessage?: string;
  isPending?: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onSignUp?: () => void;
  focusRef?: Ref<HTMLElement>;
}

function SocialButtons({
  messages,
  providers,
  pendingProviderId,
  disabled,
  onSelect,
}: {
  messages: SignInStartMessages;
  providers: readonly SignInSocialProvider[];
  pendingProviderId?: string;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  const asBlock = providers.length <= SOCIAL_BUTTON_BLOCK_THRESHOLD;
  return (
    <div {...stylex.props(asBlock ? styles.socialBlock : styles.socialIcons)}>
      {providers.map(provider => (
        <SubmitButton
          key={provider.id}
          type='button'
          variant='outline'
          color='neutral'
          fullWidth
          aria-label={asBlock ? undefined : messages.socialIconButton(provider.name)}
          disabled={disabled}
          isPending={pendingProviderId === provider.id}
          pendingLabel={messages.socialIconButton(provider.name)}
          onClick={() => onSelect(provider.id)}
        >
          <img
            src={provider.iconUrl}
            alt=''
            aria-hidden
            {...stylex.props(styles.providerIcon)}
          />
          {asBlock ? messages.socialBlockButton(provider.name) : null}
        </SubmitButton>
      ))}
    </div>
  );
}

export function SignInStart({
  messages,
  socialProviders,
  pendingProviderId,
  onSelectProvider,
  value,
  errorMessage,
  isPending = false,
  onValueChange,
  onSubmit,
  onSignUp,
  focusRef,
}: SignInStartProps) {
  const formId = useId();
  const busy = isPending || Boolean(pendingProviderId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!busy) {
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
        {socialProviders.length > 0 ? (
          <>
            <SocialButtons
              messages={messages}
              providers={socialProviders}
              pendingProviderId={pendingProviderId}
              disabled={busy}
              onSelect={onSelectProvider}
            />
            <div
              role='separator'
              {...stylex.props(styles.divider)}
            >
              <span {...stylex.props(styles.dividerLine)} />
              <Text
                size='sm'
                color='foreground-secondary'
              >
                {messages.dividerText}
              </Text>
              <span {...stylex.props(styles.dividerLine)} />
            </div>
          </>
        ) : null}
        <form
          id={formId}
          onSubmit={handleSubmit}
        >
          <Field.Root
            required
            invalid={Boolean(errorMessage)}
            disabled={busy}
            focusableWhenDisabled
          >
            <Field.Label>{messages.fieldLabel}</Field.Label>
            <Input
              ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
              name='identifier'
              type='email'
              autoComplete='email webauthn'
              placeholder={messages.fieldPlaceholder}
              value={value}
              onChange={event => onValueChange(event.target.value)}
            />
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
          </Field.Root>
        </form>
        {onSignUp ? (
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
              disabled={busy}
              onClick={onSignUp}
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
          disabled={Boolean(pendingProviderId)}
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
