import { InitialState } from '@clerk/types';
import { stringify } from 'querystring';
import React from 'react';

import { multipleClerkProvidersError } from '../errors';
import type { IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';
import { StructureContext, StructureContextStates } from './StructureContext';

export interface ClerkProviderProps extends IsomorphicClerkOptions {
  children: React.ReactNode;
  initialState?: InitialState;
  publishableKey?: string;
  frontendApi?: string;
}

// TODO: Undup
function parsePublishableKey(key: string, pkg: string) {
  try {
    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
      throw 'error';
    }
    const keyParts = key.split('_');
    const instanceType = keyParts[1] as 'test' | 'live';
    let frontendApi = atob(keyParts[2]);
    if (!frontendApi.endsWith('$')) {
      throw 'error';
    }
    frontendApi = frontendApi.slice(0, -1);
    return { instanceType, frontendApi };
  } catch (e) {
    throw new Error(
      `Clerk Error: The publishableKey passed to Clerk is malformed. Your publishable key can be retrieved from https://dashboard.clerk.dev/last-active?path=api-keys (package=${pkg};passed=${key})`,
    );
  }
}

function ClerkProviderBase(props: ClerkProviderProps): JSX.Element {
  const { initialState, children, Clerk, frontendApi, publishableKey, ...options } = props;

  // TODO: There should be a better way to type this
  let keyOptions;
  if (typeof frontendApi === 'string' && typeof publishableKey === 'undefined') {
    keyOptions = { frontendApi: frontendApi, publishableKey: publishableKey };
  } else if (typeof frontendApi === 'undefined' && typeof publishableKey === 'string') {
    keyOptions = { frontendApi: frontendApi, publishableKey: publishableKey };
    parsePublishableKey(publishableKey, '@clerk/clerk-react');
  } else {
    throw new Error(
      'Clerk Error: publishableKey must be passed to the ClerkProvider component. (package=@clerk/clerk-react)',
    );
  }

  return (
    <StructureContext.Provider value={StructureContextStates.noGuarantees}>
      <ClerkContextProvider
        initialState={initialState}
        isomorphicClerkOptions={{ ...keyOptions, Clerk, options }}
      >
        {children}
      </ClerkContextProvider>
    </StructureContext.Provider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };
