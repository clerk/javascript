import type { IsomorphicClerkOptions } from '@clerk/shared/types';
import type { Ui } from '@clerk/ui/internal';
import React from 'react';

import { multipleClerkProvidersError } from '../errors/messages';
import type { ClerkProviderProps } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';

function ClerkProviderBase<TUi extends Ui>(props: ClerkProviderProps<TUi>) {
  const { initialState, children, ...restIsomorphicClerkOptions } = props;
  const isomorphicClerkOptions = restIsomorphicClerkOptions as unknown as IsomorphicClerkOptions;

  return (
    <ClerkContextProvider
      initialState={initialState}
      isomorphicClerkOptions={isomorphicClerkOptions}
    >
      {children}
    </ClerkContextProvider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };
