import { createActorContext } from '@xstate/react';

import { SignInMachine } from './sign-in.machine';

export const SignInActor = createActorContext(SignInMachine);
