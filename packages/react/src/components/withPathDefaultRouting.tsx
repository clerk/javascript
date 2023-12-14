import type { RoutingOptions } from '@clerk/types';
import type { ComponentProps, ComponentType } from 'react';
import React from 'react';

import { errorThrower } from '../errors/errorThrower';
import { noPathProvidedError } from '../errors/messages';

export function withPathDefaultRouting<T, P extends RoutingOptions>(Component: T, componentName: string): T {
  const BaseComponent = Component as ComponentType<RoutingOptions>;
  const HOC = (props: ComponentProps<ComponentType<P>>) => {
    if (!props.path && !props.routing) {
      errorThrower.throw(noPathProvidedError(componentName));
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
