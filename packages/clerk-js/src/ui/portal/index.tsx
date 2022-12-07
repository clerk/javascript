import { RoutingStrategy } from '@clerk/types';
import React from 'react';
import ReactDOM from 'react-dom';

import { clerkErrorPathRouterMissingPath } from '../../core/errors';
import { normalizeRoutingOptions } from '../common';
import { ComponentContext } from '../contexts';
import { HashRouter, PathRouter } from '../router';
import type { AvailableComponentCtx } from '../types';

type PortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
  node: HTMLDivElement;
  component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
  props: PropsType & { path?: string; routing?: RoutingStrategy };
  preservedParams?: string[];
} & Pick<CtxType, 'componentName'>;

export default class Portal<CtxType extends AvailableComponentCtx> extends React.PureComponent<PortalProps<CtxType>> {
  render(): React.ReactPortal {
    const { props, component, componentName, node, preservedParams } = this.props;

    const normalizedProps = { ...props, ...normalizeRoutingOptions({ routing: props.routing, path: props.path }) };

    const el = (
      <ComponentContext.Provider value={{ componentName: componentName, ...normalizedProps } as CtxType}>
        {React.createElement(component, normalizedProps)}
      </ComponentContext.Provider>
    );

    if (componentName === 'UserButton') {
      return ReactDOM.createPortal(el, node);
    }

    if (normalizedProps.routing === 'path') {
      if (!normalizedProps.path) {
        clerkErrorPathRouterMissingPath(componentName);
      }

      return ReactDOM.createPortal(
        <PathRouter
          preservedParams={preservedParams}
          basePath={normalizedProps.path}
        >
          {el}
        </PathRouter>,
        node,
      );
    }

    return ReactDOM.createPortal(<HashRouter preservedParams={preservedParams}>{el}</HashRouter>, node);
  }
}
