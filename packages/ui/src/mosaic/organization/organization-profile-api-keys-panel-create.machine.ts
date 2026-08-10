import { setup } from '../machine/setup';

/** The subset of a created key the copy step needs — the secret is only returned once. */
export interface CreatedApiKey {
  name: string;
  secret: string;
}

export interface OrganizationProfileApiKeysPanelCreateContext {
  /** The name draft. Mirrors the legacy required "Secret key name" field. */
  draftName: string;
  /** The optional description draft (only surfaced when `showDescription` is set). */
  draftDescription: string;
  /** Seconds until expiration, or `undefined` for "never". The view converts the option→seconds. */
  draftExpiration: number | undefined;
  /** Whether the description field is shown (mirrors the legacy `showDescription` prop). */
  showDescription: boolean;
  /** The freshly created key + secret, revealed once in the copy step. */
  createdKey: CreatedApiKey | null;
  error: string | null;
  createAPIKey: (params: {
    name: string;
    description?: string;
    secondsUntilExpiration?: number;
  }) => Promise<CreatedApiKey>;
}

export type OrganizationProfileApiKeysPanelCreateEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE_NAME'; value: string }
  | { type: 'TYPE_DESCRIPTION'; value: string }
  | { type: 'SET_EXPIRATION'; secondsUntilExpiration: number | undefined }
  | { type: 'SUBMIT' }
  | { type: 'CANCEL' }
  | { type: 'CLOSE' };

// Mirrors the legacy `canSubmit = nameField.value.length > 2`, trimmed so whitespace-only
// names cannot pass (matches the profile-section's trimmed name guard).
const canSubmit = (context: OrganizationProfileApiKeysPanelCreateContext): boolean =>
  context.draftName.trim().length > 2;

const resetDrafts = () => ({
  draftName: '',
  draftDescription: '',
  draftExpiration: undefined,
  error: null,
});

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileApiKeysPanelCreateContext,
  OrganizationProfileApiKeysPanelCreateEvent
>();

export const organizationProfileApiKeysPanelCreateMachine = createMachine({
  id: 'apiKeysCreate',
  initial: 'closed',
  context: {
    draftName: '',
    draftDescription: '',
    draftExpiration: undefined,
    showDescription: false,
    createdKey: null,
    error: null,
    createAPIKey: async () => ({ name: '', secret: '' }),
  },
  states: {
    closed: { on: { OPEN: 'editing' } },
    editing: {
      on: {
        TYPE_NAME: {
          actions: assign((_, event) => ({ draftName: event.value, error: null })),
        },
        TYPE_DESCRIPTION: {
          actions: assign((_, event) => ({ draftDescription: event.value, error: null })),
        },
        SET_EXPIRATION: {
          actions: assign((_, event) => ({ draftExpiration: event.secondsUntilExpiration, error: null })),
        },
        SUBMIT: {
          target: 'creating',
          guard: canSubmit,
        },
        CANCEL: {
          target: 'closed',
          actions: assign(resetDrafts),
        },
      },
    },
    creating: {
      invoke: fromPromise(
        context =>
          context.createAPIKey({
            name: context.draftName,
            description: context.draftDescription || undefined,
            secondsUntilExpiration: context.draftExpiration,
          }),
        {
          onDone: {
            target: 'showingSecret',
            actions: assign((_, event) => ({ createdKey: event.output, error: null })),
          },
          onError: {
            target: 'editing',
            actions: assign((_, event) => ({
              error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
            })),
          },
        },
      ),
    },
    // The secret is shown once; closing drops the drafts and the revealed key.
    showingSecret: {
      on: {
        CLOSE: {
          target: 'closed',
          actions: assign(() => ({ ...resetDrafts(), createdKey: null })),
        },
      },
    },
  },
});
