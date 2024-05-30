import type { SignInResource } from '@clerk/types';
import { fromPromise, not, sendTo, setup } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form';
import { sendToLoading } from '~/internals/machines/shared';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { SignInRouterMachineActorRef } from './router.types';
import type { SignInStartPasskeyEvent, SignInStartSchema } from './start.types';

export type TSignInStartMachine = typeof SignInStartMachine;

export const SignInStartMachineId = 'SignInStart';

export const SignInStartMachine = setup({
  actors: {
    attemptPasskey: fromPromise<
      SignInResource,
      { parent: SignInRouterMachineActorRef; flow: 'discoverable' | undefined }
    >(({ input: { parent, flow } }) => {
      return parent.getSnapshot().context.clerk.client.signIn.authenticateWithPasskey({
        flow,
      });
    }),
    attempt: fromPromise<SignInResource, { parent: SignInRouterMachineActorRef; fields: FormFields }>(
      ({ input: { fields, parent } }) => {
        const clerk = parent.getSnapshot().context.clerk;

        const password = fields.get('password');
        const identifier = fields.get('identifier');

        const passwordParams = password?.value
          ? {
              password: password.value,
              strategy: 'password',
            }
          : {};

        return clerk.client.signIn.create({
          identifier: (identifier?.value as string) || '',
          ...passwordParams,
        });
      },
    ),
  },
  actions: {
    sendToNext: ({ context, event }) => {
      // @ts-expect-error -- We're calling this in onDone, and event.output exists on the actor done event
      return context.parent.send({ type: 'NEXT', resource: event?.output });
    },
    sendToLoading,
    setFormErrors: sendTo(
      ({ context }) => context.formRef,
      ({ event }) => {
        assertActorEventError(event);
        return {
          type: 'ERRORS.SET',
          error: event.error,
        };
      },
    ),
  },
  guards: {
    isExampleMode: ({ context }) => Boolean(context.parent.getSnapshot().context.exampleMode),
  },
  types: {} as SignInStartSchema,
}).createMachine({
  id: SignInStartMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_IN_DEFAULT_BASE_PATH,
    parent: input.parent,
    formRef: input.formRef,
    loadingStep: 'start',
  }),
  initial: 'Pending',
  states: {
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
      on: {
        SUBMIT: {
          guard: not('isExampleMode'),
          target: 'Attempting',
          reenter: true,
        },
        'AUTHENTICATE.PASSKEY': {
          guard: not('isExampleMode'),
          target: 'AttemptingPasskey',
          reenter: true,
        },
        'AUTHENTICATE.PASSKEY_AUTOFILL': {
          guard: not('isExampleMode'),
          target: 'AttemptingPasskeyAutoFill',
          reenter: false,
        },
      },
    },
    Attempting: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          parent: context.parent,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: ['sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormErrors', 'sendToLoading'],
          target: 'Pending',
        },
      },
    },
    AttemptingPasskey: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attemptPasskey',
        src: 'attemptPasskey',
        input: ({ context, event }) => ({
          parent: context.parent,
          flow: (event as SignInStartPasskeyEvent).flow,
        }),
        onDone: {
          actions: ['sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormErrors', 'sendToLoading'],
          target: 'Pending',
        },
      },
    },
    AttemptingPasskeyAutoFill: {
      on: {
        'AUTHENTICATE.PASSKEY': {
          guard: not('isExampleMode'),
          target: 'AttemptingPasskey',
          reenter: true,
        },
        SUBMIT: {
          guard: not('isExampleMode'),
          target: 'Attempting',
          reenter: true,
        },
      },
      invoke: {
        id: 'attemptPasskeyAutofill',
        src: 'attemptPasskey',
        input: ({ context, event }) => ({
          parent: context.parent,
          flow: (event as SignInStartPasskeyEvent).flow,
        }),
        onDone: {
          actions: ['sendToNext'],
        },
        onError: {
          actions: ['setFormErrors'],
          target: 'Pending',
        },
      },
    },
  },
});
