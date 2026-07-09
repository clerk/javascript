import type { OrganizationEnrollmentMode } from '@clerk/shared/types';

import { setup } from '../machine/setup';

export interface OrganizationProfileDomainsSectionAddVerifyContext {
  domainId: string;
  domainName: string;
  draftName: string;
  draftEmail: string;
  draftCode: string;
  selectedEnrollmentMode: OrganizationEnrollmentMode | '';
  error: string | null;
  createDomain: (name: string) => Promise<{ id: string; name: string; verified: boolean }>;
  prepareVerification: (params: { domainId: string; affiliationEmailAddress: string }) => Promise<void>;
  attemptVerification: (params: { domainId: string; code: string }) => Promise<{ verified: boolean }>;
  updateEnrollmentMode: (params: {
    domainId: string;
    enrollmentMode: OrganizationEnrollmentMode;
    deletePending: boolean;
  }) => Promise<void>;
}

export type OrganizationProfileDomainsSectionAddVerifyEvent =
  | { type: 'OPEN_ADD' }
  | { type: 'OPEN_VERIFY'; domain: { id: string; name: string } }
  | { type: 'TYPE_NAME'; value: string }
  | { type: 'SUBMIT_NAME' }
  | { type: 'TYPE_EMAIL'; value: string }
  | { type: 'SUBMIT_EMAIL' }
  | { type: 'TYPE_CODE'; value: string }
  | { type: 'SUBMIT_CODE' }
  | { type: 'RESEND' }
  | { type: 'BACK' }
  | { type: 'SELECT_MODE'; value: OrganizationEnrollmentMode }
  | { type: 'SUBMIT_ENROLLMENT' }
  | { type: 'CANCEL' };

// TODO: field-level errors. This collapses any failure to one message; the classic forms map
// ClerkAPIResponseError onto the specific field (name/email/code) via handleError. Applies to
// all three domain flows (add-verify, enrollment, remove) — each machine holds a single `error`
// string rather than per-field feedback.
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const resetDrafts = {
  draftName: '',
  draftEmail: '',
  draftCode: '',
  selectedEnrollmentMode: '' as const,
  error: null,
};

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileDomainsSectionAddVerifyContext,
  OrganizationProfileDomainsSectionAddVerifyEvent
>();

export const organizationProfileDomainsSectionAddVerifyMachine = createMachine({
  id: 'domainsAddVerify',
  initial: 'closed',
  context: {
    domainId: '',
    domainName: '',
    draftName: '',
    draftEmail: '',
    draftCode: '',
    selectedEnrollmentMode: '',
    error: null,
    createDomain: async () => ({ id: '', name: '', verified: false }),
    prepareVerification: async () => {},
    attemptVerification: async () => ({ verified: false }),
    updateEnrollmentMode: async () => {},
  },
  states: {
    closed: {
      on: {
        OPEN_ADD: {
          target: 'enteringName',
          actions: assign(() => ({ domainId: '', domainName: '', ...resetDrafts })),
        },
        OPEN_VERIFY: {
          target: 'enteringEmail',
          actions: assign((_, event) => ({ domainId: event.domain.id, domainName: event.domain.name, ...resetDrafts })),
        },
      },
    },
    enteringName: {
      on: {
        TYPE_NAME: {
          actions: assign((_, event) => ({ draftName: event.value, error: null })),
        },
        SUBMIT_NAME: {
          target: 'creating',
          guard: context => context.draftName.trim() !== '',
        },
        CANCEL: 'closed',
      },
    },
    creating: {
      invoke: fromPromise(context => context.createDomain(context.draftName), {
        onDone: [
          {
            target: 'selectingEnrollment',
            guard: (_, event) => event.output.verified,
            actions: assign((_, event) => ({ domainId: event.output.id, domainName: event.output.name, error: null })),
          },
          {
            target: 'enteringEmail',
            actions: assign((_, event) => ({ domainId: event.output.id, domainName: event.output.name, error: null })),
          },
        ],
        onError: {
          target: 'enteringName',
          actions: assign((_, event) => ({ error: errorMessage(event.error) })),
        },
      }),
    },
    enteringEmail: {
      on: {
        TYPE_EMAIL: {
          actions: assign((_, event) => ({ draftEmail: event.value, error: null })),
        },
        SUBMIT_EMAIL: {
          target: 'preparing',
          guard: context => context.draftEmail.trim() !== '',
        },
        CANCEL: 'closed',
      },
    },
    preparing: {
      invoke: fromPromise(
        context =>
          context.prepareVerification({
            domainId: context.domainId,
            affiliationEmailAddress: `${context.draftEmail}@${context.domainName}`,
          }),
        {
          onDone: {
            target: 'enteringCode',
            actions: assign(() => ({ error: null })),
          },
          onError: {
            target: 'enteringEmail',
            actions: assign((_, event) => ({ error: errorMessage(event.error) })),
          },
        },
      ),
    },
    enteringCode: {
      on: {
        TYPE_CODE: {
          actions: assign((_, event) => ({ draftCode: event.value, error: null })),
        },
        SUBMIT_CODE: {
          target: 'attempting',
          guard: context => context.draftCode.trim() !== '',
        },
        RESEND: 'preparing',
        BACK: 'enteringEmail',
        CANCEL: 'closed',
      },
    },
    attempting: {
      invoke: fromPromise(
        context => context.attemptVerification({ domainId: context.domainId, code: context.draftCode }),
        {
          onDone: [
            {
              target: 'selectingEnrollment',
              guard: (_, event) => event.output.verified,
              actions: assign(() => ({ error: null })),
            },
            { target: 'closed' },
          ],
          onError: {
            target: 'enteringCode',
            actions: assign((_, event) => ({ error: errorMessage(event.error) })),
          },
        },
      ),
    },
    selectingEnrollment: {
      on: {
        SELECT_MODE: {
          actions: assign((_, event) => ({ selectedEnrollmentMode: event.value, error: null })),
        },
        SUBMIT_ENROLLMENT: {
          target: 'savingEnrollment',
          guard: context => context.selectedEnrollmentMode !== '',
        },
        CANCEL: 'closed',
      },
    },
    savingEnrollment: {
      invoke: fromPromise(
        context => {
          const mode = context.selectedEnrollmentMode;
          // The SUBMIT_ENROLLMENT guard blocks an empty mode; this narrows it for the typed call.
          if (mode === '') {
            return Promise.resolve();
          }
          return context.updateEnrollmentMode({
            domainId: context.domainId,
            enrollmentMode: mode,
            deletePending: false,
          });
        },
        {
          onDone: {
            target: 'closed',
            actions: assign(() => ({ error: null })),
          },
          onError: {
            target: 'selectingEnrollment',
            actions: assign((_, event) => ({ error: errorMessage(event.error) })),
          },
        },
      ),
    },
  },
});
