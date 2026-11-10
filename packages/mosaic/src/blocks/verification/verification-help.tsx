import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';

interface VerificationHelpMessages {
  title: string;
  description: string;
  backButton: string;
  supportButton: string;
}

interface VerificationHelpProps {
  messages: VerificationHelpMessages;
  onEmailSupport: () => void;
  onBack: () => void;
}

export function VerificationHelp({ messages, onEmailSupport, onBack }: VerificationHelpProps) {
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
          onClick={onBack}
        >
          {messages.backButton}
        </Button>
        <Button
          type='button'
          onClick={onEmailSupport}
        >
          {messages.supportButton}
        </Button>
      </Card.Footer>
    </>
  );
}
