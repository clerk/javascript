import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { ClerkLogo } from '../components/clerk-logo';
import { Icon } from '../components/icon';
import { reset } from '../components/reset.styles';
import type { IconName } from '../icons/registry';
import { styles } from '../profile-page.styles';
import { mergeStyleProps, themeProps } from '../props';

export type OrganizationProfilePanelId = 'general' | 'members' | 'security' | 'billing' | 'api-keys';

const destinations: Record<OrganizationProfilePanelId, { label: string; icon: IconName }> = {
  general: { label: 'General', icon: 'building' },
  members: { label: 'Members', icon: 'users' },
  security: { label: 'Security', icon: 'shield-check' },
  billing: { label: 'Billing', icon: 'credit-card' },
  'api-keys': { label: 'API Keys', icon: 'code' },
};

export interface OrganizationProfileSidebarProps {
  activePanel: OrganizationProfilePanelId;
  panels: readonly OrganizationProfilePanelId[];
  onPanelChange: (panel: OrganizationProfilePanelId) => void;
  renderBranding?: boolean;
}

export function OrganizationProfileSidebar({
  activePanel,
  panels,
  onPanelChange,
  renderBranding = true,
}: OrganizationProfileSidebarProps): ReactElement {
  return (
    <aside {...mergeStyleProps(themeProps('organization-profile-sidebar'), stylex.props(reset.base, styles.sidebar))}>
      <nav
        aria-label='Organization profile'
        {...stylex.props(reset.base, styles.navigation)}
      >
        {panels.map(panel => {
          const destination = destinations[panel];
          const active = panel === activePanel;

          return (
            <button
              key={panel}
              aria-current={active ? 'page' : undefined}
              type='button'
              {...stylex.props(reset.base, styles.navigationItem, active && styles.navigationItemActive)}
              onClick={() => onPanelChange(panel)}
            >
              <Icon
                aria-hidden
                name={destination.icon}
                size='sm'
              />
              <span>{destination.label}</span>
            </button>
          );
        })}
      </nav>
      {renderBranding ? (
        <div {...stylex.props(reset.base, styles.branding)}>
          <span>Secured by</span>
          <a
            aria-label='Clerk'
            href='https://go.clerk.com/components'
            rel='noopener noreferrer'
            target='_blank'
            {...stylex.props(reset.base, styles.brandingLink)}
          >
            <ClerkLogo height={12} />
          </a>
        </div>
      ) : null}
    </aside>
  );
}
