import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { VerificationActions } from '../../../blocks/verification';
import { SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { fill, useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';

interface SignInForgotPasswordProps {
  identifier: string;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInForgotPassword({
  identifier,
  globalErrorMessage,
  isPending,
  onSubmit,
  onBack,
  focusRef,
}: SignInForgotPasswordProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.forgotPassword.title}</Card.Title>
        <Card.Description>{fill(m.forgotPassword.description, { identifier })}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <VerificationActions
          primary={
            <SubmitButton
              ref={ref}
              type='button'
              fullWidth
              isPending={isPending}
              pendingLabel={m.forgotPassword.pending}
              onClick={onSubmit}
            >
              {m.forgotPassword.submit}
            </SubmitButton>
          }
          secondaryLabel={m.forgotPassword.back}
          onSecondary={onBack}
          disabled={isPending}
        />
      </Card.Content>
    </>
  );
}
