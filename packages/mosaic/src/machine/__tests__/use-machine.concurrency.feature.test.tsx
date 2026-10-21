import { act, render, screen } from '@testing-library/react';
import { Activity, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { createMachine } from '../create-machine';
import type { StateMachine } from '../types';
import { useMachine } from '../use-machine';

type FlowEvent = { type: 'START' } | { type: 'NEXT' };

function createFlowMachine(work: () => Promise<void>) {
  return createMachine<Record<string, never>, FlowEvent>({
    initial: 'idle',
    states: {
      idle: { on: { START: 'working' } },
      working: { invoke: { src: work, onDone: 'review' } },
      review: { on: { NEXT: 'finished' } },
      finished: { type: 'final' },
    },
  });
}

type Send = (event: FlowEvent) => void;

function Flow({
  machine,
  onDone,
  onSend,
}: {
  machine: StateMachine<Record<string, never>, FlowEvent>;
  onDone?: () => void;
  onSend?: (send: Send) => void;
}) {
  const [snapshot, send] = useMachine(machine, { onDone });
  onSend?.(send);
  return (
    <>
      <output>{snapshot.value}</output>
      <button
        type='button'
        onClick={() => send({ type: 'START' })}
      >
        Start
      </button>
      <button
        type='button'
        onClick={() => send({ type: 'NEXT' })}
      >
        Next
      </button>
    </>
  );
}

function renderInActivity(props: Parameters<typeof Flow>[0]) {
  const ui = (mode: 'visible' | 'hidden') => (
    <Activity mode={mode}>
      <Flow {...props} />
    </Activity>
  );
  const view = render(ui('visible'));
  return {
    hide: () => act(() => view.rerender(ui('hidden'))),
    show: () => act(() => view.rerender(ui('visible'))),
  };
}

const state = () => screen.getByRole('status');
const click = (name: string) => act(() => screen.getByRole('button', { name }).click());

describe.runIf(Activity)('useMachine inside Activity', () => {
  it('keeps the current state and keeps rendering transitions after being shown again', async () => {
    const machine = createFlowMachine(() => Promise.resolve());
    const activity = renderInActivity({ machine });
    click('Start');
    await act(async () => {});
    expect(state()).toHaveTextContent('review');

    activity.hide();
    activity.show();

    expect(state()).toHaveTextContent('review');
    click('Next');
    expect(state()).toHaveTextContent('finished');
  });

  it('renders an invoke result that settled while hidden', async () => {
    const gate = deferred<void>();
    const work = vi.fn(() => gate.promise);
    const activity = renderInActivity({ machine: createFlowMachine(work) });
    click('Start');
    expect(state()).toHaveTextContent('working');

    activity.hide();
    await act(async () => gate.resolve());
    activity.show();

    expect(state()).toHaveTextContent('review');
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('applies an event sent while hidden once shown again', async () => {
    let send: Send = () => {};
    const machine = createFlowMachine(() => Promise.resolve());
    const activity = renderInActivity({ machine, onSend: next => (send = next) });
    click('Start');
    await act(async () => {});

    activity.hide();
    act(() => send({ type: 'NEXT' }));
    activity.show();

    expect(state()).toHaveTextContent('finished');
  });

  it('calls onDone once for a flow that finished before being hidden and shown again', async () => {
    const onDone = vi.fn();
    const activity = renderInActivity({ machine: createFlowMachine(() => Promise.resolve()), onDone });
    click('Start');
    await act(async () => {});
    click('Next');
    expect(onDone).toHaveBeenCalledTimes(1);

    activity.hide();
    activity.show();

    expect(state()).toHaveTextContent('finished');
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe('useMachine in StrictMode', () => {
  it('runs entry actions and the invoke once', async () => {
    const entry = vi.fn();
    const work = vi.fn(() => Promise.resolve());
    const machine = createMachine<Record<string, never>, FlowEvent>({
      initial: 'working',
      states: {
        working: { entry, invoke: { src: work, onDone: 'review' } },
        review: {},
      },
    });

    render(
      <StrictMode>
        <Flow machine={machine} />
      </StrictMode>,
    );
    await act(async () => {});

    expect(state()).toHaveTextContent('review');
    expect(entry).toHaveBeenCalledTimes(1);
    expect(work).toHaveBeenCalledTimes(1);
  });
});
