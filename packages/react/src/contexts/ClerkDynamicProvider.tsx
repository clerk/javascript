import React from 'react';

import { useAuth, useDerivedAuth } from '../hooks/useAuth';

const PromisifiedAuthContext = React.createContext<Promise<unknown> | unknown | null>(null);

export function PromisifiedAuthProvider({
  authPromise,
  children,
}: {
  authPromise: Promise<unknown> | unknown;
  children: React.ReactNode;
}) {
  return <PromisifiedAuthContext.Provider value={authPromise}>{children}</PromisifiedAuthContext.Provider>;
}

export function usePromisifiedAuth() {
  const valueFromContext = React.useContext(PromisifiedAuthContext);

  let resolvedData = valueFromContext;
  // @ts-expect-error -- TODO: fixme
  if (valueFromContext && 'then' in valueFromContext) {
    if (!('use' in React)) {
      throw new Error(
        `Attempting to read a promise from AuthContext but use() is not available. React version: ${React.version}`,
      );
    }
    // @ts-expect-error -- use() does not exist on stable React types yet
    resolvedData = React.use(valueFromContext);
  }

  // At this point we should have a usable auth object

  if (typeof window === 'undefined') {
    if (!resolvedData) {
      throw new Error('useAuth() called without ClerkDynamicProvider');
    }
    // We don't need to deal with Clerk being loaded here
    return useDerivedAuth(resolvedData);
  } else {
    return useAuth(resolvedData);
  }

  // TODO: handle clerk loading state, or just delegate to useAuth()? we know that will be available
  return {};
}
