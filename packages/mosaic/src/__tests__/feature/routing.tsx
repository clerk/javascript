import type { ReactNode } from 'react';

import { MosaicRoutingScope } from '../../routing/routing-scope';
import type { MosaicRoutingMode } from '../../routing/use-mosaic-location';
import { useRouterScope } from '../../routing/use-router';

const routes = { root: '' } as const;

export function InRoutingScope({
  path,
  routing = 'virtual',
  children,
}: {
  path: string;
  routing?: MosaicRoutingMode;
  children: ReactNode;
}) {
  const { scope } = useRouterScope(routes, { routing, path, root: 'root' });
  return <MosaicRoutingScope scope={scope}>{children}</MosaicRoutingScope>;
}
