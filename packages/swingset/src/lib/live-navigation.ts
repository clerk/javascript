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

const liveRoutes = new Map([
  ['/user-profile/user-profile-api-keys-panel', '/live/api-keys'],
  ['/user-profile/user-profile-profile-section', '/live/profile'],
  ['/user-profile/user-profile-email-section', '/live/email'],
  ['/user-profile/user-profile-phone-section', '/live/phone'],
  ['/user-profile/user-profile-password-section', '/live/password'],
  ['/user-profile/user-profile-active-devices-section', '/live/active-devices'],
  ['/user-profile/user-profile-mfa-section', '/live/mfa'],
  ['/user-profile/user-profile-connected-accounts-section', '/live/connected-accounts'],
  ['/user-profile/user-profile-enterprise-accounts-section', '/live/enterprise-accounts'],
  ['/user-profile/user-profile-danger-section', '/live/user-danger'],
  ['/organization-profile/organization-profile-general-panel', '/live/organization-general'],
  ['/organization-profile/organization-profile-members-panel', '/live/organization-members'],
  ['/organization-profile/organization-profile-danger-section', '/live/organization-danger'],
  ['/user-profile/user-profile-passkeys-section', '/live/passkeys'],
  ['/user-profile/user-profile-web3wallets-section', '/live/web3-wallets'],
  ['/reverification/reverification', '/live/reverification'],
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
        const key = `/${groupSlug}/${component.componentSlug}`;
        const href = liveRoutes.get(key);
        if (href) {
          liveComponents.push({
            ...component,
            href,
            status: component.mod.meta.status,
            substatus: component.mod.meta.substatus,
          });
        } else if (inventoriedGroups.has(group) && inventoriedCategories.has(category)) {
          liveComponents.push({ ...component, href: `${LIVE_TODO_PREFIX}${key}`, status: 'todo' });
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
