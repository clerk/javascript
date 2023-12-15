import type { ClerkProviderOptionsWrapper } from '@clerk/clerk-react';
import type { InitialState } from '@clerk/types';
import React from 'react';

import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { ClientClerkProvider } from '../client/ClerkProvider';
import { initialState } from './auth';

type NextAppClerkProviderProps = ClerkProviderOptionsWrapper;

export function ClerkProvider(props: NextAppClerkProviderProps) {
  const { children, ...rest } = props;
  const state = initialState()?.__clerk_ssr_state as InitialState;

  return (
    <ClientClerkProvider
      {...mergeNextClerkPropsWithEnv(rest)}
      initialState={state}
    >
      {children}
    </ClientClerkProvider>
  );
}
