import type { LoadedClerk } from '@clerk/types';
import React from 'react';
import { assertContextExists } from 'ui/contexts/utils';

const excludedProps = ['user', 'session', 'client'] as const;

type ExcludedProp = typeof excludedProps[number];
type ClerkSingletonPropName = Exclude<keyof LoadedClerk, ExcludedProp>;

export type CoreClerkProps = {
  [k in ClerkSingletonPropName]: LoadedClerk[k];
};

function clerkSingletonProps(clerk: LoadedClerk): CoreClerkProps {
  return Object.keys(clerk).reduce((acc, propName) => {
    const prop = propName as keyof LoadedClerk & keyof CoreClerkProps;
    if (excludedProps.includes(prop as ExcludedProp)) {
      return acc;
    }

    let propVal = clerk[prop];
    propVal = typeof propVal === 'function' ? propVal.bind(clerk) : propVal;
    acc[prop] = propVal as any;
    return acc;
  }, {} as CoreClerkProps);
}

export const CoreClerkContext = React.createContext<LoadedClerk | undefined>(
  undefined,
);
CoreClerkContext.displayName = 'CoreClerkContext';

let cachedClerkSingletonProps: CoreClerkProps | undefined;

export function useCoreClerk(): CoreClerkProps {
  const context = React.useContext(CoreClerkContext);
  assertContextExists(context, 'CoreClerkContextProvider');

  if (!cachedClerkSingletonProps) {
    cachedClerkSingletonProps = clerkSingletonProps(context);
  }

  return cachedClerkSingletonProps;
}
