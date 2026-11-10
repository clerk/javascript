import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { fill, useMessages } from '../../../localization';

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
      <Card.Footer>
        <Button
          type='button'
          variant='outline'
          color='neutral'
          disabled={isPending}
          onClick={onBack}
        >
          {m.forgotPassword.back}
        </Button>
        <SubmitButton
          ref={ref}
          type='button'
          isPending={isPending}
          pendingLabel={m.forgotPassword.pending}
          onClick={onSubmit}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
