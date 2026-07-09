import type { OrganizationEnrollmentMode } from '@clerk/shared/types';

import { setup } from '../machine/setup';

export interface OrganizationProfileDomainsSectionEnrollmentContext {
  domainId: string;
  domainName: string;
  /** The domain's saved enrollment mode, seeded when the dialog opens. */
  committedEnrollmentMode: OrganizationEnrollmentMode | '';
  /** The user's selection, or `null` while untouched (falls through to committed). */
  draftEnrollmentMode: OrganizationEnrollmentMode | null;
  deletePending: boolean;
  totalPendingInvitations: number;
  totalPendingSuggestions: number;
  error: string | null;
  updateEnrollmentMode: (params: {
    domainId: string;
    enrollmentMode: OrganizationEnrollmentMode;
    deletePending: boolean;
  }) => Promise<void>;
}

export type OrganizationProfileDomainsSectionEnrollmentEvent =
  | {
      type: 'OPEN';
      domain: {
        id: string;
        name: string;
        enrollmentMode: OrganizationEnrollmentMode;
        totalPendingInvitations: number;
        totalPendingSuggestions: number;
      };
    }
  | { type: 'SELECT_MODE'; value: OrganizationEnrollmentMode }
  | { type: 'TOGGLE_DELETE_PENDING'; checked: boolean }
  | { type: 'SUBMIT' }
  | { type: 'CANCEL' };

const effectiveMode = (context: OrganizationProfileDomainsSectionEnrollmentContext): OrganizationEnrollmentMode | '' =>
  context.draftEnrollmentMode ?? context.committedEnrollmentMode;

const canSave = (context: OrganizationProfileDomainsSectionEnrollmentContext): boolean => {
  const mode = effectiveMode(context);
  return mode !== '' && (mode !== context.committedEnrollmentMode || context.deletePending);
};

const { createMachine, assign, fromPromise } = setup<
  OrganizationProfileDomainsSectionEnrollmentContext,
  OrganizationProfileDomainsSectionEnrollmentEvent
>();

export const organizationProfileDomainsSectionEnrollmentMachine = createMachine({
  id: 'domainsEnrollment',
  initial: 'closed',
  context: {
    domainId: '',
    domainName: '',
    committedEnrollmentMode: '',
    draftEnrollmentMode: null,
    deletePending: false,
    totalPendingInvitations: 0,
    totalPendingSuggestions: 0,
    error: null,
    updateEnrollmentMode: async () => {},
  },
  states: {
    closed: {
      on: {
        OPEN: {
          target: 'editing',
          actions: assign((_, event) => ({
            domainId: event.domain.id,
            domainName: event.domain.name,
            committedEnrollmentMode: event.domain.enrollmentMode,
            totalPendingInvitations: event.domain.totalPendingInvitations,
            totalPendingSuggestions: event.domain.totalPendingSuggestions,
            draftEnrollmentMode: null,
            deletePending: false,
            error: null,
          })),
        },
      },
    },
    editing: {
      on: {
        SELECT_MODE: {
          actions: assign((_, event) => ({ draftEnrollmentMode: event.value, error: null })),
        },
        TOGGLE_DELETE_PENDING: {
          actions: assign((_, event) => ({ deletePending: event.checked })),
        },
        SUBMIT: {
          target: 'saving',
          guard: canSave,
        },
        CANCEL: {
          target: 'closed',
          actions: assign(() => ({ draftEnrollmentMode: null, deletePending: false, error: null })),
        },
      },
    },
    saving: {
      invoke: fromPromise(
        context => {
          const mode = effectiveMode(context);
          // The SUBMIT guard blocks an empty mode; this narrows it for the typed call.
          if (mode === '') {
            return Promise.resolve();
          }
          return context.updateEnrollmentMode({
            domainId: context.domainId,
            enrollmentMode: mode,
            deletePending: context.deletePending,
          });
        },
        {
          onDone: {
            target: 'closed',
            actions: assign(() => ({ draftEnrollmentMode: null, deletePending: false, error: null })),
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
  },
});
