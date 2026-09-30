import { assign as _assign } from './assign';
import { createMachine as _createMachine } from './createMachine';
import type {
  AssignAction,
  DoneInvokeEvent,
  ErrorInvokeEvent,
  EventObject,
  InvokeConfig,
  MachineConfig,
  PromiseSrc,
  ProvidedActors,
  StateMachine,
  Transition,
} from './types';

/**
 * Pre-bind `TContext` and `TEvent` once per machine file, returning factory
 * functions that don't require repeating those types at every call site.
 *
 * ```ts
 * const { createMachine, assign } = setup<SignInContext, SignInEvent>();
 *
 * export function createSignInMachine(deps: Deps) {
 *   return createMachine({           // no <SignInContext, SignInEvent> needed
 *     states: {
 *       collecting: {
 *         on: {
 *           TYPE_IDENTIFIER: {
 *             actions: assign((_, e) => ({ identifier: e.value })), // e narrowed automatically
 *           },
 *         },
 *       },
 *     },
 *   });
 * }
 * ```
 *
 * `assign`'s second type parameter (`TEvt`) is left free so TypeScript's
 * contextual typing can narrow it from its placement inside `on`, `onDone`,
 * `onError`, or `after` — eliminating the need to write
 * `assign<Ctx, Extract<Event, { type: 'X' }>>` by hand.
 */
export function setup<
  TContext extends object,
  TEvent extends EventObject,
  TActors extends ProvidedActors = ProvidedActors,
>() {
  return {
    createMachine: (
      config: MachineConfig<TContext, TEvent, string, TActors>,
    ): StateMachine<TContext, TEvent, TActors> => _createMachine<TContext, TEvent, string, TActors>(config),

    assign: <TEvt extends EventObject = EventObject>(
      fn: (context: TContext, event: TEvt) => Partial<TContext>,
    ): AssignAction<TContext, TEvt> => _assign<TContext, TEvt>(fn),

    /**
     * Wraps an async function so its resolved type flows into `onDone.actions`.
     * Mirrors XState v5's `fromPromise<TOutput>()` — a typed wrapper that carries
     * `TOutput` to `DoneInvokeEvent<TOutput>` without needing a full actor registry.
     *
     * ```ts
     * const { createMachine, assign, fromPromise } = setup<Ctx, Event>();
     *
     * states: {
     *   loading: {
     *     invoke: fromPromise(
     *       ctx => ctx.fetchFn(),                              // infers TOutput = Resource
     *       { onDone: { target: 'success',
     *                   actions: assign((_, e) => ({ data: e.output })) } }, // e.output: Resource ✓
     *     ),
     *   },
     * }
     * ```
     *
     * A raw `src` function (without `fromPromise`) still works — `e.output` is `any`.
     */
    fromPromise: <TOutput, TStates extends string = string>(
      fn: (context: TContext) => Promise<TOutput>,
      config?: {
        onDone?: Transition<TContext, DoneInvokeEvent<TOutput>, TStates>;
        onError?: Transition<TContext, ErrorInvokeEvent, TStates>;
      },
    ): InvokeConfig<TContext, TEvent, TOutput, TStates> & { src: PromiseSrc<TContext, TEvent, TOutput> } => ({
      src: fn,
      ...config,
    }),
  };
}
