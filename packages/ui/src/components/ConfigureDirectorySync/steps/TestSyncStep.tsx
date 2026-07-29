import { Badge, Button, Col, Flex, Spinner, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { usePrototype } from '../prototype';

type FakeSyncEvent = {
  id: string;
  type: string;
  subject: string;
  time: string;
  status: 'success' | 'failed';
};

const STREAMING_EVENTS: ReadonlyArray<FakeSyncEvent> = [
  { id: '1', type: 'user.provisioned', subject: 'jdoe@acme.com', time: '2 min ago', status: 'success' },
  { id: '2', type: 'user.updated', subject: 'msmith@acme.com', time: '1 min ago', status: 'success' },
  { id: '3', type: 'group.provisioned', subject: 'Engineering', time: 'just now', status: 'success' },
];

const FAILURE_EVENTS: ReadonlyArray<FakeSyncEvent> = [
  { id: '1', type: 'user.provisioned', subject: 'jdoe@acme.com', time: '3 min ago', status: 'success' },
  { id: '2', type: 'user.provisioned', subject: 'msmith@acme.com', time: 'just now', status: 'failed' },
];

const SyncEventRow = ({ event }: { event: FakeSyncEvent }): JSX.Element => (
  <Flex
    align='center'
    justify='between'
    sx={t => ({
      padding: `${t.space.$2x5} ${t.space.$4}`,
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
      '&:last-of-type': { borderBottom: 'none' },
    })}
  >
    <Col sx={t => ({ gap: t.space.$0x5 })}>
      <Text
        as='code'
        sx={t => ({ fontFamily: 'monospace', fontSize: t.fontSizes.$sm })}
      >
        {event.type}
      </Text>
      <Text
        as='span'
        colorScheme='secondary'
        sx={t => ({ fontSize: t.fontSizes.$sm })}
      >
        {event.subject}
      </Text>
    </Col>
    <Flex
      align='center'
      sx={t => ({ gap: t.space.$2 })}
    >
      <Text
        as='span'
        colorScheme='secondary'
        sx={t => ({ fontSize: t.fontSizes.$xs })}
      >
        {event.time}
      </Text>
      <Badge colorScheme={event.status === 'success' ? 'success' : 'danger'}>
        {event.status === 'success' ? 'Success' : 'Failed'}
      </Badge>
    </Flex>
  </Flex>
);

export const TestSyncStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();
  const { providerMeta, syncLog, setSyncLog } = usePrototype();

  const events = syncLog === 'streaming' ? STREAMING_EVENTS : syncLog === 'failure' ? FAILURE_EVENTS : [];
  const hasSuccessfulEvent = events.some(event => event.status === 'success');

  return (
    <>
      <Step.Header
        title='Test provisioning'
        description={`Assign or push a test user from ${providerMeta.name} to verify events reach Clerk.`}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Flex
            align='center'
            justify='between'
          >
            <Text
              as='p'
              colorScheme='secondary'
            >
              Provisioning events appear here as your identity provider sends them.
            </Text>
            {syncLog === 'empty' && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSyncLog('streaming')}
              >
                Simulate events
              </Button>
            )}
          </Flex>

          {events.length === 0 ? (
            <Flex
              align='center'
              justify='center'
              sx={t => ({
                gap: t.space.$2,
                padding: t.space.$8,
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: 'dashed',
                borderColor: t.colors.$borderAlpha150,
              })}
            >
              <Spinner
                size='xs'
                colorScheme='neutral'
              />
              <Text
                as='span'
                colorScheme='secondary'
              >
                Waiting for the first sync event…
              </Text>
            </Flex>
          ) : (
            <Col
              sx={t => ({
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$borderAlpha150,
                overflow: 'hidden',
              })}
            >
              {events.map(event => (
                <SyncEventRow
                  key={event.id}
                  event={event}
                />
              ))}
            </Col>
          )}

          {syncLog === 'failure' && (
            <Alert
              variant='danger'
              title='invalid_bearer_token'
              subtitle='Clerk rejected the request because the bearer token is invalid or expired. Generate a new token on the previous step and update it in your identity provider, then retry the sync.'
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={!hasSuccessfulEvent}
        />
      </Step.Footer>
    </>
  );
};
