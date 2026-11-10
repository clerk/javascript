import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { useMessages } from '../../../localization';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface SignInPasskeyProps {
  identifier: string;
  onEditIdentifier?: () => void;
  globalErrorMessage?: string;
  isPending: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  onShowHelp: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInPasskey({
  identifier,
  onEditIdentifier,
  globalErrorMessage,
  isPending,
  onSubmit,
  onCancel,
  onShowHelp,
  focusRef,
}: SignInPasskeyProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.passkey.title}</Card.Title>
        <Card.Description>{m.passkey.description}</Card.Description>
        <SignInIdentityPreview
          identifier={identifier}
          editLabel={m.password.editIdentifier}
          disabled={isPending}
          onEdit={onEditIdentifier}
        />
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
          onClick={onCancel ?? onShowHelp}
        >
          {onCancel ? m.useAnotherMethod : m.alternativeMethods.helpLink}
        </Button>
        <SubmitButton
          ref={ref}
          type='button'
          isPending={isPending}
          pendingLabel={m.verifying}
          onClick={onSubmit}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
