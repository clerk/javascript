import {
  ClientResource,
  SessionResource,
  SignInResource,
  SignUpResource,
} from '@clerk/types';
import React, { useContext } from 'react';

import {
  assertClerkLoadedGuarantee,
  assertWrappedByClerkProvider,
} from './assertHelpers';
import { StructureContext } from './StructureContext';

type ClientContextValue = { value: ClientResource | undefined | null };
export const ClientContext = React.createContext<
  ClientContextValue | undefined
>(undefined);
ClientContext.displayName = 'ClientContext';

export function useSignIn(): SignInResource {
  const structureCtx = useContext(StructureContext);
  const clientCtx = React.useContext(ClientContext);
  assertWrappedByClerkProvider(clientCtx);
  assertWrappedByClerkProvider(structureCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useSignIn()');
  return (clientCtx.value as ClientResource).signIn;
}

export function useSignUp(): SignUpResource {
  const structureCtx = useContext(StructureContext);
  const clientCtx = React.useContext(ClientContext);
  assertWrappedByClerkProvider(clientCtx);
  assertWrappedByClerkProvider(structureCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useSignUp()');
  return (clientCtx.value as ClientResource).signUp;
}

export function useSessionList(): SessionResource[] {
  const structureCtx = useContext(StructureContext);
  const clientCtx = React.useContext(ClientContext);
  assertWrappedByClerkProvider(clientCtx);
  assertWrappedByClerkProvider(structureCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useSessionList()');
  return (clientCtx.value as ClientResource).sessions;
}
