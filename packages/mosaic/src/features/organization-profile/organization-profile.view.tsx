import React from 'react';

import { Badge } from '../../components/badge';
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
  CustomProfilePage,
  OrganizationProfilePageId,
  OrganizationProfilePages,
} from './organization-profile.types';
import { OrganizationProfileApiKeysPanelView } from './organization-profile-api-keys-panel.view';
import { OrganizationProfileBillingPanelView } from './organization-profile-billing-panel.view';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel.view';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';
import { OrganizationProfileSecurityPanelView } from './organization-profile-security-panel.view';

export interface OrganizationProfileViewProps extends Omit<ProfileRootProps, 'children' | 'value' | 'onValueChange'> {
  /** Names the surface, and the dialog it opens in. Defaults to the `organizationProfile.label` message. */
  label?: string;
  /** The open page: a built-in page's id, or a custom page's `path`. */
  activePage: OrganizationProfilePageId | (string & {});
  pages: OrganizationProfilePages;
  /** Pages of the consumer's own, added to the navigation after the built-ins. */
  customPages?: readonly CustomProfilePage[];
  /**
   * The order the navigation runs in, by id: a built-in page's id, or a custom page's `path`. Ids
   * left out keep their default place behind the ones named.
   */
  pageOrder?: readonly (OrganizationProfilePageId | (string & {}))[];
  onPageChange: (page: OrganizationProfilePageId | (string & {})) => void;
}

function BuiltInPage({
  id,
  pages,
}: {
  id: OrganizationProfilePageId;
  pages: OrganizationProfilePages;
}): React.ReactElement | null {
  switch (id) {
    case 'general':
      return <OrganizationProfileGeneralPanelView {...pages.general} />;
    case 'members':
      return pages.members ? <OrganizationProfileMembersPanelView {...pages.members} /> : null;
    case 'security':
      return pages.security ? <OrganizationProfileSecurityPanelView {...pages.security} /> : null;
    case 'billing':
      return pages.billing ? <OrganizationProfileBillingPanelView {...pages.billing} /> : null;
    case 'apiKeys':
      return pages.apiKeys ? <OrganizationProfileApiKeysPanelView {...pages.apiKeys} /> : null;
  }
}

/**
 * The organization profile as a `Profile`: the built-in pages the instance has content for, the
 * consumer's own pages after them, in the order asked for. An `activePage` the navigation does
 * not list falls back to the first one, so a page turned off by the environment cannot leave the
 * surface blank.
 */
export const OrganizationProfileView = React.forwardRef<HTMLDivElement, OrganizationProfileViewProps>(
  function OrganizationProfileView({ activePage, pages, customPages, pageOrder, onPageChange, label, ...rest }, ref) {
    const m = useMessages('organizationProfile');
    const entries = resolveOrganizationProfilePages(
      getAvailableOrganizationProfilePages(pages),
      customPages,
      pageOrder,
    );
    const resolvedPage = entries.some(entry => entry.id === activePage) ? activePage : entries[0].id;
    // Mirrors the count on the Members page's own Requests tab, so pending requests are visible from
    // the navigation.
    const pendingRequestCount = pages.members?.requests?.length ?? 0;

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
              badge={
                !entry.custom && entry.id === 'members' && pendingRequestCount > 0 ? (
                  <Badge color='neutral'>{pendingRequestCount}</Badge>
                ) : undefined
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
