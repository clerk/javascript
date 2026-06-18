import { useState } from 'react';

import { Close, Code, CreditCard, LogoMark, ShieldCheck, UserCircle } from '../../icons';
import { Box } from '../components/box';
import { Text } from '../components/text';
import { useUser } from '../mock/use-user';
import { OrganizationProfileApiKeys } from '../panels/organization-profile-api-keys';
import { OrganizationProfileBilling } from '../panels/organization-profile-billing';
import { UserProfileGeneral } from '../panels/user-profile-general';
import { UserProfileSecurity } from '../panels/user-profile-security';

type NavId = 'profile' | 'security' | 'billing' | 'api-keys';

const NAV: Array<{ id: NavId; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
  { id: 'profile', label: 'Profile', Icon: UserCircle },
  { id: 'security', label: 'Security', Icon: ShieldCheck },
  { id: 'billing', label: 'Billing', Icon: CreditCard },
  { id: 'api-keys', label: 'API Keys', Icon: Code },
];

export function UserProfile() {
  const [activeNav, setActiveNav] = useState<NavId>('profile');
  const { isLoaded, user } = useUser();

  return (
    <Box
      sx={() => ({
        display: 'flex',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow:
          '0px 5px 15px 0px rgba(0,0,0,0.08), 0px 15px 35px -5px rgba(0,0,0,0.20), 0px 0px 0px 1px rgba(0,0,0,0.06)',
        background: 'light-dark(white, oklch(0.145 0 0))',
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
            gap: t.spacing(0.5),
            padding: t.spacing(4),
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
            width: '24px',
            height: '24px',
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
            width={16}
            height={16}
          />
        </Box>

        {/* Active panel */}
        {activeNav === 'profile' && <UserProfileGeneral />}
        {activeNav === 'security' && <UserProfileSecurity />}
        {activeNav === 'billing' && <OrganizationProfileBilling plan={isLoaded && user ? user.plan : undefined} />}
        {activeNav === 'api-keys' && <OrganizationProfileApiKeys />}
      </Box>
    </Box>
  );
}
