import { useMemo } from 'react';

import type { MosaicLocation } from './location';
import { createVirtualLocation } from './virtual-location';
import { useVirtualWrite } from './virtual-store';

export type MosaicLocationOptions = { routing: 'virtual'; path?: string };

export interface RoutingProps {
  /** Where the component's pages live: `virtual` keeps them in memory. Defaults per component. */
  routing?: MosaicLocationOptions['routing'];
  /** The base the component's pages are nested under. Defaults per component. */
  path?: string;
}

export function useMosaicLocation(options: MosaicLocationOptions): MosaicLocation {
  const write = useVirtualWrite();
  const path = options.path ?? '/';
  return useMemo(() => createVirtualLocation(path, write), [path, write]);
}
