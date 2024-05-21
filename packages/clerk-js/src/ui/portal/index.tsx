import type { RoutingOptions } from '@clerk/types';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import { PRESERVED_QUERYSTRING_PARAMS } from '../../core/constants';
import { clerkErrorPathRouterMissingPath } from '../../core/errors';
import { normalizeRoutingOptions } from '../../utils/normalizeRoutingOptions';
import { ComponentContext } from '../contexts';
import { HashRouter, PathRouter, VirtualRouter } from '../router';
import type { AvailableComponentCtx } from '../types';

type PortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
  node: HTMLDivElement;
  component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
  // Aligning this with props attributes of ComponentControls
  props?: PropsType & RoutingOptions;
} & Pick<CtxType, 'componentName'>;

export class Portal<CtxType extends AvailableComponentCtx> extends React.PureComponent<PortalProps<CtxType>> {
  render() {
    const { props, component, componentName, node } = this.props;
    const normalizedProps = { ...props, ...normalizeRoutingOptions({ routing: props?.routing, path: props?.path }) };

    const el = (
      <ComponentContext.Provider value={{ componentName: componentName, ...normalizedProps } as CtxType}>
        <Suspense fallback={''}>
          {React.createElement(component, normalizedProps as PortalProps<CtxType>['props'])}
        </Suspense>
      </ComponentContext.Provider>
    );

    if (normalizedProps?.routing === 'path') {
      if (!normalizedProps?.path) {
        clerkErrorPathRouterMissingPath(componentName);
      }

      return ReactDOM.createPortal(
        <PathRouter
          preservedParams={PRESERVED_QUERYSTRING_PARAMS}
          basePath={normalizedProps.path}
        >
          {el}
        </PathRouter>,
        node,
      );
    }

    return ReactDOM.createPortal(<HashRouter preservedParams={PRESERVED_QUERYSTRING_PARAMS}>{el}</HashRouter>, node);
  }
}

type VirtualBodyRootPortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
  component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
  props?: PropsType;
  startPath: string;
} & Pick<CtxType, 'componentName'>;

export class VirtualBodyRootPortal<CtxType extends AvailableComponentCtx> extends React.PureComponent<
  VirtualBodyRootPortalProps<CtxType>
> {
  private elRef = document.createElement('div');

  componentDidMount() {
    document.body.appendChild(this.elRef);
  }

  componentWillUnmount() {
    document.body.removeChild(this.elRef);
  }

  render() {
    const { props, startPath, component, componentName } = this.props;

    return ReactDOM.createPortal(
      <VirtualRouter startPath={startPath}>
        <ComponentContext.Provider value={{ componentName: componentName, ...props } as CtxType}>
          <Suspense fallback={''}>{React.createElement(component, props as PortalProps<CtxType>['props'])}</Suspense>
        </ComponentContext.Provider>
      </VirtualRouter>,
      this.elRef,
    );
  }
}
