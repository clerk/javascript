import { isPublishableKey } from '@clerk/shared/keys';
import React from 'react';

import { errorThrower } from '../errors/errorThrower';
import { multipleClerkProvidersError } from '../errors/messages';
import type { ClerkProviderProps } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';

function ClerkProviderBase(props: ClerkProviderProps): JSX.Element {
  const { initialState, children, __internal_bypassMissingPk, ...restIsomorphicClerkOptions } = props;
  const { publishableKey = '', Clerk: userInitialisedClerk } = restIsomorphicClerkOptions;

  if (!userInitialisedClerk && !__internal_bypassMissingPk) {
    if (!publishableKey) {
      errorThrower.throwMissingPublishableKeyError();
    } else if (publishableKey && !isPublishableKey(publishableKey)) {
      errorThrower.throwInvalidPublishableKeyError({ key: publishableKey });
    }
  }

  return (
    <ClerkContextProvider
      initialState={initialState}
      isomorphicClerkOptions={restIsomorphicClerkOptions}
    >
      {children}
    </ClerkContextProvider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };
