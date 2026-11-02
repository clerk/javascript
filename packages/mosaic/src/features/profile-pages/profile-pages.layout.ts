import { logger } from '@clerk/shared/logger';

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
