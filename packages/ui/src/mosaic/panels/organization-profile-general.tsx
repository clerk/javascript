import { useEffect, useState } from 'react';

import { Plus } from '../../icons';
import { Destructive } from '../block/destructive';
import { Avatar } from '../components/avatar';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import { useOrganization } from '../mock/use-organization';

function formatOrgId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 11)}...${id.slice(-6)}`;
}

const REVEAL = {
  duration: '400ms',
  ease: 'ease-in-out',
  blur: '2px',
} as const;

const revealTransition = `opacity ${REVEAL.duration} ${REVEAL.ease}, filter ${REVEAL.duration} ${REVEAL.ease}`;

/**
 * Grid-stacked crossfade: both children sit in the same grid cell so the
 * taller one sizes the parent. Skeleton fades out + blurs while content
 * fades in + un-blurs.
 */
function RevealContainer({
  revealed,
  skeleton,
  children,
}: {
  revealed: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box sx={() => ({ display: 'grid' })}>
      {/* Skeleton — row 1 / col 1 */}
      <Box
        aria-hidden
        sx={() => ({
          gridArea: '1 / 1',
          opacity: revealed ? 0 : 1,
          filter: revealed ? `blur(${REVEAL.blur})` : 'blur(0)',
          transition: revealTransition,
          pointerEvents: revealed ? 'none' : 'auto',
        })}
      >
        {skeleton}
      </Box>
      {/* Content — row 1 / col 1 */}
      <Box
        sx={() => ({
          gridArea: '1 / 1',
          opacity: revealed ? 1 : 0,
          filter: revealed ? 'blur(0)' : `blur(${REVEAL.blur})`,
          transition: revealTransition,
        })}
      >
        {children}
      </Box>
    </Box>
  );
}

export function OrganizationProfileGeneral() {
  const { isLoaded, organization, membership } = useOrganization();

  const [revealed, setRevealed] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leavePending, setLeavePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    if (isLoaded && organization) {
      setRevealed(true);
    }
  }, [isLoaded, organization]);

  const handleLeave = async () => {
    setLeavePending(true);
    await membership?.destroy();
    setLeavePending(false);
    setLeaveOpen(false);
  };

  const handleDelete = async () => {
    setDeletePending(true);
    await organization?.destroy();
    setDeletePending(false);
    setDeleteOpen(false);
  };

  return (
    <Box
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        gap: t.spacing(6),
        width: '100%',
      })}
    >
      <Heading
        size='xl'
        sx={t => ({ paddingInline: t.spacing(4) })}
      >
        General
      </Heading>

      {/* Org info card */}
      <Box
        sx={t => ({
          border: `1px solid ${t.color.border}`,
          borderRadius: '8px',
          padding: t.spacing(4),
          background: `light-dark(white, oklch(0.145 0 0))`,
        })}
      >
        <RevealContainer
          revealed={revealed}
          skeleton={
            <Box sx={t => ({ display: 'flex', gap: t.spacing(3), alignItems: 'center' })}>
              <Skeleton
                width='2.5rem'
                height='2.5rem'
                sx={t => ({ borderRadius: t.rounded.lg, flexShrink: 0 })}
              />
              <Box sx={() => ({ display: 'flex', flexDirection: 'column', gap: '0.25rem' })}>
                <Skeleton
                  width={100}
                  height='0.875rem'
                />
                <Skeleton
                  width={140}
                  height='0.75rem'
                />
              </Box>
            </Box>
          }
        >
          <Box sx={t => ({ display: 'flex', gap: t.spacing(3), alignItems: 'center' })}>
            <Avatar
              shape='org'
              size='md'
              src={isLoaded && organization ? organization.avatar : undefined}
              color='#6c47ff'
            />
            <Box>
              <Text
                size='sm'
                sx={t => ({ fontWeight: t.font.semibold })}
              >
                {isLoaded && organization ? organization.name : ''}
              </Text>
              <Text
                size='xs'
                intent='mutedForeground'
              >
                {isLoaded && organization ? formatOrgId(organization.id) : ''}
              </Text>
            </Box>
          </Box>
        </RevealContainer>
      </Box>

      {/* Allowed email domains */}
      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          gap: t.spacing(2.5),
        })}
      >
        {/* Section header — always visible */}
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing(2),
            paddingInline: t.spacing(3),
            paddingRight: t.spacing(1),
          })}
        >
          <Box
            sx={t => ({
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minWidth: 0,
            })}
          >
            <Heading size='sm'>Allowed email domains</Heading>
            <Text
              size='xs'
              intent='mutedForeground'
            >
              Allow users to join automatically or request access via verified email domain.
            </Text>
          </Box>
          <Button
            variant='ghost'
            size='md'
            intent='primary'
            sx={t => ({
              gap: t.spacing(1),
              flexShrink: 0,
            })}
          >
            Add
            <Plus
              width={12}
              height={12}
            />
          </Button>
        </Box>

        {/* Domain list — fetched data */}
        <RevealContainer
          revealed={revealed}
          skeleton={
            <Box
              sx={t => ({
                border: `1px solid ${t.color.border}`,
                borderRadius: '8px',
                height: '2.75rem',
                padding: t.spacing(3),
                display: 'flex',
                alignItems: 'center',
                background: `light-dark(white, oklch(0.145 0 0))`,
              })}
            >
              <Skeleton
                width={120}
                height='0.875rem'
              />
            </Box>
          }
        >
          <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2.5) })}>
            {isLoaded &&
              organization?.emailDomains.map(({ id, domain }) => (
                <Box
                  key={id}
                  sx={t => ({
                    border: `1px solid ${t.color.border}`,
                    borderRadius: '8px',
                    height: '2.75rem',
                    padding: t.spacing(3),
                    display: 'flex',
                    alignItems: 'center',
                    background: `light-dark(white, oklch(0.145 0 0))`,
                  })}
                >
                  <Text
                    size='sm'
                    sx={() => ({ flex: 1, minWidth: 0 })}
                  >
                    {domain}
                  </Text>
                </Box>
              ))}
          </Box>
        </RevealContainer>
      </Box>

      {/* Danger zone */}
      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          gap: t.spacing(2.5),
        })}
      >
        <Box sx={t => ({ paddingInline: t.spacing(3) })}>
          <Heading size='sm'>Danger zone</Heading>
        </Box>
        <Box
          sx={t => ({
            border: `1px solid ${t.color.border}`,
            borderRadius: '8px',
            padding: t.spacing(3),
            background: `light-dark(white, oklch(0.145 0 0))`,
          })}
        >
          <RevealContainer
            revealed={revealed}
            skeleton={
              <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(3) })}>
                <Skeleton
                  width={140}
                  height='0.875rem'
                />
                <Box sx={t => ({ height: '1px', background: t.color.border })} />
                <Skeleton
                  width={150}
                  height='0.875rem'
                />
              </Box>
            }
          >
            {isLoaded && organization ? (
              <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(3) })}>
                <Destructive
                  trigger={props => (
                    <Button
                      variant='ghost'
                      intent='destructive'
                      {...props}
                      sx={() => ({
                        padding: 0,
                        height: 'auto',
                        fontWeight: 500,
                      })}
                    >
                      Leave organization
                    </Button>
                  )}
                  open={leaveOpen}
                  onOpenChange={setLeaveOpen}
                  title='Leave organization'
                  description='Are you sure you want to leave this organization? You will lose access to this organization and its applications.'
                  resourceName={organization.name}
                  primaryActionLabel='Leave organization'
                  onDelete={handleLeave}
                  isDeleting={leavePending}
                />
                <Box
                  sx={t => ({
                    height: '1px',
                    background: t.color.border,
                  })}
                />
                <Destructive
                  trigger={props => (
                    <Button
                      variant='ghost'
                      intent='destructive'
                      {...props}
                      sx={() => ({
                        padding: 0,
                        height: 'auto',
                        fontWeight: 500,
                      })}
                    >
                      Delete organization
                    </Button>
                  )}
                  open={deleteOpen}
                  onOpenChange={setDeleteOpen}
                  title='Delete organization'
                  description='Are you sure you want to delete this organization?'
                  resourceName={organization.name}
                  primaryActionLabel='Delete organization'
                  onDelete={handleDelete}
                  isDeleting={deletePending}
                />
              </Box>
            ) : (
              <Box />
            )}
          </RevealContainer>
        </Box>
      </Box>
    </Box>
  );
}
