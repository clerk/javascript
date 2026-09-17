import { useId } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { useFlowAutoFocus } from '../../components/flow';
import { Otp } from '../../components/otp';
import { Text } from '../../components/text';
import { useMessages } from '../../localization';
import { styles } from './user-profile-add-authenticator.styles';
import type { UserProfileAuthenticatorSetupViewProps } from './user-profile-authenticator-setup.view';
import { UserProfileAuthenticatorSetupView } from './user-profile-authenticator-setup.view';

export interface UserProfileAddAuthenticatorViewProps extends Omit<
  UserProfileAuthenticatorSetupViewProps,
  'secret' | 'uri'
> {
  setup?: { secret: string; uri: string };
  setupErrorMessage?: string;
  onRetry: () => void;
  onCancel: () => void;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code: string) => void;
  isPending?: boolean;
  errorMessage?: string;
}

export function UserProfileAddAuthenticatorView({
  onCancel,
  setup,
  setupErrorMessage,
  onRetry,
  onCopy,
  copyStatus,
  copyErrorMessage,
  code,
  onCodeChange,
  onSubmit,
  isPending = false,
  errorMessage,
}: UserProfileAddAuthenticatorViewProps) {
  const m = useMessages('userProfileAddAuthenticator');
  const setupMessages = useMessages('userProfileAuthenticatorSetup');
  const formId = useId();
  const actionRef = useFlowAutoFocus<HTMLButtonElement>();
  const submitCode = (value: string) => {
    if (setup && !isPending && value.length === 6) {
      onSubmit(value);
    }
  };

  return (
    <>
      {setup ? (
        <UserProfileAuthenticatorSetupView
          {...setup}
          onCopy={onCopy}
          copyStatus={copyStatus}
          copyErrorMessage={copyErrorMessage}
        />
      ) : (
        <>
          <Card.Header>
            <Card.Title>{setupMessages.title}</Card.Title>
          </Card.Header>
          <Card.Content>
            {setupErrorMessage ? (
              <Banner.Root
                color='negative'
                role='alert'
              >
                <Banner.Label>{setupErrorMessage}</Banner.Label>
              </Banner.Root>
            ) : (
              <Text
                role='status'
                aria-label={m.preparing}
              >
                {m.preparing}
              </Text>
            )}
          </Card.Content>
        </>
      )}
      {setup ? (
        <Card.Content
          xstyle={styles.verification}
          render={
            <form
              id={formId}
              onSubmit={event => {
                event.preventDefault();
                submitCode(code);
              }}
            />
          }
        >
          <Field.Root
            required
            disabled={isPending}
            invalid={Boolean(errorMessage)}
            xstyle={styles.field}
          >
            <Field.Label xstyle={styles.label}>{m.codeLabel}</Field.Label>
            <Otp
              name='code'
              value={code}
              onValueChange={onCodeChange}
              onComplete={submitCode}
            />
            <Field.Message>
              <Field.Error>{errorMessage}</Field.Error>
            </Field.Message>
          </Field.Root>
        </Card.Content>
      ) : null}
      <Card.Footer>
        <Button
          type='button'
          variant='outline'
          color='neutral'
          fullWidth
          disabled={Boolean(setup) && isPending}
          onClick={onCancel}
        >
          {m.cancel}
        </Button>
        <SubmitButton
          ref={actionRef}
          type={setup ? 'submit' : 'button'}
          form={setup ? formId : undefined}
          fullWidth
          isPending={setup ? isPending : !setupErrorMessage}
          disabled={Boolean(setup) && code.length !== 6}
          focusableWhenDisabled
          pendingLabel={setup ? m.pending : m.preparing}
          onClick={setup ? undefined : onRetry}
        >
          {setup ? m.verify : setupErrorMessage ? m.retry : m.preparing}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
