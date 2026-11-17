import { useMergeRefs } from '@floating-ui/react';
import type { ReactNode, Ref } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../primitives/flow';

interface VerificationPasskeyMessages {
  title: string;
  description: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

interface VerificationPasskeyProps {
  messages: VerificationPasskeyMessages;
  identity?: ReactNode;
  errorMessage?: string;
  isPending?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function VerificationPasskey({
  messages,
  identity,
  errorMessage,
  isPending = false,
  onSubmit,
  onCancel,
  focusRef,
}: VerificationPasskeyProps) {
  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
        {identity}
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {errorMessage}
      </Card.Banner>
      <Card.Footer>
        {onCancel ? (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            disabled={isPending}
            onClick={onCancel}
          >
            {messages.secondaryActionLabel}
          </Button>
        ) : null}
        <SubmitButton
          ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()])}
          type='button'
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
          onClick={onSubmit}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
