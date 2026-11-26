import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';
import { useId } from 'react';

import { VerificationActions } from '../../../blocks/verification';
import { SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';

interface SignInPasswordCompromisedProps {
  globalErrorMessage?: string;
  isPending: boolean;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPasswordCompromised({
  globalErrorMessage,
  isPending,
  onForgotPassword,
  onCancel,
  focusRef,
}: SignInPasswordCompromisedProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const messageId = useId();

  return (
    <>
      <Card.Header>
        <Card.Title>{m.passwordCompromised.title}</Card.Title>
        <Card.Description>
          <span id={messageId}>{m.passwordCompromised.message}</span>
        </Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      {onForgotPassword || onCancel ? (
        <Card.Content>
          <VerificationActions
            primary={
              onForgotPassword ? (
                <SubmitButton
                  ref={ref}
                  type='button'
                  aria-describedby={messageId}
                  fullWidth
                  isPending={isPending}
                  pendingLabel={m.passwordCompromised.pending}
                  onClick={onForgotPassword}
                >
                  {m.passwordCompromised.resetPassword}
                </SubmitButton>
              ) : undefined
            }
            secondaryLabel={m.useAnotherMethod}
            onSecondary={onCancel}
            disabled={isPending}
            secondaryRef={onForgotPassword ? undefined : ref}
          />
        </Card.Content>
      ) : null}
    </>
  );
}
