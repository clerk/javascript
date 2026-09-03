import { localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { Checkmark, Close } from '@/ui/icons';

import { AgentActionIcon } from './AgentActionIcon';

export type TerminalStatus = 'approved' | 'denied' | 'expired';

export function TerminalCard({ status }: { status: TerminalStatus }) {
  const title = localizationKeys(`agentActionApproval.terminal.${status}Title`);
  const subtitle = localizationKeys(`agentActionApproval.terminal.${status}Subtitle`);

  return (
    <Card.Root>
      <Card.Content
        role='status'
        aria-live='polite'
        gap={6}
      >
        <AgentActionIcon
          icon={status === 'approved' ? Checkmark : Close}
          tone={status === 'approved' ? 'success' : status === 'denied' ? 'danger' : 'neutral'}
        />
        <Header.Root>
          <Header.Title
            as='h2'
            localizationKey={title}
          />
          <Header.Subtitle localizationKey={subtitle} />
        </Header.Root>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
}
