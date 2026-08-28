import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Text } from '../../components/text';

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
  onVerify: () => void;
  onCancel?: () => void;
}

export function ReverificationPasskey({
  messages,
  errorMessage,
  isPending = false,
  onVerify,
  onCancel,
}: ReverificationPasskeyProps) {
  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      {errorMessage ? (
        <Card.Content>
          <Text
            role='alert'
            color='negative'
          >
            {errorMessage}
          </Text>
        </Card.Content>
      ) : null}
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
          type='button'
          fullWidth
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
          onClick={onVerify}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
