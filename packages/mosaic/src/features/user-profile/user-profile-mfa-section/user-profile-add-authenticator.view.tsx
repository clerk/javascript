import { useId } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import { Otp } from '../../../components/otp';
import { useMessages } from '../../../localization';
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
  const m = useMessages('userProfileAddAuthenticator');
  const formId = useId();
  const actionRef = useFlowAutoFocus<HTMLButtonElement>();
  const inputRef = useFlowAutoFocus<HTMLInputElement>();
  const submitCode = (value: string) => {
    if (!isPending && value.length === 6) {
      onSubmit(value);
    }
  };

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
          invalid={Boolean(errorMessage)}
          xstyle={styles.field}
        >
          <Field.Label xstyle={styles.label}>{m.codeLabel}</Field.Label>
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
      </Card.Content>
      <Card.Footer>
        <Button
          type='button'
          variant='outline'
          color='neutral'
          fullWidth
          disabled={isPending}
          onClick={onBack}
        >
          {m.back}
        </Button>
        <SubmitButton
          ref={actionRef}
          type='submit'
          form={formId}
          fullWidth
          isPending={isPending}
          disabled={code.length !== 6}
          focusableWhenDisabled
          pendingLabel={m.pending}
        >
          {m.verify}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
