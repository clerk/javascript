import { keyframes } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';

import { Checkmark, ChevronDown, ChevronLeft, ChevronRight, MagnifyingGlass, Minus, Selector } from '../../icons';
import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { FilterChip } from '../components/filter-chip';
import { Select } from '../components/select';
import { Heading } from '../components/heading';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import { LOAD_DELAY_MS } from '../mock/organization-store';

import Avatar1 from '../components/mock/gradient-1.jpg';
import Avatar2 from '../components/mock/gradient-2.jpg';
import Avatar3 from '../components/mock/gradient-3.jpg';
import Avatar4 from '../components/mock/gradient-4.jpg';
import Avatar5 from '../components/mock/gradient-5.jpg';

type MemberStatus = 'active' | 'request' | 'invited';

interface MockMember {
  id: string;
  image: string;
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
    image: Avatar1.src,
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
    image: Avatar2.src,
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
    image: Avatar3.src,
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
    image: Avatar4.src,
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
    image: Avatar5.src,
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

const STATUS_ITEMS = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'invited', label: 'Invited' },
  { value: 'banned', label: 'Banned' },
  { value: 'inactive', label: 'Inactive' },
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
        border: checked ? 'none' : `1px solid ${t.color.border}`,
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
        border: checked || indeterminate ? 'none' : `1px solid ${t.color.border}`,
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

const REVEAL_TRANSITION = 'opacity 250ms ease-in-out, filter 250ms ease-in-out';

const digitPopIn = keyframes({
  '0%': {
    transform: 'translateY(8px)',
    opacity: 0,
    filter: 'blur(2px)',
  },
  '100%': {
    transform: 'translateY(0)',
    opacity: 1,
    filter: 'blur(0)',
  },
});

const DIGIT_STAGGER_MS = 70;
const DIGIT_EASE = 'cubic-bezier(0.34, 1.45, 0.64, 1)';

function AnimatedCount({ value, animate }: { value: number; animate: boolean }) {
  const digits = String(value).split('');

  return (
    <Box
      render={p => <span {...p} />}
      sx={() => ({
        display: 'inline-flex',
        alignItems: 'baseline',
      })}
    >
      {digits.map((char, i) => (
        <Box
          key={`${i}-${char}`}
          render={p => <span {...p} />}
          sx={() => ({
            display: 'inline-block',
            willChange: animate ? 'transform, opacity, filter' : undefined,
            animation: animate ? `${digitPopIn} 500ms ${DIGIT_EASE} ${i * DIGIT_STAGGER_MS}ms both` : 'none',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none !important' },
          })}
        >
          {char}
        </Box>
      ))}
    </Box>
  );
}

const ROW_HEIGHT = '4rem';

function SkeletonRow() {
  return (
    <Box
      sx={t => ({
        display: 'flex',
        alignItems: 'center',
        borderTop: `1px solid ${t.color.border}`,
        height: ROW_HEIGHT,
      })}
    >
      <Box
        sx={t => ({
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing(2),
          paddingInline: t.spacing(3),
        })}
      >
        <Skeleton
          width='2rem'
          height='2rem'
          sx={t => ({ borderRadius: t.rounded.full, flexShrink: 0 })}
        />
        <Box sx={() => ({ display: 'flex', flexDirection: 'column', gap: '0.25rem' })}>
          <Skeleton
            width={120}
            height='0.875rem'
          />
          <Skeleton
            width={160}
            height='0.75rem'
          />
        </Box>
      </Box>
      <Box sx={t => ({ flex: 1, paddingInline: t.spacing(3) })}>
        <Skeleton
          width={60}
          height='0.875rem'
        />
      </Box>
    </Box>
  );
}

export function OrganizationProfileMembers() {
  const [revealed, setRevealed] = useState(false);
  const [skeletonDone, setSkeletonDone] = useState(false);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [mfaFilter, setMfaFilter] = useState<string | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [sortValue, setSortValue] = useState<string | undefined>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setSkeletonDone(true), 300);
    return () => clearTimeout(timer);
  }, [revealed]);

  const query = searchQuery.trim().toLowerCase();
  const visibleMembers = MOCK_MEMBERS.filter(m => {
    if (declinedIds.has(m.id)) return false;
    if (mfaFilter === 'enabled' && !m.mfaEnabled) return false;
    if (mfaFilter === 'disabled' && m.mfaEnabled) return false;
    if (roleFilter === 'admin' && m.role !== 'Admin') return false;
    if (roleFilter === 'member' && m.role !== 'Member') return false;
    if (query && !m.email.toLowerCase().includes(query) && !(m.name ?? '').toLowerCase().includes(query)) return false;
    if (statusFilter === 'requested' && !(m.status === 'request' && !acceptedIds.has(m.id))) return false;
    if (statusFilter === 'invited' && m.status !== 'invited') return false;
    if (statusFilter === 'banned' || statusFilter === 'inactive') return false;
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

  const seatCount = visibleMembers.filter(m => m.status !== 'request' || acceptedIds.has(m.id)).length;

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
            sx={t => ({ fontWeight: t.font.medium, overflow: 'hidden' })}
          >
            <Text
              render={p => <span {...p} />}
              sx={t => ({ color: t.color.primary, fontSize: 'inherit' })}
            >
              <AnimatedCount
                value={revealed ? seatCount : 0}
                animate={revealed}
              />
            </Text>{' '}
            seats
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
            paddingBlock: t.spacing(2),
            gap: t.spacing(2),
          })}
        >
          <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), flex: 1, minWidth: 0 })}>
            <Select
              value={statusFilter}
              onValueChange={v => setStatusFilter(v ?? 'all')}
              items={STATUS_ITEMS}
              placement='bottom-start'
              sideOffset={4}
              trigger={p => (
                <Box
                  render={pp => <button {...pp} />}
                  {...(p as object)}
                  sx={t => ({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.spacing(1),
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    ...t.text('sm'),
                    fontWeight: t.font.medium,
                    color: t.color.primary,
                  })}
                >
                  {STATUS_ITEMS.find(s => s.value === statusFilter)?.label ?? 'All'}
                  <ChevronDown
                    width={14}
                    height={14}
                    style={{ opacity: 0.5, flexShrink: 0 }}
                  />
                </Box>
              )}
            >
              {STATUS_ITEMS.map(item => (
                <Select.Option
                  key={item.value}
                  value={item.value}
                  label={item.label}
                >
                  {item.label}
                </Select.Option>
              ))}
            </Select>
            <Box sx={t => ({ width: '1px', height: '16px', background: t.color.border, flexShrink: 0 })} />
            <Box
              sx={t => ({
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing(1.5),
                flex: 1,
                color: t.color.mutedForeground,
              })}
            >
              <MagnifyingGlass
                width={16}
                style={{ flexShrink: 0 }}
              />
              <Box
                render={p => (
                  <input
                    {...p}
                    type='text'
                    placeholder='Search'
                    value={searchQuery}
                    onChange={e => setSearchQuery((e.target as HTMLInputElement).value)}
                  />
                )}
                sx={t => ({
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  ...t.text('sm'),
                  color: t.color.primary,
                  '&::placeholder': { color: t.color.mutedForeground },
                })}
              />
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
              width={16}
              height={16}
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
                gap: t.spacing(1.5),
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
            fontWeight: t.font.medium,
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
          <Box sx={() => ({ display: 'grid', alignItems: 'center' })}>
            <Box
              aria-hidden
              sx={() => ({
                gridArea: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                opacity: revealed ? 0 : 1,
                filter: revealed ? 'blur(2px)' : 'blur(0)',
                transition: REVEAL_TRANSITION,
                pointerEvents: revealed ? 'none' : 'auto',
              })}
            >
              <Skeleton
                width={70}
                height='0.75rem'
              />
            </Box>
            <Box
              sx={() => ({
                gridArea: '1 / 1',
                opacity: revealed ? 1 : 0,
                filter: revealed ? 'blur(0)' : 'blur(2px)',
                transition: REVEAL_TRANSITION,
              })}
            >
              <Text
                size='xs'
                intent='mutedForeground'
                sx={t => ({ fontWeight: t.font.medium })}
              >
                {visibleMembers.length} members
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Member rows — grid-stacked skeleton/content crossfade */}
        <Box sx={() => ({ display: 'grid' })}>
          {/* Skeleton layer — unmounted after reveal so it doesn't hold height */}
          {!skeletonDone && (
            <Box
              aria-hidden
              sx={() => ({
                gridArea: '1 / 1',
                opacity: revealed ? 0 : 1,
                filter: revealed ? 'blur(2px)' : 'blur(0)',
                transition: REVEAL_TRANSITION,
                pointerEvents: revealed ? 'none' : 'auto',
              })}
            >
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </Box>
          )}
          {/* Content layer */}
          <Box
            sx={() => ({
              gridArea: '1 / 1',
              opacity: revealed ? 1 : 0,
              filter: revealed ? 'blur(0)' : 'blur(2px)',
              transition: REVEAL_TRANSITION,
            })}
          >
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
                    height: ROW_HEIGHT,
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
                    {/* Avatar ↔ Checkbox swap */}
                    <Box
                      sx={() => ({
                        display: 'inline-grid',
                        width: '2rem',
                        height: '2rem',
                        flexShrink: 0,
                      })}
                    >
                      <Box
                        sx={() => ({
                          gridArea: '1 / 1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition:
                            'opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), filter 250ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
                          willChange: 'opacity, filter, transform',
                          opacity: showCheckbox ? 0 : 1,
                          filter: showCheckbox ? 'blur(2px)' : 'blur(0)',
                          transform: showCheckbox ? 'scale(0.5)' : 'scale(1)',
                          pointerEvents: showCheckbox ? 'none' : 'auto',
                        })}
                      >
                        <Avatar
                          shape='user'
                          src={member.image}
                          color={member.color}
                          sx={() => ({ width: '2rem', height: '2rem' })}
                        >
                          <Text
                            size='xs'
                            sx={() => ({ color: 'white', opacity: 0.75 })}
                          >
                            {member.initials}
                          </Text>
                        </Avatar>
                      </Box>
                      <Box
                        sx={() => ({
                          gridArea: '1 / 1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition:
                            'opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), filter 250ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
                          willChange: 'opacity, filter, transform',
                          opacity: showCheckbox ? 1 : 0,
                          filter: showCheckbox ? 'blur(0)' : 'blur(2px)',
                          transform: showCheckbox ? 'scale(1)' : 'scale(0.5)',
                          pointerEvents: showCheckbox ? 'auto' : 'none',
                        })}
                      >
                        <RowCheckbox
                          checked={isSelected}
                          onClick={() => toggleSelected(member.id)}
                        />
                      </Box>
                    </Box>

                    <Box sx={t => ({ display: 'flex', flexDirection: 'column', minWidth: 0 })}>
                      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
                        <Text
                          size='sm'
                          sx={t => ({ fontWeight: t.font.medium, whiteSpace: 'nowrap' })}
                        >
                          {member.name ?? member.email}
                        </Text>
                        {displayStatus === 'request' && <Badge intent='primary'>Request</Badge>}
                        {displayStatus === 'invited' && <Badge>Invited</Badge>}
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
        </Box>
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
            sx={t => ({ fontWeight: t.font.medium })}
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
            sx={t => ({ fontWeight: t.font.medium })}
          >
            Results per page
          </Text>
          <Select
            value={pageSize}
            onValueChange={setPageSize}
            items={[
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: 'all', label: 'All' },
            ]}
            placement='top-end'
            sideOffset={4}
            trigger={p => (
              <Box
                render={pp => <button {...pp} />}
                {...(p as object)}
                sx={t => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing(1),
                  height: '24px',
                  paddingInline: t.spacing(1.5),
                  borderRadius: t.rounded.md,
                  border: `1px solid ${t.color.border}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  ...t.text('xs'),
                  fontWeight: t.font.medium,
                  color: t.color.primary,
                })}
              >
                {pageSize === 'all' ? 'All' : pageSize}
                <ChevronDown
                  width={16}
                  height={16}
                />
              </Box>
            )}
          >
            {[
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: 'all', label: 'All' },
            ].map(item => (
              <Select.Option
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Box>
      </Box>
    </Box>
  );
}
