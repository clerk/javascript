import type { IconComponent } from '../../icons/glyph';
import { Building } from '../../icons/glyphs/building';
import { CreditCard } from '../../icons/glyphs/credit-card';
import { Key } from '../../icons/glyphs/key';
import { SecurityLockSquare } from '../../icons/glyphs/security-lock-square';
import { Users } from '../../icons/glyphs/users';
import { applyOrder } from '../../utils/apply-order';
import { withUniquePaths } from '../profile-pages/profile-pages.layout';
import type {
  CustomOrganizationProfilePage,
  OrganizationProfilePageId,
  OrganizationProfilePageListOptions,
  OrganizationProfilePages,
} from './organization-profile.types';

export const ORGANIZATION_PROFILE_PAGE_IDS: readonly OrganizationProfilePageId[] = [
  'general',
  'members',
  'security',
  'billing',
  'apiKeys',
];

export const ORGANIZATION_PROFILE_PAGE_ICONS: Record<OrganizationProfilePageId, IconComponent> = {
  general: Building,
  members: Users,
  security: SecurityLockSquare,
  billing: CreditCard,
  apiKeys: Key,
};

export type OrganizationProfileNavEntry =
  | { id: OrganizationProfilePageId; custom?: undefined }
  | { id: string; custom: CustomOrganizationProfilePage };

export function getAvailableOrganizationProfilePages(pages: OrganizationProfilePages): OrganizationProfilePageId[] {
  return ORGANIZATION_PROFILE_PAGE_IDS.filter(id => {
    const content = pages[id];
    return content !== undefined && content !== null && content !== false;
  });
}

export function resolveOrganizationProfilePages(
  builtIn: readonly OrganizationProfilePageId[],
  customPages: readonly CustomOrganizationProfilePage[] = [],
  order?: readonly string[],
): OrganizationProfileNavEntry[] {
  const uniqueCustomPages = withUniquePaths(customPages);
  const customById = new Map(uniqueCustomPages.map(page => [page.path, page]));
  const builtInIds = new Set<string>(builtIn);
  const entries: OrganizationProfileNavEntry[] = [
    ...builtIn.map((id): OrganizationProfileNavEntry => {
      const custom = customById.get(id);
      return custom ? { id, custom } : { id };
    }),
    ...uniqueCustomPages.filter(page => !builtInIds.has(page.path)).map(page => ({ id: page.path, custom: page })),
  ];
  return applyOrder(order, entries, entry => entry.id);
}

export function organizationProfileNavEntries({
  pages,
  customPages,
  pageOrder,
}: OrganizationProfilePageListOptions): OrganizationProfileNavEntry[] {
  return resolveOrganizationProfilePages(getAvailableOrganizationProfilePages(pages), customPages, pageOrder);
}

export function organizationProfilePageIds(options: OrganizationProfilePageListOptions): string[] {
  return organizationProfileNavEntries(options).map(entry => entry.id);
}
