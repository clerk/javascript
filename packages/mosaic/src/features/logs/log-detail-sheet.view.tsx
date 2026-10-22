import * as stylex from '@stylexjs/stylex';

import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { CopyButton } from '../../components/copy-button';
import { DataList } from '../../components/data-list';
import { Entity } from '../../components/entity';
import { Icon } from '../../components/icon';
import { ChevronDown } from '../../icons/glyphs/chevron-down';
import { ChevronUp } from '../../icons/glyphs/chevron-up';
import { X } from '../../icons/glyphs/x';
import { useMessages } from '../../localization';
import { Dialog } from '../../primitives/dialog';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { LogPayloadView } from './log-payload.view';
import { countryFlag, formatLocation, initials } from './logs.format';
import { styles } from './logs.styles';
import type { LogDetailSheetViewProps, LogEvent } from './logs.types';

export function LogDetailSheetView({
  event,
  open,
  onOpenChange,
  showActor = false,
  applicationName,
  onPrevious,
  onNext,
}: LogDetailSheetViewProps) {
  const m = useMessages('logs');

  return (
    <Dialog.Root
      open={open && event !== null}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          {...mergeStyleProps(themeProps('log-detail-backdrop'), stylex.props(reset.base, styles.backdrop))}
        />
        <Dialog.Viewport {...mergeStyleProps(themeProps('log-detail-viewport'), stylex.props(styles.viewport))}>
          <Dialog.Popup {...mergeStyleProps(themeProps('log-detail-sheet'), stylex.props(reset.base, styles.sheet))}>
            <header {...stylex.props(styles.sheetHeader)}>
              <Dialog.Title {...mergeStyleProps(themeProps('log-detail-title'), stylex.props(styles.sheetHeaderTitle))}>
                {m.detailTitle}
              </Dialog.Title>
              <div {...stylex.props(styles.sheetHeaderActions)}>
                <Button
                  aria-label={m.previousEvent}
                  color='neutral'
                  variant='ghost'
                  size='sm'
                  shape='square'
                  disabled={!onPrevious}
                  onClick={onPrevious}
                >
                  <Icon glyph={ChevronUp} />
                </Button>
                <Button
                  aria-label={m.nextEvent}
                  color='neutral'
                  variant='ghost'
                  size='sm'
                  shape='square'
                  disabled={!onNext}
                  onClick={onNext}
                >
                  <Icon glyph={ChevronDown} />
                </Button>
                <span
                  aria-hidden
                  {...stylex.props(styles.divider)}
                />
                <Dialog.Close
                  render={
                    <Button
                      aria-label={m.close}
                      color='neutral'
                      variant='ghost'
                      size='sm'
                      shape='square'
                    />
                  }
                >
                  <Icon glyph={X} />
                </Dialog.Close>
              </div>
            </header>
            {event ? (
              <LogDetailBody
                event={event}
                showActor={showActor}
                applicationName={applicationName}
              />
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LogDetailBody({
  event,
  showActor,
  applicationName,
}: {
  event: LogEvent;
  showActor: boolean;
  applicationName: string;
}) {
  const m = useMessages('logs');
  const location = formatLocation(event.location);

  return (
    <div {...stylex.props(styles.sheetBody)}>
      <div {...stylex.props(styles.summary)}>
        <h2 {...stylex.props(styles.summaryTitle)}>{event.description}</h2>
        <span {...stylex.props(styles.eventTypeLine)}>
          <span {...stylex.props(styles.eventType)}>{event.type}</span>
          {event.source === 'application' ? <Badge color='neutral'>{m.custom}</Badge> : null}
        </span>
      </div>

      <section {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <h3 {...stylex.props(styles.sectionTitle)}>{m.information}</h3>
        </div>
        <DataList.Root>
          {showActor && event.actor ? (
            <DataList.Item>
              <DataList.Label>{m.performedBy}</DataList.Label>
              <DataList.Value>
                <Entity.Root>
                  <Entity.Media>
                    <Avatar.Root
                      size='fit'
                      aria-hidden
                      xstyle={styles.actorAvatar}
                    >
                      {event.actor.imageUrl ? (
                        <Avatar.Image
                          src={event.actor.imageUrl}
                          alt=''
                        />
                      ) : null}
                      <Avatar.Fallback>{initials(event.actor.name)}</Avatar.Fallback>
                    </Avatar.Root>
                  </Entity.Media>
                  <Entity.Content>
                    <Entity.Label>{event.actor.name}</Entity.Label>
                    {event.actor.identifier ? <Entity.Description>{event.actor.identifier}</Entity.Description> : null}
                  </Entity.Content>
                </Entity.Root>
              </DataList.Value>
            </DataList.Item>
          ) : null}
          <DataList.Item>
            <DataList.Label>{m.time}</DataList.Label>
            <DataList.Value>
              <time title={event.relativeLabel}>{event.timestampLabel}</time>
            </DataList.Value>
          </DataList.Item>
          {event.ipAddress ? (
            <DataList.Item>
              <DataList.Label>{m.ipAddress}</DataList.Label>
              <DataList.Value>
                <span {...stylex.props(styles.valueRow)}>
                  <span {...stylex.props(styles.ipText)}>{event.ipAddress}</span>
                  <CopyButton
                    value={event.ipAddress}
                    label={m.copyIpAddress}
                    copiedLabel={m.copied}
                  />
                </span>
              </DataList.Value>
            </DataList.Item>
          ) : null}
          {location ? (
            <DataList.Item>
              <DataList.Label>{m.location}</DataList.Label>
              <DataList.Value>
                <span {...stylex.props(styles.valueRow)}>
                  <span aria-hidden>{countryFlag(event.location?.countryCode)}</span>
                  {location}
                </span>
              </DataList.Value>
            </DataList.Item>
          ) : null}
          {event.deviceLabel ? (
            <DataList.Item>
              <DataList.Label>{m.device}</DataList.Label>
              <DataList.Value>{event.deviceLabel}</DataList.Value>
            </DataList.Item>
          ) : null}
          <DataList.Item>
            <DataList.Label>{m.source}</DataList.Label>
            <DataList.Value>{event.source === 'application' ? applicationName : m.sourceClerk}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </section>

      <LogPayloadView payload={event.payload} />
    </div>
  );
}
