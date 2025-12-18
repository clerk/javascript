import { ClerkContextProvider } from '@clerk/shared/react';
import type { Ui } from '@clerk/ui/internal';
import React from 'react';

import { multipleClerkProvidersError } from '../errors/messages';
import { IsomorphicClerk } from '../isomorphicClerk';
import type { ClerkProviderProps, IsomorphicClerkOptions } from '../types';
import { withMaxAllowedInstancesGuard } from '../utils';

function ClerkProviderBase<TUi extends Ui>(props: ClerkProviderProps<TUi>) {
  const { initialState, children, ...restIsomorphicClerkOptions } = props;

  const { isomorphicClerk, clerkStatus } = useLoadedIsomorphicClerk(
    restIsomorphicClerkOptions as unknown as IsomorphicClerkOptions,
  );

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
    void isomorphicClerkRef.current.__internal_updateProps({ appearance: options.appearance });
  }, [options.appearance]);

  React.useEffect(() => {
    void isomorphicClerkRef.current.__internal_updateProps({ options });
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
