import { Prompt } from '../../../blocks/prompt';
import { Card } from '../../../components/card';
import { useMessages } from '../../../localization';

export function SignInWrongAccount({ disabled, onStartOver }: { disabled: boolean; onStartOver: () => void }) {
  const m = useMessages('signIn');
  return (
    <Card.Footer>
      <Prompt
        text=''
        action={m.back}
        disabled={disabled}
        onAction={onStartOver}
      />
    </Card.Footer>
  );
}
