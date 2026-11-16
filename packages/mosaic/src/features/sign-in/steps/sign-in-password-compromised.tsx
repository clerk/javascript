import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { useMessages } from '../../../localization';

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

  return (
    <>
      <Card.Header>
        <Card.Title>{m.passwordCompromised.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage ?? m.passwordCompromised.message}
      </Card.Banner>
      <Card.Footer>
        {onCancel ? (
          <Button
            ref={onForgotPassword ? undefined : ref}
            type='button'
            variant='outline'
            color='neutral'
            disabled={isPending}
            onClick={onCancel}
          >
            {m.useAnotherMethod}
          </Button>
        ) : null}
        {onForgotPassword ? (
          <SubmitButton
            ref={ref}
            type='button'
            isPending={isPending}
            pendingLabel={m.passwordCompromised.pending}
            onClick={onForgotPassword}
          >
            {m.passwordCompromised.resetPassword}
          </SubmitButton>
        ) : null}
      </Card.Footer>
    </>
  );
}
