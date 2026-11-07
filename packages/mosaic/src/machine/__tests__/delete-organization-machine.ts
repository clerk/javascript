import { setup } from '../setup';
import type { StateMachine } from '../types';

/**
 * Shared fixture: the delete-organization flow expressed as an explicit machine.
 *
 * Today this logic is smeared across four `useState` flags in
 * `sections/organization-profile-delete-section.tsx` + `block/destructive.tsx`
 * (`open`, `isDeleting`, `confirmValue`, and the derived `canSubmit`). Modelling
 * it as a machine — `idle → confirming → deleting → deleted`, guarded on the
 * typed name matching, with an error path back to `confirming` — makes every
 * state reachable and testable without rendering a single component.
 *
 * It is intentionally defined once and imported by both the runtime and the
 * React tests so the two read against the same, real-world example.
 */

export interface DeleteOrgContext {
  /** The org name the user must type to confirm. */
  name: string;
  /** What the user has typed into the confirm field so far. */
  confirmValue: string;
  /** Populated when the destroy mutation rejects. */
  error: string | null;
}

export type DeleteOrgEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

/** The async work the `deleting` state invokes. */
export type DestroyOrg = (context: DeleteOrgContext) => Promise<void>;

export type DeleteOrgState = 'idle' | 'confirming' | 'deleting' | 'deleted';

const deleteOrg = setup<DeleteOrgContext, DeleteOrgEvent>();

export function createDeleteOrgMachine(
  destroyOrg: DestroyOrg,
): StateMachine<DeleteOrgContext, DeleteOrgEvent, DeleteOrgState> {
  return deleteOrg.createMachine({
    id: 'deleteOrg',
    initial: 'idle',
    context: { name: 'Acme Inc', confirmValue: '', error: null },
    states: {
      idle: {
        on: { OPEN: { target: 'confirming' } },
      },
      confirming: {
        on: {
          // Internal transition: updates context, stays in `confirming`.
          TYPE: ({ event }) => ({ context: { confirmValue: event.value } }),
          // Only proceeds once the typed name matches.
          CONFIRM: ({ context }) => (context.confirmValue === context.name ? { target: 'deleting' } : undefined),
          CANCEL: () => ({ target: 'idle', context: { confirmValue: '', error: null } }),
        },
      },
      deleting: {
        invoke: deleteOrg.createInvoke({
          input: ({ context }) => context,
          src: ({ input }) => destroyOrg(input),
          onDone: { target: 'deleted' },
          onError: ({ event }) => ({ target: 'confirming', context: { error: String(event.error) } }),
        }),
      },
      deleted: { type: 'final' },
    },
  });
}

/**
 * A tiny loader flow used to demonstrate `invoke` landing its resolved output in
 * context. Parameterised by the fetcher so tests can resolve, reject, or hold it.
 */
export interface LoaderContext {
  data: string | null;
  error: string | null;
}

export type LoaderEvent = { type: 'FETCH' };

export type LoaderState = 'idle' | 'loading' | 'success' | 'failure';

const loader = setup<LoaderContext, LoaderEvent>();

export function createLoaderMachine(
  fetcher: () => Promise<string>,
): StateMachine<LoaderContext, LoaderEvent, LoaderState> {
  return loader.createMachine({
    initial: 'idle',
    context: { data: null, error: null },
    states: {
      idle: { on: { FETCH: { target: 'loading' } } },
      loading: {
        invoke: loader.createInvoke({
          src: () => fetcher(),
          onDone: ({ event }) => ({ target: 'success', context: { data: event.output } }),
          onError: ({ event }) => ({ target: 'failure', context: { error: String(event.error) } }),
        }),
      },
      success: { type: 'final' },
      failure: { on: { FETCH: { target: 'loading' } } },
    },
  });
}
