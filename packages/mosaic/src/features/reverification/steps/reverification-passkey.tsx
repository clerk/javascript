import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';

export interface ReverificationPasskeyMessages {
  title: string;
  description: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface ReverificationPasskeyProps {
  messages: ReverificationPasskeyMessages;
  errorMessage?: string;
  isPending?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function ReverificationPasskey({
  messages,
  errorMessage,
  isPending = false,
  onSubmit,
  onCancel,
}: ReverificationPasskeyProps) {
  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
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
            fullWidth
            disabled={isPending}
            onClick={onCancel}
          >
            {messages.secondaryActionLabel}
          </Button>
        ) : null}
        <SubmitButton
          ref={useFlowAutoFocus<HTMLButtonElement>()}
          type='button'
          fullWidth
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
