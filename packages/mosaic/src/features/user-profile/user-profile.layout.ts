import { logger } from '@clerk/shared/logger';

import type { IconComponent } from '../../icons/glyph';
import { Code } from '../../icons/glyphs/code';
import { CreditCard } from '../../icons/glyphs/credit-card';
import { ShieldCheck } from '../../icons/glyphs/shield-check';
import { UserCircle } from '../../icons/glyphs/user-circle';
import { applyOrder } from '../../utils/apply-order';
import { organizationProfilePageIds } from '../organization-profile/organization-profile.layout';
import type { OrganizationProfilePageListOptions } from '../organization-profile/organization-profile.types';
import { withUniquePaths } from '../profile-pages/profile-pages.layout';
import type { CustomProfilePage, UserProfilePageId, UserProfilePages } from './user-profile.types';

/** The built-in pages in the order the profile lists them before a consumer reorders anything. */
export const USER_PROFILE_PAGE_IDS: readonly UserProfilePageId[] = ['account', 'security', 'billing', 'apiKeys'];

/** Sets an organization page's id apart from an account page's when the profile shows both. */
export const ORGANIZATION_PAGE_PREFIX = 'organization/';

export const USER_PROFILE_PAGE_ICONS: Record<UserProfilePageId, IconComponent> = {
  account: UserCircle,
  security: ShieldCheck,
  billing: CreditCard,
  apiKeys: Code,
};

/** One row of the navigation: a built-in page by id, or a page of the consumer's own. */
export type UserProfileNavEntry =
  | { id: UserProfilePageId; custom?: undefined }
  | { id: string; custom: CustomProfilePage };

/** The built-in pages this instance was given content for. `account` is always among them. */
export function getAvailableUserProfilePages(pages: UserProfilePages): UserProfilePageId[] {
  return USER_PROFILE_PAGE_IDS.filter(id => {
    const content = pages[id];
    return content !== undefined && content !== null && content !== false;
  });
}

/**
 * The navigation, in order: the built-ins the instance shows, then the consumer's pages, with
 * `order` moving any of them by id (a custom page's id is its `path`). A custom page given a
 * built-in's id REPLACES it, in its place — `applyOrder`'s rule, applied before the order is.
 */
export function resolveUserProfilePages(
  builtIn: readonly UserProfilePageId[],
  customPages: readonly CustomProfilePage[] = [],
  order?: readonly string[],
): UserProfileNavEntry[] {
  const uniqueCustomPages = withUniquePaths(customPages);
  const customById = new Map(uniqueCustomPages.map(page => [page.path, page]));
  const builtInIds = new Set<string>(builtIn);
  const entries: UserProfileNavEntry[] = [
    ...builtIn.map((id): UserProfileNavEntry => {
      const custom = customById.get(id);
      return custom ? { id, custom } : { id };
    }),
    ...uniqueCustomPages.filter(page => !builtInIds.has(page.path)).map(page => ({ id: page.path, custom: page })),
  ];
  return applyOrder(order, entries, entry => entry.id);
}

type UserProfilePageListOptions = {
  pages: UserProfilePages;
  customPages?: readonly CustomProfilePage[];
  pageOrder?: readonly string[];
  organization?: OrganizationProfilePageListOptions;
};

export function userProfileNavEntries({
  pages,
  customPages,
  pageOrder,
}: UserProfilePageListOptions): UserProfileNavEntry[] {
  return resolveUserProfilePages(getAvailableUserProfilePages(pages), withoutOrganizationPaths(customPages), pageOrder);
}

export function userProfilePageIds(options: UserProfilePageListOptions): string[] {
  const accountPageIds = userProfileNavEntries(options).map(entry => entry.id);
  const organizationPageIds = options.organization
    ? organizationProfilePageIds(options.organization).map(id => `${ORGANIZATION_PAGE_PREFIX}${id}`)
    : [];
  return [...accountPageIds, ...organizationPageIds];
}

function withoutOrganizationPaths(customPages: readonly CustomProfilePage[] = []): CustomProfilePage[] {
  return customPages.filter(page => {
    if (!page.path.startsWith(ORGANIZATION_PAGE_PREFIX)) {
      return true;
    }
    logger.warnOnce(
      `[Clerk] UserProfile custom page "${page.path}" uses the reserved "${ORGANIZATION_PAGE_PREFIX}" prefix and was skipped.`,
    );
    return false;
  });
}
