import type { SnapshotFrom } from 'xstate';

import type { TSignUpRouterMachine } from '~/internals/machines/sign-up';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignUpRouterMachine>;

export const SignUpRouterCtx = createContextFromActorRef<TSignUpRouterMachine>('SignUpRouterCtx');
