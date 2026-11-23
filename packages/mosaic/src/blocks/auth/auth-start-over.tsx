import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';

export interface AuthStartOverMessages {
  title: string;
  description: string;
  action: string;
}

interface AuthStartOverProps {
  messages: AuthStartOverMessages;
  onStartOver: () => void;
}

export function AuthStartOver({ messages, onStartOver }: AuthStartOverProps) {
  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button
          ref={useFlowAutoFocus<HTMLButtonElement>()}
          type='button'
          fullWidth
          onClick={onStartOver}
        >
          {messages.action}
        </Button>
      </Card.Footer>
    </>
  );
}
