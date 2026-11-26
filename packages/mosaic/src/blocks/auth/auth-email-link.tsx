import { useMergeRefs } from '@floating-ui/react';
import type { ReactNode, Ref } from 'react';

import { Banner } from '../../components/banner';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { fill } from '../../localization';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import type { VerificationCodeResend } from '../verification';
import { VerificationLinks } from '../verification';
import { styles as verificationStyles } from '../verification/verification.styles';
import { useVerificationLayout } from '../verification/verification-actions';
import { emphasizeIdentifier } from './auth-identity-preview';

export interface AuthEmailLinkMessages {
  title: string;
  description: string;
  editIdentifier: string;
  secondaryActionLabel: string;
  waiting?: string;
}

interface AuthEmailLinkProps {
  messages: AuthEmailLinkMessages;
  identifier: string;
  globalErrorMessage?: string;
  isPending: boolean;
  resend?: VerificationCodeResend;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
  notice?: string;
  prompt?: ReactNode;
}

export function AuthEmailLink({
  messages,
  identifier,
  globalErrorMessage,
  isPending,
  resend,
  onCancel,
  focusRef,
  notice,
  prompt,
}: AuthEmailLinkProps) {
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const layout = useVerificationLayout();

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>
          {emphasizeIdentifier(fill<string>(messages.description, { identifier }), identifier)}
        </Card.Description>
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
      {layout === 'stacked' ? (
        <Card.Content>
          {messages.waiting ? (
            <Text
              role='status'
              size='sm'
              color='foreground-secondary'
              xstyle={verificationStyles.status}
            >
              <Spinner size='sm' />
              {messages.waiting}
            </Text>
          ) : null}
          <VerificationLinks
            prompt={prompt}
            disabled={isPending}
            links={
              onCancel ? [{ label: messages.secondaryActionLabel, onClick: onCancel, variant: 'outline' as const }] : []
            }
          />
        </Card.Content>
      ) : null}
      {layout !== 'stacked' && onCancel ? (
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
