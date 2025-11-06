import type { RoutingOptions } from '@clerk/shared/types';

import { errorThrower } from '../errors/errorThrower';
import { incompatibleRoutingWithPathProvidedError, noPathProvidedError } from '../errors/messages';

export function useRoutingProps<T extends RoutingOptions>(
  componentName: string,
  props: T,
  routingOptions?: RoutingOptions,
): T {
  const path = props.path || routingOptions?.path;
  const routing = props.routing || routingOptions?.routing || 'path';

  if (routing === 'path') {
    if (!path) {
      return errorThrower.throw(noPathProvidedError(componentName));
    }

    return {
      ...routingOptions,
      ...props,
      routing: 'path',
    };
  }

  if (props.path) {
    return errorThrower.throw(incompatibleRoutingWithPathProvidedError(componentName));
  }

  return {
    ...routingOptions,
    ...props,
    path: undefined,
  };
}
