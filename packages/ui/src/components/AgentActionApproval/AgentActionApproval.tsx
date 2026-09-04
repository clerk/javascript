import { useMemo, useState } from 'react';

import { Button, Col, Flex, Flow, FormLabel, Grid, localizationKeys, Text, useLocalizations } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { CreditCard, ShieldCheck } from '@/ui/icons';
import { Textarea } from '@/ui/primitives';

import { ActionDetails } from './ActionDetails';
import { AgentActionIcon } from './AgentActionIcon';
import { TerminalCard, type TerminalStatus } from './TerminalCard';
import { formatRemainingTime, useCountdown } from './useCountdown';

const mockAction = {
  description: 'Refund the most recent charge after the customer reported a duplicate payment.',
  parameters: [
    { key: 'refund_amount', label: 'Refund amount', value: '$400.00' },
    { key: 'customer_id', label: 'Refund to', value: 'Cameron Walker' },
    { key: 'payment_method', label: 'Payment method', value: 'Visa', secondaryValue: '⋯ 4242', icon: CreditCard },
    { key: 'payment_intent_id', label: 'Payment intent', value: 'pi_3QkL8mF7bXn4p9V2c6a', copyable: true },
  ],
};

function ApprovalScreen() {
  const { locale, t } = useLocalizations();
  const [comment, setComment] = useState('');
  const [decision, setDecision] = useState<TerminalStatus | null>(null);
  const timestamps = useMemo(
    () => ({
      createdAt: Date.now() - 3 * 60 * 1_000,
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
        <Col gap={4}>
          <AgentActionIcon icon={ShieldCheck} />
          <Header.Root>
            <Header.Title
              as='h2'
              localizationKey={localizationKeys('agentActionApproval.title')}
            />
            <Header.Subtitle
              localizationKey={localizationKeys('agentActionApproval.requestedAt', {
                relativeTime: formatRelativeTime(timestamps.createdAt, locale),
              })}
            />
          </Header.Root>
        </Col>
        <Col
          gap={4}
          sx={{ textAlign: 'start' }}
        >
          <Text colorScheme='secondary'>{mockAction.description}</Text>
          <ActionDetails details={mockAction.parameters} />
        </Col>
        <Col
          gap={2}
          sx={{ textAlign: 'start' }}
        >
          <Flex
            align='center'
            justify='between'
          >
            <FormLabel
              htmlFor='agent-action-comment'
              localizationKey={localizationKeys('agentActionApproval.commentLabel')}
            />
            <Text
              colorScheme='secondary'
              localizationKey={localizationKeys('agentActionApproval.commentOptional')}
            />
          </Flex>
          <Textarea
            id='agent-action-comment'
            value={comment}
            maxLength={500}
            rows={3}
            onChange={event => setComment(event.target.value)}
            placeholder={t(localizationKeys('agentActionApproval.commentPlaceholder'))}
            style={{ maxHeight: 'none', minHeight: '4.5rem', resize: 'vertical' }}
          />
        </Col>
        <Grid
          columns={2}
          gap={3}
        >
          <Button
            colorScheme='secondary'
            variant='outline'
            onClick={() => setDecision('denied')}
            localizationKey={localizationKeys('agentActionApproval.action__deny')}
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

function formatRelativeTime(timestamp: number, locale: string): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1_000));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });

  if (elapsedSeconds < 60) {
    return formatter.format(-elapsedSeconds, 'second');
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return formatter.format(-elapsedMinutes, 'minute');
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return formatter.format(-elapsedHours, 'hour');
  }

  return formatter.format(-Math.floor(elapsedHours / 24), 'day');
}

export const AgentActionApproval = withCardStateProvider(AgentActionApprovalInternal);
