import { logger } from '@clerk/shared/logger';
import React from 'react';

import { Icon } from '../../components/icon';
import { useMessages } from '../../localization';
import type { ProfilePage, ProfilePagesViewProps } from '../profile-pages/profile-pages.view';
import { ProfilePagesView } from '../profile-pages/profile-pages.view';
import { ORGANIZATION_PROFILE_PAGE_ICONS, organizationProfileNavEntries } from './organization-profile.layout';
import type { OrganizationProfilePageId, OrganizationProfilePageListOptions } from './organization-profile.types';

export interface OrganizationProfileViewProps
  extends
    Omit<ProfilePagesViewProps, 'label' | 'groups' | 'activePage' | 'onPageChange'>,
    OrganizationProfilePageListOptions {
  label?: string;
  activePage: OrganizationProfilePageId | (string & {});
  onPageChange: (page: OrganizationProfilePageId | (string & {})) => void;
}

export const OrganizationProfileView = React.forwardRef<HTMLDivElement, OrganizationProfileViewProps>(
  function OrganizationProfileView({ pages, customPages, pageOrder, label, ...rest }, ref) {
    const m = useMessages('organizationProfile');
    const list = organizationProfilePageList({ pages, customPages, pageOrder }, m.pages);
    if (list.length === 0) {
      logger.warnOnce('[Clerk] OrganizationProfile has no pages to show.');
    }

    return (
      <ProfilePagesView
        ref={ref}
        label={label ?? m.label}
        groups={[{ pages: list }]}
        {...rest}
      />
    );
  },
);

/** The organization's navigation, in order: the built-ins it was given content for, then the consumer's pages. */
export function organizationProfilePageList(
  options: OrganizationProfilePageListOptions,
  labels: Record<OrganizationProfilePageId, string>,
): ProfilePage[] {
  return organizationProfileNavEntries(options).map(entry =>
    entry.custom
      ? { id: entry.id, label: entry.custom.label, icon: entry.custom.icon, content: entry.custom.content }
      : {
          id: entry.id,
          label: labels[entry.id],
          icon: (
            <Icon
              glyph={ORGANIZATION_PROFILE_PAGE_ICONS[entry.id]}
              size='sm'
            />
          ),
          content: options.pages[entry.id],
        },
  );
}
