import { createActorContext } from '@xstate/react';
import type { SnapshotFrom } from 'xstate';

import { SignUpMachine } from '~/internals/machines/sign-up/sign-up.machine';

export type SnapshotState = SnapshotFrom<typeof SignUpMachine>;

export const SignUpCtx = createActorContext(SignUpMachine);
