import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import { PRESERVED_QUERYSTRING_PARAMS } from '../../core/constants';
import { clerkErrorPathRouterMissingPath } from '../../core/errors';
import { ComponentContext } from '../contexts';
import { HashRouter, PathRouter } from '../router';
import type { AvailableComponentCtx } from '../types';

type PortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
  node: HTMLDivElement;
  component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
  // Aligning this with props attributes of ComponentControls
  props?: PropsType & { path?: string; routing?: string };
} & Pick<CtxType, 'componentName'>;

export default class Portal<CtxType extends AvailableComponentCtx> extends React.PureComponent<PortalProps<CtxType>> {
  render(): React.ReactPortal {
    const { props, component, componentName, node } = this.props;

    const el = (
      <ComponentContext.Provider value={{ componentName: componentName, ...props } as CtxType}>
        <Suspense fallback={''}>{React.createElement(component, props)}</Suspense>
      </ComponentContext.Provider>
    );

    if (props?.routing === 'path') {
      if (!props?.path) {
        clerkErrorPathRouterMissingPath(componentName);
      }

      return ReactDOM.createPortal(
        <PathRouter
          preservedParams={PRESERVED_QUERYSTRING_PARAMS}
          basePath={props.path}
        >
          {el}
        </PathRouter>,
        node,
      );
    }

    return ReactDOM.createPortal(<HashRouter preservedParams={PRESERVED_QUERYSTRING_PARAMS}>{el}</HashRouter>, node);
  }
}
