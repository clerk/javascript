import { isPublishableKey } from '@clerk/shared/keys';
import { ClerkContextProvider } from '@clerk/shared/react';
import React from 'react';

import { errorThrower } from '../errors/errorThrower';
import { multipleClerkProvidersError } from '../errors/messages';
import { IsomorphicClerk } from '../isomorphicClerk';
import type { ClerkProviderProps, IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';

function ClerkProviderBase(props: ClerkProviderProps) {
  const { initialState, children, __internal_bypassMissingPublishableKey, ...restIsomorphicClerkOptions } = props;
  const { publishableKey = '', Clerk: userInitialisedClerk } = restIsomorphicClerkOptions;

  if (!userInitialisedClerk && !__internal_bypassMissingPublishableKey) {
    if (!publishableKey) {
      errorThrower.throwMissingPublishableKeyError();
    } else if (publishableKey && !isPublishableKey(publishableKey)) {
      errorThrower.throwInvalidPublishableKeyError({ key: publishableKey });
    }
  }

  const { isomorphicClerk, clerkStatus } = useLoadedIsomorphicClerk(restIsomorphicClerkOptions);

  return (
    <ClerkContextProvider
      initialState={initialState}
      // @ts-expect-error - Fixme!
      clerk={isomorphicClerk}
      clerkStatus={clerkStatus}
    >
      {children}
    </ClerkContextProvider>
  );
}

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider };

const useLoadedIsomorphicClerk = (options: IsomorphicClerkOptions) => {
  const isomorphicClerkRef = React.useRef(IsomorphicClerk.getOrCreateInstance(options));
  const [clerkStatus, setClerkStatus] = React.useState(isomorphicClerkRef.current.status);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__unstable__updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__unstable__updateProps({ options });
  }, [options.localization]);

  React.useEffect(() => {
    isomorphicClerkRef.current.on('status', setClerkStatus);
    return () => {
      if (isomorphicClerkRef.current) {
        isomorphicClerkRef.current.off('status', setClerkStatus);
      }
      IsomorphicClerk.clearInstance();
    };
  }, []);

  return { isomorphicClerk: isomorphicClerkRef.current, clerkStatus };
};
