import { createActorContext } from '@xstate/react';
import type { SnapshotFrom } from 'xstate';

import { SignInMachine } from '~/internals/machines/sign-in/sign-in.machine';

export type SnapshotState = SnapshotFrom<typeof SignInMachine>;

export const SignInCtx = createActorContext(SignInMachine);
