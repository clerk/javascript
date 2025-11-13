import { buildErrorThrower } from '@clerk/shared/error';
import type { RoutingOptions } from '@clerk/shared/types';
import type { ComputedRef, MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';

import { incompatibleRoutingWithPathProvidedError, noPathProvidedError } from '../errors/messages';

const errorThrower = buildErrorThrower({ packageName: '@clerk/nuxt' });

export function useRoutingProps<T extends RoutingOptions>(
  componentName: string,
  props: T,
  routingOptions?: MaybeRefOrGetter<RoutingOptions>,
): ComputedRef<T> {
  const path = computed(() => props.path || toValue(routingOptions)?.path);
  const routing = computed(() => props.routing || toValue(routingOptions)?.routing || 'path');

  return computed(() => {
    if (routing.value === 'path') {
      if (!path.value) {
        return errorThrower.throw(noPathProvidedError(componentName));
      }

      return {
        ...toValue(routingOptions),
        ...props,
        routing: 'path',
      };
    }

    if (props.path) {
      return errorThrower.throw(incompatibleRoutingWithPathProvidedError(componentName));
    }

    return {
      ...toValue(routingOptions),
      ...props,
      path: undefined,
    };
  });
}
