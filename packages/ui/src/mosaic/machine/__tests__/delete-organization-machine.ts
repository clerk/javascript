/**
 * Test-only fixture machines used across the machine test suite.
 *
 * These live here rather than in `src/mosaic/sections/` so the core machine
 * tests (machine.test.ts, useMachine.test.tsx) have no dependency on the
 * sections layer — the core library is standalone.
 */
import { assign } from '../assign';
import { createMachine } from '../createMachine';
import type { DoneInvokeEvent, ErrorInvokeEvent } from '../types';

// ─── DeleteOrg machine ────────────────────────────────────────────────────────

export type DeleteOrgContext = { name: string; confirmValue: string; error: string | null };
export type DeleteOrgEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

export function createDeleteOrgMachine(deleteFn: () => Promise<void>) {
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
          TYPE: {
            actions: assign<DeleteOrgContext, Extract<DeleteOrgEvent, { type: 'TYPE' }>>((_, e) => ({
              confirmValue: e.value,
            })),
          },
          CONFIRM: {
            target: 'deleting',
            guard: (ctx: DeleteOrgContext) => ctx.confirmValue === ctx.name,
          },
          CANCEL: 'idle',
        },
      },
      deleting: {
        invoke: {
          src: (_ctx: DeleteOrgContext) => deleteFn(),
          onDone: 'deleted',
          onError: {
            target: 'confirming',
            actions: assign<DeleteOrgContext, ErrorInvokeEvent>((_, e) => ({
              error: String(e.error),
            })),
          },
        },
      },
      deleted: { type: 'final' },
    },
  });
}

// ─── Loader machine ───────────────────────────────────────────────────────────

type LoaderContext = { data: string | null; error: string | null };

export function createLoaderMachine(loadFn: () => Promise<string>) {
  return createMachine<LoaderContext, { type: 'FETCH' }>({
    initial: 'idle',
    context: { data: null, error: null },
    states: {
      idle: {
        on: { FETCH: 'loading' },
      },
      loading: {
        invoke: {
          src: () => loadFn(),
          onDone: {
            target: 'success',
            actions: assign<LoaderContext, DoneInvokeEvent<string>>((_, e) => ({ data: e.output })),
          },
          onError: {
            target: 'failure',
            actions: assign<LoaderContext, ErrorInvokeEvent>((_, e) => ({
              error: String(e.error),
            })),
          },
        },
      },
      success: { type: 'final' },
      failure: {},
    },
  });
}
