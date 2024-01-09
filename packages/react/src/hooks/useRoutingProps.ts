import type { RoutingOptions } from '@clerk/types';

import { errorThrower } from '../errors/errorThrower';
import { noPathProvidedError } from '../errors/messages';

export function useRoutingProps<T extends RoutingOptions>(
  componentName: string,
  props: T,
  routingOptions?: RoutingOptions,
): T {
  const path = props.path || routingOptions?.path;
  if (!path && !props.routing) {
    errorThrower.throw(noPathProvidedError(componentName));
  }

  if (props.routing && props.routing !== 'path' && routingOptions?.path && !props.path) {
    return {
      ...routingOptions,
      ...props,
      path: undefined,
    };
  }

  if (path && !props.routing) {
    return {
      ...routingOptions,
      ...props,
      routing: 'path',
    };
  }

  return {
    ...routingOptions,
    ...props,
  };
}
