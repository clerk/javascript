import type { ActiveSessionResource, PublicUserData } from '@clerk/shared/types';
import * as React from 'react';

import { useActiveTags } from '../../hooks';
import { SignInRouterCtx } from '../context';

export type SignInActiveSessionListItem = Pick<ActiveSessionResource, 'id'> & PublicUserData;

export const SignInActiveSessionContext = React.createContext<SignInActiveSessionListItem | null>(null);

export function useSignInActiveSessionContext(): SignInActiveSessionListItem {
  const ctx = React.useContext(SignInActiveSessionContext);

  if (!ctx) {
    throw new Error('SignInActiveSessionContext must be used within a SessionList/SignInSessionListItem');
  }

  return ctx;
}

export function useSignInChooseSessionIsActive() {
  const routerRef = SignInRouterCtx.useActorRef();
  return useActiveTags(routerRef, 'step:choose-session');
}

export type UseSignInSessionListParams = {
  omitCurrent: boolean;
};

export function useSignInSessionList(params?: UseSignInSessionListParams): SignInActiveSessionListItem[] {
  const { omitCurrent = true } = params || {};

  return SignInRouterCtx.useSelector(state => {
    const signedInSessions = state.context.clerk?.client?.signedInSessions || [];
    const currentSessionId = state.context.clerk?.session?.id;
    const filteredSessions = omitCurrent ? signedInSessions.filter(s => s.id !== currentSessionId) : signedInSessions;

    return filteredSessions.map(s => ({
      id: s.id,
      ...s.publicUserData,
    }));
  });
}
