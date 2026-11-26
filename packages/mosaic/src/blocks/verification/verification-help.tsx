import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import type { VerificationLayout } from './verification-actions';
import { useVerificationLayout, VerificationActions } from './verification-actions';

export interface VerificationHelpMessages {
  title: string;
  description: string;
  backButton: string;
  supportButton: string;
}

interface VerificationHelpProps {
  messages: VerificationHelpMessages;
  onEmailSupport: () => void;
  onBack: () => void;
  /** `stacked` puts the actions under the description, primary first, for a full-page card. Defaults to `stacked` on a card whose `actions` stack, otherwise `inline`. */
  layout?: VerificationLayout;
}

export function VerificationHelp({ messages, onEmailSupport, onBack, layout: layoutProp }: VerificationHelpProps) {
  const layout = useVerificationLayout(layoutProp);
  const actions = (
    <VerificationActions
      layout={layout}
      primary={
        <Button
          ref={useFlowAutoFocus<HTMLButtonElement>()}
          type='button'
          fullWidth={layout === 'stacked' || undefined}
          onClick={onEmailSupport}
        >
          {messages.supportButton}
        </Button>
      }
      secondaryLabel={messages.backButton}
      onSecondary={onBack}
    />
  );

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      {layout === 'stacked' ? <Card.Content>{actions}</Card.Content> : actions}
    </>
  );
}
