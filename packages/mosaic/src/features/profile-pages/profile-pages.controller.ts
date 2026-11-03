import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';

export function useProfilePagesController(
  initialPage: string,
  pageIds: readonly string[] | undefined,
  routing: MosaicLocationOptions,
) {
  const firstPage = pageIds?.[0];
  const fallbackPage = pageIds && firstPage !== undefined && !pageIds.includes(initialPage) ? firstPage : initialPage;
  const { route, go } = useRouterScope(Object.fromEntries((pageIds ?? [initialPage]).map(id => [id, id])), {
    ...routing,
    notFound: fallbackPage,
  });

  return { activePage: route, onPageChange: go };
}
