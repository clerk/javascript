import { localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

export type TerminalStatus = 'approved' | 'rejected' | 'expired';

export function TerminalCard({ status }: { status: TerminalStatus }) {
  const title = localizationKeys(`agentActionApproval.terminal.${status}Title`);
  const subtitle = localizationKeys(`agentActionApproval.terminal.${status}Subtitle`);

  return (
    <Card.Root>
      <Card.Content
        role='status'
        aria-live='polite'
      >
        <Header.Root>
          <Header.Title localizationKey={title} />
          <Header.Subtitle localizationKey={subtitle} />
        </Header.Root>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
}
