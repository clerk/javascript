import React from 'react';

import { Icon } from '../components/icon';
import type { ProfileRootProps } from '../components/profile';
import { Profile } from '../components/profile';
import { getAvailableUserProfilePages, resolveUserProfilePages, USER_PROFILE_PAGE_ICONS } from './user-profile.layout';
import { userProfileBase as m } from './user-profile.messages';
import type { CustomProfilePage, UserProfilePageId, UserProfilePages } from './user-profile.types';
import { UserProfileApiKeysPanelView } from './user-profile-api-keys-panel.view';
import { UserProfileBillingPanelView } from './user-profile-billing-panel.view';
import { UserProfileProfilePanelView } from './user-profile-profile-panel.view';
import { UserProfileSecurityPanelView } from './user-profile-security-panel.view';

export interface UserProfileViewProps extends Omit<ProfileRootProps, 'children' | 'value' | 'onValueChange'> {
  /** Names the surface, and the dialog it opens in. Defaults to English; pass a localized string once one is available. */
  label?: string;
  /** The open page: a built-in page's id, or a custom page's `path`. */
  activePage: UserProfilePageId | (string & {});
  pages: UserProfilePages;
  /** Pages of the consumer's own, added to the navigation after the built-ins. */
  customPages?: readonly CustomProfilePage[];
  /**
   * The order the navigation runs in, by id: a built-in page's id, or a custom page's `path`. Ids
   * left out keep their default place behind the ones named.
   */
  pageOrder?: readonly (UserProfilePageId | (string & {}))[];
  onPageChange: (page: UserProfilePageId | (string & {})) => void;
}

function BuiltInPage({ id, pages }: { id: UserProfilePageId; pages: UserProfilePages }): React.ReactElement | null {
  switch (id) {
    case 'account':
      return <UserProfileProfilePanelView {...pages.account} />;
    case 'security':
      return pages.security ? <UserProfileSecurityPanelView {...pages.security} /> : null;
    case 'billing':
      return pages.billing ? <UserProfileBillingPanelView {...pages.billing} /> : null;
    case 'apiKeys':
      return pages.apiKeys ? <UserProfileApiKeysPanelView {...pages.apiKeys} /> : null;
  }
}

/**
 * The user profile as a `Profile`: the built-in pages the instance has content for, the
 * consumer's own pages after them, in the order asked for. An `activePage` the navigation does
 * not list falls back to the first one, so a page turned off by the environment cannot leave the
 * surface blank.
 */
export const UserProfileView = React.forwardRef<HTMLDivElement, UserProfileViewProps>(function UserProfileView(
  { activePage, pages, customPages, pageOrder, onPageChange, label = m.label, ...rest },
  ref,
) {
  const entries = resolveUserProfilePages(getAvailableUserProfilePages(pages), customPages, pageOrder);
  const resolvedPage = entries.some(entry => entry.id === activePage) ? activePage : entries[0].id;

  return (
    <Profile.Root
      ref={ref}
      value={resolvedPage}
      onValueChange={onPageChange}
      {...rest}
    >
      <Profile.Title>{label}</Profile.Title>
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
                  name={USER_PROFILE_PAGE_ICONS[entry.id]}
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
          <Profile.TabPanel
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
          </Profile.TabPanel>
        ))}
      </Profile.Content>
    </Profile.Root>
  );
});
