import { assign } from '../assign';
import { createMachine } from '../createMachine';
import type { DoneInvokeEvent, ErrorInvokeEvent, StateMachine } from '../types';

/**
 * Shared fixture: the delete-organization flow expressed as an explicit machine.
 *
 * Today this logic is smeared across four `useState` flags in
 * `sections/delete-organization.tsx` + `block/destructive.tsx`
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

export function createDeleteOrgMachine(destroyOrg: DestroyOrg): StateMachine<DeleteOrgContext, DeleteOrgEvent> {
  return createMachine<DeleteOrgContext, DeleteOrgEvent>({
    id: 'deleteOrg',
    initial: 'idle',
    context: { name: 'Acme Inc', confirmValue: '', error: null },
    states: {
      idle: {
        on: { OPEN: 'confirming' },
      },
      confirming: {
        on: {
          // Internal transition: runs an action, stays in `confirming`.
          TYPE: {
            actions: assign<DeleteOrgContext, DeleteOrgEvent>((_, event) =>
              event.type === 'TYPE' ? { confirmValue: event.value } : {},
            ),
          },
          // Guarded: only proceeds once the typed name matches.
          CONFIRM: { target: 'deleting', guard: context => context.confirmValue === context.name },
          CANCEL: {
            target: 'idle',
            actions: assign<DeleteOrgContext, DeleteOrgEvent>(() => ({ confirmValue: '', error: null })),
          },
        },
      },
      deleting: {
        invoke: {
          src: destroyOrg,
          onDone: 'deleted',
          onError: {
            target: 'confirming',
            actions: assign<DeleteOrgContext, ErrorInvokeEvent>((_, event) => ({ error: String(event.error) })),
          },
        },
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

export function createLoaderMachine(fetcher: () => Promise<string>): StateMachine<LoaderContext, LoaderEvent> {
  return createMachine<LoaderContext, LoaderEvent>({
    initial: 'idle',
    context: { data: null, error: null },
    states: {
      idle: { on: { FETCH: 'loading' } },
      loading: {
        invoke: {
          src: fetcher,
          onDone: {
            target: 'success',
            actions: assign<LoaderContext, DoneInvokeEvent<string>>((_, event) => ({ data: event.output })),
          },
          onError: {
            target: 'failure',
            actions: assign<LoaderContext, ErrorInvokeEvent>((_, event) => ({ error: String(event.error) })),
          },
        },
      },
      success: { type: 'final' },
      failure: { on: { FETCH: 'loading' } },
    },
  });
}
