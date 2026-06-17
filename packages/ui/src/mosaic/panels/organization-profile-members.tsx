import { useState } from 'react';

import { ChevronLeft, ChevronRight, ChevronDown, MagnifyingGlass, Selector } from '../../icons';
import { Avatar } from '../components/avatar';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';

type MemberStatus = 'active' | 'request' | 'invited';

interface MockMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: MemberStatus;
  initials: string;
  color: string;
}

const MOCK_MEMBERS: MockMember[] = [
  {
    id: '1',
    name: 'Jian Yang',
    email: 'jianyang@hotdogornot.com',
    role: 'Member',
    status: 'request',
    initials: 'JY',
    color: '#4f46e5',
  },
  {
    id: '2',
    name: 'Bertram Gilfoyle',
    email: 'gilfoyle@piedpiper.com',
    role: 'Member',
    status: 'active',
    initials: 'BG',
    color: '#6b7280',
  },
  {
    id: '3',
    name: null,
    email: 'kkapoor@gmail.com',
    role: 'Member',
    status: 'invited',
    initials: 'KK',
    color: '#8b5cf6',
  },
  {
    id: '4',
    name: 'Myle Kac',
    email: 'mylekac@piedpiper.com',
    role: 'Admin',
    status: 'active',
    initials: 'MK',
    color: '#dc2626',
  },
  {
    id: '5',
    name: 'Richard Hendricks',
    email: 'richard@piedpiper.com',
    role: 'Admin',
    status: 'active',
    initials: 'RH',
    color: '#0ea5e9',
  },
];

export function OrganizationProfileMembers() {
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  const visibleMembers = MOCK_MEMBERS.filter(m => !declinedIds.has(m.id));

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4), width: '100%' })}>
      {/* Header: title + seats + invite */}
      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
        <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), flex: 1, minWidth: 0 })}>
          <Heading size='xl'>Members</Heading>
          <Box sx={t => ({ width: '1px', height: '16px', background: t.color.border, flexShrink: 0 })} />
          <Text
            size='xs'
            intent='mutedForeground'
            render={p => <span {...p} />}
          >
            {visibleMembers.length} seats
          </Text>
        </Box>
        <Button
          variant='filled'
          intent='primary'
        >
          Invite
        </Button>
      </Box>

      {/* Members table */}
      <Box
        sx={t => ({
          border: `1px solid ${t.color.border}`,
          borderRadius: '8px',
          overflow: 'hidden',
        })}
      >
        {/* Top bar */}
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: t.spacing(3),
            paddingBlock: t.spacing(1),
            gap: t.spacing(2),
          })}
        >
          <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), flex: 1, minWidth: 0 })}>
            <Button
              variant='ghost'
              intent='primary'
              size='sm'
              sx={t => ({ fontWeight: t.font.medium })}
            >
              All
            </Button>
            <Box sx={t => ({ width: '1px', height: '16px', background: t.color.border, flexShrink: 0 })} />
            <Box
              sx={t => ({
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing(2),
                flex: 1,
                color: t.color.mutedForeground,
              })}
            >
              <MagnifyingGlass
                width={14}
                height={14}
                style={{ flexShrink: 0 }}
              />
              <Text
                size='sm'
                intent='mutedForeground'
                render={p => <span {...p} />}
              >
                Search
              </Text>
            </Box>
          </Box>
          <Button
            variant='outline'
            intent='primary'
            size='sm'
            sx={t => ({ color: t.color.mutedForeground, padding: t.spacing(1) })}
          >
            <Selector
              width={14}
              height={14}
            />
          </Button>
        </Box>

        {/* Table sub-header */}
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing(2),
            paddingInline: t.spacing(3),
            paddingBlock: t.spacing(1.5),
            borderTop: `1px solid ${t.color.border}`,
            background: t.color.muted,
          })}
        >
          <Box
            sx={t => ({
              width: '16px',
              height: '16px',
              border: `1px solid ${t.color.border}`,
              borderRadius: t.rounded.sm,
              flexShrink: 0,
              background: `light-dark(white, oklch(0.2 0 0))`,
            })}
          />
          <Text
            size='xs'
            intent='mutedForeground'
          >
            {visibleMembers.length} members
          </Text>
        </Box>

        {/* Member rows */}
        {visibleMembers.map(member => {
          const isAccepted = acceptedIds.has(member.id);
          const displayStatus: MemberStatus = isAccepted ? 'active' : member.status;
          return (
            <Box
              key={member.id}
              sx={t => ({
                display: 'flex',
                alignItems: 'stretch',
                borderTop: `1px solid ${t.color.border}`,
              })}
            >
              {/* Left: avatar + name + email */}
              <Box
                sx={t => ({
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing(2),
                  padding: t.spacing(3),
                  minWidth: 0,
                })}
              >
                <Avatar
                  shape='user'
                  color={member.color}
                  sx={() => ({ width: '2rem', height: '2rem', fontSize: '11px', flexShrink: 0 })}
                >
                  {member.initials}
                </Avatar>
                <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(0.5), minWidth: 0 })}>
                  <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
                    <Text
                      size='sm'
                      sx={t => ({ fontWeight: t.font.semibold, whiteSpace: 'nowrap' })}
                    >
                      {member.name ?? member.email}
                    </Text>
                    {displayStatus === 'request' && (
                      <Box
                        sx={t => ({
                          display: 'inline-flex',
                          alignItems: 'center',
                          height: '18px',
                          paddingInline: t.spacing(1.5),
                          borderRadius: t.rounded.md,
                          background: 'rgba(108, 71, 255, 0.08)',
                          ...t.text('xs'),
                          color: '#6c47ff',
                          fontWeight: t.font.medium,
                          flexShrink: 0,
                        })}
                      >
                        Request
                      </Box>
                    )}
                    {displayStatus === 'invited' && (
                      <Box
                        sx={t => ({
                          display: 'inline-flex',
                          alignItems: 'center',
                          height: '18px',
                          paddingInline: t.spacing(1.5),
                          borderRadius: t.rounded.md,
                          border: `1px dashed ${t.color.border}`,
                          ...t.text('xs'),
                          color: t.color.mutedForeground,
                          flexShrink: 0,
                        })}
                      >
                        Invited
                      </Box>
                    )}
                  </Box>
                  {member.name && (
                    <Text
                      size='sm'
                      intent='mutedForeground'
                      sx={() => ({ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}
                    >
                      {member.email}
                    </Text>
                  )}
                </Box>
              </Box>

              {/* Right: role + optional actions */}
              <Box
                sx={t => ({
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: t.spacing(3),
                  gap: t.spacing(1.5),
                })}
              >
                <Text
                  size='sm'
                  intent='mutedForeground'
                  sx={() => ({ flex: 1 })}
                >
                  {member.role}
                </Text>
                {displayStatus === 'request' && (
                  <Box sx={t => ({ display: 'flex', gap: t.spacing(1.5) })}>
                    <Button
                      variant='outline'
                      intent='primary'
                      onClick={() => setDeclinedIds(s => new Set([...s, member.id]))}
                    >
                      Decline
                    </Button>
                    <Button
                      variant='filled'
                      intent='primary'
                      onClick={() => setAcceptedIds(s => new Set([...s, member.id]))}
                    >
                      Accept
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Pagination */}
      <Box sx={t => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
        <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
          <Button
            variant='outline'
            intent='primary'
            size='sm'
            sx={() => ({ width: '24px', height: '24px', padding: 0 })}
          >
            <ChevronLeft
              width={14}
              height={14}
            />
          </Button>
          <Text
            size='xs'
            intent='mutedForeground'
            render={p => <span {...p} />}
          >
            1 of 1
          </Text>
          <Button
            variant='outline'
            intent='primary'
            size='sm'
            sx={() => ({ width: '24px', height: '24px', padding: 0 })}
          >
            <ChevronRight
              width={14}
              height={14}
            />
          </Button>
        </Box>
        <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
          <Text
            size='xs'
            intent='mutedForeground'
            render={p => <span {...p} />}
          >
            Results per page
          </Text>
          <Button
            variant='outline'
            intent='primary'
            size='sm'
            sx={t => ({ gap: t.spacing(1) })}
          >
            10
            <ChevronDown
              width={14}
              height={14}
            />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
