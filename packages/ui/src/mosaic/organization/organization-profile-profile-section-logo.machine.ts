import { setup } from '../machine/setup';

export interface OrganizationProfileProfileSectionLogoContext {
  /** The file to upload, or `null` to remove the current logo. */
  file: File | null;
  setLogo: (file: File | null) => Promise<void>;
  error: string | null;
}

export type OrganizationProfileProfileSectionLogoEvent = { type: 'UPLOAD'; file: File } | { type: 'REMOVE' };

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileProfileSectionLogoContext,
  OrganizationProfileProfileSectionLogoEvent
>();

export const organizationProfileProfileSectionLogoMachine = createMachine({
  id: 'organizationProfileLogo',
  initial: 'idle',
  context: {
    file: null,
    setLogo: async () => {},
    error: null,
  },
  states: {
    idle: {
      on: {
        UPLOAD: {
          target: 'submitting',
          actions: assign((_, event) => ({ file: event.file, error: null })),
        },
        REMOVE: {
          target: 'submitting',
          actions: assign(() => ({ file: null, error: null })),
        },
      },
    },
    submitting: {
      invoke: fromPromise(context => context.setLogo(context.file), {
        onDone: 'idle',
        onError: {
          target: 'idle',
          actions: assign((_, event) => ({
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
  },
});
