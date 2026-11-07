import { createMachine as _createMachine } from './create-machine';
import type {
  ActionMap,
  ActorMap,
  AsyncArgs,
  AsyncLogic,
  CreatedInvoke,
  DoneInvokeEvent,
  Enqueue,
  ErrorInvokeEvent,
  EventObject,
  InputArgs,
  MachineConfig,
  StateMachine,
  Transition,
  TransitionArgs,
} from './types';
import { INVOKE_DONE, INVOKE_ERROR } from './types';

/**
 * Pre-bind `TContext`, `TEvent` and the actor's `TInput` once per machine file,
 * returning factory functions that don't require repeating those types at every call site.
 *
 * ```ts
 * const { createMachine } = setup<SignInContext, SignInEvent>();
 *
 * const signInMachine = createMachine({
 *   initial: 'collecting',
 *   context: { identifier: '' },
 *   states: {
 *     collecting: {
 *       on: {
 *         TYPE_IDENTIFIER: ({ event }) => ({ context: { identifier: event.value } }),
 *       },
 *     },
 *   },
 * });
 * ```
 */
export function setup<TContext extends object, TEvent extends EventObject, TInput = undefined>() {
  const invoke: InvokeFactory<TContext, TEvent> = createInvoke;
  return {
    createMachine: <
      TStates extends string,
      TActions extends ActionMap = Record<never, never>,
      TActors extends ActorMap = Record<never, never>,
    >(
      config: MachineConfig<TContext, TEvent, TStates, TActions, TActors, TInput>,
    ): StateMachine<TContext, TEvent, TStates, TActions, TActors, TInput> => _createMachine(config),

    /**
     * An inline invoke for a state. `input` maps the state's args to the input, `src`
     * gets `{ input, signal }`, and its resolved value types `onDone`'s `event.output`.
     * The signal aborts when the state is left, and a result that settles after that is dropped.
     *
     * ```ts
     * loading: {
     *   invoke: createInvoke({
     *     input: ({ context }) => context.id,
     *     src: ({ input }) => fetchResource(input),
     *     onDone: ({ event }) => ({ target: 'success', context: { data: event.output } }),
     *   }),
     * }
     * ```
     */
    createInvoke: invoke,
  };
}

/**
 * Async logic for a named actor. Declare it under the machine's `actors` and run it from a
 * state with `invoke: { src: 'name', input: ({ context }) => … }`. It gets `{ input, signal }`.
 *
 * ```ts
 * actors: { save: createAsyncLogic(({ input }: AsyncArgs<Values>) => api.save(input)) }
 * ```
 */
export function createAsyncLogic<TInput = undefined, TOutput = unknown>(
  run: (args: AsyncArgs<TInput>) => Promise<TOutput>,
): AsyncLogic<NoInfer<TInput>, TOutput> {
  return { run };
}

type Source<TInput, TOutput> = AsyncLogic<TInput, TOutput> | ((args: AsyncArgs<TInput>) => Promise<TOutput>);

interface InvokeFactory<TContext, TEvent extends EventObject> {
  <TInvokeInput, TOutput, const TStates extends string = never, TActions extends ActionMap = ActionMap>(
    config: {
      input: (args: InputArgs<TContext, TEvent>) => TInvokeInput;
      src: Source<TInvokeInput, TOutput>;
    } & Handlers<TContext, TEvent, TOutput, TStates, TActions>,
  ): CreatedInvoke<TContext, TEvent, TStates, TActions>;
  <TOutput, const TStates extends string = never, TActions extends ActionMap = ActionMap>(
    config: { input?: undefined; src: Source<undefined, TOutput> } & Handlers<
      TContext,
      TEvent,
      TOutput,
      TStates,
      TActions
    >,
  ): CreatedInvoke<TContext, TEvent, TStates, TActions>;
}

interface Handlers<TContext, TEvent extends EventObject, TOutput, TStates extends string, TActions extends ActionMap> {
  onDone?: InvokeTransition<TContext, DoneInvokeEvent<TOutput>, TStates, TActions, TEvent>;
  onError?: InvokeTransition<TContext, ErrorInvokeEvent, TStates, TActions, TEvent>;
}

type CreateInvokeConfig<
  TContext,
  TEvent extends EventObject,
  TInput,
  TOutput,
  TStates extends string,
  TActions extends ActionMap,
> = (
  | { input: (args: InputArgs<TContext, TEvent>) => TInput; src: Source<TInput, TOutput> }
  | { input?: undefined; src: Source<undefined, TOutput> }
) &
  Handlers<TContext, TEvent, TOutput, TStates, TActions>;

type InvokeTransition<
  TContext,
  TBound extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TEvent extends EventObject,
> =
  | { target: TStates }
  | ((
      args: TransitionArgs<TContext, TBound, TActions, TEvent>,
      enq: Enqueue,
    ) => { target?: TStates; context?: Partial<TContext> } | undefined | void);

function createInvoke<
  TContext,
  TEvent extends EventObject,
  TInput,
  TOutput,
  TStates extends string,
  TActions extends ActionMap,
>(
  config: CreateInvokeConfig<TContext, TEvent, TInput, TOutput, TStates, TActions>,
): CreatedInvoke<TContext, TEvent, TStates, TActions> {
  const start = (args: InputArgs<TContext, TEvent>, signal: AbortSignal): Promise<TOutput> =>
    config.input === undefined
      ? runSource(config.src, { input: undefined, signal })
      : runSource(config.src, { input: config.input(args), signal });
  return {
    run: (args, signal, settle) => {
      const fail = (error: unknown) => {
        const event: ErrorInvokeEvent = { type: INVOKE_ERROR, error };
        settle({ event, transition: bindEvent(config.onError, event) });
      };
      let output: Promise<TOutput>;
      try {
        output = start(args, signal);
      } catch (error) {
        queueMicrotask(() => fail(error));
        return;
      }
      output.then(value => {
        const event: DoneInvokeEvent<TOutput> = { type: INVOKE_DONE, output: value };
        settle({ event, transition: bindEvent(config.onDone, event) });
      }, fail);
    },
  };
}

function runSource<TInput, TOutput>(src: Source<TInput, TOutput>, args: AsyncArgs<TInput>): Promise<TOutput> {
  return typeof src === 'function' ? src(args) : src.run(args);
}

function bindEvent<
  TContext,
  TBound extends EventObject,
  TStates extends string,
  TActions extends ActionMap,
  TEvent extends EventObject,
>(
  transition: InvokeTransition<TContext, TBound, TStates, TActions, TEvent> | undefined,
  event: TBound,
): Transition<TContext, EventObject, TStates, TActions, TEvent> | undefined {
  if (typeof transition !== 'function') {
    return transition;
  }
  return (args, enq) => transition({ ...args, event }, enq);
}
