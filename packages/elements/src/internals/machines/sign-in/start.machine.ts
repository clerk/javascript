import type { SignInResource, Web3Strategy } from '@clerk/shared/types';
import { assertEvent, enqueueActions, fromPromise, not, sendTo, setup } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { FormFields } from '~/internals/machines/form';
import { sendToLoading } from '~/internals/machines/shared';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { SignInRouterMachineActorRef } from './router.types';
import type { SignInStartSchema } from './start.types';

const DISABLEABLE_FIELDS = ['emailAddress', 'phoneNumber'] as const;

export type TSignInStartMachine = typeof SignInStartMachine;

export const SignInStartMachineId = 'SignInStart';

type AttemptParams = { strategy: 'ticket'; ticket: string } | { strategy?: never; ticket?: never };

export const SignInStartMachine = setup({
  actors: {
    attemptPasskey: fromPromise<
      SignInResource,
      { parent: SignInRouterMachineActorRef; flow: 'autofill' | 'discoverable' | undefined }
    >(({ input: { parent, flow } }) => {
      return parent.getSnapshot().context.clerk.client.signIn.authenticateWithPasskey({
        flow,
      });
    }),
    attemptWeb3: fromPromise<SignInResource, { parent: SignInRouterMachineActorRef; strategy: Web3Strategy }>(
      ({ input: { parent, strategy } }) => {
        if (strategy === 'web3_metamask_signature') {
          return parent.getSnapshot().context.clerk.client.signIn.authenticateWithMetamask();
        }
        if (strategy === 'web3_coinbase_wallet_signature') {
          return parent.getSnapshot().context.clerk.client.signIn.authenticateWithCoinbaseWallet();
        }
        if (strategy === 'web3_base_signature') {
          return parent.getSnapshot().context.clerk.client.signIn.authenticateWithBase();
        }
        if (strategy === 'web3_okx_wallet_signature') {
          return parent.getSnapshot().context.clerk.client.signIn.authenticateWithOKXWallet();
        }
        throw new ClerkElementsRuntimeError(`Unsupported Web3 strategy: ${strategy}`);
      },
    ),
    attempt: fromPromise<
      SignInResource,
      { parent: SignInRouterMachineActorRef; fields: FormFields; params?: AttemptParams }
    >(({ input: { fields, parent, params } }) => {
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
        ...passwordParams,
        ...(params?.ticket
          ? params
          : {
              identifier: (identifier?.value as string) ?? '',
            }),
      });
    }),
  },
  actions: {
    sendToNext: ({ context, event }) => {
      // @ts-expect-error -- We're calling this in onDone, and event.output exists on the actor done event
      return context.parent.send({ type: 'NEXT', resource: event?.output });
    },
    sendToLoading,
    setFormDisabledTicketFields: enqueueActions(({ context, enqueue }) => {
      if (!context.ticket) {
        return;
      }

      const currentFields = context.formRef.getSnapshot().context.fields;

      for (const name of DISABLEABLE_FIELDS) {
        if (currentFields.has(name)) {
          enqueue.sendTo(context.formRef, { type: 'FIELD.DISABLE', field: { name } });
        }
      }
    }),
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
    hasTicket: ({ context }) => Boolean(context.ticket),
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
    ticket: input.ticket,
  }),
  initial: 'Init',
  states: {
    Init: {
      description: 'Handle ticket, if present; Else, default to Pending state.',
      always: [
        {
          guard: 'hasTicket',
          target: 'Attempting',
        },
        {
          target: 'Pending',
        },
      ],
    },
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
        'AUTHENTICATE.PASSKEY.AUTOFILL': {
          guard: not('isExampleMode'),
          target: 'AttemptingPasskeyAutoFill',
          reenter: false,
        },
        'AUTHENTICATE.WEB3': {
          guard: not('isExampleMode'),
          target: 'AttemptingWeb3',
          reenter: true,
        },
      },
    },
    Attempting: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => {
          // Standard fields
          const defaultParams = {
            fields: context.formRef.getSnapshot().context.fields,
            parent: context.parent,
          };

          // Handle ticket-specific flows
          const params: AttemptParams = context.ticket
            ? {
                strategy: 'ticket',
                ticket: context.ticket,
              }
            : {};

          return { ...defaultParams, params };
        },
        onDone: {
          actions: ['setFormDisabledTicketFields', 'sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormDisabledTicketFields', 'setFormErrors', 'sendToLoading'],
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
        input: ({ context }) => ({
          parent: context.parent,
          flow: 'discoverable',
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
        input: ({ context }) => ({
          parent: context.parent,
          flow: 'autofill',
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
    AttemptingWeb3: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attemptWeb3',
        src: 'attemptWeb3',
        input: ({ context, event }) => {
          assertEvent(event, 'AUTHENTICATE.WEB3');
          return {
            parent: context.parent,
            strategy: event.strategy,
          };
        },
        onDone: {
          actions: ['sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormErrors', 'sendToLoading'],
          target: 'Pending',
        },
      },
    },
  },
});
