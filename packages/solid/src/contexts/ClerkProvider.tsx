import type { InitialState } from '@clerk/types';
import { isLegacyFrontendApiKey, isPublishableKey } from '@clerk/utils';
import { multipleClerkProvidersError } from '@clerk/utils';
import type { ParentComponent } from 'solid-js';

import type { IsomorphicClerkOptions } from '../types';
import { __internal__setErrorThrowerOptions, errorThrower, withMaxAllowedInstancesGuard } from '../utils';
import { ClerkContextProvider } from './ClerkContextProvider';
import { StructureContext, StructureContextStates } from './StructureContext';

__internal__setErrorThrowerOptions({
  packageName: '@clerk/clerk-solid',
});

export type ClerkProviderProps = IsomorphicClerkOptions & {
  initialState?: InitialState;
};

const ClerkProviderBase: ParentComponent<ClerkProviderProps> = props => {
  const { initialState, ...restIsomorphicClerkOptions } = props;
  const { frontendApi = '', publishableKey = '', Clerk: userInitialisedClerk } = restIsomorphicClerkOptions;

  if (!userInitialisedClerk) {
    if (!publishableKey && !frontendApi) {
      errorThrower.throwMissingPublishableKeyError();
    } else if (publishableKey && !isPublishableKey(publishableKey)) {
      errorThrower.throwInvalidPublishableKeyError({ key: publishableKey });
    } else if (!publishableKey && frontendApi && !isLegacyFrontendApiKey(frontendApi)) {
      errorThrower.throwInvalidFrontendApiError({ key: frontendApi });
    }
  }

  return (
    <StructureContext.Provider value={StructureContextStates.noGuarantees}>
      <ClerkContextProvider
        initialState={initialState}
        isomorphicClerkOptions={restIsomorphicClerkOptions}
      >
        {props.children}
      </ClerkContextProvider>
    </StructureContext.Provider>
  );
};

const ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, 'ClerkProvider', multipleClerkProvidersError);

ClerkProvider.displayName = 'ClerkProvider';

export { ClerkProvider, __internal__setErrorThrowerOptions };
