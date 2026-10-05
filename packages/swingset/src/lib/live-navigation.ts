import { getSidebarGroups } from '@/lib/registry';
import { getSidebarCategories, type SidebarEntry } from '@/lib/sidebar-navigation';

type LiveSidebarEntry = SidebarEntry & { href: string };

type LiveSidebarGroup = {
  group: string;
  groupSlug: string;
  categories: Array<{ category: string; components: LiveSidebarEntry[] }>;
};

const liveRoutes = new Map([
  ['/user-profile/user-profile-api-keys-panel', '/live/api-keys'],
  ['/user-profile/user-profile-account-section', '/live/account-section'],
  ['/user-profile/user-profile-password-section', '/live/password'],
  ['/user-profile/user-profile-connected-accounts-section', '/live/connected-accounts'],
  ['/user-profile/user-profile-enterprise-accounts-section', '/live/enterprise-accounts'],
  ['/user-profile/user-profile-delete-section', '/live/delete-account'],
  ['/organization-profile/organization-profile-danger-section', '/live/organization-danger'],
  ['/reverification/reverification', '/live/reverification'],
]);

export function getLiveSidebarGroups(): LiveSidebarGroup[] {
  const liveGroups: LiveSidebarGroup[] = [];

  for (const { group, groupSlug, components } of getSidebarGroups()) {
    const categories: LiveSidebarGroup['categories'] = [];

    for (const { category, components: categoryComponents } of getSidebarCategories(components)) {
      const liveComponents: LiveSidebarEntry[] = [];

      for (const component of categoryComponents) {
        const href = liveRoutes.get(`/${groupSlug}/${component.componentSlug}`);
        if (href) {
          liveComponents.push({ ...component, href });
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
