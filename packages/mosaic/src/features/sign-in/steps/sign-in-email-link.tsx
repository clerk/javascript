import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import type { VerificationCodeResend } from '../../../blocks/verification';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Text } from '../../../components/text';
import { fill, useMessages } from '../../../localization';

interface SignInEmailLinkProps {
  identifier: string;
  globalErrorMessage?: string;
  resend?: VerificationCodeResend;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInEmailLink({ identifier, globalErrorMessage, resend, onCancel, focusRef }: SignInEmailLinkProps) {
  const m = useMessages('signIn');
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{m.emailLink.title}</Card.Title>
        <Card.Description>{fill(m.emailLink.description, { identifier })}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      {resend ? (
        <Card.Content>
          <Text
            size='sm'
            color='foreground-secondary'
          >
            {resend.text}{' '}
            <Button
              ref={ref}
              type='button'
              size='sm'
              color='neutral'
              variant='link'
              disabled={resend.disabled}
              onClick={resend.onClick}
            >
              {resend.label}
            </Button>
          </Text>
        </Card.Content>
      ) : null}
      {onCancel ? (
        <Card.Footer>
          <Button
            ref={resend ? undefined : ref}
            type='button'
            variant='outline'
            color='neutral'
            onClick={onCancel}
          >
            {m.useAnotherMethod}
          </Button>
        </Card.Footer>
      ) : null}
    </>
  );
}
