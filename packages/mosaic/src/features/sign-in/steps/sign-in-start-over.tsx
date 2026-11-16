import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { useMessages } from '../../../localization';

interface SignInStartOverProps {
  onStartOver: () => void;
}

export function SignInStartOver({ onStartOver }: SignInStartOverProps) {
  const m = useMessages('signIn').startOver;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{m.description}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button
          ref={useFlowAutoFocus<HTMLButtonElement>()}
          type='button'
          fullWidth
          onClick={onStartOver}
        >
          {m.action}
        </Button>
      </Card.Footer>
    </>
  );
}
