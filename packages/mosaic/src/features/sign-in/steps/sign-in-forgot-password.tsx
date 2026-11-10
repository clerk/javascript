import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Form } from '../../../primitives/form';
import { styles } from '../sign-in.styles';

export interface SignInForgotPasswordMessages {
  title: string;
  description: string;
  primaryActionLabel: string;
  pendingLabel: string;
  backLabel: string;
}

interface SignInForgotPasswordProps {
  messages: SignInForgotPasswordMessages;
  isPending?: boolean;
  onSubmit: () => void;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInForgotPassword({
  messages,
  isPending = false,
  onSubmit,
  onBack,
  focusRef,
}: SignInForgotPasswordProps) {
  const ref = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <Form
            onSubmit={event => {
              event.preventDefault();
              onSubmit();
            }}
          />
        }
      >
        <div {...stylex.props(styles.actions)}>
          <SubmitButton
            ref={ref}
            fullWidth
            isPending={isPending}
            pendingLabel={messages.pendingLabel}
          >
            {messages.primaryActionLabel}
          </SubmitButton>
          <Button
            type='button'
            variant='ghost'
            color='neutral'
            fullWidth
            disabled={isPending}
            onClick={onBack}
          >
            {messages.backLabel}
          </Button>
        </div>
      </Card.Content>
    </>
  );
}
