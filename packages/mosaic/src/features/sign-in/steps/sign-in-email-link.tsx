import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../../blocks/verification';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { useMessages } from '../../../localization';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface SignInEmailLinkProps {
  identifier: string;
  onEditIdentifier?: () => void;
  globalErrorMessage?: string;
  isPending: boolean;
  resend?: VerificationCodeResend;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInEmailLink({
  identifier,
  onEditIdentifier,
  globalErrorMessage,
  isPending,
  resend,
  onCancel,
  focusRef,
}: SignInEmailLinkProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.emailLink.title}</Card.Title>
        <Card.Description>{m.emailLink.description}</Card.Description>
        <SignInIdentityPreview
          identifier={identifier}
          editLabel={m.password.editIdentifier}
          disabled={isPending}
          onEdit={onEditIdentifier}
        />
        {resend ? (
          <Card.Description>
            {resend.text}{' '}
            <Button
              ref={ref}
              type='button'
              size='sm'
              color='neutral'
              variant='link'
              disabled={resend.disabled || isPending}
              onClick={resend.onClick}
            >
              {resend.label}
            </Button>
          </Card.Description>
        ) : null}
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      {onCancel ? (
        <Card.Footer>
          <Button
            ref={resend ? undefined : ref}
            type='button'
            variant='outline'
            color='neutral'
            disabled={isPending}
            onClick={onCancel}
          >
            {m.useAnotherMethod}
          </Button>
        </Card.Footer>
      ) : null}
    </>
  );
}
