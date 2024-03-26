import * as React from 'react';

/**
 * Use this context helper to detect whether a component has a particular parent higher up in the DOM or not.
 */
export function createContextForDomValidation(displayName: string) {
  const ReactContext = React.createContext(false);
  const OriginalProvider = ReactContext.Provider;

  function Provider({ children }: { children: React.ReactNode }) {
    return React.createElement(
      OriginalProvider,
      {
        value: true,
      },
      children,
    );
  }

  Provider.displayName = displayName;

  function useContext(allowMissingContext: boolean = false) {
    const context = React.useContext(ReactContext);

    if (!allowMissingContext && !context) {
      throw new Error(
        `You used a hook from "${Provider.displayName}" but it's not inside a <${Provider.displayName}.Provider> component.`,
      );
    }

    return context;
  }

  return {
    Provider,
    useDomValidation: useContext,
  };
}
