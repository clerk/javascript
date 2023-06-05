import type { IsomorphicClerkOptions } from '@clerk/clerk-react';
import type { InitialState, PublishableKeyOrFrontendApi } from '@clerk/types';
import React from 'react';

import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';

type NextAppClerkProviderProps = React.PropsWithChildren<
  Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> & Partial<PublishableKeyOrFrontendApi>
>;

export function ClerkProvider(props: NextAppClerkProviderProps) {
  const { children, ...rest } = props;
  const state = initialState()?.__clerk_ssr_state as InitialState;

  return (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      // @ts-ignore
      initialState={state}
    >
      {children}
    </ClientClerkProvider>
  );
}
