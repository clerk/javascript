import type { ReactNode } from 'react';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import type { Snapshot } from '../machine/types';
import type { MemberRow } from './organization-profile-members-panel.controller';
import type {
  OrganizationProfileMembersPanelContext,
  OrganizationProfileMembersPanelEvent,
} from './organization-profile-members-panel.machine';

export interface OrganizationProfileMembersPanelViewProps {
  snapshot: Snapshot<OrganizationProfileMembersPanelContext>;
  send: (event: OrganizationProfileMembersPanelEvent) => void;
  rows: MemberRow[];
  canManage: boolean;
  page: number;
  pageCount: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

/** Small pill used for the "You" / "Banned" row markers. */
function Badge({ children, intent = 'neutral' }: { children: ReactNode; intent?: 'neutral' | 'destructive' }) {
  return (
    <Box
      render={p => <span {...p} />}
      sx={t => ({
        display: 'inline-flex',
        alignItems: 'center',
        ...t.text('xs'),
        fontWeight: t.font.medium,
        paddingInline: t.spacing(1.5),
        paddingBlock: t.spacing(0.5),
        borderRadius: t.rounded.full,
        color: intent === 'destructive' ? t.color.destructive : t.color.mutedForeground,
        backgroundColor: intent === 'destructive' ? t.alpha('destructive', 12) : t.alpha('primary', 8),
      })}
    >
      {children}
    </Box>
  );
}

function HeaderCell({ children, align = 'start' }: { children?: ReactNode; align?: 'start' | 'end' }) {
  return (
    <Box
      render={p => <th {...p} />}
      sx={t => ({
        ...t.text('xs'),
        fontWeight: t.font.medium,
        color: t.color.mutedForeground,
        textAlign: align,
        paddingInline: t.spacing(3),
        paddingBlock: t.spacing(2),
        whiteSpace: 'nowrap',
      })}
    >
      {children}
    </Box>
  );
}

function Cell({ children, align = 'start' }: { children?: ReactNode; align?: 'start' | 'end' }) {
  return (
    <Box
      render={p => <td {...p} />}
      sx={t => ({
        ...t.text('sm'),
        textAlign: align,
        paddingInline: t.spacing(3),
        paddingBlock: t.spacing(3),
        verticalAlign: 'middle',
      })}
    >
      {children}
    </Box>
  );
}

export function OrganizationProfileMembersPanelView({
  snapshot,
  send,
  rows,
  canManage,
  page,
  pageCount,
  isLoading,
  onPageChange,
}: OrganizationProfileMembersPanelViewProps) {
  const isRemoving = snapshot.value === 'removing';
  const columnCount = canManage ? 4 : 3;

  return (
    <Box
      sx={{
        width: '100%',
        containerType: 'inline-size',
      }}
    >
      <Box
        render={p => (
          <form
            {...p}
            onSubmit={event => {
              event.preventDefault();
              send({ type: 'SEARCH_SUBMIT' });
            }}
          />
        )}
        sx={t => ({
          display: 'flex',
          gap: t.spacing(2),
          marginBlockEnd: t.spacing(4),
        })}
      >
        <Input
          size='sm'
          type='search'
          placeholder='Search members'
          aria-label='Search members'
          value={snapshot.context.search}
          onChange={event => send({ type: 'SEARCH_CHANGE', value: event.currentTarget.value })}
        />
        <Button
          type='submit'
          variant='outline'
          size='sm'
          sx={{ flexShrink: 0 }}
        >
          Search
        </Button>
      </Box>

      {snapshot.context.error ? (
        <Text
          intent='destructive'
          size='sm'
          role='alert'
          sx={t => ({ marginBlockEnd: t.spacing(3) })}
        >
          {snapshot.context.error}
        </Text>
      ) : null}

      <Box
        render={p => <table {...p} />}
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <Box render={p => <thead {...p} />}>
          <Box
            render={p => <tr {...p} />}
            sx={t => ({ borderBottom: `1px solid ${t.alpha('primary', 10)}` })}
          >
            <HeaderCell>Member</HeaderCell>
            <HeaderCell>Joined</HeaderCell>
            <HeaderCell>Role</HeaderCell>
            {canManage ? <HeaderCell align='end'>Actions</HeaderCell> : null}
          </Box>
        </Box>
        <Box render={p => <tbody {...p} />}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                render={p => <tr {...p} />}
              >
                {Array.from({ length: columnCount }).map((__, cellIndex) => (
                  <Cell key={cellIndex}>
                    <Skeleton height='1rem' />
                  </Cell>
                ))}
              </Box>
            ))
          ) : rows.length === 0 ? (
            <Box render={p => <tr {...p} />}>
              <Box
                render={p => (
                  <td
                    {...p}
                    colSpan={columnCount}
                  />
                )}
                sx={t => ({
                  ...t.text('sm'),
                  color: t.color.mutedForeground,
                  textAlign: 'center',
                  paddingBlock: t.spacing(8),
                })}
              >
                There are no members to display
              </Box>
            </Box>
          ) : (
            rows.map(row => {
              const isRemovingRow = isRemoving && snapshot.context.pendingMembershipId === row.id;
              return (
                <Box
                  key={row.id}
                  render={p => <tr {...p} />}
                  sx={t => ({ borderBottom: `1px solid ${t.alpha('primary', 6)}` })}
                >
                  <Cell>
                    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(0.5) })}>
                      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
                        <Text
                          size='sm'
                          sx={t => ({ fontWeight: t.font.medium })}
                        >
                          {row.name}
                        </Text>
                        {row.isCurrentUser ? <Badge>You</Badge> : null}
                        {row.isBanned ? <Badge intent='destructive'>Banned</Badge> : null}
                      </Box>
                      {row.identifier && row.identifier !== row.name ? (
                        <Text
                          size='xs'
                          intent='mutedForeground'
                        >
                          {row.identifier}
                        </Text>
                      ) : null}
                    </Box>
                  </Cell>
                  <Cell>
                    <Text
                      size='sm'
                      intent='mutedForeground'
                    >
                      {row.joinedAt}
                    </Text>
                  </Cell>
                  <Cell>
                    <Text size='sm'>{row.roleLabel}</Text>
                  </Cell>
                  {canManage ? (
                    <Cell align='end'>
                      <Button
                        intent='destructive'
                        variant='ghost'
                        size='sm'
                        disabled={row.isCurrentUser || isRemovingRow}
                        onClick={row.onRemove}
                      >
                        {isRemovingRow ? 'Removing…' : 'Remove'}
                      </Button>
                    </Cell>
                  ) : null}
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {pageCount > 1 ? (
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: t.spacing(3),
            marginBlockStart: t.spacing(4),
          })}
        >
          <Text
            size='xs'
            intent='mutedForeground'
          >
            Page {page} of {pageCount}
          </Text>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
