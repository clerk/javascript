import type { ClerkPaginatedResponse } from '@clerk/shared/types';

export function replaceInPages<T extends { id: string }>(
  pages: (ClerkPaginatedResponse<T> | undefined)[],
  item: T,
): (ClerkPaginatedResponse<T> | undefined)[] {
  return pages.map(
    page => page && { ...page, data: page.data.map(existing => (existing.id === item.id ? item : existing)) },
  );
}
