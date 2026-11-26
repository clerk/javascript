import { useId } from 'react';

import { useVerificationLayout, VerificationActions } from '../../../blocks/verification';
import { SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { Otp } from '../../../components/otp';
import { useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { Form } from '../../../primitives/form';
import { styles } from './user-profile-add-authenticator.styles';
import { UserProfileAuthenticatorSetupView } from './user-profile-authenticator-setup.view';

export interface UserProfileAddAuthenticatorViewProps {
  setup: { secret: string; uri: string };
  onBack: () => void;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code: string) => void;
  isPending?: boolean;
  errorMessage?: string;
}

export function UserProfileAddAuthenticatorView({
  onBack,
  setup,
  code,
  onCodeChange,
  onSubmit,
  isPending = false,
  errorMessage,
}: UserProfileAddAuthenticatorViewProps) {
  const m = useMessages('userProfile').mfa.addAuthenticator;
  const formId = useId();
  const layout = useVerificationLayout();
  const actionRef = useFlowAutoFocus<HTMLButtonElement>();
  const inputRef = useFlowAutoFocus<HTMLInputElement>();
  const submitCode = (value: string) => {
    if (!isPending && value.length === 6) {
      onSubmit(value);
    }
  };

  const actions = (
    <VerificationActions
      layout={layout}
      primary={
        <SubmitButton
          ref={actionRef}
          type='submit'
          form={formId}
          fullWidth={layout === 'stacked' || undefined}
          isPending={isPending}
          disabled={code.length !== 6}
          focusableWhenDisabled
          pendingLabel={m.pending}
        >
          {m.verify}
        </SubmitButton>
      }
      secondaryLabel={m.back}
      onSecondary={onBack}
      disabled={isPending}
    />
  );

  return (
    <>
      <UserProfileAuthenticatorSetupView {...setup} />
      <Card.Content
        xstyle={styles.verification}
        render={
          <Form
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
          focusableWhenDisabled
          invalid={Boolean(errorMessage)}
        >
          <Field.Label visuallyHidden>{m.codeLabel}</Field.Label>
          <Otp
            ref={inputRef}
            name='code'
            value={code}
            onValueChange={onCodeChange}
            onComplete={submitCode}
          />
          <Field.Message>
            <Field.Error>{errorMessage}</Field.Error>
          </Field.Message>
        </Field.Root>
        {layout === 'stacked' ? actions : null}
      </Card.Content>
      {layout === 'inline' ? actions : null}
    </>
  );
}
