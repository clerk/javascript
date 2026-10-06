import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { assign } from '../assign';
import { createActor, mockActor } from '../create-actor';
import { createMachine } from '../create-machine';
import { setup } from '../setup';
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

    // Guard blocks confirm until the name is typed.
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

  it('exposes the actor so components can ask whether a transition is available', () => {
    function DeleteOrg() {
      const [, send, actor] = useMachine(createDeleteOrgMachine(() => Promise.resolve()));
      return (
        <div>
          <output data-testid='can-confirm'>{String(actor.can({ type: 'CONFIRM' }))}</output>
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

describe('useMachine — context init option', () => {
  it('passes runtime context through to the actor', () => {
    type Ctx = { label: string };
    const machine = createMachine<Ctx, { type: never }>({
      initial: 'idle',
      context: { label: 'default' },
      states: { idle: {} },
    });

    function Comp() {
      const [snapshot] = useMachine(machine, { context: { label: 'runtime' } });
      return <output>{snapshot.context.label}</output>;
    }

    render(<Comp />);
    expect(screen.getByText('runtime')).toBeInTheDocument();
  });

  it('only seeds context, so state the machine assigns survives a re-render', async () => {
    type Ctx = { name: string };
    const save = vi.fn((_name: string) => Promise.resolve());
    const machine = createMachine<Ctx, { type: 'TYPE'; value: string } | { type: 'SAVE' }>({
      initial: 'editing',
      context: { name: '' },
      states: {
        editing: {
          on: {
            TYPE: { actions: assign((_, e) => ({ name: e.value })) },
            SAVE: 'saving',
          },
        },
        saving: { invoke: { src: ctx => save(ctx.name), onDone: 'editing' } },
      },
    });

    function Comp({ savedName }: { savedName: string }) {
      const [, send] = useMachine(machine, { context: { name: savedName } });
      return (
        <div>
          <button onClick={() => send({ type: 'TYPE', value: 'Acme Inc' })}>Type</button>
          <button onClick={() => send({ type: 'SAVE' })}>Save</button>
        </div>
      );
    }

    const { rerender } = render(<Comp savedName='Acme' />);
    fireEvent.click(screen.getByText('Type'));
    rerender(<Comp savedName='Acme' />);
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(save).toHaveBeenCalledWith('Acme Inc');
  });
});

describe('useActor + mockActor — render a teleported step', () => {
  it('shows the content for a state reached only by teleport', () => {
    // `deleting` sits behind a 2s mutation — unreachable by clicking. Teleport in.
    const actor = mockActor(
      createDeleteOrgMachine(() => Promise.resolve()),
      {
        value: 'deleting',
        context: { name: 'Acme Inc', confirmValue: 'Acme Inc' },
      },
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
    createMachine<Ctx, Ev>({
      initial: 'active',
      context: { a: 0, b: 0 },
      states: {
        active: {
          on: {
            INC_A: { actions: assign<Ctx, Ev>(c => ({ a: c.a + 1 })) },
            INC_B: { actions: assign<Ctx, Ev>(c => ({ b: c.b + 1 })) },
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
    expect(renders).toHaveBeenCalledTimes(1);

    // Unrelated change → selected slice (`a`) is unchanged → no re-render.
    act(() => actor.send({ type: 'INC_B' }));
    expect(renders).toHaveBeenCalledTimes(1);

    // Selected change → re-render.
    act(() => actor.send({ type: 'INC_A' }));
    expect(renders).toHaveBeenCalledTimes(2);
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
    expect(renders).toHaveBeenCalledTimes(1);

    act(() => actor.send({ type: 'INC_A' }));
    act(() => actor.send({ type: 'INC_A' }));
    expect(renders).toHaveBeenCalledTimes(1);
    // Still shows the stale (first) value because the equality fn suppressed updates.
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('subscription cleanup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

describe('useMachine — onDone', () => {
  it('calls onDone exactly once when the machine reaches a final state', async () => {
    const gate = deferred<void>();
    const onDone = vi.fn();

    type Ctx = { fn: () => Promise<void> };
    type Ev = { type: 'GO' };
    const machine = createMachine<Ctx, Ev>({
      initial: 'idle',
      context: { fn: async () => {} },
      states: {
        idle: { on: { GO: 'running' } },
        running: { invoke: { src: (ctx: Ctx) => ctx.fn(), onDone: 'done', onError: 'done' } },
        done: { type: 'final' },
      },
    });

    function Comp() {
      const [snapshot, send] = useMachine(machine, {
        context: { fn: () => gate.promise },
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

  it('always invokes the latest onDone prop, not a stale closure', async () => {
    const gate = deferred<void>();
    const staleCallback = vi.fn();
    const freshCallback = vi.fn();

    type Ctx = { fn: () => Promise<void> };
    type Ev = { type: 'GO' };
    const machine = createMachine<Ctx, Ev>({
      initial: 'idle',
      context: { fn: async () => {} },
      states: {
        idle: { on: { GO: 'running' } },
        running: { invoke: { src: (ctx: Ctx) => ctx.fn(), onDone: 'done', onError: 'done' } },
        done: { type: 'final' },
      },
    });

    function Comp({ onDone }: { onDone: () => void }) {
      const [, send] = useMachine(machine, { context: { fn: () => gate.promise }, onDone });
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
  type Ctx = Record<string, never>;
  type Ev = { type: 'GO' };
  const { createMachine: createRunnerMachine } = setup<Ctx, Ev>().extend({
    actors: { run: () => Promise.resolve() },
  });
  const runnerMachine = createRunnerMachine({
    initial: 'idle',
    context: {},
    states: {
      idle: { on: { GO: 'running' } },
      running: { invoke: { src: 'run', onDone: 'done', onError: 'done' } },
      done: { type: 'final' },
    },
  });

  it('invokes the implementation provided on the latest render', async () => {
    const gate = deferred<void>();
    const staleFn = vi.fn(() => gate.promise);
    const freshFn = vi.fn(() => gate.promise);
    const actors: unknown[] = [];

    function Runner({ run }: { run: () => Promise<void> }) {
      const [snapshot, send, actor] = useMachine(runnerMachine.provide({ actors: { run } }));
      actors.push(actor);
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
    expect(new Set(actors).size).toBe(1);
  });

  it('does not re-render when only the provided implementations change', () => {
    let renders = 0;

    function Runner({ run }: { run: () => Promise<void> }) {
      renders++;
      useMachine(runnerMachine.provide({ actors: { run } }));
      return null;
    }

    const { rerender } = render(<Runner run={() => Promise.resolve()} />);
    const afterMount = renders;
    rerender(<Runner run={() => Promise.resolve()} />);

    expect(renders).toBe(afterMount + 1);
  });
});
