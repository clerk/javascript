import { ClientResource, SessionResource, SignInResource, SignUpResource } from '@clerk/types';
import React, { useContext } from 'react';

import { makeContextAndHook } from '../utils/makeContextAndHook';
import { assertClerkLoadedGuarantee, assertWrappedByClerkProvider } from './assertHelpers';
import { StructureContext } from './StructureContext';

/**
 * @internal
 */
export const [ClientContext, useClientContext] = makeContextAndHook<ClientResource | undefined | null>(
  'ClientContext',
);

export function useSignIn(): SignInResource {
  const structureCtx = useContext(StructureContext);
  const client = useClientContext();
  assertWrappedByClerkProvider(structureCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useSignIn()');
  return (client as ClientResource).signIn;
}

export function useSignUp(): SignUpResource {
  const structureCtx = useContext(StructureContext);
  const client = useClientContext();
  assertWrappedByClerkProvider(structureCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useSignUp()');
  return (client as ClientResource).signUp;
}

export function useSessionList(): SessionResource[] {
  const structureCtx = useContext(StructureContext);
  const client = useClientContext();
  assertWrappedByClerkProvider(structureCtx);
  assertClerkLoadedGuarantee(structureCtx.guaranteedLoaded, 'useSessionList()');
  return (client as ClientResource).sessions;
}
