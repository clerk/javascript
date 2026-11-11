import type { SegmentParts } from '../../routing/location';
import type { MosaicLocationOptions } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';
import { pageSegment } from './profile-pages.layout';

export interface ProfilePagesOptions extends MosaicLocationOptions {
  notFound?: (parts: SegmentParts) => string | undefined;
}

const NO_PAGE = '';

// Page ids that are still unknown, because the model they come from is loading, give no active
// page and leave the location alone, so a page written before the profile was ready is still
// there when it is.
export function useProfilePagesController(pageIds: readonly string[] | undefined, options: ProfilePagesOptions) {
  const ids = pageIds ?? [];
  const { route, go } = useRouterScope(Object.fromEntries(ids.map(id => [id, pageSegment(id)])), {
    ...options,
    root: ids[0] ?? NO_PAGE,
    ready: pageIds !== undefined,
  });

  return { activePage: route, onPageChange: go };
}
