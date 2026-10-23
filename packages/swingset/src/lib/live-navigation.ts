import { getSidebarGroups } from '@/lib/registry';
import { getSidebarCategories, type SidebarEntry } from '@/lib/sidebar-navigation';
import type { StoryStatus, WipSubstatus } from '@/lib/types';

export type LiveSidebarEntry = SidebarEntry & {
  href: string;
  status?: StoryStatus;
  substatus?: WipSubstatus;
};

type LiveSidebarGroup = {
  group: string;
  groupSlug: string;
  categories: Array<{ category: string; components: LiveSidebarEntry[] }>;
};

const livePages = new Set([
  '/user-profile/user-profile',
  '/user-profile/user-profile-profile-panel',
  '/user-profile/user-profile-security-panel',
  '/user-profile/user-profile-api-keys-panel',
  '/user-profile/user-profile-profile-section',
  '/user-profile/user-profile-email-section',
  '/user-profile/user-profile-phone-section',
  '/user-profile/user-profile-password-section',
  '/user-profile/user-profile-active-devices-section',
  '/user-profile/user-profile-mfa-section',
  '/user-profile/user-profile-connected-accounts-section',
  '/user-profile/user-profile-enterprise-accounts-section',
  '/user-profile/user-profile-danger-section',
  '/organization-profile/organization-profile',
  '/organization-profile/organization-profile-general-panel',
  '/organization-profile/organization-profile-members-panel',
  '/organization-profile/organization-profile-api-keys-panel',
  '/organization-profile/organization-profile-profile-section',
  '/organization-profile/organization-profile-danger-section',
  '/user-profile/user-profile-passkeys-section',
  '/user-profile/user-profile-web3wallets-section',
  '/misc/api-keys-table',
  '/misc/reverification',
  '/user-button/user-button',
]);

const inventoriedGroups = new Set(['User Profile', 'Organization Profile']);
const inventoriedCategories = new Set(['Panels', 'Sections']);

const LIVE_TODO_PREFIX = '/live/todo';

export function getLiveSidebarGroups(): LiveSidebarGroup[] {
  const liveGroups: LiveSidebarGroup[] = [];

  for (const { group, groupSlug, components } of getSidebarGroups()) {
    const categories: LiveSidebarGroup['categories'] = [];

    for (const { category, components: categoryComponents } of getSidebarCategories(components)) {
      const liveComponents: LiveSidebarEntry[] = [];

      for (const component of categoryComponents) {
        const path = `/${groupSlug}/${component.componentSlug}`;
        if (livePages.has(path)) {
          liveComponents.push({
            ...component,
            href: `/live${path}`,
            status: component.mod.meta.status,
            substatus: component.mod.meta.substatus,
          });
        } else if (inventoriedGroups.has(group) && inventoriedCategories.has(category)) {
          liveComponents.push({ ...component, href: `${LIVE_TODO_PREFIX}${path}`, status: 'todo' });
        }
      }

      if (liveComponents.length > 0) {
        categories.push({ category, components: liveComponents });
      }
    }

    if (categories.length > 0) {
      liveGroups.push({ group, groupSlug, categories });
    }
  }

  return liveGroups;
}

const liveEntries = getLiveSidebarGroups().flatMap(({ categories }) =>
  categories.flatMap(({ components }) => components),
);

export function findLiveEntry(pathname: string): LiveSidebarEntry | undefined {
  return liveEntries.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}
