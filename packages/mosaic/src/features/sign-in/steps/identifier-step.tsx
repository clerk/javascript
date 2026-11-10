import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Input } from '../../../components/input';
import { ProviderButton, ProviderButtonGroup } from '../../../components/provider-button';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';
import type { SignInSocialProvider } from '../sign-in.types';

interface IdentifierStepProps {
  applicationName: string;
  combined: boolean;
  logo?: { src: string; alt: string };
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

export function IdentifierStep({
  applicationName,
  combined,
  logo,
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
}: IdentifierStepProps) {
  const m = useMessages('signIn');
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
      <Card.Content>
        {socialProviders.length > 0 ? (
          <>
            <ProviderButtonGroup disabled={busy}>
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
          id={formId}
          onSubmit={handleSubmit}
        >
          <Field.Root
            required
            invalid={Boolean(errorMessage)}
            disabled={busy}
            focusableWhenDisabled
          >
            <Field.Label>{m.start.emailLabel}</Field.Label>
            <Input
              ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>()])}
              name='identifier'
              type='email'
              autoComplete='email webauthn'
              placeholder={m.start.emailPlaceholder}
              value={value}
              onChange={event => onValueChange(event.target.value)}
            />
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
          </Field.Root>
        </Form>
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
              disabled={busy}
              onClick={onSignUp}
            >
              {m.start.signUpLink}
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
          pendingLabel={m.verifying}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
