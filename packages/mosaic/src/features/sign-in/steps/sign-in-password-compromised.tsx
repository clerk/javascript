import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { useMessages } from '../../../localization';

interface SignInPasswordCompromisedProps {
  globalErrorMessage?: string;
  onForgotPassword?: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPasswordCompromised({
  globalErrorMessage,
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
        <Card.Description>{m.passwordCompromised.description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Footer>
        {onCancel ? (
          <Button
            ref={onForgotPassword ? undefined : ref}
            type='button'
            variant='outline'
            color='neutral'
            onClick={onCancel}
          >
            {m.useAnotherMethod}
          </Button>
        ) : null}
        {onForgotPassword ? (
          <Button
            ref={ref}
            type='button'
            onClick={onForgotPassword}
          >
            {m.passwordCompromised.resetPassword}
          </Button>
        ) : null}
      </Card.Footer>
    </>
  );
}
