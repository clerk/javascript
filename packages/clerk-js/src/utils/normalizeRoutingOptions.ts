import type { RoutingOptions, RoutingStrategy } from '@clerk/shared/types';

import { clerkInvalidRoutingStrategy } from '../core/errors';

export const normalizeRoutingOptions = ({
  routing,
  path,
}: {
  routing?: RoutingStrategy;
  path?: string;
}): RoutingOptions => {
  if (!!path && !routing) {
    return { routing: 'path', path };
  }

  if (routing !== 'path' && !!path) {
    return clerkInvalidRoutingStrategy(routing);
  }

  return { routing, path } as RoutingOptions;
};
