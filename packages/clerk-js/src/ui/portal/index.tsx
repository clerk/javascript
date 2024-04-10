import type { RoutingOptions } from '@clerk/types';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import { PRESERVED_QUERYSTRING_PARAMS } from '../../core/constants';
import { clerkErrorPathRouterMissingPath } from '../../core/errors';
import { buildVirtualRouterUrl } from '../../utils';
import { normalizeRoutingOptions } from '../../utils/authPropHelpers';
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
  render(): React.ReactPortal {
    const { props, component, componentName, node } = this.props;
    const normalizedProps = { ...props, ...normalizeRoutingOptions({ routing: props?.routing, path: props?.path }) };

    const el = (
      <ComponentContext.Provider value={{ componentName: componentName, ...normalizedProps } as CtxType}>
        <Suspense fallback={''}>
          {React.createElement(component, normalizedProps as PortalProps<CtxType>['props'])}
        </Suspense>
      </ComponentContext.Provider>
    );

    if (componentName === 'OneTap') {
      console.log('virtual for node', node);
      console.log(normalizedProps.routing);

      return ReactDOM.createPortal(
        <VirtualRouter startPath={buildVirtualRouterUrl({ base: '/one-tap', path: '' })}>{el}</VirtualRouter>,
        node,
      );
    }

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
