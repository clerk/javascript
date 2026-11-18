'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { MosaicLocationOptions } from './use-mosaic-location';

const scopeBrand: unique symbol = Symbol('MosaicRoutingScope');

export interface RoutingScope {
  readonly [scopeBrand]: MosaicLocationOptions;
}

export function createRoutingScope(options: MosaicLocationOptions): RoutingScope {
  return { [scopeBrand]: options };
}

export interface MosaicRoutingScopeProps {
  scope: RoutingScope;
  children: ReactNode;
}

const MosaicRoutingScopeContext = createContext<RoutingScope | undefined>(undefined);

export function MosaicRoutingScope({ scope, children }: MosaicRoutingScopeProps) {
  return <MosaicRoutingScopeContext.Provider value={scope}>{children}</MosaicRoutingScopeContext.Provider>;
}

export function useInheritedScope(): MosaicLocationOptions | undefined {
  return useContext(MosaicRoutingScopeContext)?.[scopeBrand];
}
