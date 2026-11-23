import { SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';

export interface AuthStartOverMessages {
  title: string;
  message: string;
  action: string;
  pending: string;
}

interface AuthStartOverProps {
  messages: AuthStartOverMessages;
  globalErrorMessage?: string;
  isPending?: boolean;
  onStartOver: () => void;
}

export function AuthStartOver({ messages, globalErrorMessage, isPending, onStartOver }: AuthStartOverProps) {
  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage ?? messages.message}
      </Card.Banner>
      <Card.Footer>
        <SubmitButton
          ref={useFlowAutoFocus<HTMLButtonElement>()}
          type='button'
          fullWidth
          isPending={isPending}
          pendingLabel={messages.pending}
          onClick={onStartOver}
        >
          {messages.action}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
