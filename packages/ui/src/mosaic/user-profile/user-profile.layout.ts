import type { IconName } from '../icons/registry';
import { applyOrder } from '../utils/apply-order';
import type { CustomProfilePage, UserProfilePageId, UserProfilePages } from './user-profile.types';

/** The built-in pages in the order the profile lists them before a consumer reorders anything. */
export const USER_PROFILE_PAGE_IDS: readonly UserProfilePageId[] = ['account', 'security', 'billing', 'apiKeys'];

export const USER_PROFILE_PAGE_ICONS: Record<UserProfilePageId, IconName> = {
  account: 'user-circle',
  security: 'shield-check',
  billing: 'credit-card',
  apiKeys: 'code',
};

/** One row of the navigation: a built-in page by id, or a page of the consumer's own. */
export type UserProfileNavEntry =
  | { id: UserProfilePageId; custom?: undefined }
  | { id: string; custom: CustomProfilePage };

/** The built-in pages this instance was given content for. `account` is always among them. */
export function getAvailableUserProfilePages(pages: UserProfilePages): UserProfilePageId[] {
  return USER_PROFILE_PAGE_IDS.filter(id => pages[id] !== undefined);
}

/**
 * The navigation, in order: the built-ins the instance shows, then the consumer's pages, with
 * `order` moving any of them by id (a custom page's id is its `path`). Same rule as the
 * UserButton's menu — see `applyOrder`.
 */
export function resolveUserProfilePages(
  builtIn: readonly UserProfilePageId[],
  customPages: readonly CustomProfilePage[] = [],
  order?: readonly string[],
): UserProfileNavEntry[] {
  const entries: UserProfileNavEntry[] = [
    ...builtIn.map(id => ({ id })),
    ...customPages.map(page => ({ id: page.path, custom: page })),
  ];
  return applyOrder(order, entries, entry => entry.id);
}
