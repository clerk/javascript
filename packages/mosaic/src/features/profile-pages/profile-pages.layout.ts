import { logger } from '@clerk/shared/logger';

import { isLiteralPattern } from '../../routing/routes';

export function withRoutablePaths<Page extends { path: string }>(pages: readonly Page[]): Page[] {
  return pages.filter(page => {
    if (isLiteralPattern(page.path)) {
      return true;
    }
    logger.warnOnce(
      `[Clerk] Custom page path "${page.path}" is not a plain URL segment, so the page is left out. Use URL-safe characters only, without a leading colon.`,
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
