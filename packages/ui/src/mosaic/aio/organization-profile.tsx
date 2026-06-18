import { useEffect, useState } from 'react';

import { Building, Close, Code, CreditCard, LogoMark, Users } from '../../icons';
import { Avatar } from '../components/avatar';
import { Box } from '../components/box';
import { Skeleton } from '../components/skeleton';
import { Text } from '../components/text';
import { useOrganization } from '../mock/use-organization';
import { OrganizationProfileApiKeys } from '../panels/organization-profile-api-keys';
import { OrganizationProfileBilling } from '../panels/organization-profile-billing';
import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import { OrganizationProfileMembers } from '../panels/organization-profile-members';

type NavId = 'general' | 'members' | 'billing' | 'api-keys';

const NAV: Array<{ id: NavId; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
  { id: 'general', label: 'General', Icon: Building },
  { id: 'members', label: 'Members', Icon: Users },
  { id: 'billing', label: 'Billing', Icon: CreditCard },
  { id: 'api-keys', label: 'API Keys', Icon: Code },
];

export function OrganizationProfile() {
  const [activeNav, setActiveNav] = useState<NavId>('members');
  const { isLoaded, organization } = useOrganization();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isLoaded && organization) {
      setRevealed(true);
    }
  }, [isLoaded, organization]);

  return (
    <Box
      sx={t => ({
        display: 'flex',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow:
          '0px 5px 15px 0px rgba(0,0,0,0.08), 0px 15px 35px -5px rgba(0,0,0,0.20), 0px 0px 0px 1px rgba(0,0,0,0.06)',
        background: `light-dark(white, oklch(0.145 0 0))`,
        width: '100%',
        minHeight: '625px',
      })}
    >
      {/* Sidebar */}
      <Box
        sx={t => ({
          width: '220px',
          flexShrink: 0,
          borderRight: `1px solid ${t.color.border}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        })}
      >
        {/* Navigation */}
        <Box
          sx={t => ({
            display: 'flex',
            flexDirection: 'column',
            gap: t.spacing(3),
            padding: t.spacing(5),
          })}
        >
          {/* Org header */}
          <Box sx={t => ({ paddingInline: t.spacing(3), position: 'relative', height: '1.25rem' })}>
            {/* Skeleton layer */}
            <Box
              aria-hidden
              sx={() => ({
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                paddingInline: '0.625rem',
                opacity: revealed ? 0 : 1,
                filter: revealed ? 'blur(2px)' : 'blur(0)',
                transition: 'opacity 400ms ease-in-out, filter 400ms ease-in-out',
                pointerEvents: revealed ? 'none' : 'auto',
              })}
            >
              <Skeleton
                width='1.25rem'
                height='1.25rem'
                sx={t => ({ borderRadius: t.rounded.lg, flexShrink: 0 })}
              />
              <Skeleton
                width={100}
                height='0.875rem'
              />
            </Box>
            {/* Content layer */}
            <Box
              sx={() => ({
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                paddingInline: '0.625rem',
                opacity: revealed ? 1 : 0,
                filter: revealed ? 'blur(0)' : 'blur(2px)',
                transition: 'opacity 400ms ease-in-out, filter 400ms ease-in-out',
              })}
            >
              <Avatar
                shape='org'
                size='sm'
                src={isLoaded && organization ? organization.avatar : undefined}
                color='#6c47ff'
              />
              <Text
                size='sm'
                sx={t => ({
                  fontWeight: t.font.semibold,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                })}
                render={p => <span {...p} />}
              >
                {isLoaded && organization ? organization.name : ''}
              </Text>
            </Box>
          </Box>

          {/* Nav items */}
          <Box
            sx={t => ({
              display: 'flex',
              flexDirection: 'column',
              gap: t.spacing(0.5),
            })}
          >
            {NAV.map(({ id, label, Icon }) => {
              const isActive = activeNav === id;
              return (
                <Box
                  key={id}
                  render={p => <button {...p} />}
                  onClick={() => setActiveNav(id)}
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing(3),
                    width: '100%',
                    height: '32px',
                    paddingInline: t.spacing(3),
                    paddingBlock: t.spacing(1.5),
                    borderRadius: t.rounded.md,
                    background: isActive ? t.color.muted : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isActive ? 'inherit' : t.color.mutedForeground,
                    '&:hover': { background: t.color.muted },
                  })}
                >
                  <Icon
                    width={16}
                    height={16}
                  />
                  <Text
                    size='sm'
                    sx={t => ({ fontWeight: t.font.medium, color: 'inherit' })}
                    render={p => <span {...p} />}
                  >
                    {label}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Clerk branding footer */}
        <Box
          sx={t => ({
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing(2),
            paddingInline: t.spacing(6),
            paddingBlock: t.spacing(4),
            height: '48px',
          })}
        >
          <Text
            size='xs'
            intent='mutedForeground'
            render={p => <span {...p} />}
          >
            Secured by
          </Text>
          <LogoMark height={14} />
        </Box>
      </Box>

      {/* Content area */}
      <Box
        sx={t => ({
          flex: 1,
          minWidth: 0,
          position: 'relative',
          overflowY: 'auto',
          paddingInline: t.spacing(8),
          paddingTop: t.spacing(13),
          paddingBottom: t.spacing(8),
        })}
      >
        {/* Close button */}
        <Box
          render={p => <button {...p} />}
          sx={t => ({
            position: 'absolute',
            top: t.spacing(3),
            right: t.spacing(3),
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t.rounded.md,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: t.color.mutedForeground,
            '&:hover': { background: t.color.muted },
          })}
        >
          <Close
            width={20}
            height={20}
          />
        </Box>

        {/* Active panel */}
        {activeNav === 'general' && <OrganizationProfileGeneral />}
        {activeNav === 'members' && <OrganizationProfileMembers />}
        {activeNav === 'billing' && <OrganizationProfileBilling />}
        {activeNav === 'api-keys' && <OrganizationProfileApiKeys />}
      </Box>
    </Box>
  );
}
