import { useMemo, useState } from 'react';

import {
  Button,
  Col,
  Flow,
  FormLabel,
  Grid,
  Heading,
  localizationKeys,
  Text,
  useLocalizations,
} from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Divider } from '@/ui/elements/Divider';
import { Header } from '@/ui/elements/Header';
import { LineItems } from '@/ui/elements/LineItems';
import { Textarea } from '@/ui/primitives';

import { TerminalCard, type TerminalStatus } from './TerminalCard';
import { formatRemainingTime, useCountdown } from './useCountdown';

const mockAction = {
  description: 'Refund the most recent charge after the customer reported a duplicate payment.',
  operation: 'Create a refund',
  parameters: [
    { key: 'refund_amount', label: 'Refund amount', value: '$250.00' },
    { key: 'customer_id', label: 'Customer', value: 'cus_agent_demo' },
    { key: 'payment_intent_id', label: 'Payment intent', value: 'pi_agent_demo' },
    { key: 'payment_method', label: 'Payment method', value: 'Visa ending in 4242' },
  ],
  requestedBy: 'Codex',
};

function ApprovalScreen() {
  const { t } = useLocalizations();
  const [comment, setComment] = useState('');
  const [decision, setDecision] = useState<TerminalStatus | null>(null);
  const timestamps = useMemo(
    () => ({
      createdAt: Date.now() - 2 * 60 * 1_000,
      expiresAt: Date.now() + 15 * 60 * 1_000,
    }),
    [],
  );
  const { remaining, isExpired } = useCountdown(timestamps.expiresAt, decision !== null);

  if (decision) {
    return <TerminalCard status={decision} />;
  }

  if (isExpired) {
    return <TerminalCard status='expired' />;
  }

  return (
    <Card.Root>
      <Card.Content gap={6}>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('agentActionApproval.title')} />
          <Header.Subtitle localizationKey={localizationKeys('agentActionApproval.subtitle')} />
        </Header.Root>
        <Divider dividerText={null} />
        <Col
          gap={4}
          sx={{ textAlign: 'start' }}
        >
          <Col gap={2}>
            <Col gap={1}>
              <Heading
                as='h2'
                textVariant='h2'
                sx={{ overflowWrap: 'anywhere' }}
              >
                {mockAction.operation}
              </Heading>
              <Text
                variant='caption'
                colorScheme='secondary'
                sx={theme => ({ fontSize: theme.fontSizes.$sm })}
                localizationKey={localizationKeys('agentActionApproval.requestedBy', {
                  agent: mockAction.requestedBy,
                  createdAt: formatTimestamp(timestamps.createdAt),
                })}
              />
            </Col>
            <Text colorScheme='secondary'>{mockAction.description}</Text>
          </Col>
          <LineItems.Root>
            {mockAction.parameters.map(parameter => (
              <LineItems.Group
                key={parameter.key}
                variant='secondary'
              >
                <LineItems.Title title={parameter.label} />
                <LineItems.Description text={String(parameter.value)} />
              </LineItems.Group>
            ))}
          </LineItems.Root>
        </Col>
        <Col
          gap={2}
          sx={{ textAlign: 'start' }}
        >
          <FormLabel
            htmlFor='agent-action-comment'
            localizationKey={localizationKeys('agentActionApproval.commentLabel')}
          />
          <Textarea
            id='agent-action-comment'
            value={comment}
            maxLength={500}
            rows={4}
            onChange={event => setComment(event.target.value)}
            placeholder={t(localizationKeys('agentActionApproval.commentPlaceholder'))}
            style={{ maxHeight: 'none', minHeight: '5.5rem', resize: 'vertical' }}
          />
        </Col>
        <Grid
          columns={2}
          gap={3}
        >
          <Button
            colorScheme='secondary'
            variant='outline'
            onClick={() => setDecision('rejected')}
            localizationKey={localizationKeys('agentActionApproval.action__reject')}
          />
          <Button
            onClick={() => setDecision('approved')}
            localizationKey={localizationKeys('agentActionApproval.action__approve')}
          />
          <Text
            sx={{ fontVariantNumeric: 'tabular-nums', gridColumn: 'span 2' }}
            variant='caption'
            colorScheme='secondary'
            localizationKey={localizationKeys('agentActionApproval.expiresIn', {
              remaining: formatRemainingTime(remaining),
            })}
          />
        </Grid>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
}

function AgentActionApprovalInternal() {
  return (
    <Flow.Root flow='agentActionApproval'>
      <Flow.Part>
        <ApprovalScreen />
      </Flow.Part>
    </Flow.Root>
  );
}

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
}

export const AgentActionApproval = withCardStateProvider(AgentActionApprovalInternal);
