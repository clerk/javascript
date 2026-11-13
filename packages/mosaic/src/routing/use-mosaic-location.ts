import { useMemo } from 'react';

import type { MosaicLocation } from './location';
import { createVirtualLocation } from './virtual-location';
import { useVirtualActions } from './virtual-store';

export type MosaicLocationOptions = { routing: 'virtual'; path?: string };

export interface RoutingProps {
  /** Where the component's pages live: `virtual` keeps them in memory. Defaults per component. */
  routing?: MosaicLocationOptions['routing'];
  /** The base the component's pages are nested under. Defaults per component. */
  path?: string;
}

export function useMosaicLocation(options: MosaicLocationOptions): MosaicLocation {
  const actions = useVirtualActions();
  const path = options.path ?? '/';
  return useMemo(() => createVirtualLocation(path, actions), [path, actions]);
}
