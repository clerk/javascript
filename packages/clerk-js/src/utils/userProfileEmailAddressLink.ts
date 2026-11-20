import type { EmailAddressLinkStatus } from '@clerk/shared/internal/clerk-js/queryParams';
import { toEmailAddressLinkStatus } from '@clerk/shared/internal/clerk-js/queryParams';
import { hasUrlInFragment, mergeFragmentIntoUrl, trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
import type { RoutingStrategy } from '@clerk/shared/types';

/**
 * Returns the `__clerk_status` of `url` when `url` is the `verify` page that a `<UserProfile />` email address
 * verification link redirects to, for a `<UserProfile />` mounted with these routing options. Returns `null` for
 * any other page or status.
 */
export function getUserProfileEmailAddressLinkStatus(
  { routing, path }: { routing?: RoutingStrategy; path?: string } = {},
  url: URL = new URL(window.location.href),
): EmailAddressLinkStatus | null {
  const status = toEmailAddressLinkStatus(url.searchParams.get('__clerk_status'));
  if (!status) {
    return null;
  }

  const pathRouting = routing === 'path' || (!routing && !!path);
  const verifyPath = pathRouting ? `${trimTrailingSlash(path ?? '')}/verify` : '/verify';
  const routedPath = pathRouting
    ? mergeFragmentIntoUrl(url).pathname
    : hasUrlInFragment(url)
      ? new URL(url.hash.substring(1), url.origin).pathname
      : '/';

  return trimTrailingSlash(routedPath) === verifyPath ? status : null;
}
