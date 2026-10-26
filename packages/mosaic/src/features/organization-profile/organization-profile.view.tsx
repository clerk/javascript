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

export interface OrganizationProfileViewProps extends Omit<ProfileRootProps, 'children' | 'value' | 'onValueChange'> {
  label?: string;
  activePage: OrganizationProfilePageId | (string & {});
  pages: OrganizationProfilePages;
  customPages?: readonly CustomOrganizationProfilePage[];
  pageOrder?: readonly (OrganizationProfilePageId | (string & {}))[];
  onPageChange: (page: OrganizationProfilePageId | (string & {})) => void;
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
    const resolvedEntry = entries.find(entry => entry.id === activePage) ?? firstPage;
    const resolvedPage = resolvedEntry?.id ?? 'general';

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
                    glyph={ORGANIZATION_PROFILE_PAGE_ICONS[entry.id]}
                    size='sm'
                  />
                )
              }
            >
              {entry.custom ? entry.custom.label : m.pages[entry.id]}
            </Profile.NavItem>
          ))}
        </Profile.Nav>
        <Profile.Content
          pageTitle={resolvedEntry?.custom ? resolvedEntry.custom.label : resolvedEntry && m.pages[resolvedEntry.id]}
        >
          {entries.map(entry => (
            <Profile.ContentPanel
              key={entry.id}
              value={entry.id}
            >
              {entry.custom ? entry.custom.content : pages[entry.id]}
            </Profile.ContentPanel>
          ))}
        </Profile.Content>
      </Profile.Root>
    );
  },
);
