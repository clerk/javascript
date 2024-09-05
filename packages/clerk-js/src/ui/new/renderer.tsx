import { ClerkInstanceContext, OptionsContext } from '@clerk/shared/react';
import { ClerkHostRouter, ClerkHostRouterContext } from '@clerk/shared/router';
import { ClerkOptions, LoadedClerk } from '@clerk/types';
import { ElementType, createElement, lazy } from 'react';
import { createPortal } from 'react-dom';
import { Root, createRoot } from 'react-dom/client';

// TODO: don't import here
import '@clerk/ui/styles.css';

const ROOT_ELEMENT_ID = 'clerk-components-new';

// Initializes the react renderer
export function init({
  router,
  clerk,
  options,
}: {
  router: ClerkHostRouter;
  clerk: LoadedClerk;
  options: ClerkOptions;
}) {
  let renderedComponents = new Map<HTMLElement, [ElementType, Record<string, any>]>();
  let rootElement = document.getElementById(ROOT_ELEMENT_ID);
  let root: Root;

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'clerk-components');
    document.body.appendChild(rootElement);
  }

  root = createRoot(rootElement);

  function ClerkComponentContainer() {
    return (
      <ClerkInstanceContext.Provider value={{ value: clerk }}>
        <OptionsContext.Provider value={options}>
          <ClerkHostRouterContext.Provider value={router}>
            {Array.from(renderedComponents.entries()).map(([node, [element, props]]) =>
              createPortal(createElement(element, props), node),
            )}
          </ClerkHostRouterContext.Provider>
        </OptionsContext.Provider>
      </ClerkInstanceContext.Provider>
    );
  }

  function render() {
    root.render(<ClerkComponentContainer />);
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

  function createElementFromComponentDefinition(componentDefinition: any) {
    return lazy(componentDefinition.load);
  }

  return {
    mount,
    unmount,
    createElementFromComponentDefinition,
  };
}
