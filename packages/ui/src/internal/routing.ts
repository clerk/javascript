import type { RoutingStrategy } from '@clerk/shared/types';

export type WithInternalRouting<T> =
  | (Omit<T, 'routing' | 'path'> & { path: string | undefined; routing?: Extract<RoutingStrategy, 'path'> })
  | (Omit<T, 'routing' | 'path'> & { path?: never; routing?: Extract<RoutingStrategy, 'hash' | 'virtual'> });
