import type { SnapshotFrom } from 'xstate';

import type { TSignInRouterMachine } from '~/internals/machines/sign-in';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignInRouterMachine>;

export const SignInRouterCtx = createContextFromActorRef<TSignInRouterMachine>('SignInRouterCtx');

export const useSignInPasskeyAutofill = () =>
  SignInRouterCtx.useSelector(state => state.context.webAuthnAutofillSupport);
