import type { IconName } from '../../icons/registry';
import { applyOrder } from '../../utils/apply-order';
import type {
  CustomOrganizationProfilePage,
  OrganizationProfilePageId,
  OrganizationProfilePages,
} from './organization-profile.types';

export const ORGANIZATION_PROFILE_PAGE_IDS: readonly OrganizationProfilePageId[] = [
  'general',
  'members',
  'security',
  'billing',
  'apiKeys',
];

export const ORGANIZATION_PROFILE_PAGE_ICONS: Record<OrganizationProfilePageId, IconName> = {
  general: 'building',
  members: 'users',
  security: 'security-lock-square',
  billing: 'credit-card',
  apiKeys: 'key',
};

export type OrganizationProfileNavEntry =
  | { id: OrganizationProfilePageId; custom?: undefined }
  | { id: string; custom: CustomOrganizationProfilePage };

export function getAvailableOrganizationProfilePages(pages: OrganizationProfilePages): OrganizationProfilePageId[] {
  return ORGANIZATION_PROFILE_PAGE_IDS.filter(id => pages[id] !== undefined);
}

export function resolveOrganizationProfilePages(
  builtIn: readonly OrganizationProfilePageId[],
  customPages: readonly CustomOrganizationProfilePage[] = [],
  order?: readonly string[],
): OrganizationProfileNavEntry[] {
  const customById = new Map(customPages.map(page => [page.path, page]));
  const builtInIds = new Set<string>(builtIn);
  const entries: OrganizationProfileNavEntry[] = [
    ...builtIn.map((id): OrganizationProfileNavEntry => {
      const custom = customById.get(id);
      return custom ? { id, custom } : { id };
    }),
    ...customPages.filter(page => !builtInIds.has(page.path)).map(page => ({ id: page.path, custom: page })),
  ];
  return applyOrder(order, entries, entry => entry.id);
}
