import { useEffect, useState } from 'react';

import { Plus, ThreeDots } from '../../icons';
import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Select } from '../components/select';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import { useUser } from '../mock/use-user';

const REVEAL_TRANSITION = 'opacity 400ms ease-in-out, filter 400ms ease-in-out';

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <Box
      sx={t => ({
        display: 'flex',
        alignItems: 'center',
        paddingInline: t.spacing(3),
        paddingRight: t.spacing(2),
      })}
    >
      <Heading
        size='sm'
        sx={() => ({ flex: 1 })}
      >
        {title}
      </Heading>
      {action}
    </Box>
  );
}

function ListRow({ children, showDivider = true }: { children: React.ReactNode; showDivider?: boolean }) {
  return (
    <>
      <Box
        sx={t => ({
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing(2),
          padding: t.spacing(3),
          '&:hover, &:has([aria-expanded="true"])': { background: t.color.muted },
          '& [data-row-action]': { opacity: 0 },
          '&:hover [data-row-action], &:has([aria-expanded="true"]) [data-row-action]': { opacity: 1 },
        })}
      >
        {children}
      </Box>
      {showDivider && <Box sx={t => ({ height: '1px', background: t.color.border, marginInline: t.spacing(3) })} />}
    </>
  );
}

function RowMenu({ items }: { items: Array<{ value: string; label: string; destructive?: boolean }> }) {
  return (
    <Select
      value=''
      onValueChange={() => {}}
      items={items}
      placement='bottom-end'
      sideOffset={4}
      trigger={p => (
        <Box
          data-row-action
          render={pp => <button {...pp} />}
          {...(p as object)}
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: t.rounded.md,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: t.color.mutedForeground,
            padding: 0,
            transition: 'opacity 150ms ease',
            '&:hover': { color: t.color.primary },
          })}
        >
          <ThreeDots
            width={16}
            height={16}
          />
        </Box>
      )}
    >
      {items.map(item => (
        <Select.Option
          key={item.value}
          value={item.value}
          label={item.label}
          showCheck={false}
        >
          <Text
            size='sm'
            render={p => <span {...p} />}
            sx={t => ({
              fontWeight: t.font.medium,
              ...(item.destructive ? { color: t.color.destructive } : {}),
            })}
          >
            {item.label}
          </Text>
        </Select.Option>
      ))}
    </Select>
  );
}

export function UserProfileGeneral() {
  const { isLoaded, user } = useUser();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isLoaded && user) setRevealed(true);
  }, [isLoaded, user]);

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(6), width: '100%' })}>
      {/* Profile heading + user info card */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <Heading size='xl'>Profile</Heading>
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '12px',
            padding: t.spacing(3),
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing(3),
            overflow: 'hidden',
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
          <Box sx={() => ({ display: 'grid', flex: 1, minWidth: 0 })}>
            {/* Skeleton layer */}
            <Box
              aria-hidden
              sx={() => ({
                gridArea: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: revealed ? 0 : 1,
                filter: revealed ? 'blur(2px)' : 'blur(0)',
                transition: REVEAL_TRANSITION,
                pointerEvents: revealed ? 'none' : 'auto',
              })}
            >
              <Skeleton
                width='2.5rem'
                height='2.5rem'
                sx={t => ({ borderRadius: t.rounded.full, flexShrink: 0 })}
              />
              <Box sx={() => ({ display: 'flex', flexDirection: 'column', gap: '0.25rem' })}>
                <Skeleton
                  width={120}
                  height='0.875rem'
                />
                <Skeleton
                  width={90}
                  height='0.75rem'
                />
              </Box>
            </Box>
            {/* Content layer */}
            <Box
              sx={() => ({
                gridArea: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: revealed ? 1 : 0,
                filter: revealed ? 'blur(0)' : 'blur(2px)',
                transition: REVEAL_TRANSITION,
              })}
            >
              <Avatar
                shape='user'
                size='md'
                src={user?.avatar}
                color='#6c47ff'
              />
              <Box>
                <Text
                  size='sm'
                  sx={t => ({ fontWeight: t.font.semibold })}
                >
                  {user?.name ?? ''}
                </Text>
                <Text
                  size='xs'
                  intent='mutedForeground'
                >
                  {user?.username ?? ''}
                </Text>
              </Box>
            </Box>
          </Box>
          <Button
            variant='ghost'
            size='md'
          >
            Edit profile
          </Button>
        </Box>
      </Box>

      {/* Email */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <SectionHeader
          title='Email'
          action={
            <Button
              variant='ghost'
              size='md'
              sx={t => ({ gap: t.spacing(1) })}
            >
              Add
              <Plus
                width={12}
                height={12}
              />
            </Button>
          }
        />
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
          {!revealed ? (
            <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
              <Skeleton
                width={140}
                height='1.25rem'
              />
            </Box>
          ) : (
            user?.emails.map((email, i) => (
              <ListRow
                key={email.id}
                showDivider={i < user.emails.length - 1}
              >
                <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), flex: 1, minWidth: 0 })}>
                  <Text size='sm'>{email.address}</Text>
                  {email.isPrimary && <Badge>Primary</Badge>}
                </Box>
                <RowMenu
                  items={
                    email.isPrimary
                      ? [{ value: 'remove', label: 'Remove email address', destructive: true }]
                      : [
                          { value: 'primary', label: 'Set as primary' },
                          { value: 'remove', label: 'Remove email address', destructive: true },
                        ]
                  }
                />
              </ListRow>
            ))
          )}
        </Box>
      </Box>

      {/* Phone */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <SectionHeader
          title='Phone'
          action={
            <Button
              variant='ghost'
              size='md'
              sx={t => ({ gap: t.spacing(1) })}
            >
              Add
              <Plus
                width={12}
                height={12}
              />
            </Button>
          }
        />
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
          {!revealed ? (
            <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
              <Skeleton
                width={120}
                height='1.25rem'
              />
            </Box>
          ) : (
            user?.phones.map((phone, i) => (
              <ListRow
                key={phone.id}
                showDivider={i < user.phones.length - 1}
              >
                <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), flex: 1, minWidth: 0 })}>
                  <Text size='sm'>{phone.number}</Text>
                  {phone.isPrimary && <Badge>Primary</Badge>}
                </Box>
                <RowMenu
                  items={
                    phone.isPrimary
                      ? [{ value: 'remove', label: 'Remove phone number', destructive: true }]
                      : [
                          { value: 'primary', label: 'Set as primary' },
                          { value: 'remove', label: 'Remove phone number', destructive: true },
                        ]
                  }
                />
              </ListRow>
            ))
          )}
        </Box>
      </Box>

      {/* Connected accounts */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <SectionHeader title='Connected accounts' />
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
          {!revealed ? (
            <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
              <Skeleton
                width='2rem'
                height='2rem'
                sx={t => ({ borderRadius: t.rounded.full })}
              />
              <Skeleton
                width={100}
                height='1.25rem'
              />
            </Box>
          ) : (
            user?.connectedAccounts.map((account, i) => (
              <ListRow
                key={account.id}
                showDivider={i < user.connectedAccounts.length - 1}
              >
                <Box
                  sx={t => ({
                    width: '32px',
                    height: '32px',
                    borderRadius: t.rounded.full,
                    background: t.color.muted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  })}
                >
                  <Text
                    size='xs'
                    sx={t => ({ fontWeight: t.font.medium })}
                    render={p => <span {...p} />}
                  >
                    {account.provider[0]}
                  </Text>
                </Box>
                <Box sx={() => ({ flex: 1, minWidth: 0 })}>
                  <Text
                    size='sm'
                    sx={t => ({ fontWeight: t.font.medium })}
                  >
                    {account.provider}
                  </Text>
                  {account.email && (
                    <Text
                      size='xs'
                      intent='mutedForeground'
                    >
                      {account.email}
                    </Text>
                  )}
                </Box>
                {account.connected ? (
                  <RowMenu
                    items={[{ value: 'disconnect', label: `Disconnect ${account.provider}`, destructive: true }]}
                  />
                ) : (
                  <Button
                    variant='ghost'
                    size='md'
                  >
                    Connect
                  </Button>
                )}
              </ListRow>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}
