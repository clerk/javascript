import type { ActiveSessionResource, PublicUserData } from '@clerk/types';
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

export type UseSignInActiveSessionListParams = {
  omitCurrent: boolean;
};

export function useSignInSessionList(params?: UseSignInActiveSessionListParams): SignInActiveSessionListItem[] {
  const { omitCurrent = true } = params || {};

  return SignInRouterCtx.useSelector(state => {
    const authenticatedSessions = state.context.clerk?.client?.authenticatedSessions || [];
    const currentSessionId = state.context.clerk?.session?.id;
    const filteredSessions = omitCurrent
      ? authenticatedSessions.filter(s => s.id !== currentSessionId)
      : authenticatedSessions;

    return filteredSessions.map(s => ({
      id: s.id,
      ...s.publicUserData,
    }));
  });
}
