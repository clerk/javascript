import { logger } from '@clerk/shared/logger';

import { isLiteralPattern } from '../../routing/routes';

const BUILT_IN_SEGMENTS: Readonly<Record<string, string>> = {
  apiKeys: 'api-keys',
  'organization/apiKeys': 'organization/api-keys',
};

export function pageSegment(id: string): string {
  return BUILT_IN_SEGMENTS[id] ?? id;
}

export function pageParts(page: string | undefined): string[] {
  return page === undefined ? [] : pageSegment(page).split('/').filter(Boolean);
}

const BUILT_IN_SEGMENT_IDS = new Map(Object.entries(BUILT_IN_SEGMENTS).map(([id, segment]) => [segment, id]));

export function withRoutablePaths<Page extends { path: string }>(pages: readonly Page[]): Page[] {
  return pages.filter(page => {
    const builtIn = BUILT_IN_SEGMENT_IDS.get(page.path);
    if (builtIn !== undefined) {
      logger.warnOnce(
        `[Clerk] Custom page path "${page.path}" is the segment of the built-in "${builtIn}" page, so the page is left out. Use "${builtIn}" as the path to replace that page.`,
      );
      return false;
    }
    if (isLiteralPattern(page.path)) {
      return true;
    }
    logger.warnOnce(
      `[Clerk] Custom page path "${page.path}" cannot be a route, so the page is left out. Write it decoded, without a leading colon.`,
    );
    return false;
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
