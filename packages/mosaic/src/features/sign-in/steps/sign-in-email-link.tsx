import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../../blocks/verification';
import { Banner } from '../../../components/banner';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { useMessages } from '../../../localization';
import { SignInIdentityPreview } from './sign-in-identity-preview';

interface SignInEmailLinkProps {
  title: string;
  description: string;
  identifier: string;
  onEditIdentifier?: () => void;
  globalErrorMessage?: string;
  isPending: boolean;
  resend?: VerificationCodeResend;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
  notice?: string;
}

export function SignInEmailLink({
  title,
  description,
  identifier,
  onEditIdentifier,
  globalErrorMessage,
  isPending,
  resend,
  onCancel,
  focusRef,
  notice,
}: SignInEmailLinkProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
        <SignInIdentityPreview
          identifier={identifier}
          editLabel={m.editIdentifier}
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
      {notice ? (
        <Card.Content>
          <Banner.Root color='warning'>
            <Banner.Label>{notice}</Banner.Label>
          </Banner.Root>
        </Card.Content>
      ) : null}
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
