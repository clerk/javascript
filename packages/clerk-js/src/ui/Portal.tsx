import { clerkErrorPathRouterMissingPath } from 'core/errors';
import React from 'react';
import ReactDOM from 'react-dom';
import { ComponentContext, ComponentContextValue } from 'ui/contexts';
import { HashRouter, PathRouter } from 'ui/router';

type PortalProps<
  CtxType extends ComponentContextValue,
  PropsType = Omit<CtxType, 'componentName'>,
> = {
  node: HTMLDivElement;
  component:
    | React.FunctionComponent<PropsType>
    | React.ComponentClass<PropsType, any>;
  props: PropsType & { path?: string; routing?: string };
  preservedParams?: string[];
} & Pick<CtxType, 'componentName'>;

export default class Portal<
  CtxType extends ComponentContextValue,
> extends React.PureComponent<PortalProps<CtxType>> {
  render(): React.ReactPortal {
    const { props, component, componentName, node, preservedParams } =
      this.props;

    const el = (
      <ComponentContext.Provider
        value={{ componentName: componentName, ...props } as CtxType}
      >
        {React.createElement(component, props)}
      </ComponentContext.Provider>
    );

    if (componentName === 'UserButton') {
      return ReactDOM.createPortal(el, node);
    }

    if (props.routing === 'path') {
      if (!props.path) {
        clerkErrorPathRouterMissingPath(componentName);
      }

      return ReactDOM.createPortal(
        <PathRouter preservedParams={preservedParams} basePath={props.path}>
          {el}
        </PathRouter>,
        node,
      );
    }

    return ReactDOM.createPortal(
      <HashRouter preservedParams={preservedParams}>{el}</HashRouter>,
      node,
    );
  }
}
