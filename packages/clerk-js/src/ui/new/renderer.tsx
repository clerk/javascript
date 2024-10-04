import { ClerkInstanceContext, OptionsContext } from '@clerk/shared/react';
import type { ClerkHostRouter } from '@clerk/shared/router';
import { ClerkHostRouterContext } from '@clerk/shared/router';
import type { ClerkOptions, LoadedClerk } from '@clerk/types';
//@ts-ignore - This is treated as a string export by Webpack
import stylesheetURL from '@clerk/ui/styles.css';
import type { ElementType, ReactNode } from 'react';
import { createElement, lazy } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';

import type { ComponentDefinition } from './types';

const ROOT_ELEMENT_ID = 'clerk-components-new';

export function wrapperInit({
  clerk,
  options,
  router,
}: {
  clerk: LoadedClerk;
  options: ClerkOptions;
  router: ClerkHostRouter;
}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ClerkInstanceContext.Provider value={{ value: clerk }}>
        <OptionsContext.Provider value={options}>
          <ClerkHostRouterContext.Provider value={router}>{children}</ClerkHostRouterContext.Provider>
        </OptionsContext.Provider>
      </ClerkInstanceContext.Provider>
    );
  };
}

// Initializes the react renderer
export function init({ wrapper }: { wrapper: ElementType }) {
  const renderedComponents = new Map<HTMLElement, [ElementType, Record<string, any>]>();
  let rootElement = document.getElementById(ROOT_ELEMENT_ID);

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'clerk-components');
    document.body.appendChild(rootElement);

    const stylesheet = document.createElement('link');
    stylesheet.href = stylesheetURL;
    stylesheet.rel = 'stylesheet';
    // Add as first stylesheet so that application styles take precedence over our styles.
    document.head.prepend(stylesheet);
  }

  const root = createRoot(rootElement);

  // (re-)renders the render wrapper, rendering any components present in the `renderedComponents` map.
  // React's render function retains state, so it's safe to call multiple times as additional components are mounted and unmounted.
  function render() {
    root.render(
      createElement(
        wrapper,
        null,
        Array.from(renderedComponents.entries()).map(([node, [element, props]]) =>
          createPortal(createElement(element, props), node),
        ),
      ),
    );
  }

  function mount(element: ElementType, props: any, node: HTMLElement) {
    renderedComponents.set(node, [element, props]);
    render();
  }

  function unmount(node: HTMLElement) {
    if (!renderedComponents.has(node)) {
      return;
    }

    renderedComponents.delete(node);
    render();
  }

  function createElementFromComponentDefinition(componentDefinition: ComponentDefinition) {
    return lazy(componentDefinition.load);
  }

  return {
    mount,
    unmount,
    createElementFromComponentDefinition,
  };
}
