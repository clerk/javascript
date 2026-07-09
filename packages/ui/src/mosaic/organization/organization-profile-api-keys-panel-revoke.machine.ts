import { setup } from '../machine/setup';

export interface OrganizationProfileApiKeysPanelRevokeContext {
  selectedKeyId: string;
  selectedKeyName: string;
  confirmationValue: string;
  /** The word the user must type to confirm (injected so i18n stays out of the machine). */
  confirmationText: string;
  error: string | null;
  revokeAPIKey: (apiKeyId: string) => Promise<void>;
}

export type OrganizationProfileApiKeysPanelRevokeEvent =
  | { type: 'REQUEST'; keyId: string; keyName: string }
  | { type: 'TYPE_CONFIRMATION'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

const reset = () => ({
  selectedKeyId: '',
  selectedKeyName: '',
  confirmationValue: '',
  error: null,
});

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileApiKeysPanelRevokeContext,
  OrganizationProfileApiKeysPanelRevokeEvent
>();

export const organizationProfileApiKeysPanelRevokeMachine = createMachine({
  id: 'apiKeysRevoke',
  initial: 'idle',
  context: {
    selectedKeyId: '',
    selectedKeyName: '',
    confirmationValue: '',
    confirmationText: 'Revoke',
    error: null,
    revokeAPIKey: async () => {},
  },
  states: {
    idle: {
      on: {
        REQUEST: {
          target: 'confirming',
          actions: assign((_, event) => ({
            selectedKeyId: event.keyId,
            selectedKeyName: event.keyName,
            confirmationValue: '',
            error: null,
          })),
        },
      },
    },
    confirming: {
      on: {
        TYPE_CONFIRMATION: {
          actions: assign((_, event) => ({ confirmationValue: event.value, error: null })),
        },
        CONFIRM: {
          target: 'revoking',
          guard: context => context.confirmationValue === context.confirmationText,
        },
        CANCEL: {
          target: 'idle',
          actions: assign(reset),
        },
      },
    },
    revoking: {
      invoke: fromPromise(context => context.revokeAPIKey(context.selectedKeyId), {
        onDone: {
          target: 'idle',
          actions: assign(reset),
        },
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
