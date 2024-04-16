import { useRoutingProps } from '@clerk/clerk-react/internal';
import type { RoutingOptions } from '@clerk/types';

import { useEnforceCatchAllRoute } from './useEnforceCatchAllRoute';
import { usePathnameWithoutCatchAll } from './usePathnameWithoutCatchAll';

export function useEnforceCorrectRoutingProps<T extends RoutingOptions>(componentName: string, props: T): T {
  const path = usePathnameWithoutCatchAll();
  const routingProps = useRoutingProps(componentName, props, { path });
  useEnforceCatchAllRoute(componentName, path, routingProps.routing);
  return routingProps;
}
