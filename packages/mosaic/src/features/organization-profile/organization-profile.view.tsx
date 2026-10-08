import { logger } from '@clerk/shared/logger';
import React from 'react';

import { Icon } from '../../components/icon';
import type { ProfileRootProps } from '../../components/profile';
import { Profile } from '../../components/profile';
import { useMessages } from '../../localization';
import {
  getAvailableOrganizationProfilePages,
  ORGANIZATION_PROFILE_PAGE_ICONS,
  resolveOrganizationProfilePages,
} from './organization-profile.layout';
import type {
  CustomOrganizationProfilePage,
  OrganizationProfilePageId,
  OrganizationProfilePages,
} from './organization-profile.types';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel.view';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';
import { OrganizationProfilePlaceholderPanelView } from './organization-profile-placeholder-panel.view';

export interface OrganizationProfileViewProps extends Omit<ProfileRootProps, 'children' | 'value' | 'onValueChange'> {
  label?: string;
  activePage: OrganizationProfilePageId | (string & {});
  pages: OrganizationProfilePages;
  customPages?: readonly CustomOrganizationProfilePage[];
  pageOrder?: readonly (OrganizationProfilePageId | (string & {}))[];
  onPageChange: (page: OrganizationProfilePageId | (string & {})) => void;
}

function BuiltInPage({
  id,
  pages,
}: {
  id: OrganizationProfilePageId;
  pages: OrganizationProfilePages;
}): React.ReactNode {
  if (id === 'general') {
    return <OrganizationProfileGeneralPanelView {...pages.general} />;
  }
  if (id === 'apiKeys') {
    return pages.apiKeys;
  }
  if (id === 'members') {
    return pages.members?.members || pages.members?.invitations || pages.members?.requests ? (
      <OrganizationProfileMembersPanelView {...pages.members} />
    ) : (
      <OrganizationProfilePlaceholderPanelView page={id} />
    );
  }
  return <OrganizationProfilePlaceholderPanelView page={id} />;
}

export const OrganizationProfileView = React.forwardRef<HTMLDivElement, OrganizationProfileViewProps>(
  function OrganizationProfileView({ activePage, pages, customPages, pageOrder, onPageChange, label, ...rest }, ref) {
    const m = useMessages('organizationProfile');
    const entries = resolveOrganizationProfilePages(
      getAvailableOrganizationProfilePages(pages),
      customPages,
      pageOrder,
    );
    const firstPage = entries[0];
    if (!firstPage) {
      logger.warnOnce('[Clerk] OrganizationProfile has no pages to show.');
    }
    const resolvedPage = entries.some(entry => entry.id === activePage) ? activePage : (firstPage?.id ?? 'general');

    return (
      <Profile.Root
        ref={ref}
        value={resolvedPage}
        onValueChange={onPageChange}
        {...rest}
      >
        <Profile.Title>{label ?? m.label}</Profile.Title>
        <Profile.Nav>
          {entries.map(entry => (
            <Profile.NavItem
              key={entry.id}
              value={entry.id}
              icon={
                entry.custom ? (
                  entry.custom.icon
                ) : (
                  <Icon
                    name={ORGANIZATION_PROFILE_PAGE_ICONS[entry.id]}
                    size='sm'
                  />
                )
              }
            >
              {entry.custom ? entry.custom.label : m.pages[entry.id]}
            </Profile.NavItem>
          ))}
        </Profile.Nav>
        <Profile.Content>
          {entries.map(entry => (
            <Profile.ContentPanel
              key={entry.id}
              value={entry.id}
            >
              {entry.custom ? (
                entry.custom.content
              ) : (
                <BuiltInPage
                  id={entry.id}
                  pages={pages}
                />
              )}
            </Profile.ContentPanel>
          ))}
        </Profile.Content>
      </Profile.Root>
    );
  },
);
