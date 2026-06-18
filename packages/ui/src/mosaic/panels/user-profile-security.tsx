import { useEffect, useState } from 'react';

import { Mobile, Plus, ThreeDotsCircle } from '../../icons';
import { Badge } from '../components/badge';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import { useUser } from '../mock/use-user';

const REVEAL_TRANSITION = 'opacity 400ms ease-in-out, filter 400ms ease-in-out';

export function UserProfileSecurity() {
  const { isLoaded, user } = useUser();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isLoaded && user) setRevealed(true);
  }, [isLoaded, user]);

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(6), width: '100%' })}>
      {/* Password */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(1) })}>
        <Box
          sx={t => ({ display: 'flex', alignItems: 'center', paddingInline: t.spacing(3), paddingRight: t.spacing(2) })}
        >
          <Heading
            size='sm'
            sx={() => ({ flex: 1 })}
          >
            Password
          </Heading>
          <Button
            variant='ghost'
            size='md'
          >
            Update
          </Button>
        </Box>
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '6px',
            padding: t.spacing(3),
            display: 'grid',
            overflow: 'hidden',
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
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
            <Skeleton
              width={140}
              height='0.875rem'
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
              size='sm'
              sx={t => ({ fontWeight: t.font.medium })}
            >
              •••••••••••••••••
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Two-step verification */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <Box
          sx={t => ({ display: 'flex', alignItems: 'center', paddingInline: t.spacing(3), paddingRight: t.spacing(2) })}
        >
          <Heading
            size='sm'
            sx={() => ({ flex: 1 })}
          >
            Two-step verification
          </Heading>
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
        </Box>
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
          {!revealed ? (
            <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center', gap: t.spacing(1.5) })}>
              <Skeleton
                width={16}
                height={16}
                sx={t => ({ borderRadius: t.rounded.sm })}
              />
              <Skeleton
                width={120}
                height='1.25rem'
              />
            </Box>
          ) : (
            <>
              <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5), padding: t.spacing(3) })}>
                <Mobile
                  width={16}
                  height={16}
                  style={{ flexShrink: 0, color: 'var(--cl-color-muted-foreground)' }}
                />
                <Text
                  size='sm'
                  sx={t => ({ fontWeight: t.font.medium })}
                >
                  SMS Code
                </Text>
                <Text
                  size='sm'
                  intent='mutedForeground'
                  render={p => <span {...p} />}
                >
                  +1 (313) 555-4001
                </Text>
                <Badge>Default</Badge>
              </Box>
              <Box sx={t => ({ height: '1px', background: t.color.border, marginInline: t.spacing(3) })} />
              <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(1.5), padding: t.spacing(3) })}>
                <ThreeDotsCircle
                  width={16}
                  height={16}
                  style={{ flexShrink: 0, color: 'var(--cl-color-muted-foreground)' }}
                />
                <Text
                  size='sm'
                  sx={t => ({ fontWeight: t.font.medium })}
                >
                  Backup codes
                </Text>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Active devices */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <Box sx={t => ({ paddingInline: t.spacing(3) })}>
          <Heading size='sm'>Active devices</Heading>
        </Box>
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          })}
        >
          {/* Table header */}
          <Box
            sx={t => ({
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              background: t.color.muted,
              borderBottom: `1px solid ${t.color.border}`,
            })}
          >
            {['Date', 'Location', 'Activity'].map(col => (
              <Box
                key={col}
                sx={t => ({ paddingBlock: t.spacing(1.5), paddingInline: t.spacing(3) })}
              >
                <Text
                  size='xs'
                  intent='mutedForeground'
                  sx={t => ({ fontWeight: t.font.medium })}
                >
                  {col}
                </Text>
              </Box>
            ))}
          </Box>
          {/* Device rows */}
          {!revealed ? (
            <Box sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' })}>
              <Box sx={t => ({ padding: t.spacing(3), display: 'flex', flexDirection: 'column', gap: t.spacing(0.5) })}>
                <Skeleton
                  width={100}
                  height='0.875rem'
                />
                <Skeleton
                  width={120}
                  height='0.75rem'
                />
              </Box>
              <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center' })}>
                <Skeleton
                  width={100}
                  height='0.75rem'
                />
              </Box>
              <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center' })}>
                <Skeleton
                  width={110}
                  height='0.75rem'
                />
              </Box>
            </Box>
          ) : (
            user?.devices.map(device => (
              <Box
                key={device.id}
                sx={t => ({
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  borderTop: `1px solid ${t.color.border}`,
                })}
              >
                <Box sx={t => ({ padding: t.spacing(3) })}>
                  <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
                    <Text
                      size='sm'
                      sx={t => ({ fontWeight: t.font.medium })}
                    >
                      {device.name}
                    </Text>
                    {device.isCurrent && <Badge>This device</Badge>}
                  </Box>
                  <Text
                    size='xs'
                    intent='mutedForeground'
                  >
                    {device.browser}
                  </Text>
                </Box>
                <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center' })}>
                  <Text
                    size='xs'
                    intent='mutedForeground'
                  >
                    {device.location}
                  </Text>
                </Box>
                <Box sx={t => ({ padding: t.spacing(3), display: 'flex', alignItems: 'center' })}>
                  <Text
                    size='xs'
                    intent='mutedForeground'
                  >
                    {device.lastActive}
                  </Text>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Danger zone */}
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <Box sx={t => ({ paddingInline: t.spacing(3) })}>
          <Heading size='sm'>Danger zone</Heading>
        </Box>
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            padding: t.spacing(3),
            background: 'light-dark(white, oklch(0.145 0 0))',
          })}
        >
          <Button
            variant='ghost'
            intent='destructive'
            size='md'
          >
            Delete account
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
