import type { RoutingOptions } from '@clerk/shared/types';
import type { ComputedRef, MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';

import { errorThrower } from '../errors/errorThrower';
import { incompatibleRoutingWithPathProvidedError, noPathProvidedError } from '../errors/messages';

export function useRoutingProps<T extends RoutingOptions>(
  componentName: string,
  props: MaybeRefOrGetter<T>,
  routingOptions?: MaybeRefOrGetter<RoutingOptions>,
): ComputedRef<T> {
  return computed(() => {
    const propsValue = toValue(props) || {};
    const routingOptionsValue = toValue(routingOptions);

    const path = propsValue.path || routingOptionsValue?.path;
    const routing = propsValue.routing || routingOptionsValue?.routing || 'path';

    if (routing === 'path') {
      if (!path) {
        return errorThrower.throw(noPathProvidedError(componentName));
      }

      return {
        ...routingOptionsValue,
        ...propsValue,
        routing: 'path',
      };
    }

    if (propsValue.path) {
      return errorThrower.throw(incompatibleRoutingWithPathProvidedError(componentName));
    }

    return {
      ...routingOptionsValue,
      ...propsValue,
      path: undefined,
    };
  });
}
