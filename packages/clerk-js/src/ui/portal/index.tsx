import type { RoutingOptions } from '@clerk/shared/types';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import { PRESERVED_QUERYSTRING_PARAMS } from '../../core/constants';
import { clerkErrorPathRouterMissingPath } from '../../core/errors';
import { normalizeRoutingOptions } from '../../utils/normalizeRoutingOptions';
import { ComponentContextProvider } from '../contexts';
import { HashRouter, PathRouter, VirtualRouter } from '../router';
import type { AvailableComponentCtx, AvailableComponentName } from '../types';

type PortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
  node: HTMLDivElement;
  component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
  // Aligning this with props attributes of ComponentControls
  props?: PropsType & RoutingOptions;
} & { componentName: AvailableComponentName };

export function Portal<CtxType extends AvailableComponentCtx>({
  props,
  component,
  componentName,
  node,
}: PortalProps<CtxType>) {
  const normalizedProps = { ...props, ...normalizeRoutingOptions({ routing: props?.routing, path: props?.path }) };

  const el = (
    <ComponentContextProvider
      componentName={componentName}
      props={normalizedProps}
    >
      <Suspense fallback={''}>
        {React.createElement(component, normalizedProps as PortalProps<CtxType>['props'])}
      </Suspense>
    </ComponentContextProvider>
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

type VirtualBodyRootPortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
  component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
  props?: PropsType;
  startPath: string;
} & { componentName: AvailableComponentName };

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
        <ComponentContextProvider
          componentName={componentName}
          props={props ?? {}}
        >
          <Suspense fallback={''}>{React.createElement(component, props as PortalProps<CtxType>['props'])}</Suspense>
        </ComponentContextProvider>
      </VirtualRouter>,
      this.elRef,
    );
  }
}
