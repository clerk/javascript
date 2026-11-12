import { logger } from '@clerk/shared/logger';

const BUILT_IN_SEGMENTS: Readonly<Record<string, string>> = {
  apiKeys: 'api-keys',
  'organization/apiKeys': 'organization/api-keys',
};

export function pageSegment(id: string): string {
  const segment = Object.hasOwn(BUILT_IN_SEGMENTS, id) ? BUILT_IN_SEGMENTS[id] : undefined;
  return segment ?? id;
}

export function pageParts(page: string | undefined): string[] {
  return page === undefined ? [] : pageSegment(page).split('/').filter(Boolean);
}

// A custom page's path becomes a route literal and is compared raw elsewhere, so it has to be
// exactly its own segment: decoded, without a leading colon, and without the slashes the codec
// would strip.
export function withRoutablePaths<Page extends { path: string }>(
  pages: readonly Page[],
  builtInIds: readonly string[],
): Page[] {
  const shadowed = new Map(builtInIds.filter(id => pageSegment(id) !== id).map(id => [pageSegment(id), id]));
  return pages.filter(page => {
    const builtIn = shadowed.get(page.path);
    if (builtIn !== undefined) {
      logger.warnOnce(
        `[Clerk] Custom page path "${page.path}" is the segment of the built-in "${builtIn}" page, so the page is left out. Use "${builtIn}" as the path to replace that page.`,
      );
      return false;
    }
    if (page.path === '') {
      logger.warnOnce('[Clerk] A custom page needs a path, so a page without one is left out.');
      return false;
    }
    const parts = pageParts(page.path);
    if (parts.join('/') !== page.path) {
      logger.warnOnce(
        `[Clerk] Custom page path "${page.path}" has a leading, trailing or doubled slash, so the page is left out. Use "${parts.join('/')}".`,
      );
      return false;
    }
    if (parts.some(part => part.startsWith(':'))) {
      logger.warnOnce(`[Clerk] Custom page path "${page.path}" cannot start with a colon, so the page is left out.`);
      return false;
    }
    if (parts.some(part => part === '.' || part === '..')) {
      logger.warnOnce(
        `[Clerk] Custom page path "${page.path}" has a "." or ".." part, which a URL resolves away, so the page is left out.`,
      );
      return false;
    }
    if (parts.some(part => part.includes('%'))) {
      logger.warnOnce(
        `[Clerk] Custom page path "${page.path}" contains percent-encoding, so the page is left out. Write it as plain text.`,
      );
      return false;
    }
    return true;
  });
}

export function withUniquePaths<Page extends { path: string }>(pages: readonly Page[]): Page[] {
  const seen = new Set<string>();
  return pages.filter(page => {
    if (seen.has(page.path)) {
      logger.warnOnce(
        `[Clerk] Duplicate path "${page.path}" found in custom pages. This may cause unexpected behavior.`,
      );
      return false;
    }
    seen.add(page.path);
    return true;
  });
}
