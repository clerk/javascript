import { useRef, useState } from 'react';

import { Checkmark, ChevronDown, ChevronLeft, ChevronRight, MagnifyingGlass, Minus, Selector } from '../../icons';
import { Avatar } from '../components/avatar';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { FilterChip } from '../components/filter-chip';
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
  mfaEnabled: boolean;
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
    mfaEnabled: false,
  },
  {
    id: '2',
    name: 'Bertram Gilfoyle',
    email: 'gilfoyle@piedpiper.com',
    role: 'Member',
    status: 'active',
    initials: 'BG',
    color: '#6b7280',
    mfaEnabled: true,
  },
  {
    id: '3',
    name: null,
    email: 'kkapoor@gmail.com',
    role: 'Member',
    status: 'invited',
    initials: 'KK',
    color: '#8b5cf6',
    mfaEnabled: false,
  },
  {
    id: '4',
    name: 'Myle Kac',
    email: 'mylekac@piedpiper.com',
    role: 'Admin',
    status: 'active',
    initials: 'MK',
    color: '#dc2626',
    mfaEnabled: true,
  },
  {
    id: '5',
    name: 'Richard Hendricks',
    email: 'richard@piedpiper.com',
    role: 'Admin',
    status: 'active',
    initials: 'RH',
    color: '#0ea5e9',
    mfaEnabled: false,
  },
];

const MFA_ITEMS = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];

const ROLE_ITEMS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

const SORT_ITEMS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
];

function RowCheckbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <Box
      render={p => (
        <button
          {...p}
          type='button'
        />
      )}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
      }}
      sx={t => ({
        width: '16px',
        height: '16px',
        borderRadius: t.rounded.sm,
        border: checked ? 'none' : `1.5px solid ${t.color.border}`,
        background: checked ? '#6c47ff' : `light-dark(white, oklch(0.2 0 0))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        padding: 0,
        '&:hover': { borderColor: t.color.mutedForeground },
      })}
    >
      {checked && (
        <Checkmark
          width={10}
          height={10}
          style={{ color: 'white' }}
        />
      )}
    </Box>
  );
}

function HeaderCheckbox({
  checked,
  indeterminate,
  onClick,
}: {
  checked: boolean;
  indeterminate: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      render={p => (
        <button
          {...p}
          type='button'
        />
      )}
      onClick={onClick}
      sx={t => ({
        width: '16px',
        height: '16px',
        borderRadius: t.rounded.sm,
        border: checked || indeterminate ? 'none' : `1.5px solid ${t.color.border}`,
        background: checked || indeterminate ? '#6c47ff' : `light-dark(white, oklch(0.2 0 0))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        padding: 0,
      })}
    >
      {indeterminate && !checked ? (
        <Minus
          width={10}
          height={10}
          style={{ color: 'white' }}
        />
      ) : checked ? (
        <Checkmark
          width={10}
          height={10}
          style={{ color: 'white' }}
        />
      ) : null}
    </Box>
  );
}

export function OrganizationProfileMembers() {
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [mfaFilter, setMfaFilter] = useState<string | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [sortValue, setSortValue] = useState<string | undefined>('name');

  const visibleMembers = MOCK_MEMBERS.filter(m => {
    if (declinedIds.has(m.id)) return false;
    if (mfaFilter === 'enabled' && !m.mfaEnabled) return false;
    if (mfaFilter === 'disabled' && m.mfaEnabled) return false;
    if (roleFilter === 'admin' && m.role !== 'Admin') return false;
    if (roleFilter === 'member' && m.role !== 'Member') return false;
    return true;
  });

  // Sort requests to top (unless they've been accepted), then by sort field.
  const sortedMembers = [...visibleMembers].sort((a, b) => {
    const aIsRequest = !acceptedIds.has(a.id) && a.status === 'request';
    const bIsRequest = !acceptedIds.has(b.id) && b.status === 'request';
    if (aIsRequest && !bIsRequest) return -1;
    if (bIsRequest && !aIsRequest) return 1;
    if (sortValue === 'email') return a.email.localeCompare(b.email);
    const aName = a.name ?? a.email;
    const bName = b.name ?? b.email;
    return aName.localeCompare(bName);
  });

  const toggleSelected = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allChecked = sortedMembers.length > 0 && sortedMembers.every(m => selectedIds.has(m.id));
  const anyChecked = sortedMembers.some(m => selectedIds.has(m.id));
  const toggleAll = () => setSelectedIds(allChecked ? new Set() : new Set(sortedMembers.map(m => m.id)));

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4), width: '100%' })}>
      {/* Header */}
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
            onClick={() => setFilterOpen(o => !o)}
            sx={t => ({ color: filterOpen ? 'inherit' : t.color.mutedForeground, padding: t.spacing(1) })}
          >
            <Selector
              width={14}
              height={14}
            />
          </Button>
        </Box>

        {/* Filter/sort row */}
        <Box
          sx={() => ({
            display: 'grid',
            gridTemplateRows: filterOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 200ms ease',
            overflow: 'hidden',
          })}
        >
          <Box sx={() => ({ minHeight: 0 })}>
            <Box
              sx={t => ({
                display: 'flex',
                alignItems: 'center',
                paddingInline: t.spacing(3),
                paddingBlock: t.spacing(2),
                gap: t.spacing(2),
                borderTop: `1px solid ${t.color.border}`,
              })}
            >
              <FilterChip
                label='MFA'
                value={mfaFilter}
                onValueChange={setMfaFilter}
                items={MFA_ITEMS}
              />
              <FilterChip
                label='Role'
                value={roleFilter}
                onValueChange={setRoleFilter}
                items={ROLE_ITEMS}
              />
              <Box sx={() => ({ marginLeft: 'auto' })}>
                <FilterChip
                  label='Sort'
                  value={sortValue}
                  onValueChange={v => setSortValue(v ?? 'name')}
                  items={SORT_ITEMS}
                  clearable={false}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Column header */}
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing(2),
            paddingInline: t.spacing(3),
            borderTop: `1px solid ${t.color.border}`,
            background: t.color.muted,
          })}
        >
          <Box
            sx={() => ({
              width: '2rem',
              height: '2rem',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <HeaderCheckbox
              checked={allChecked}
              indeterminate={anyChecked && !allChecked}
              onClick={toggleAll}
            />
          </Box>
          <Text
            size='xs'
            intent='mutedForeground'
            sx={t => ({ fontWeight: t.font.medium })}
          >
            {visibleMembers.length} members
          </Text>
        </Box>

        {/* Member rows */}
        {sortedMembers.map(member => {
          const isAccepted = acceptedIds.has(member.id);
          const displayStatus: MemberStatus = isAccepted ? 'active' : member.status;
          const isRequest = displayStatus === 'request';
          const isSelected = selectedIds.has(member.id);
          const showCheckbox = hoveredId === member.id || isSelected;

          return (
            <Box
              key={member.id}
              onMouseEnter={() => {
                hoverTimerRef.current = setTimeout(() => setHoveredId(member.id), 175);
              }}
              onMouseLeave={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                setHoveredId(null);
              }}
              sx={t => ({
                display: 'flex',
                alignItems: 'stretch',
                borderTop: `1px solid ${t.color.border}`,
                background: isRequest ? t.color.muted : 'transparent',
              })}
            >
              {/* Left: avatar/checkbox + name + email */}
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
                <Box
                  sx={() => ({
                    width: '2rem',
                    height: '2rem',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  {showCheckbox ? (
                    <RowCheckbox
                      checked={isSelected}
                      onClick={() => toggleSelected(member.id)}
                    />
                  ) : (
                    <Avatar
                      shape='user'
                      color={member.color}
                      sx={() => ({ width: '2rem', height: '2rem', fontSize: '11px' })}
                    >
                      <Text
                        size='xs'
                        sx={t => ({ color: 'white', opacity: 0.75 })}
                      >
                        {member.initials}
                      </Text>
                    </Avatar>
                  )}
                </Box>

                <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(0.5), minWidth: 0 })}>
                  <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
                    <Text
                      size='sm'
                      sx={t => ({ fontWeight: t.font.medium, whiteSpace: 'nowrap' })}
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
