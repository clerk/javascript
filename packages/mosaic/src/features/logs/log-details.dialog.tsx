import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { DataList } from '../../components/data-list';
import type { DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { fill } from '../../localization';
import type { LogEntry, LogsTableMessages } from './logs-table.types';

export interface LogDetailsDialogProps {
  handle: DialogHandle<LogEntry>;
  messages: LogsTableMessages;
}

export function LogDetailsDialog({ handle, messages: m }: LogDetailsDialogProps) {
  return (
    <Dialog.Root handle={handle}>
      {({ payload }) =>
        payload === undefined ? null : (
          <Dialog.Popup
            variant='card'
            compactPlacement='center'
          >
            <Card.Root
              elevation='overlay'
              renderBranding={false}
            >
              <LogDetails
                log={payload}
                messages={m}
              />
            </Card.Root>
          </Dialog.Popup>
        )
      }
    </Dialog.Root>
  );
}

function LogDetails({ log, messages: m }: { log: LogEntry; messages: LogsTableMessages }) {
  const fields: { label: string; value: string | null }[] = [
    { label: m.details.eventType, value: log.code },
    {
      label: m.details.performedBy,
      value: fill(m.details.performedByValue, { name: log.actor.name, email: log.actor.email }),
    },
    { label: m.details.target, value: log.target },
    { label: m.details.ipAddress, value: log.ipAddress },
    { label: m.details.location, value: log.location },
    { label: m.details.device, value: log.device },
    { label: m.details.timestamp, value: log.fullTimestampLabel },
    { label: m.details.eventId, value: log.id },
  ];

  return (
    <>
      <Card.Header>
        <Card.Title>{log.eventLabel}</Card.Title>
        <Card.Description>{log.timestampLabel}</Card.Description>
      </Card.Header>
      <Card.Content>
        <DataList.Root>
          {fields.map(field =>
            field.value === null ? null : (
              <DataList.Item key={field.label}>
                <DataList.Label>{field.label}</DataList.Label>
                <DataList.Value title={field.value}>{field.value}</DataList.Value>
              </DataList.Item>
            ),
          )}
        </DataList.Root>
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          render={
            <Button
              color='neutral'
              fullWidth
              variant='outline'
            />
          }
        >
          {m.details.close}
        </Dialog.Close>
      </Card.Footer>
    </>
  );
}
