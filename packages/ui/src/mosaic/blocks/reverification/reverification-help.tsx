import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';

export interface ReverificationHelpMessages {
  title: string;
  description: string;
  backButton: string;
  supportButton: string;
}

export interface ReverificationHelpProps {
  messages: ReverificationHelpMessages;
  onEmailSupport: () => void;
  onBack: () => void;
}

export function ReverificationHelp({ messages, onEmailSupport, onBack }: ReverificationHelpProps) {
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
          variant='outline'
          color='neutral'
          fullWidth
          onClick={onBack}
        >
          {messages.backButton}
        </Button>
        <Button
          type='button'
          fullWidth
          onClick={onEmailSupport}
        >
          {messages.supportButton}
        </Button>
      </Card.Footer>
    </>
  );
}
