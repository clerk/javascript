import type { SignUpResource, Web3Strategy } from '@clerk/types';
import { assertEvent, enqueueActions, fromPromise, not, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { FormFields } from '~/internals/machines/form';
import { sendToLoading } from '~/internals/machines/shared';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';
import { ThirdPartyMachine } from '~/internals/machines/third-party';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { SignInRouterMachineActorRef } from './router.types';
import type { SignUpStartSchema } from './start.types';

const DISABLEABLE_FIELDS = ['emailAddress', 'phoneNumber'] as const;

export type TSignUpStartMachine = typeof SignUpStartMachine;

export const SignUpStartMachineId = 'SignUpStart';

type AttemptParams = { strategy: 'ticket'; ticket: string } | { strategy?: never; ticket?: never };
type PrefillFieldsKeys = keyof Pick<
  SignUpResource,
  'username' | 'firstName' | 'lastName' | 'emailAddress' | 'phoneNumber'
>;
const PREFILL_FIELDS: PrefillFieldsKeys[] = ['firstName', 'lastName', 'emailAddress', 'username', 'phoneNumber'];

export const SignUpStartMachine = setup({
  actors: {
    attempt: fromPromise<
      SignUpResource,
      { parent: SignInRouterMachineActorRef; fields: FormFields; params?: AttemptParams }
    >(({ input: { fields, parent, params } }) => {
      const fieldParams = fieldsToSignUpParams(fields);
      return parent.getSnapshot().context.clerk.client.signUp.create({ ...fieldParams, ...params });
    }),
    attemptWeb3: fromPromise<SignUpResource, { parent: SignInRouterMachineActorRef; strategy: Web3Strategy }>(
      ({ input: { parent, strategy } }) => {
        if (strategy === 'web3_metamask_signature') {
          return parent.getSnapshot().context.clerk.client.signUp.authenticateWithMetamask();
        }
        if (strategy === 'web3_coinbase_signature') {
          return parent.getSnapshot().context.clerk.client.signUp.authenticateWithCoinbase();
        }
        if (strategy === 'web3_coinbase_wallet_signature') {
          return parent.getSnapshot().context.clerk.client.signUp.authenticateWithCoinbaseWallet();
        }
        throw new ClerkElementsRuntimeError(`Unsupported Web3 strategy: ${strategy}`);
      },
    ),
    thirdParty: ThirdPartyMachine,
  },
  actions: {
    sendToNext: ({ context }) => context.parent.send({ type: 'NEXT' }),
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
    setDefaultFormValues: ({ context }) => {
      const signUp = context.parent.getSnapshot().context.clerk.client.signUp;
      const prefilledDefaultValues = new Map();

      for (const key of PREFILL_FIELDS) {
        if (key in signUp) {
          prefilledDefaultValues.set(key, signUp[key]);
        }
      }

      context.formRef.send({
        type: 'PREFILL_DEFAULT_VALUES',
        defaultValues: prefilledDefaultValues,
      });
    },
  },
  guards: {
    hasTicket: ({ context }) => Boolean(context.ticket),
    isExampleMode: ({ context }) => Boolean(context.parent.getSnapshot().context.exampleMode),
  },
  types: {} as SignUpStartSchema,
}).createMachine({
  id: SignUpStartMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_UP_DEFAULT_BASE_PATH,
    formRef: input.formRef,
    parent: input.parent,
    loadingStep: 'start',
    ticket: input.ticket,
  }),
  entry: 'setDefaultFormValues',
  initial: 'Init',
  states: {
    Init: {
      description:
        'Handle ticket, if present; Else, default to Pending state. Per tickets, `Attempting` makes a `signUp.create` request allowing for an incomplete sign up to contain progressively filled fields on the Start step.',
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
        id: 'attemptCreate',
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
    AttemptingWeb3: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attemptCreateWeb3',
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
