import type { RoutingOptions } from '@clerk/types';

import { errorThrower } from '../errors/errorThrower';
import { noPathProvidedError } from '../errors/messages';

export function useRoutingProps<T extends RoutingOptions>(
  componentName: string,
  props: T,
  routingOptions?: RoutingOptions,
): T {
  const path = routingOptions?.path || props.path;
  if (!path && !props.routing) {
    errorThrower.throw(noPathProvidedError(componentName));
  }

  if (props.path) {
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
