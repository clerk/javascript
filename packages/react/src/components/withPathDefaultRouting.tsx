import type { RoutingOptions } from '@clerk/types';
import type { ComponentProps, ComponentType } from 'react';
import React from 'react';

import { errorThrower } from '../errors/errorThrower';

export function withPathDefaultRouting<T, P extends RoutingOptions>(Component: T): T {
  const BaseComponent = Component as ComponentType<RoutingOptions>;
  const HOC = (props: ComponentProps<ComponentType<P>>) => {
    if (!props.path && !props.routing) {
      errorThrower.throw('You must specify path and routing props');
    }
    if (props.path) {
      return (
        <BaseComponent
          {...props}
          routing='path'
        />
      );
    }

    return <BaseComponent {...props} />;
  };

  HOC.displayName = BaseComponent.displayName;

  return Object.assign(HOC, {
    ...BaseComponent,
  }) as T;
}
