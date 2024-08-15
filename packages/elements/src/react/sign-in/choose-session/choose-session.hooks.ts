import * as React from 'react';

import { useActiveTags } from '../../hooks';
import { SignInRouterCtx } from '../context';

export const SignInActiveSessionContext = React.createContext<any>(null);

export function useSignInActiveSessionContext() {
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

export function useSignInActiveSessionList() {
  return SignInRouterCtx.useSelector(
    state =>
      state.context.clerk?.client?.activeSessions?.map(s => ({
        id: s.id,
        ...s.publicUserData,
      })) || [],
  );
}
