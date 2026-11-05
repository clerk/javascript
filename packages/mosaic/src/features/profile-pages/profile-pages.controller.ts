import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import { pageSegment } from './profile-pages.layout';

const NO_PAGE = '';

export function useProfilePagesController(pageIds: readonly string[], routing: MosaicLocationOptions) {
  const rootPage = pageIds[0] ?? NO_PAGE;
  const { route, go } = useRouterScope(
    Object.fromEntries(pageIds.map(id => [id, id === rootPage ? '' : pageSegment(id)])),
    { ...routing, notFound: rootPage },
  );

  return { activePage: route, onPageChange: go };
}
