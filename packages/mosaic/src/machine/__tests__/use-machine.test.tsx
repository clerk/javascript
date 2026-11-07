import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { createActor, restoreActor } from '../create-actor';
import { createAsyncLogic, setup } from '../setup';
import { useActor, useMachine, useSelector } from '../use-machine';
import { createDeleteOrgMachine } from './delete-organization-machine';

describe('useMachine — drives a flow from a component', () => {
  it('re-renders as send advances the machine through its states', async () => {
    const gate = deferred<void>();

    function DeleteOrg() {
      const [snapshot, send] = useMachine(createDeleteOrgMachine(() => gate.promise));
      return (
        <div>
          <output data-testid='state'>{snapshot.value}</output>
          <button onClick={() => send({ type: 'OPEN' })}>Open</button>
          <button onClick={() => send({ type: 'TYPE', value: 'Acme Inc' })}>Type name</button>
          <button onClick={() => send({ type: 'CONFIRM' })}>Confirm</button>
        </div>
      );
    }

    render(<DeleteOrg />);
    expect(screen.getByTestId('state')).toHaveTextContent('idle');

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('state')).toHaveTextContent('confirming');

    // CONFIRM is unhandled until the name is typed.
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.getByTestId('state')).toHaveTextContent('confirming');

    fireEvent.click(screen.getByText('Type name'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.getByTestId('state')).toHaveTextContent('deleting');

    await act(async () => {
      gate.resolve();
    });
    expect(screen.getByTestId('state')).toHaveTextContent('deleted');
  });

  it('lets components ask the snapshot whether a transition is available', () => {
    function DeleteOrg() {
      const [snapshot, send] = useMachine(createDeleteOrgMachine(() => Promise.resolve()));
      return (
        <div>
          <output data-testid='can-confirm'>{String(snapshot.can({ type: 'CONFIRM' }))}</output>
          <button onClick={() => send({ type: 'OPEN' })}>Open</button>
          <button onClick={() => send({ type: 'TYPE', value: 'Acme Inc' })}>Type name</button>
        </div>
      );
    }

    render(<DeleteOrg />);

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('can-confirm')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Type name'));
    expect(screen.getByTestId('can-confirm')).toHaveTextContent('true');
  });
});

describe('useMachine — input option', () => {
  it('builds the initial context from input', () => {
    type Ctx = { label: string };
    const machine = setup<Ctx, { type: never }, { label: string }>().createMachine({
      initial: 'idle',
      context: ({ input }) => ({ label: input.label }),
      states: { idle: {} },
    });

    function Comp() {
      const [snapshot] = useMachine(machine, { input: { label: 'runtime' } });
      return <output>{snapshot.context.label}</output>;
    }

    render(<Comp />);
    expect(screen.getByText('runtime')).toBeInTheDocument();
  });
});

describe('useActor + restoreActor — render a restored step', () => {
  it('shows the content for a state reached only by restoring it', () => {
    const machine = createDeleteOrgMachine(() => Promise.resolve());
    const actor = restoreActor(
      machine,
      machine.resolveState({
        value: 'deleting',
        context: { name: 'Acme Inc', confirmValue: 'Acme Inc', error: null },
      }),
    );

    function Step() {
      const [snapshot] = useActor(actor);
      return <div>{snapshot.value === 'deleting' ? 'Deleting…' : `state: ${snapshot.value}`}</div>;
    }

    render(<Step />);
    expect(screen.getByText('Deleting…')).toBeInTheDocument();
  });
});

describe('useSelector — re-renders only on the selected slice', () => {
  type Ctx = { a: number; b: number };
  type Ev = { type: 'INC_A' } | { type: 'INC_B' };

  const makeMachine = () =>
    setup<Ctx, Ev>().createMachine({
      initial: 'active',
      context: { a: 0, b: 0 },
      states: {
        active: {
          on: {
            INC_A: ({ context }) => ({ context: { a: context.a + 1 } }),
            INC_B: ({ context }) => ({ context: { b: context.b + 1 } }),
          },
        },
      },
    });

  it('does not re-render when an unrelated slice changes', () => {
    const actor = createActor(makeMachine());
    actor.start();

    const renders = vi.fn();
    function ReadsA() {
      const a = useSelector(actor, s => s.context.a);
      renders();
      return <output>{a}</output>;
    }

    render(<ReadsA />);
    renders.mockClear();

    // Unrelated change → selected slice (`a`) is unchanged → no re-render.
    act(() => actor.send({ type: 'INC_B' }));
    expect(renders).not.toHaveBeenCalled();

    // Selected change → re-render.
    act(() => actor.send({ type: 'INC_A' }));
    expect(renders).toHaveBeenCalled();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('honors a custom equality function', () => {
    const actor = createActor(makeMachine());
    actor.start();

    const renders = vi.fn();
    function ReadsA() {
      // Equality always true → treat every selection as equal → never re-renders.
      const a = useSelector(
        actor,
        s => s.context.a,
        () => true,
      );
      renders();
      return <output>{a}</output>;
    }

    render(<ReadsA />);
    renders.mockClear();

    act(() => actor.send({ type: 'INC_A' }));
    act(() => actor.send({ type: 'INC_A' }));
    expect(renders).not.toHaveBeenCalled();
    // Still shows the stale (first) value because the equality fn suppressed updates.
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('subscription cleanup', () => {
  it('unsubscribes from the actor on unmount', () => {
    const actor = createActor(createDeleteOrgMachine(() => Promise.resolve()));
    actor.start();

    // Wrap subscribe to count live subscriptions.
    let live = 0;
    const realSubscribe = actor.subscribe;
    actor.subscribe = listener => {
      live++;
      const unsubscribe = realSubscribe(listener);
      return () => {
        live--;
        unsubscribe();
      };
    };

    function Reader() {
      const [snapshot] = useActor(actor);
      return <output>{snapshot.value}</output>;
    }

    const { unmount } = render(<Reader />);
    expect(live).toBe(1);

    unmount();
    expect(live).toBe(0);
  });
});

function makeRunMachine() {
  return setup<object, { type: 'GO' }>().createMachine({
    initial: 'idle',
    context: {},
    actors: { run: createAsyncLogic(() => Promise.resolve()) },
    states: {
      idle: { on: { GO: { target: 'running' } } },
      running: { invoke: { src: 'run', onDone: { target: 'done' }, onError: { target: 'done' } } },
      done: { type: 'final' },
    },
  });
}

describe('useMachine — onDone', () => {
  it('calls onDone exactly once when the machine reaches a final state', async () => {
    const gate = deferred<void>();
    const onDone = vi.fn();

    const machine = makeRunMachine();

    function Comp() {
      const [snapshot, send] = useMachine(machine.provide({ actors: { run: createAsyncLogic(() => gate.promise) } }), {
        onDone,
      });
      return (
        <div>
          <output data-testid='state'>{snapshot.value}</output>
          <button onClick={() => send({ type: 'GO' })}>Go</button>
        </div>
      );
    }

    render(<Comp />);
    expect(onDone).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Go'));
    await act(async () => gate.resolve());

    expect(screen.getByTestId('state')).toHaveTextContent('done');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone once when the actor restarts in a final state', () => {
    const onDone = vi.fn();
    const machine = setup<object, { type: 'GO' }>().createMachine({
      initial: 'done',
      context: {},
      states: { done: { type: 'final' } },
    });

    function Comp() {
      const [snapshot] = useMachine(machine, { onDone });
      return <output>{snapshot.value}</output>;
    }

    render(<Comp />, { reactStrictMode: true });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('always invokes the latest onDone prop, not a stale closure', async () => {
    const gate = deferred<void>();
    const staleCallback = vi.fn();
    const freshCallback = vi.fn();

    const machine = makeRunMachine();

    function Comp({ onDone }: { onDone: () => void }) {
      const [, send] = useMachine(machine.provide({ actors: { run: createAsyncLogic(() => gate.promise) } }), {
        onDone,
      });
      return <button onClick={() => send({ type: 'GO' })}>Go</button>;
    }

    const { rerender } = render(<Comp onDone={staleCallback} />);
    rerender(<Comp onDone={freshCallback} />);

    fireEvent.click(screen.getByText('Go'));
    await act(async () => gate.resolve());

    expect(freshCallback).toHaveBeenCalledTimes(1);
    expect(staleCallback).not.toHaveBeenCalled();
  });
});

describe('useMachine — provided implementations stay current', () => {
  it('invokes the latest provided actor even when the prop changes between renders', async () => {
    const gate = deferred<void>();
    const staleFn = vi.fn(() => gate.promise);
    const freshFn = vi.fn(() => gate.promise);

    const machine = makeRunMachine();

    function Runner({ run }: { run: () => Promise<void> }) {
      const [snapshot, send] = useMachine(machine.provide({ actors: { run: createAsyncLogic(run) } }));
      return (
        <div>
          <output data-testid='state'>{snapshot.value}</output>
          <button onClick={() => send({ type: 'GO' })}>Go</button>
        </div>
      );
    }

    const { rerender } = render(<Runner run={staleFn} />);
    rerender(<Runner run={freshFn} />);

    fireEvent.click(screen.getByText('Go'));
    expect(screen.getByTestId('state')).toHaveTextContent('running');

    await act(async () => gate.resolve());
    expect(screen.getByTestId('state')).toHaveTextContent('done');

    expect(freshFn).toHaveBeenCalledTimes(1);
    expect(staleFn).not.toHaveBeenCalled();
  });
});
