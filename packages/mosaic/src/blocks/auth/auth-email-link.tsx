import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Banner } from '../../components/banner';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';
import type { VerificationCodeResend } from '../verification';
import { AuthIdentityPreview } from './auth-identity-preview';

export interface AuthEmailLinkMessages {
  title: string;
  description: string;
  editIdentifier: string;
  secondaryActionLabel: string;
}

interface AuthEmailLinkProps {
  messages: AuthEmailLinkMessages;
  identifier: string;
  onEditIdentifier?: () => void;
  globalErrorMessage?: string;
  isPending: boolean;
  resend?: VerificationCodeResend;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
  notice?: string;
}

export function AuthEmailLink({
  messages,
  identifier,
  onEditIdentifier,
  globalErrorMessage,
  isPending,
  resend,
  onCancel,
  focusRef,
  notice,
}: AuthEmailLinkProps) {
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
        <AuthIdentityPreview
          identifier={identifier}
          editLabel={messages.editIdentifier}
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
            {messages.secondaryActionLabel}
          </Button>
        </Card.Footer>
      ) : null}
    </>
  );
}
