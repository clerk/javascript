import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import { pageSegment } from './profile-pages.layout';

const NO_PAGE = '';

export function useProfilePagesController(pageIds: readonly string[], options: MosaicLocationOptions) {
  const { route, go } = useRouterScope(Object.fromEntries(pageIds.map(id => [id, pageSegment(id)])), {
    ...options,
    root: pageIds[0] ?? NO_PAGE,
  });

  return { activePage: route, onPageChange: go };
}
