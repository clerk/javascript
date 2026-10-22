import * as stylex from '@stylexjs/stylex';

import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { EmptyState } from '../../components/empty-state';
import { Entity } from '../../components/entity';
import { Pagination } from '../../components/pagination';
import { Select } from '../../components/select';
import { Table } from '../../components/table';
import { MagnifyingGlass } from '../../icons/glyphs/magnifying-glass';
import { fill, useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { countryFlag, initials } from './logs.format';
import { styles } from './logs.styles';
import type { LogEvent, LogsTableViewProps } from './logs.types';

export function LogsTableView({
  events,
  totalCount,
  showActor = false,
  searchValue,
  onSearchChange,
  categories,
  category,
  onCategoryChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedId,
  onSelect,
}: LogsTableViewProps) {
  const m = useMessages('logs');
  const columnCount = showActor ? 4 : 3;
  const isFiltered = searchValue.trim() !== '' || category !== 'all';

  return (
    <div {...mergeStyleProps(themeProps('logs-table'), stylex.props(styles.root))}>
      <Table.Toolbar>
        <Table.Search
          label={m.search}
          clearLabel={m.clearSearch}
          value={searchValue}
          onValueChange={onSearchChange}
        />
        <div {...stylex.props(styles.categorySelect)}>
          <Select.Root
            items={categories}
            value={category}
            onValueChange={value => value && onCategoryChange(value)}
          >
            <Select.Trigger aria-label={m.category} />
            <Select.Popup />
          </Select.Root>
        </div>
      </Table.Toolbar>
      <Table.Root
        layout='fixed'
        aria-label={m.tableLabel}
        xstyle={showActor ? styles.tableWithActor : styles.table}
      >
        <Table.ColumnGroup>
          <Table.Column />
          {showActor ? <Table.Column width='13rem' /> : null}
          <Table.Column width={showActor ? '9.5rem' : '10rem'} />
          <Table.Column width='11.5rem' />
        </Table.ColumnGroup>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{m.event}</Table.HeaderCell>
            {showActor ? <Table.HeaderCell>{m.member}</Table.HeaderCell> : null}
            <Table.HeaderCell>{m.ipAddress}</Table.HeaderCell>
            <Table.HeaderCell>{m.timestamp}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {events.length === 0 ? (
            <Table.Empty colSpan={columnCount}>
              <EmptyState.Root>
                <EmptyState.Icon glyph={MagnifyingGlass} />
                <EmptyState.Label>{isFiltered ? m.empty : m.noEvents}</EmptyState.Label>
                <EmptyState.Description>
                  {isFiltered ? m.emptyDescription : m.noEventsDescription}
                </EmptyState.Description>
              </EmptyState.Root>
            </Table.Empty>
          ) : (
            events.map(event => (
              <LogsTableRow
                key={event.id}
                event={event}
                showActor={showActor}
                selected={event.id === selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </Table.Body>
      </Table.Root>
      {totalCount > 0 ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalCount}
          onChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 25, 50]}
          label={m.pagination}
          pageSizeLabel={m.pageSize}
          previousPageLabel={m.previousPage}
          nextPageLabel={m.nextPage}
        />
      ) : null}
    </div>
  );
}

function LogsTableRow({
  event,
  showActor,
  selected,
  onSelect,
}: {
  event: LogEvent;
  showActor: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const m = useMessages('logs');
  return (
    <Table.Row
      selected={selected}
      xstyle={styles.row}
      onClick={() => onSelect(event.id)}
    >
      <Table.Cell>
        <button
          type='button'
          aria-label={fill(m.viewEvent, { event: event.description })}
          onClick={clickEvent => {
            clickEvent.stopPropagation();
            onSelect(event.id);
          }}
          {...stylex.props(styles.rowButton)}
        >
          <span {...stylex.props(styles.eventDescription)}>{event.description}</span>
          <span {...stylex.props(styles.eventTypeLine)}>
            <span {...stylex.props(styles.eventType)}>{event.type}</span>
            {event.source === 'application' ? <Badge color='neutral'>{m.custom}</Badge> : null}
          </span>
        </button>
      </Table.Cell>
      {showActor ? (
        <Table.Cell>
          {event.actor ? (
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
                <Entity.Label>
                  {event.actor.name}
                  {event.actor.isCurrentUser ? <Badge>{m.you}</Badge> : null}
                </Entity.Label>
              </Entity.Content>
            </Entity.Root>
          ) : (
            <span {...stylex.props(styles.muted)}>-</span>
          )}
        </Table.Cell>
      ) : null}
      <Table.Cell>
        {event.ipAddress ? (
          <span {...stylex.props(styles.ipCell)}>
            <span
              aria-hidden
              {...stylex.props(styles.flag)}
            >
              {countryFlag(event.location?.countryCode)}
            </span>
            <span {...stylex.props(styles.ipText)}>{event.ipAddress}</span>
          </span>
        ) : (
          <span {...stylex.props(styles.muted)}>-</span>
        )}
      </Table.Cell>
      <Table.Cell noWrap>
        <time
          title={event.timestampLabel}
          {...stylex.props(styles.time)}
        >
          <span {...stylex.props(styles.timeDate)}>{event.dateLabel}</span>
          <span {...stylex.props(styles.timeClock)}>{event.timeLabel}</span>
        </time>
      </Table.Cell>
    </Table.Row>
  );
}
